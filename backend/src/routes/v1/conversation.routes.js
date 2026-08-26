const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const ConversationController = require('../../controllers/conversation.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', ConversationController.createOrFindConversation);
router.get('/', ConversationController.listConversations);
router.get('/:id', ConversationController.getConversation);
router.post('/:id/messages', ConversationController.sendMessage);
router.get('/:id/messages', ConversationController.getMessages);
router.patch('/:id/read', ConversationController.markAsRead);
router.post('/:id/read', ConversationController.markAsRead);

module.exports = router;
