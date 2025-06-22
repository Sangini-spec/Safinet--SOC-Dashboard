
import DOMPurify from 'dompurify';

// Session timeout configuration (30 minutes)
export const SESSION_TIMEOUT = 30 * 60 * 1000;

// Enhanced XSS protection utilities
export const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    // Server-side fallback - basic sanitization
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  return DOMPurify.sanitize(html);
};

export const sanitizeJSON = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  const sanitized = JSON.parse(JSON.stringify(obj));
  
  const sanitizeRecursive = (item: any): any => {
    if (typeof item === 'string') {
      return sanitizeHtml(item);
    }
    if (Array.isArray(item)) {
      return item.map(sanitizeRecursive);
    }
    if (typeof item === 'object' && item !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(item)) {
        result[sanitizeHtml(key)] = sanitizeRecursive(value);
      }
      return result;
    }
    return item;
  };
  
  return sanitizeRecursive(sanitized);
};

export const createSecureElement = (tagName: string): HTMLElement => {
  const allowedTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!allowedTags.includes(tagName.toLowerCase())) {
    throw new Error(`Tag ${tagName} is not allowed`);
  }
  return document.createElement(tagName);
};

export const setSecureTextContent = (element: HTMLElement, content: string): void => {
  element.textContent = content;
};

// Session management utilities
export const scheduleSessionTimeout = (callback: () => void): NodeJS.Timeout => {
  return setTimeout(callback, SESSION_TIMEOUT);
};

export const clearSessionTimeout = (timeoutId: NodeJS.Timeout): void => {
  clearTimeout(timeoutId);
};

// Enhanced validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const validateApiKey = (apiKey: string): boolean => {
  return typeof apiKey === 'string' && 
         apiKey.length >= 10 && 
         apiKey.length <= 500 &&
         !/[<>'"&]/.test(apiKey);
};
