
// Security utility functions for XSS prevention and input validation

export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .replace(/data:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

export const createSecureElement = (tagName: string, textContent: string, className?: string): HTMLElement => {
  const element = document.createElement(tagName);
  element.textContent = textContent; // Safe - prevents XSS
  if (className) {
    element.className = className;
  }
  return element;
};

export const setSecureTextContent = (element: HTMLElement, content: string): void => {
  element.textContent = content; // Safe - prevents XSS
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .substring(0, 255);
};

export const escapeCSV = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const rateLimitKey = (userId: string, action: string): string => {
  return `rate_limit:${userId}:${action}`;
};

export const isStrongPassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

export const sanitizeJSON = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeHtml(key)] = sanitizeJSON(value);
    }
    return sanitized;
  }
  return obj;
};

// Content Security Policy helper
export const setCSPHeaders = (): void => {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;";
  document.head.appendChild(meta);
};

// Session timeout handling
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const scheduleSessionTimeout = (callback: () => void): NodeJS.Timeout => {
  return setTimeout(callback, SESSION_TIMEOUT);
};

export const clearSessionTimeout = (timeoutId: NodeJS.Timeout): void => {
  clearTimeout(timeoutId);
};
