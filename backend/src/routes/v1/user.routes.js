const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const {
  updateProfileSchema,
  updateAvatarSchema,
  userStatusSchema,
  listUsersQuerySchema,
} = require('../../utils/user.validator');
const {
  getProfile,
  updateProfile,
  updateAvatar,
  getUserById,
  listUsers,
  updateUserStatus,
} = require('../../controllers/user.controller');

const router = express.Router();

// Current User Profile endpoints
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate({ body: updateProfileSchema }), updateProfile);
router.patch('/profile/avatar', authenticate, validate({ body: updateAvatarSchema }), updateAvatar);

// Admin / HR / Head User Management & Lookup
router.get('/', authenticate, requireRole('admin', 'hr', 'head'), validate({ query: listUsersQuerySchema }), listUsers);
router.get('/:id', authenticate, requireRole('admin', 'hr', 'head', 'supervisor'), getUserById);
router.patch('/:id/status', authenticate, requireRole('admin', 'hr'), validate({ body: userStatusSchema }), updateUserStatus);

module.exports = router;
