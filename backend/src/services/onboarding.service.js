const { query } = require('../config/db');
const ApiError = require('../utils/apiError');
const ApplicationModel = require('../models/application.model');
const OnboardingModel = require('../models/onboarding.model');
const UserModel = require('../models/user.model');
const ProfileModel = require('../models/profile.model');
const RoleModel = require('../models/role.model');
const InternshipModel = require('../models/internship.model');
const InternshipRecordModel = require('../models/internshipRecord.model');
const AuditLogModel = require('../models/auditLog.model');
const NotificationModel = require('../models/notification.model');
const StorageService = require('./storage.service');
const { hashPassword } = require('../utils/password.utils');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const { resolveFifthLabDefaults } = require('../utils/fifthlabDefaults');
const { PDF_UPLOAD_TYPES, assertSafeUpload } = require('../utils/uploadSecurity');
const { sanitizeTextInput } = require('../utils/sanitizer');

const ONBOARDING_SECTION_LABELS = {
  internship_info: 'Internship Info',
  welcome: 'Welcome',
  company_policies: 'Company Policies',
  it_setup: 'IT Setup',
  team_intro: 'Team Introduction',
  training: 'Training',
};

const REQUIRED_DOCS = [
  { category: 'resume', title: 'Resume / CV' },
  { category: 'placement_letter', title: 'Internship / Placement Letter' },
  { category: 'acceptance_letter', title: 'Acceptance Letter' },
];

const VALID_TRANSITIONS = {
  applied: ['under_review', 'accepted', 'approved', 'rejected'],
  pending_review: ['under_review', 'accepted', 'approved', 'rejected'],
  under_review: ['accepted', 'approved', 'rejected'],
  accepted: ['account_created', 'onboarding_in_progress'],
  approved: ['account_created', 'onboarding_in_progress'],
  account_created: ['onboarding_in_progress', 'onboarding_completed'],
  onboarding_in_progress: ['onboarding_in_progress', 'onboarding_completed'],
  onboarding_completed: ['completed', 'terminated'],
  rejected: [],
  completed: [],
  terminated: [],
};

function buildDocumentTracking(docs, targetRecord = null) {
  const relevantDocs = targetRecord
    ? docs.filter((doc) => doc.internship_record_id === targetRecord.id)
    : docs;

  const docsByCategory = new Map();
  relevantDocs.forEach((doc) => {
    if (!docsByCategory.has(doc.category)) {
      docsByCategory.set(doc.category, doc);
    }
  });

  const checklist = REQUIRED_DOCS.map((item) => {
    const doc = docsByCategory.get(item.category) || null;
    return {
      category: item.category,
      title: item.title,
      submitted: !!doc,
      review_status: doc ? doc.review_status || 'pending' : 'not_submitted',
      document: doc,
      history: [],
    };
  });

  const approvedCount = checklist.filter((item) => item.review_status === 'approved').length;
  const totalRequired = REQUIRED_DOCS.length;
  const submittedCount = checklist.filter((item) => item.submitted).length;
  const rejectedItems = checklist.filter(
    (item) => item.review_status === 'rejected' || item.review_status === 'resubmission_required'
  );
  const hasRejections = rejectedItems.length > 0;
  const allSubmitted = checklist.every((item) => item.submitted);
  const allApproved = approvedCount === totalRequired;

  let status = 'not_started';
  if (allApproved) {
    status = 'completed';
  } else if (hasRejections) {
    status = 'action_required';
  } else if (allSubmitted) {
    status = 'pending';
  } else if (submittedCount > 0) {
    status = 'in_progress';
  }

  const rejectionReason = hasRejections
    ? rejectedItems.map((item) => `${item.title}: ${item.document?.review_notes || 'Action required'}`).join('; ')
    : null;

  return {
    documents: relevantDocs,
    checklist,
    approved_count: approvedCount,
    total_required: totalRequired,
    progress_label: `${approvedCount}/${totalRequired} Approved`,
    onboarding_ready: allApproved,
    all_required_submitted: allSubmitted,
    status,
    action_required: status === 'action_required' || status === 'in_progress' || status === 'not_started',
    rejection_reason: rejectionReason,
    internship_record_id: targetRecord ? targetRecord.id : null,
    internship_number: targetRecord?.internship_number || 1,
    internship_title: targetRecord?.title || 'Internship #1',
  };
}

