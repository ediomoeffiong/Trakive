const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { listActivityQuerySchema } = require('../../utils/activity.validator');
const { getActivities } = require('../../controllers/activity.controller');

const router = express.Router();

router.get('/', authenticate, validate({ query: listActivityQuerySchema }), getActivities);

module.exports = router;
