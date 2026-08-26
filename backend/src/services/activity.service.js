const ActivityModel = require('../models/activity.model');
const UserModel = require('../models/user.model');
const ProfileModel = require('../models/profile.model');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const ActivityService = {
  async getEffectiveOrgId(requestingUser) {
    if (requestingUser.organization_id) return requestingUser.organization_id;
    const defaultOrgId = await ProfileModel.getOrCreateDefaultOrganization();
    await UserModel.update(requestingUser.id, { organization_id: defaultOrgId });
    return defaultOrgId;
  },

  async getActivities(requestingUser, queryParams) {
    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const { page, limit, offset } = getPaginationParams(queryParams);
    const orgId = await this.getEffectiveOrgId(requestingUser);

    const filter = {
      organizationId: orgId,
      entityType: queryParams.entity_type || null,
      action: queryParams.action || null,
      startDate: queryParams.start_date || null,
      endDate: queryParams.end_date || null,
      sortBy: queryParams.sort_by || 'created_at',
      order: queryParams.order || 'DESC',
      limit,
      offset,
    };

    if (role === 'intern') {
      filter.userId = requestingUser.id;
    } else if (queryParams.user_id) {
      filter.userId = queryParams.user_id;
    }

    const activities = await ActivityModel.findActivities(filter);
    const total = await ActivityModel.countActivities(filter);

    return formatPaginatedResponse(activities, total, page, limit);
  },
};

module.exports = ActivityService;
