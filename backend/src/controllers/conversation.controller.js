const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const MessagingService = require('../services/messaging.service');

const ConversationController = {
  createOrFindConversation: asyncHandler(async (req, res) => {
    const conversation = await MessagingService.createOrFindConversation(req.body, req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Conversation retrieved or created successfully',
      data: conversation,
    });
  }),

  listConversations: asyncHandler(async (req, res) => {
    const result = await MessagingService.listUserConversations(req.query, req.user);
    return sendSuccess(res, {
      message: 'Conversations fetched successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),

  getConversation: asyncHandler(async (req, res) => {
    const conversation = await MessagingService.getConversationDetails(req.params.id, req.user);
    return sendSuccess(res, {
      message: 'Conversation details fetched successfully',
      data: conversation,
    });
  }),

  sendMessage: asyncHandler(async (req, res) => {
    const message = await MessagingService.sendMessage(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Message sent successfully',
      data: message,
    });
  }),

  getMessages: asyncHandler(async (req, res) => {
    const result = await MessagingService.getMessages(req.params.id, req.query, req.user);
    return sendSuccess(res, {
      message: 'Messages fetched successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),

  markAsRead: asyncHandler(async (req, res) => {
    const result = await MessagingService.markAsRead(req.params.id, req.user);
    return sendSuccess(res, {
      message: result.message,
    });
  }),

  deleteMessage: asyncHandler(async (req, res) => {
    const result = await MessagingService.deleteMessage(req.params.id, req.user);
    return sendSuccess(res, {
      message: result.message,
    });
  }),
};

module.exports = ConversationController;
