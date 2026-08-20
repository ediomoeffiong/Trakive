const ApiError = require('./apiError');

/**
 * Validate object against Joi schema
 * @param {object} schema Joi schema object
 * @param {object} data Object to validate
 * @returns {object} Validated value
 * @throws {ApiError} Unprocessable Entity error if invalid
 */
const validateData = (schema, data) => {
  if (!schema) return data;

  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    errors: {
      wrap: {
        label: '',
      },
    },
  });

  if (error) {
    const formattedErrors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    throw ApiError.unprocessableEntity('Validation Error', formattedErrors);
  }

  return value;
};

module.exports = {
  validateData,
};
