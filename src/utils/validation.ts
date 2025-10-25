/**
 * Validation utilities for user input
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate password according to backend requirements
 * - At least 8 characters
 * - At least one digit
 * - At least one uppercase letter
 * - At least one lowercase letter
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one digit',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter',
    };
  }

  return { isValid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  return { isValid: true };
}

/**
 * Validate name fields (first, middle, last)
 * - At least 1 character
 * - Maximum 100 characters
 */
export function validateName(name: string, fieldName: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  if (name.length > 100) {
    return {
      isValid: false,
      error: `${fieldName} must be less than 100 characters`,
    };
  }

  return { isValid: true };
}

/**
 * Get password strength indicator
 */
export function getPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  message: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/\d/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score <= 2) {
    return {
      strength: 'weak',
      message: 'Weak password',
      color: 'text-red-500',
    };
  } else if (score <= 4) {
    return {
      strength: 'medium',
      message: 'Medium strength',
      color: 'text-amber-500',
    };
  } else {
    return {
      strength: 'strong',
      message: 'Strong password',
      color: 'text-emerald-500',
    };
  }
}

