const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const ConversationController = require('../../controllers/conversation.controller');

const router = express.Router();

router.use(authenticate);

router.delete('/:id', ConversationController.deleteMessage);

module.exports = router;
