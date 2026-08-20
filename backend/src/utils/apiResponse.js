/**
 * Send standard success API response
 * @param {import('express').Response} res 
 * @param {object} params
 * @param {number} [params.statusCode=200]
 * @param {string} [params.message='Success']
 * @param {object|Array|null} [params.data=null]
 * @param {object|null} [params.meta=null]
 */
const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) => {
  const payload = {
    success: true,
    statusCode,
    message,
    data,
  };

  if (meta !== null && meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
};
