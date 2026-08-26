const ApiError = require('../utils/apiError');
const ConversationModel = require('../models/conversation.model');
const MessageModel = require('../models/message.model');
const UserModel = require('../models/user.model');
const ProfileModel = require('../models/profile.model');
const AuditLogModel = require('../models/auditLog.model');
const NotificationService = require('./notification.service');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const MessagingService = {
  async getEffectiveOrgId(requestingUser) {
    if (requestingUser.organization_id) return requestingUser.organization_id;
    const defaultOrgId = await ProfileModel.getOrCreateDefaultOrganization();
    await UserModel.update(requestingUser.id, { organization_id: defaultOrgId });
    return defaultOrgId;
  },

  async createOrFindConversation(data, requestingUser) {
    const orgId = await this.getEffectiveOrgId(requestingUser);

    let participantIds = [];
    if (Array.isArray(data.participant_ids)) {
      participantIds = data.participant_ids.filter((id) => id !== requestingUser.id);
    } else if (data.recipient_id) {
      participantIds = [data.recipient_id];
    }

    if (participantIds.length === 0) {
      throw ApiError.badRequest('At least one valid recipient/participant ID is required');
    }

    const type = data.type || (participantIds.length === 1 ? 'direct' : 'group');

    // If direct conversation, check for pre-existing conversation between the two users
    if (type === 'direct' && participantIds.length === 1) {
      const recipientId = participantIds[0];
      
      const recipient = await UserModel.findById(recipientId);
      if (!recipient) {
        throw ApiError.notFound('Recipient user not found');
      }

      const existing = await ConversationModel.findDirectBetweenUsers(orgId, requestingUser.id, recipientId);
      if (existing) {
        return await ConversationModel.findById(existing.id);
      }
    }

    // Validate all participant IDs exist
    for (const pId of participantIds) {
      const u = await UserModel.findById(pId);
      if (!u) {
        throw ApiError.notFound(`Participant user with ID ${pId} not found`);
      }
    }

    // Create new conversation
    const conversation = await ConversationModel.create({
      organizationId: orgId,
      title: data.title || null,
      type,
      createdBy: requestingUser.id,
    });

    // Add creator & all participants
    await ConversationModel.addParticipant(conversation.id, requestingUser.id);
    for (const pId of participantIds) {
      await ConversationModel.addParticipant(conversation.id, pId);
    }

    // Initial message if provided
    if (data.initial_message || data.message || data.content) {
      const content = data.initial_message || data.message || data.content;
      await this.sendMessage(conversation.id, { content }, requestingUser);
    }

    return await ConversationModel.findById(conversation.id);
  },

  async listUserConversations(query, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const orgId = await this.getEffectiveOrgId(requestingUser);

    const items = await ConversationModel.findUserConversations({
      userId: requestingUser.id,
      organizationId: orgId,
      limit,
      offset,
    });

    const totalItems = await ConversationModel.countUserConversations({
      userId: requestingUser.id,
      organizationId: orgId,
    });

    return formatPaginatedResponse(items, totalItems, page, limit);
  },

  async getConversationDetails(conversationId, requestingUser) {
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    const isParticipant = await ConversationModel.isParticipant(conversationId, requestingUser.id);
    if (!isParticipant) {
      throw ApiError.forbidden('Access denied: You are not a participant in this conversation');
    }

    return conversation;
  },

  async sendMessage(conversationId, data, requestingUser) {
    if (!data.content || typeof data.content !== 'string' || !data.content.trim()) {
      throw ApiError.badRequest('Message content cannot be empty');
    }

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    const isParticipant = await ConversationModel.isParticipant(conversationId, requestingUser.id);
    if (!isParticipant) {
      throw ApiError.forbidden('Access denied: You are not a participant in this conversation');
    }

    const message = await MessageModel.create({
      conversationId,
      senderId: requestingUser.id,
      content: data.content.trim(),
      attachments: data.attachments || [],
    });

    await ConversationModel.touchUpdatedAt(conversationId);
    await ConversationModel.updateLastReadAt(conversationId, requestingUser.id);

    // Notify other participants in the conversation
    if (conversation.participants && Array.isArray(conversation.participants)) {
      for (const p of conversation.participants) {
        if (p.user_id !== requestingUser.id) {
          const senderName = `${requestingUser.first_name} ${requestingUser.last_name}`.trim();
          await NotificationService.createNotification({
            userId: p.user_id,
            title: `New message from ${senderName}`,
            message: data.content.length > 80 ? `${data.content.substring(0, 80)}...` : data.content,
            type: 'message',
            linkUrl: `/conversations/${conversationId}`,
          }).catch(() => {});
        }
      }
    }

    return message;
  },

  async getMessages(conversationId, query, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query, 1, 20);

    const isParticipant = await ConversationModel.isParticipant(conversationId, requestingUser.id);
    if (!isParticipant) {
      throw ApiError.forbidden('Access denied: You are not a participant in this conversation');
    }

    const items = await MessageModel.findConversationMessages({
      conversationId,
      limit,
      offset,
    });

    const totalItems = await MessageModel.countConversationMessages(conversationId);

    // Update last_read_at for reader
    await ConversationModel.updateLastReadAt(conversationId, requestingUser.id);

    return formatPaginatedResponse(items, totalItems, page, limit);
  },

  async markAsRead(conversationId, requestingUser) {
    const isParticipant = await ConversationModel.isParticipant(conversationId, requestingUser.id);
    if (!isParticipant) {
      throw ApiError.forbidden('Access denied: You are not a participant in this conversation');
    }

    await ConversationModel.updateLastReadAt(conversationId, requestingUser.id);
    return { message: 'Conversation marked as read' };
  },

  async deleteMessage(messageId, requestingUser) {
    const message = await MessageModel.findById(messageId);
    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const isAdmin = ['admin', 'super_admin', 'org_admin'].includes(role);

    if (message.sender_id !== requestingUser.id && !isAdmin) {
      throw ApiError.forbidden('Access denied: You can only delete your own messages');
    }

    await MessageModel.softDelete(messageId, message.sender_id);
    return { message: 'Message deleted successfully' };
  },
};

module.exports = MessagingService;
