const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\sA-Za-z0-9])[\x21-\x7E]{8,100}$/;

const passwordMessage =
  'Password must be 8-100 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol. Spaces are not allowed.';

module.exports = {
  passwordPattern,
  passwordMessage,
};
