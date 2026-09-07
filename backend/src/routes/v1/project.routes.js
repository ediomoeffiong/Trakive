const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const ProjectController = require('../../controllers/project.controller');
const MilestoneController = require('../../controllers/milestone.controller');
const TaskModel = require('../../models/task.model');
const { sendSuccess } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

// ── Project CRUD ──────────────────────────────────────────────────────────────
router.get('/', ProjectController.listProjects);
router.post(
  '/',
  requireRole('supervisor', 'admin', 'super_admin', 'hr'),
  ProjectController.createProject
);
router.post(
  '/propose',
  requireRole('intern'),
  ProjectController.proposeProject
);
router.get('/:id', ProjectController.getProject);
router.put('/:id', ProjectController.updateProject);
router.delete(
  '/:id',
  requireRole('supervisor', 'admin', 'super_admin', 'hr'),
  ProjectController.deleteProject
);

// ── Project tasks ─────────────────────────────────────────────────────────────
router.get(
  '/:id/tasks',
  asyncHandler(async (req, res) => {
    const tasks = await TaskModel.findByProjectId(req.params.id);
    return sendSuccess(res, { message: 'Project tasks retrieved', data: tasks });
  })
);

// ── Approval workflow ─────────────────────────────────────────────────────────
router.post(
  '/:id/approve',
  requireRole('supervisor', 'admin', 'super_admin', 'hr'),
  ProjectController.approveProject
);
router.post(
  '/:id/reject',
  requireRole('supervisor', 'admin', 'super_admin', 'hr'),
  ProjectController.rejectProject
);
router.post(
  '/:id/request-changes',
  requireRole('supervisor', 'admin', 'super_admin', 'hr'),
  ProjectController.requestChanges
);
router.post(
  '/:id/resubmit',
  requireRole('intern'),
  ProjectController.resubmitProject
);

// ── Milestones (nested under project) ────────────────────────────────────────
router.get('/:id/milestones', MilestoneController.listMilestones);
router.post(
  '/:id/milestones',
  requireRole('supervisor', 'admin', 'super_admin', 'hr'),
  MilestoneController.createMilestone
);
router.put(
  '/:id/milestones/reorder',
  requireRole('supervisor', 'admin', 'super_admin', 'hr'),
  MilestoneController.reorderMilestones
);
router.put(
  '/:id/milestones/:milestoneId',
  requireRole('supervisor', 'admin', 'super_admin', 'hr'),
  MilestoneController.updateMilestone
);
router.delete(
  '/:id/milestones/:milestoneId',
  requireRole('supervisor', 'admin', 'super_admin', 'hr'),
  MilestoneController.deleteMilestone
);

module.exports = router;
