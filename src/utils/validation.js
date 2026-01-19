// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Min 8 chars, 1 uppercase, 1 number
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return {
    isValid: minLength && hasUppercase && hasNumber,
    errors: {
      minLength: !minLength ? 'Password must be at least 8 characters' : null,
      hasUppercase: !hasUppercase ? 'Password must contain at least one uppercase letter' : null,
      hasNumber: !hasNumber ? 'Password must contain at least one number' : null
    }
  };
};

export const validateName = (name, fieldName = 'Name') => {
  if (!name || name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  return null;
};

export const validatePhone = (phone) => {
  // Australian phone number format
  const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Please enter a valid Australian phone number';
  }
  return null;
};

export const validateABN = (abn) => {
  // Remove spaces and check format
  const cleanABN = abn.replace(/\s/g, '');
  if (!/^\d{11}$/.test(cleanABN)) {
    return 'ABN must be 11 digits';
  }
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateNumber = (value, fieldName, min = 0, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (max !== null && num > max) {
    return `${fieldName} must not exceed ${max}`;
  }
  return null;
};

export const validatePercentage = (value, fieldName) => {
  return validateNumber(value, fieldName, 0, 100);
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required) {
      const error = validateRequired(value, rule.label || field);
      if (error) {
        errors[field] = error;
        isValid = false;
        return;
      }
    }
    
    if (value && rule.type) {
      let error = null;
      
      switch (rule.type) {
        case 'email':
          if (!validateEmail(value)) {
            error = 'Please enter a valid email address';
          }
          break;
        case 'password':
          const passwordValidation = validatePassword(value);
          if (!passwordValidation.isValid) {
            error = Object.values(passwordValidation.errors).filter(Boolean).join(', ');
          }
          break;
        case 'name':
          error = validateName(value, rule.label);
          break;
        case 'phone':
          error = validatePhone(value);
          break;
        case 'abn':
          error = validateABN(value);
          break;
        case 'number':
          error = validateNumber(value, rule.label, rule.min, rule.max);
          break;
        case 'percentage':
          error = validatePercentage(value, rule.label);
          break;
      }
      
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }
  });
  
  return { isValid, errors };
};