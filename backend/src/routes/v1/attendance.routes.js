const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { searchQuerySchema } = require('../../utils/search.validator');
const SearchController = require('../../controllers/search.controller');

const router = express.Router();

router.get('/', authenticate, validate({ query: searchQuerySchema }), SearchController.searchAttendance);

module.exports = router;
