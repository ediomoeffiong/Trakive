const { validateData } = require('../utils/validator');

/**
 * Express middleware factory to validate incoming requests against a Joi schema rules object.
 * @param {object} schemas Object containing Joi schemas for body, query, and/or params
 * @param {object} [schemas.body]
 * @param {object} [schemas.query]
 * @param {object} [schemas.params]
 */
const validate = (schemas = {}) => (req, res, next) => {
  try {
    if (schemas.params) {
      req.params = validateData(schemas.params, req.params);
    }
    if (schemas.query) {
      req.query = validateData(schemas.query, req.query);
    }
    if (schemas.body) {
      req.body = validateData(schemas.body, req.body);
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = validate;
