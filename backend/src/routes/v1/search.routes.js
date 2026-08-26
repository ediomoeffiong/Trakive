const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { searchQuerySchema } = require('../../utils/search.validator');
const SearchController = require('../../controllers/search.controller');

const router = express.Router();

router.get('/', authenticate, validate({ query: searchQuerySchema }), SearchController.searchGlobal);
router.get('/users', authenticate, validate({ query: searchQuerySchema }), SearchController.searchUsers);
router.get('/tasks', authenticate, validate({ query: searchQuerySchema }), SearchController.searchTasks);
router.get('/attendance', authenticate, validate({ query: searchQuerySchema }), SearchController.searchAttendance);
router.get('/leave', authenticate, validate({ query: searchQuerySchema }), SearchController.searchLeave);
router.get('/notifications', authenticate, validate({ query: searchQuerySchema }), SearchController.searchNotifications);
router.get('/documents', authenticate, validate({ query: searchQuerySchema }), SearchController.searchDocuments);
router.get('/messages', authenticate, validate({ query: searchQuerySchema }), SearchController.searchMessages);

module.exports = router;
