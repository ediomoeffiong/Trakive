export const PASSWORD_POLICY_MESSAGE =
  'Password must be 8-100 characters and include uppercase, lowercase, number, and symbol. Spaces are not allowed.';

export const passwordValidators = {
  upper: (value) => /[A-Z]/.test(value) || 'Must contain at least 1 uppercase letter',
  lower: (value) => /[a-z]/.test(value) || 'Must contain at least 1 lowercase letter',
  number: (value) => /[0-9]/.test(value) || 'Must contain at least 1 number',
  special: (value) => /[^\sA-Za-z0-9]/.test(value) || 'Must contain at least 1 symbol',
  noSpaces: (value) => !/\s/.test(value) || 'Spaces are not allowed',
  printableAscii: (value) => /^[\x21-\x7E]*$/.test(value) || 'Use standard keyboard characters only',
};

export const passwordRegisterOptions = {
  required: 'Password is required',
  minLength: { value: 8, message: 'Password must be at least 8 characters' },
  maxLength: { value: 100, message: 'Password must be 100 characters or fewer' },
  validate: passwordValidators,
};
