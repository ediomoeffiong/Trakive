const ApiError = require('../utils/apiError');

/**
 * Validates registration / internship period dates:
 * - startDate: cannot be future-dated and cannot be more than 1 year before today.
 * - endDate: cannot be future-dated and cannot be before startDate.
 */
function validateInternshipDates(startDateInput, endDateInput) {
  if (!startDateInput || !endDateInput) {
    throw ApiError.badRequest('Both start date and end date are required');
  }

  const start = new Date(startDateInput);
  const end = new Date(endDateInput);
  const now = new Date();

  // Normalize today's end of day (23:59:59.999) for fair comparison
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  // 1 year ago start of day
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 0, 0, 0, 0);

  if (isNaN(start.getTime())) {
    throw ApiError.badRequest('Invalid start date format');
  }
  if (isNaN(end.getTime())) {
    throw ApiError.badRequest('Invalid end date format');
  }

  // startDate validation
  if (start > todayEnd) {
    throw ApiError.badRequest('Start date cannot be in the future');
  }
  if (start < oneYearAgo) {
    throw ApiError.badRequest('Start date cannot be more than 1 year before today');
  }

  // endDate validation
  if (end > todayEnd) {
    throw ApiError.badRequest('End date cannot be in the future');
  }
  if (end < start) {
    throw ApiError.badRequest('End date cannot be before start date');
  }

  return true;
}

module.exports = {
  validateInternshipDates,
};