const OnboardingService = {
  async findCurrentApplicationForUser(userId) {
    const apps = await ApplicationModel.findPaginated({ applicant_id: userId, limit: 1 });
    return apps[0] || null;
  },

  async getEffectiveOrgId(requestingUser) {
    if (requestingUser.organization_id) return requestingUser.organization_id;
    throw ApiError.badRequest('User must be assigned to an organization before managing onboarding');
  },

  /**
   * Ensure the intern has a department + supervisor so submissions appear in the supervisor queue.
   * Uses existing profile values when present; otherwise auto-assigns from department/org.
   */
  async ensureInternSupervisorLink(requestingUser, preferredDepartmentId = null) {
    const orgId = await this.getEffectiveOrgId(requestingUser);
    let internProfile = await ProfileModel.findInternProfileByUserId(requestingUser.id);

    if (internProfile?.supervisor_id) {
      return internProfile;
    }

    const initialTargetDeptId =
      preferredDepartmentId ||
      internProfile?.department_id ||
      requestingUser.department_id ||
      null;
    const fifthLabDefaults = await resolveFifthLabDefaults({
      organizationId: orgId,
      departmentId: initialTargetDeptId,
      supervisorId: null,
      email: requestingUser.email,
    });
    const targetDeptId = fifthLabDefaults.departmentId;

    let assignedSupervisorProfile = fifthLabDefaults.supervisorId
      ? await ProfileModel.findSupervisorById(fifthLabDefaults.supervisorId)
      : null;
    if (targetDeptId) {
      const supRes = await query(
        `SELECT sp.* FROM supervisor_profiles sp
         JOIN users u ON u.id = sp.user_id
         WHERE (sp.department_id = $1 OR sp.department_id IS NULL)
           AND u.organization_id = $2
           AND u.status = 'active'
           AND u.deleted_at IS NULL
         ORDER BY (sp.department_id IS NOT NULL) DESC, sp.created_at ASC
         LIMIT 1`,
        [targetDeptId, orgId]
      );
      assignedSupervisorProfile = assignedSupervisorProfile || supRes.rows[0] || null;
    }

    if (!assignedSupervisorProfile) {
      const anySupRes = await query(
        `SELECT sp.* FROM supervisor_profiles sp
         JOIN users u ON u.id = sp.user_id
         WHERE u.organization_id = $1
           AND u.status = 'active'
           AND u.deleted_at IS NULL
         ORDER BY (sp.department_id IS NOT NULL) DESC, sp.created_at ASC
         LIMIT 1`,
        [orgId]
      );
      assignedSupervisorProfile = anySupRes.rows[0] || null;
    }

    const departmentId = targetDeptId || assignedSupervisorProfile?.department_id || null;

    if (departmentId) {
      await UserModel.update(requestingUser.id, { department_id: departmentId });
    }

    internProfile = await ProfileModel.upsertInternProfile({
      user_id: requestingUser.id,
      organization_id: orgId,
      department_id: departmentId,
      supervisor_id: assignedSupervisorProfile ? assignedSupervisorProfile.id : null,
      status: internProfile?.status || 'onboarding',
    });

    if (assignedSupervisorProfile && internProfile?.id) {
      await ProfileModel.recordSupervisorAssignment(
        internProfile.id,
        assignedSupervisorProfile.id,
        requestingUser.id,
        'active',
        'Auto-assigned supervisor for onboarding document visibility'
      );
    }

    return internProfile;
  },

  async notifyAssignedSupervisor(requestingUser, { title, message, type = 'onboarding_submission', linkUrl = '/supervisor/onboarding' }) {
    const internProfile = await ProfileModel.findInternProfileByUserId(requestingUser.id);
    if (!internProfile?.supervisor_id) return;

    const supProfile = await ProfileModel.findSupervisorById(internProfile.supervisor_id);
    if (!supProfile?.user_id) return;

    await NotificationModel.create({
      userId: supProfile.user_id,
      title,
      message,
      type,
      linkUrl,
    });
  },

  validateStateTransition(currentStatus, newStatus) {
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw ApiError.badRequest(`Invalid workflow state transition from '${currentStatus}' to '${newStatus}'`);
    }
  },

  async createApplication(data, requestingUser, ipAddress = null, userAgent = null) {
    const internship = await InternshipModel.findById(data.internship_id);
    if (!internship) {
      throw ApiError.notFound('Internship program not found');
    }

    const existingApp = await ApplicationModel.findByApplicantAndInternship(requestingUser.id, data.internship_id);
    if (existingApp) {
      throw ApiError.conflict('You have already applied for this internship program');
    }

    const onboardingData = {
      first_name: data.first_name || requestingUser.first_name,
      last_name: data.last_name || requestingUser.last_name,
      email: data.email || requestingUser.email,
      phone: data.phone || requestingUser.phone,
      institution: data.institution || '',
      field_of_study: data.field_of_study || '',
      academic_year: data.academic_year || '',
      cover_letter: data.cover_letter || '',
    };

    const application = await ApplicationModel.create({
      internship_id: data.internship_id,
      applicant_id: requestingUser.id,
      status: 'applied',
      onboarding_data: onboardingData,
    });

    await AuditLogModel.log({
      organizationId: internship.organization_id,
      userId: requestingUser.id,
      action: 'APPLICATION_CREATE',
      entityType: 'internship_applications',
      entityId: application.id,
      details: { internship_id: data.internship_id },
      ipAddress,
      userAgent,
    });

    return application;
  },

  async getApplication(id, requestingUser) {
    const application = await ApplicationModel.findById(id);
    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    if (reqRole === 'intern' && application.applicant_id !== requestingUser.id) {
      throw ApiError.forbidden('Interns can only view their own applications');
    }

    return application;
  },

  async listApplications(query, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';

    const organization_id = reqRole === 'super_admin' ? null : (requestingUser.organization_id || (await this.getEffectiveOrgId(requestingUser)));
    const applicant_id = reqRole === 'intern' ? requestingUser.id : null;
    const department_id = (reqRole === 'head' || reqRole === 'department_head') ? requestingUser.department_id : null;

    const items = await ApplicationModel.findPaginated({
      organization_id,
      department_id,
      applicant_id,
      status: query.status || '',
      search: query.search || '',
      limit,
      offset,
    });

    const totalItems = await ApplicationModel.count({
      organization_id,
      department_id,
      applicant_id,
      status: query.status || '',
      search: query.search || '',
    });

    return formatPaginatedResponse(items, totalItems, page, limit);
  },

  async reviewApplication(id, { status, notes }, reviewerUser, ipAddress = null, userAgent = null) {
    const application = await ApplicationModel.findById(id);
    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    const normalizedStatus = status === 'approved' ? 'accepted' : status;
    this.validateStateTransition(application.status, normalizedStatus);

    const updatedData = {
      ...(application.onboarding_data || {}),
      review_notes: notes || '',
    };

    const updatedApp = await ApplicationModel.updateStatus(id, {
      status: normalizedStatus,
      reviewed_by: reviewerUser.id,
      onboarding_data: updatedData,
    });

    await AuditLogModel.log({
      organizationId: application.organization_id,
      userId: reviewerUser.id,
      action: `APPLICATION_REVIEW_${normalizedStatus.toUpperCase()}`,
      entityType: 'internship_applications',
      entityId: id,
      details: { previous_status: application.status, new_status: normalizedStatus, notes },
      ipAddress,
      userAgent,
    });

    return updatedApp;
  },

  async createOrLinkInternAccount(applicationId, { password }, requestingUser, ipAddress = null, userAgent = null) {
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    this.validateStateTransition(application.status, 'account_created');

    const applicantUser = await UserModel.findByIdWithRoleAndPermissions(application.applicant_id);
    if (!applicantUser) {
      throw ApiError.notFound('Applicant user record not found');
    }

    const internRole = await RoleModel.findByName('intern');

    if (applicantUser.role_name !== 'intern') {
      await UserModel.update(applicantUser.id, { role_id: internRole.id });
    }

    if (password) {
      const passwordHash = await hashPassword(password);
      await UserModel.updatePassword(applicantUser.id, passwordHash);
    }

    const onbData = application.onboarding_data || {};
    const fifthLabDefaults = await resolveFifthLabDefaults({
      organizationId: application.organization_id,
      departmentId: application.department_id,
      supervisorId: null,
      email: applicantUser.email,
    });

    const internProfile = await ProfileModel.upsertInternProfile({
      user_id: applicantUser.id,
      organization_id: application.organization_id,
      department_id: fifthLabDefaults.departmentId,
      supervisor_id: fifthLabDefaults.supervisorId,
      institution: onbData.institution || null,
      field_of_study: onbData.field_of_study || null,
      academic_year: onbData.academic_year || null,
      status: 'onboarding',
    });

    if (fifthLabDefaults.departmentId) {
      await UserModel.update(applicantUser.id, { department_id: fifthLabDefaults.departmentId });
    }

    if (fifthLabDefaults.supervisorId && internProfile?.id) {
      await ProfileModel.recordSupervisorAssignment(
        internProfile.id,
        fifthLabDefaults.supervisorId,
        requestingUser.id,
        'active',
        'Auto-assigned default FifthLab supervisor'
      );
    }

    const updatedApp = await ApplicationModel.updateStatus(applicationId, {
      status: 'account_created',
      onboarding_step: 2,
    });

    await AuditLogModel.log({
      organizationId: application.organization_id,
      userId: requestingUser.id,
      action: 'APPLICATION_CREATE_INTERN_ACCOUNT',
      entityType: 'internship_applications',
      entityId: applicationId,
      details: { intern_user_id: applicantUser.id, intern_profile_id: internProfile.id },
      ipAddress,
      userAgent,
    });

    return {
      application: updatedApp,
      intern_profile: internProfile,
    };
  },

  async submitOnboardingInfo(data, requestingUser, ipAddress = null, userAgent = null) {
    let application = null;

    if (data.application_id) {
      application = await ApplicationModel.findById(data.application_id);
    } else {
      application = await this.findCurrentApplicationForUser(requestingUser.id);
    }

    const orgId = await this.getEffectiveOrgId(requestingUser);

    let assignedSupervisorProfile = null;
    let targetDeptId = data.department_id || requestingUser.department_id || null;
    const fifthLabDefaults = await resolveFifthLabDefaults({
      organizationId: orgId,
      departmentId: targetDeptId,
      supervisorId: null,
      email: requestingUser.email,
    });
    targetDeptId = fifthLabDefaults.departmentId;
    if (fifthLabDefaults.supervisorId) {
      assignedSupervisorProfile = await ProfileModel.findSupervisorById(fifthLabDefaults.supervisorId);
    }
    await UserModel.update(requestingUser.id, {
      date_of_birth: data.date_of_birth || data.dateOfBirth || null,
      phone: data.phone || requestingUser.phone || null,
      ...(targetDeptId ? { department_id: targetDeptId } : {}),
    });

    if (targetDeptId) {
      // Supervisor auto-assignment mechanism: find active supervisor in selected department
      const supRes = await query(
        `SELECT sp.* FROM supervisor_profiles sp
         JOIN users u ON u.id = sp.user_id
         WHERE (sp.department_id = $1 OR sp.department_id IS NULL) AND u.organization_id = $2 AND u.status = 'active' AND u.deleted_at IS NULL
         ORDER BY (sp.department_id IS NOT NULL) DESC, sp.created_at ASC LIMIT 1`,
        [targetDeptId, orgId]
      );
      assignedSupervisorProfile = assignedSupervisorProfile || supRes.rows[0] || null;
    }

    const internProfile = await ProfileModel.upsertInternProfile({
      user_id: requestingUser.id,
      organization_id: orgId,
      department_id: targetDeptId,
      supervisor_id: assignedSupervisorProfile ? assignedSupervisorProfile.id : null,
      institution: data.institution,
      field_of_study: data.field_of_study,
      academic_year: data.academic_year,
      emergency_contact: data.emergency_contact,
      skills: data.skills,
      status: 'onboarding',
    });

    if (assignedSupervisorProfile && internProfile && internProfile.id) {
      await ProfileModel.recordSupervisorAssignment(
        internProfile.id,
        assignedSupervisorProfile.id,
        requestingUser.id,
        'active',
        'Auto-assigned supervisor upon department selection'
      );
    }

    const existingRecord = await InternshipRecordModel.findActiveByUserId(requestingUser.id);
    const recordPayload = {
      department_id: targetDeptId,
      supervisor_id: assignedSupervisorProfile ? assignedSupervisorProfile.id : internProfile.supervisor_id || null,
      start_date: data.start_date,
      end_date: data.end_date,
      status: 'onboarding',
    };
    if (existingRecord) {
      await InternshipRecordModel.update(existingRecord.id, recordPayload);
    } else if (data.start_date && data.end_date) {
      await InternshipRecordModel.create({
        user_id: requestingUser.id,
        organization_id: orgId,
        ...recordPayload,
        title: 'Internship #1',
      });
    }

    let updatedApp = null;
    if (application) {
      const mergedData = {
        ...(application.onboarding_data || {}),
        info_submitted: true,
        phone: data.phone || requestingUser.phone || null,
        institution: data.institution,
        field_of_study: data.field_of_study,
        academic_year: data.academic_year,
        start_date: data.start_date,
        end_date: data.end_date,
        department_id: targetDeptId,
        emergency_contact: data.emergency_contact,
        skills: data.skills,
        onboarding_details: {
          ...((application.onboarding_data || {}).onboarding_details || {}),
          internship_info: {
            status: 'submitted',
            review_status: 'pending',
            submitted_at: new Date().toISOString(),
            details: {
              department_id: targetDeptId,
              institution: data.institution,
              field_of_study: data.field_of_study,
              academic_year: data.academic_year,
              phone: data.phone || requestingUser.phone || null,
              start_date: data.start_date,
              end_date: data.end_date,
            },
          },
        },
      };

      updatedApp = await ApplicationModel.updateStatus(application.id, {
        status: application.status === 'account_created' ? 'onboarding_in_progress' : application.status,
        onboarding_step: 3,
        onboarding_data: mergedData,
      });
    }

    const completeProfile = await ProfileModel.getCompleteInternProfile(requestingUser.id);

    try {
      await this.notifyAssignedSupervisor(requestingUser, {
        title: 'Onboarding Details Submitted',
        message: `${requestingUser.first_name} ${requestingUser.last_name} submitted internship onboarding details for supervisor review.`,
        type: 'onboarding_submission',
      });
    } catch (notifErr) {
      console.warn('Failed to send onboarding details notification:', notifErr);
    }

    return {
      application: updatedApp,
      intern_profile: completeProfile,
    };
  },

  async submitOnboardingDetails(data, requestingUser, ipAddress = null, userAgent = null) {
    const orgId = await this.getEffectiveOrgId(requestingUser);
    await this.ensureInternSupervisorLink(requestingUser);

    const application = await this.findCurrentApplicationForUser(requestingUser.id);
    const sectionLabel = ONBOARDING_SECTION_LABELS[data.section] || data.section;
    const submittedAt = new Date().toISOString();
    let updatedApp = null;

    if (application) {
      const previousData = application.onboarding_data || {};
      const previousDetails = previousData.onboarding_details || {};
      const mergedData = {
        ...previousData,
        onboarding_details: {
          ...previousDetails,
          [data.section]: {
            status: data.status || 'completed',
            review_status: 'pending',
            submitted_at: submittedAt,
            details: data.details || {},
          },
        },
      };

      updatedApp = await ApplicationModel.updateStatus(application.id, {
        status: application.status === 'account_created' ? 'onboarding_in_progress' : application.status,
        onboarding_data: mergedData,
      });
    }

    await AuditLogModel.log({
      organizationId: orgId,
      userId: requestingUser.id,
      action: 'ONBOARDING_DETAILS_SUBMIT',
      entityType: 'intern_profiles',
      entityId: requestingUser.id,
      details: { section: data.section, status: data.status || 'completed' },
      ipAddress,
      userAgent,
    });

    try {
      await this.notifyAssignedSupervisor(requestingUser, {
        title: 'Onboarding Details Updated',
        message: `${requestingUser.first_name} ${requestingUser.last_name} completed ${sectionLabel} in onboarding.`,
        type: 'onboarding_submission',
      });
    } catch (notifErr) {
      console.warn('Failed to send onboarding section notification:', notifErr);
    }

    return {
      application: updatedApp,
      section: data.section,
      status: data.status || 'completed',
      submitted_at: submittedAt,
    };
  },

  async reviewOnboardingDetails(internId, section, { status, notes }, reviewerUser, ipAddress = null, userAgent = null) {
    if (!ONBOARDING_SECTION_LABELS[section]) {
      throw ApiError.badRequest('Unknown onboarding section');
    }

    const reqRole = reviewerUser.role_name ? reviewerUser.role_name.toLowerCase() : '';
    const isSystemAdmin = ['super_admin', 'org_admin', 'admin', 'hr', 'head'].includes(reqRole);
    const internProfile = await ProfileModel.findInternProfileByUserId(internId);

    if (!isSystemAdmin) {
      if (reqRole !== 'supervisor') {
        throw ApiError.forbidden('Only supervisors or system administrators can review onboarding details');
      }
      const supProfile = await ProfileModel.findSupervisorProfileByUserId(reviewerUser.id);
      if (!supProfile || !internProfile || internProfile.supervisor_id !== supProfile.id) {
        throw ApiError.forbidden('Supervisors can only review onboarding details for their assigned interns');
      }
    }

    if (['rejected', 'resubmission_required'].includes(status) && (!notes || !notes.trim())) {
      throw ApiError.badRequest('A comment or reason is required when rejecting or requesting changes.');
    }

    const application = await this.findCurrentApplicationForUser(internId);
    if (!application) {
      throw ApiError.notFound('Application not found for intern');
    }

    const previousData = application.onboarding_data || {};
    const previousDetails = previousData.onboarding_details || {};
    const targetDetail = previousDetails[section];
    if (!targetDetail) {
      throw ApiError.notFound('Onboarding details section has not been submitted');
    }

    const reviewedAt = new Date().toISOString();
    const updatedDetail = {
      ...targetDetail,
      review_status: status,
      reviewed_by: reviewerUser.id,
      reviewed_at: reviewedAt,
      review_notes: notes ? notes.trim() : '',
    };

    const updatedApp = await ApplicationModel.updateStatus(application.id, {
      status: application.status === 'account_created' ? 'onboarding_in_progress' : application.status,
      onboarding_data: {
        ...previousData,
        onboarding_details: {
          ...previousDetails,
          [section]: updatedDetail,
        },
      },
    });

    await AuditLogModel.log({
      organizationId: application.organization_id || reviewerUser.organization_id,
      userId: reviewerUser.id,
      action: `ONBOARDING_DETAILS_REVIEW_${status.toUpperCase()}`,
      entityType: 'internship_applications',
      entityId: application.id,
      details: { section, review_status: status, notes },
      ipAddress,
      userAgent,
    });

    try {
      const formattedStatus = status.replace('_', ' ');
      await NotificationModel.create({
        userId: internId,
        title: `${ONBOARDING_SECTION_LABELS[section]} ${formattedStatus.toUpperCase()}`,
        message: `Your ${ONBOARDING_SECTION_LABELS[section]} onboarding details were marked as ${formattedStatus}.${notes ? ` Feedback: "${notes}"` : ''}`,
        type: 'onboarding_review',
        linkUrl: '/dashboard/onboarding',
      });
    } catch (notifErr) {
      console.warn('Failed to send onboarding details review notification to intern:', notifErr);
    }

    return {
      application: updatedApp,
      section,
      detail: updatedDetail,
    };
  },

  async submitOnboardingDocument(data, requestingUser, ipAddress = null, userAgent = null) {
    const orgId = await this.getEffectiveOrgId(requestingUser);

    // Link intern to a supervisor before persisting so the supervisor queue can see them
    await this.ensureInternSupervisorLink(requestingUser);

    const category = sanitizeTextInput(data.category || 'general');
    let fileName = data.file_name;
    let filePath = data.file_path;
    let fileSize = data.file_size;
    let mimeType = data.mime_type;
    let title = data.title;

    if (!data.file && (!fileName || !filePath)) {
      throw ApiError.badRequest('A PDF file upload is required for onboarding documents');
    }

    if (data.file) {
      assertSafeUpload(data.file, PDF_UPLOAD_TYPES);
      fileName = data.file.originalname;
      fileSize = data.file.size;
      mimeType = data.file.mimetype;
      title = sanitizeTextInput(title || data.file.originalname);
      filePath = StorageService.buildObjectPath({
        organizationId: orgId,
        ownerId: requestingUser.id,
        category,
        originalName: data.file.originalname,
      });
      await StorageService.uploadBuffer({
        buffer: data.file.buffer,
        mimeType,
        objectPath: filePath,
      });
    }

    if (!fileName || !filePath || !fileSize || !mimeType) {
      throw ApiError.badRequest('Document file metadata is required');
    }

    let targetInternshipRecordId = data.internship_record_id || null;
    if (!targetInternshipRecordId) {
      const activeRecord = await InternshipRecordModel.findActiveByUserId(requestingUser.id);
      if (activeRecord) {
        targetInternshipRecordId = activeRecord.id;
      }
    }

    const existingDoc = await OnboardingModel.findDocumentByOwnerAndCategory(
      requestingUser.id,
      category,
      targetInternshipRecordId
    );

    let doc;
    if (existingDoc) {
      // Preserve previous review history if doc was reviewed or replaced
      await OnboardingModel.addDocumentHistory({
        document_id: existingDoc.id,
        file_name: existingDoc.file_name,
        file_path: existingDoc.file_path,
        file_size: existingDoc.file_size,
        mime_type: existingDoc.mime_type,
        review_status: existingDoc.review_status || 'pending',
        reviewed_by: existingDoc.reviewer_id || null,
        reviewed_at: existingDoc.reviewed_at || null,
        review_notes: existingDoc.review_notes || null,
      });

      doc = await OnboardingModel.replaceDocumentFile(existingDoc.id, {
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        title,
        internship_record_id: targetInternshipRecordId,
      });
    } else {
      doc = await OnboardingModel.createDocument({
        organization_id: orgId,
        uploader_id: requestingUser.id,
        owner_id: requestingUser.id,
        title,
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        category,
        is_private: true,
        internship_record_id: targetInternshipRecordId,
      });
    }

    if (data.application_id) {
      const app = await ApplicationModel.findById(data.application_id);
      if (app) {
        const mergedData = {
          ...(app.onboarding_data || {}),
          documents_submitted: true,
        };
        await ApplicationModel.updateStatus(app.id, {
          status: app.status === 'account_created' ? 'onboarding_in_progress' : app.status,
          onboarding_data: mergedData,
        });
      }
    }

    await AuditLogModel.log({
      organizationId: orgId,
      userId: requestingUser.id,
      action: 'ONBOARDING_DOCUMENT_SUBMIT',
      entityType: 'documents',
      entityId: doc.id,
      details: { category: doc.category, title: doc.title, is_resubmission: !!existingDoc },
      ipAddress,
      userAgent,
    });

    // Notify assigned supervisor about intern onboarding document submission
    try {
      await this.notifyAssignedSupervisor(requestingUser, {
        title: 'New Onboarding Document Submitted',
        message: `${requestingUser.first_name} ${requestingUser.last_name} uploaded '${doc.title}' for onboarding review.`,
      });
    } catch (notifErr) {
      console.warn('Failed to send onboarding document submission notification:', notifErr);
    }

    return doc;
  },

  async trackDocuments(ownerId, requestingUser, internshipRecordId = null) {
    let targetRecord = null;
    if (internshipRecordId) {
      targetRecord = await InternshipRecordModel.findById(internshipRecordId);
    }
    if (!targetRecord) {
      targetRecord = await InternshipRecordModel.findActiveByUserId(ownerId);
    }
    const targetRecordId = targetRecord ? targetRecord.id : null;
    const docs = await OnboardingModel.findDocumentsByOwner(ownerId, null, targetRecordId);

    const checklist = await Promise.all(
      REQUIRED_DOCS.map(async (item) => {
        const doc = docs.find((d) => d.category === item.category) || null;
        let history = [];
        if (doc) {
          history = await OnboardingModel.getDocumentHistory(doc.id);
        }
        return {
          category: item.category,
          title: item.title,
          submitted: !!doc,
          review_status: doc ? doc.review_status || 'pending' : 'not_submitted',
          document: doc,
          history,
        };
      })
    );

    const approvedCount = checklist.filter((item) => item.review_status === 'approved').length;
    const totalRequired = REQUIRED_DOCS.length;
    const submittedCount = checklist.filter((item) => item.submitted).length;
    const rejectedItems = checklist.filter(
      (item) => item.review_status === 'rejected' || item.review_status === 'resubmission_required'
    );
    const hasRejections = rejectedItems.length > 0;
    const allSubmitted = checklist.every((item) => item.submitted);
    const allApproved = approvedCount === totalRequired;

    let status = 'not_started';
    if (allApproved) {
      status = 'completed';
    } else if (hasRejections) {
      status = 'action_required';
    } else if (allSubmitted) {
      status = 'pending';
    } else if (submittedCount > 0) {
      status = 'in_progress';
    } else {
      status = 'not_started';
    }

    const rejectionReason = hasRejections
      ? rejectedItems.map((item) => `${item.title}: ${item.document?.review_notes || 'Action required'}`).join('; ')
      : null;

    return {
      documents: docs,
      checklist,
      approved_count: approvedCount,
      total_required: totalRequired,
      progress_label: `${approvedCount}/${totalRequired} Approved`,
      onboarding_ready: allApproved,
      all_required_submitted: allSubmitted,
      status,
      action_required: status === 'action_required' || status === 'in_progress' || status === 'not_started',
      rejection_reason: rejectionReason,
      internship_record_id: targetRecordId,
      internship_number: targetRecord?.internship_number || 1,
      internship_title: targetRecord?.title || 'Internship #1',
    };
  },

  async reviewDocument(documentId, { status, notes }, reviewerUser, ipAddress = null, userAgent = null) {
    const docRes = await query(`SELECT * FROM documents WHERE id = $1 AND deleted_at IS NULL`, [documentId]);
    const doc = docRes.rows[0];
    if (!doc) {
      throw ApiError.notFound('Document not found');
    }

    const reqRole = reviewerUser.role_name ? reviewerUser.role_name.toLowerCase() : '';
    const isSystemAdmin = ['super_admin', 'org_admin', 'admin', 'hr'].includes(reqRole);

    if (!isSystemAdmin) {
      if (reqRole !== 'supervisor') {
        throw ApiError.forbidden('Only supervisors or system administrators can review onboarding documents');
      }
      const supProfile = await ProfileModel.findSupervisorProfileByUserId(reviewerUser.id);
      const internProfile = await ProfileModel.findInternProfileByUserId(doc.owner_id);
      if (!supProfile || !internProfile || internProfile.supervisor_id !== supProfile.id) {
        throw ApiError.forbidden('Supervisors can only review onboarding documents for their assigned interns');
      }
    }

    if (['rejected', 'resubmission_required'].includes(status) && (!notes || !notes.trim())) {
      throw ApiError.badRequest('A comment or reason is required when rejecting or requesting resubmission.');
    }

    const updatedDoc = await OnboardingModel.reviewDocument(documentId, {
      review_status: status,
      reviewer_id: reviewerUser.id,
      review_notes: notes ? notes.trim() : '',
    });

    await AuditLogModel.log({
      organizationId: doc.organization_id,
      userId: reviewerUser.id,
      action: `ONBOARDING_DOCUMENT_REVIEW_${status.toUpperCase()}`,
      entityType: 'documents',
      entityId: documentId,
      details: { review_status: status, notes },
      ipAddress,
      userAgent,
    });

    // Notify intern about document review update
    try {
      if (doc.owner_id) {
        const formattedStatus = status.replace('_', ' ');
        await NotificationModel.create({
          userId: doc.owner_id,
          title: `Onboarding Document ${formattedStatus.toUpperCase()}`,
          message: `Your document '${doc.title}' has been marked as ${formattedStatus} by supervisor.${notes ? ` Feedback: "${notes}"` : ''}`,
          type: 'onboarding_review',
          linkUrl: '/dashboard/onboarding',
        });
      }
    } catch (notifErr) {
      console.warn('Failed to send onboarding document review notification to intern:', notifErr);
    }

    return updatedDoc;
  },

  async getSupervisorOnboardingQueue(requestingUser) {
    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const orgId = reqRole === 'super_admin' ? null : requestingUser.organization_id;

    let supProfile = null;
    if (reqRole === 'supervisor') {
      supProfile = await ProfileModel.findSupervisorProfileByUserId(requestingUser.id);
      if (!supProfile && requestingUser.organization_id) {
        supProfile = await ProfileModel.upsertSupervisorProfile({
          user_id: requestingUser.id,
          organization_id: requestingUser.organization_id,
          department_id: requestingUser.department_id,
        });
      }
    }

    const values = [];
    const whereClauses = ['u.deleted_at IS NULL', "r.name = 'intern'"];
    if (orgId) {
      values.push(orgId);
      whereClauses.push(`u.organization_id = $${values.length}`);
    }

    const internRes = await query(
      `
      SELECT
        u.id AS user_id, u.organization_id, u.department_id, u.email,
        u.first_name, u.last_name, u.phone, u.avatar_url,
        u.date_of_birth, u.gender, u.address, u.city, u.state, u.country, u.bio,
        u.status AS user_status,
        u.created_at AS user_created_at,
        r.name AS role_name,
        d.name AS department_name, d.code AS department_code,
        ip.id AS intern_profile_id, ip.institution, ip.field_of_study, ip.academic_year,
        ip.emergency_contact, ip.skills, ip.work_location, ip.work_hours, ip.days_per_week,
        ip.status AS intern_status, ip.supervisor_id,
        sup_u.id AS supervisor_user_id, sup_u.first_name AS supervisor_first_name,
        sup_u.last_name AS supervisor_last_name, sup_u.email AS supervisor_email,
        head_u.id AS head_user_id, head_u.first_name AS head_first_name,
        head_u.last_name AS head_last_name, head_u.email AS head_email,
        ir.id AS internship_record_id, ir.title AS internship_title,
        ir.internship_number, ir.start_date, ir.end_date, ir.status AS internship_record_status,
        ir.work_location AS record_work_location, ir.work_hours AS record_work_hours,
        ir.days_per_week AS record_days_per_week,
        app.id AS application_id, app.onboarding_data AS application_onboarding_data
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN intern_profiles ip ON ip.user_id = u.id
      LEFT JOIN LATERAL (
        SELECT *
        FROM internship_records
        WHERE user_id = u.id AND status IN ('active', 'onboarding')
        ORDER BY internship_number DESC
        LIMIT 1
      ) ir ON true
      LEFT JOIN departments d ON d.id = COALESCE(u.department_id, ip.department_id, ir.department_id)
      LEFT JOIN supervisor_profiles sp ON sp.id = ip.supervisor_id
      LEFT JOIN users sup_u ON sup_u.id = sp.user_id
      LEFT JOIN users head_u ON head_u.id = d.head_user_id
      LEFT JOIN LATERAL (
        SELECT ia.*
        FROM internship_applications ia
        JOIN internships i ON i.id = ia.internship_id
        WHERE ia.applicant_id = u.id
        ORDER BY ia.created_at DESC
        LIMIT 1
      ) app ON true
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY u.created_at DESC
      LIMIT 100;
      `,
      values
    );

    const profiles = internRes.rows;
    if (profiles.length === 0) return [];

    const internIds = profiles.map((profile) => profile.user_id);
    const docsRes = await query(
      `
      SELECT *
      FROM documents
      WHERE owner_id = ANY($1::uuid[]) AND deleted_at IS NULL
      ORDER BY owner_id, created_at DESC;
      `,
      [internIds]
    );

    const docsByOwner = docsRes.rows.reduce((acc, doc) => {
      if (!acc.has(doc.owner_id)) acc.set(doc.owner_id, []);
      acc.get(doc.owner_id).push(doc);
      return acc;
    }, new Map());

    return profiles.map((fullProfile) => {
      const userDocs = docsByOwner.get(fullProfile.user_id) || [];
      const activeRecord = fullProfile.internship_record_id
        ? {
          id: fullProfile.internship_record_id,
          internship_number: fullProfile.internship_number,
          title: fullProfile.internship_title,
        }
        : null;
      const docTracking = buildDocumentTracking(userDocs, activeRecord);
      const hasSubmittedDocs = docTracking.checklist.some((d) => d.submitted);
      const applicationData = fullProfile.application_onboarding_data || {};
      const onboardingDetails = applicationData.onboarding_details || {};

      if (supProfile) {
        const isAssigned = fullProfile.supervisor_id === supProfile.id;
        const isSameDepartmentUnassigned =
          !fullProfile.supervisor_id &&
          fullProfile.department_id &&
          fullProfile.department_id === supProfile.department_id;
        const orphanWithSubmittedDocs =
          hasSubmittedDocs &&
          !fullProfile.supervisor_id &&
          (!fullProfile.department_id || fullProfile.department_id === supProfile.department_id);

        if (!isAssigned && !isSameDepartmentUnassigned && !orphanWithSubmittedDocs) {
          return null;
        }
      }

      return {
        intern_id: fullProfile.user_id,
        internId: fullProfile.user_id,
        user_id: fullProfile.user_id,
        internName: `${fullProfile.first_name} ${fullProfile.last_name}`.trim(),
        email: fullProfile.email,
        department: fullProfile.department_name || 'Unassigned',
        supervisor_id: fullProfile.supervisor_id || (supProfile ? supProfile.id : null),
        supervisor_name: fullProfile.supervisor_first_name
          ? `${fullProfile.supervisor_first_name} ${fullProfile.supervisor_last_name}`
          : (supProfile ? `${requestingUser.first_name} ${requestingUser.last_name}` : 'Unassigned'),
        approved_count: docTracking.approved_count,
        total_required: docTracking.total_required,
        progress_label: docTracking.progress_label,
        onboarding_ready: docTracking.onboarding_ready,
        onboarding_details: onboardingDetails,
        onboarding_info: {
          institution: fullProfile.institution || applicationData.institution || null,
          field_of_study: fullProfile.field_of_study || applicationData.field_of_study || null,
          academic_year: fullProfile.academic_year || applicationData.academic_year || null,
          phone: fullProfile.phone || applicationData.phone || null,
          start_date: fullProfile.start_date || applicationData.start_date || null,
          end_date: fullProfile.end_date || applicationData.end_date || null,
        },
        documents: docTracking.checklist,
        steps: docTracking.checklist,
      };
    }).filter(Boolean);
  },

  async assignSupervisorAndDepartment(data, requestingUser, ipAddress = null, userAgent = null) {
    let internUserId = data.intern_id;
    let application = null;

    if (data.application_id) {
      application = await ApplicationModel.findById(data.application_id);
      if (!application) throw ApiError.notFound('Application not found');
      internUserId = application.applicant_id;
    }

    if (!internUserId) {
      throw ApiError.badRequest('Either application_id or intern_id is required');
    }

    let supProfile = await ProfileModel.findSupervisorById(data.supervisor_id);
    if (!supProfile) {
      supProfile = await ProfileModel.findSupervisorProfileByUserId(data.supervisor_id);
    }
    if (!supProfile) {
      throw ApiError.notFound('Supervisor profile not found');
    }

    const supUser = await UserModel.findById(supProfile.user_id);
    const supervisorDeptId = supProfile.department_id || (supUser ? supUser.department_id : null);
    const targetDeptId = data.department_id || supervisorDeptId;

    if (targetDeptId && supervisorDeptId && targetDeptId !== supervisorDeptId) {
      throw ApiError.badRequest("Selected supervisor does not belong to the intern's department");
    }

    const updatedProfile = await ProfileModel.assignInternDepartmentAndSupervisor(
      internUserId,
      targetDeptId,
      supProfile.id
    );

    if (updatedProfile && updatedProfile.id) {
      await ProfileModel.recordSupervisorAssignment(
        updatedProfile.id,
        supProfile.id,
        requestingUser.id,
        'active',
        'Supervisor assigned during onboarding'
      );
    }

    if (application) {
      this.validateStateTransition(application.status, 'onboarding_in_progress');
      application = await ApplicationModel.updateStatus(application.id, {
        status: 'onboarding_in_progress',
        onboarding_step: 4,
      });
    }

    return {
      application,
      intern_profile: await ProfileModel.getCompleteInternProfile(internUserId),
    };
  },

  async completeOnboarding(data, requestingUser, ipAddress = null, userAgent = null) {
    let application = null;
    let internUserId = data.intern_id;

    if (data.application_id) {
      application = await ApplicationModel.findById(data.application_id);
      if (!application) throw ApiError.notFound('Application not found');
      internUserId = application.applicant_id;
    }

    if (!internUserId) {
      throw ApiError.badRequest('Either application_id or intern_id is required');
    }

    if (application) {
      this.validateStateTransition(application.status, 'onboarding_completed');
      application = await ApplicationModel.updateStatus(application.id, {
        status: 'onboarding_completed',
        onboarding_step: 5,
      });
    }

    await ProfileModel.updateInternStatus(internUserId, 'active');

    const orgId = await this.getEffectiveOrgId(requestingUser);

    await AuditLogModel.log({
      organizationId: orgId,
      userId: requestingUser.id,
      action: 'ONBOARDING_COMPLETE',
      entityType: 'intern_profiles',
      entityId: internUserId,
      details: { application_id: application ? application.id : null },
      ipAddress,
      userAgent,
    });

    return {
      application,
      intern_profile: await ProfileModel.getCompleteInternProfile(internUserId),
    };
  },
};

module.exports = OnboardingService;
