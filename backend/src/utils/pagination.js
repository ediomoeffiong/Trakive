/**
 * Parse pagination parameters from request query
 * @param {object} query 
 * @param {number} [defaultPage=1] 
 * @param {number} [defaultLimit=10] 
 * @param {number} [maxLimit=100] 
 */
const getPaginationParams = (query = {}, defaultPage = 1, defaultLimit = 10, maxLimit = 100) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) {
    page = defaultPage;
  }

  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  } else if (limit > maxLimit) {
    limit = maxLimit;
  }

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

/**
 * Format paginated data response meta object
 * @param {Array} items 
 * @param {number} totalItems 
 * @param {number} page 
 * @param {number} limit 
 */
const formatPaginatedResponse = (items, totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return {
    items,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  getPaginationParams,
  formatPaginatedResponse,
};
