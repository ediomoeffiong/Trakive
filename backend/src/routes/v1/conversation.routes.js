const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { searchQuerySchema } = require('../../utils/search.validator');
const SearchController = require('../../controllers/search.controller');

const router = express.Router();

router.get('/messages', authenticate, validate({ query: searchQuerySchema }), SearchController.searchMessages);
router.get('/', authenticate, validate({ query: searchQuerySchema }), SearchController.searchMessages);

module.exports = router;
