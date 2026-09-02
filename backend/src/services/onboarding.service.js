const ApiError = require('../utils/apiError');
const ApplicationModel = require('../models/application.model');
const OnboardingModel = require('../models/onboarding.model');
const UserModel = require('../models/user.model');
const ProfileModel = require('../models/profile.model');
const RoleModel = require('../models/role.model');
const InternshipModel = require('../models/internship.model');
const AuditLogModel = require('../models/auditLog.model');
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
    const defaultOrgId = await ProfileModel.getOrCreateDefaultOrganization();
    await UserModel.update(requestingUser.id, { organization_id: defaultOrgId });
    return defaultOrgId;
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

    const internProfile = await ProfileModel.upsertInternProfile({
      user_id: requestingUser.id,
      organization_id: orgId,
      institution: data.institution,
      field_of_study: data.field_of_study,
      academic_year: data.academic_year,
      emergency_contact: data.emergency_contact,
      skills: data.skills,
      status: 'onboarding',
    });

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

    return {
      application: updatedApp,
      intern_profile: internProfile,
    };
  },

  async submitOnboardingDocument(data, requestingUser, ipAddress = null, userAgent = null) {
    const orgId = await this.getEffectiveOrgId(requestingUser);

    const doc = await OnboardingModel.createDocument({
      organization_id: orgId,
      uploader_id: requestingUser.id,
      owner_id: requestingUser.id,
      title: data.title,
      file_name: data.file_name,
      file_path: data.file_path,
      file_size: data.file_size,
      mime_type: data.mime_type,
      category: data.category || 'general',
      is_private: true,
    });

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
      details: { category: doc.category, title: doc.title },
      ipAddress,
      userAgent,
    });

    return doc;
  },

  async trackDocuments(ownerId, requestingUser) {
    const docs = await OnboardingModel.findDocumentsByOwner(ownerId);
    const requiredCategories = ['id_proof', 'agreement'];
    const submittedCategories = docs.map((d) => d.category);

    const checklist = requiredCategories.map((cat) => ({
      category: cat,
      submitted: submittedCategories.includes(cat),
      document: docs.find((d) => d.category === cat) || null,
    }));

    return {
      documents: docs,
      checklist,
      all_required_submitted: checklist.every((item) => item.submitted),
    };
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
