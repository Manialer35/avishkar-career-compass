
// Input validation utilities for enhanced security

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: "Email is too long" };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  return { isValid: true };
};

export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,15}$/;
  
  if (!phone) {
    return { isValid: false, error: "Phone number is required" };
  }
  
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: "Please enter a valid phone number" };
  }
  
  return { isValid: true };
};

export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Name is required" };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: "Name is too long" };
  }
  
  // Allow only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: "Name can only contain letters, spaces, hyphens, and apostrophes" };
  }
  
  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .trim() // Remove leading/trailing whitespace
    .substring(0, 1000); // Limit length
};

export const validateAmount = (amount: number): { isValid: boolean; error?: string } => {
  if (isNaN(amount) || amount <= 0) {
    return { isValid: false, error: "Amount must be a positive number" };
  }
  
  if (amount > 100000) {
    return { isValid: false, error: "Amount cannot exceed ₹1,00,000" };
  }
  
  return { isValid: true };
};

// Rate limiting helper (client-side)
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
}
