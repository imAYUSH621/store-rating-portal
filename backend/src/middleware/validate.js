/**
 * Input validation helpers mapped 1:1 to specification constraints.
 * Provides clear human-friendly error messages when input constraints fail.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\]/;
const UPPERCASE_REGEX = /[A-Z]/;

function validateName(name) {
  if (typeof name !== 'string') {
    return 'Name is required.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 20) {
    return 'Name must be at least 20 characters long per requirement (received ' + trimmed.length + ').';
  }
  if (trimmed.length > 60) {
    return 'Name cannot exceed 60 characters (received ' + trimmed.length + ').';
  }
  return null;
}

function validateEmail(email) {
  if (typeof email !== 'string') {
    return 'Email is required.';
  }
  const trimmed = email.trim();
  if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
    return 'Please provide a valid email address.';
  }
  return null;
}

function validateAddress(address) {
  if (typeof address !== 'string') {
    return 'Address is required.';
  }
  const trimmed = address.trim();
  if (!trimmed) {
    return 'Address cannot be empty.';
  }
  if (trimmed.length > 400) {
    return 'Address cannot exceed 400 characters.';
  }
  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters long.';
  }
  if (!UPPERCASE_REGEX.test(password)) {
    return 'Password must include at least one uppercase letter.';
  }
  if (!SPECIAL_CHAR_REGEX.test(password)) {
    return 'Password must include at least one special character (!@#$%^&*...).';
  }
  return null;
}

function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
}

/**
 * Middleware for user signup / admin add user
 */
function validateUserRegistration(req, res, next) {
  const { name, email, address, password, role } = req.body;
  const errors = {};

  const nameError = validateName(name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const addressError = validateAddress(address);
  if (addressError) errors.address = addressError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  if (role && !['ADMIN', 'USER', 'STORE_OWNER'].includes(role)) {
    errors.role = 'Role must be one of: ADMIN, USER, STORE_OWNER.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
}

/**
 * Middleware for store creation
 */
function validateStoreCreation(req, res, next) {
  const { name, email, address } = req.body;
  const errors = {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'Store name is required.';
  } else if (name.trim().length > 100) {
    errors.name = 'Store name cannot exceed 100 characters.';
  }

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const addressError = validateAddress(address);
  if (addressError) errors.address = addressError;

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
}

/**
 * Middleware for password update
 */
function validatePasswordUpdate(req, res, next) {
  const { oldPassword, newPassword } = req.body;
  const errors = {};

  if (!oldPassword) {
    errors.oldPassword = 'Current password is required.';
  }

  const newPassError = validatePassword(newPassword);
  if (newPassError) errors.newPassword = newPassError;

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
}

module.exports = {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateRating,
  validateUserRegistration,
  validateStoreCreation,
  validatePasswordUpdate
};
