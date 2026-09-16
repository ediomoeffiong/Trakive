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
const { hashPassword } = require('../utils/password.utils');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

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

const OnboardingService = {
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

    const targetDeptId =
      preferredDepartmentId ||
      internProfile?.department_id ||
      requestingUser.department_id ||
      null;

    let assignedSupervisorProfile = null;
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
      assignedSupervisorProfile = supRes.rows[0] || null;
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
    const internProfile = await ProfileModel.upsertInternProfile({
      user_id: applicantUser.id,
      organization_id: application.organization_id,
      department_id: application.department_id,
      institution: onbData.institution || null,
      field_of_study: onbData.field_of_study || null,
      academic_year: onbData.academic_year || null,
      status: 'onboarding',
    });

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
      const apps = await ApplicationModel.findPaginated({ applicant_id: requestingUser.id, limit: 1 });
      application = apps[0] || null;
    }

    const orgId = await this.getEffectiveOrgId(requestingUser);

    let assignedSupervisorProfile = null;
    let targetDeptId = data.department_id || requestingUser.department_id || null;
    await UserModel.update(requestingUser.id, {
      date_of_birth: data.date_of_birth || data.dateOfBirth || null,
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
      assignedSupervisorProfile = supRes.rows[0] || null;
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
        emergency_contact: data.emergency_contact,
        skills: data.skills,
      };

      updatedApp = await ApplicationModel.updateStatus(application.id, {
        status: application.status === 'account_created' ? 'onboarding_in_progress' : application.status,
        onboarding_step: 3,
        onboarding_data: mergedData,
      });
    }

    const completeProfile = await ProfileModel.getCompleteInternProfile(requestingUser.id);

    return {
      application: updatedApp,
      intern_profile: completeProfile,
    };
  },

  async submitOnboardingDocument(data, requestingUser, ipAddress = null, userAgent = null) {
    const orgId = await this.getEffectiveOrgId(requestingUser);

    // Link intern to a supervisor before persisting so the supervisor queue can see them
    await this.ensureInternSupervisorLink(requestingUser);

    const category = data.category || 'general';
    const existingDoc = await OnboardingModel.findDocumentByOwnerAndCategory(requestingUser.id, category);

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
        file_name: data.file_name,
        file_path: data.file_path,
        file_size: data.file_size,
        mime_type: data.mime_type,
        title: data.title,
      });
    } else {
      doc = await OnboardingModel.createDocument({
        organization_id: orgId,
        uploader_id: requestingUser.id,
        owner_id: requestingUser.id,
        title: data.title,
        file_name: data.file_name,
        file_path: data.file_path,
        file_size: data.file_size,
        mime_type: data.mime_type,
        category,
        is_private: true,
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
      const internProfile = await ProfileModel.findInternProfileByUserId(requestingUser.id);
      if (internProfile && internProfile.supervisor_id) {
        const supProfile = await ProfileModel.findSupervisorById(internProfile.supervisor_id);
        if (supProfile && supProfile.user_id) {
          await NotificationModel.create({
            userId: supProfile.user_id,
            title: 'New Onboarding Document Submitted',
            message: `${requestingUser.first_name} ${requestingUser.last_name} uploaded '${doc.title}' for onboarding review.`,
            type: 'onboarding_submission',
            linkUrl: '/supervisor/onboarding',
          });
        }
      }
    } catch (notifErr) {
      console.warn('Failed to send onboarding document submission notification:', notifErr);
    }

    return doc;
  },

  async trackDocuments(ownerId, requestingUser) {
    const docs = await OnboardingModel.findDocumentsByOwner(ownerId);

    const REQUIRED_DOCS = [
      { category: 'resume', title: 'Resume / CV' },
      { category: 'placement_letter', title: 'Internship / Placement Letter' },
      { category: 'acceptance_letter', title: 'Acceptance Letter' },
    ];

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

    return {
      documents: docs,
      checklist,
      approved_count: approvedCount,
      total_required: totalRequired,
      progress_label: `${approvedCount}/${totalRequired} Approved`,
      onboarding_ready: approvedCount === totalRequired,
      all_required_submitted: checklist.every((item) => item.submitted),
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

    const interns = await UserModel.findPaginated({
      organization_id: orgId,
      role: 'intern',
      limit: 100,
      offset: 0,
    });

    const queue = await Promise.all(
      interns.map(async (user) => {
        const fullProfile = await ProfileModel.getCompleteInternProfile(user.id);
        if (!fullProfile) return null;

        const docTracking = await this.trackDocuments(user.id, requestingUser);
        const hasSubmittedDocs = docTracking.checklist.some((d) => d.submitted);

        if (supProfile) {
          const isAssigned = fullProfile.supervisor_id === supProfile.id;
          const isSameDepartmentUnassigned =
            !fullProfile.supervisor_id &&
            fullProfile.department_id &&
            fullProfile.department_id === supProfile.department_id;
          // Catch submissions that landed before a department/supervisor was set
          const orphanWithSubmittedDocs =
            hasSubmittedDocs &&
            !fullProfile.supervisor_id &&
            (!fullProfile.department_id || fullProfile.department_id === supProfile.department_id);

          if (!isAssigned && !isSameDepartmentUnassigned && !orphanWithSubmittedDocs) {
            return null;
          }
        }

        return {
          intern_id: user.id,
          internId: user.id,
          user_id: user.id,
          internName: `${user.first_name} ${user.last_name}`.trim(),
          email: user.email,
          department: fullProfile.department_name || 'Unassigned',
          supervisor_id: fullProfile.supervisor_id || (supProfile ? supProfile.id : null),
          supervisor_name: fullProfile.supervisor_first_name
            ? `${fullProfile.supervisor_first_name} ${fullProfile.supervisor_last_name}`
            : (supProfile ? `${requestingUser.first_name} ${requestingUser.last_name}` : 'Unassigned'),
          approved_count: docTracking.approved_count,
          total_required: docTracking.total_required,
          progress_label: docTracking.progress_label,
          onboarding_ready: docTracking.onboarding_ready,
          documents: docTracking.checklist,
          steps: docTracking.checklist,
        };
      })
    );

    return queue.filter(Boolean);
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
