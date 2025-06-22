
import React from 'react';
import { sanitizeHtml, createSecureElement, setSecureTextContent } from '@/utils/securityUtils';

interface XSSProtectionProps {
  content: string;
  tagName?: keyof HTMLElementTagNameMap;
  className?: string;
  allowedTags?: string[];
}

const XSSProtection: React.FC<XSSProtectionProps> = ({
  content,
  tagName = 'div',
  className,
  allowedTags = []
}) => {
  const elementRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (elementRef.current) {
      // Clear existing content
      elementRef.current.innerHTML = '';
      
      // If no HTML tags are allowed, use textContent for safety
      if (allowedTags.length === 0) {
        setSecureTextContent(elementRef.current, content);
      } else {
        // Sanitize and set content for allowed tags
        const sanitizedContent = sanitizeHtml(content);
        setSecureTextContent(elementRef.current, sanitizedContent);
      }
    }
  }, [content, allowedTags]);

  return React.createElement(tagName, {
    ref: elementRef,
    className
  });
};

export default XSSProtection;
