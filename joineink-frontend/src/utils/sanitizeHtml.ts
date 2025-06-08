import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks while preserving basic formatting.
 * 
 * This function uses DOMPurify to clean potentially dangerous HTML content.
 * Only allows safe formatting tags (bold, italic, underline, paragraphs, line breaks)
 * and removes all attributes to prevent attribute-based XSS attacks.
 * 
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for use with dangerouslySetInnerHTML
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    // Only allow basic formatting tags that are safe
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p'],
    // Remove all attributes to prevent attribute-based XSS
    ALLOWED_ATTR: [],
    // Additional security settings
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false
  });
};

/**
 * Type-safe wrapper for dangerouslySetInnerHTML with automatic sanitization
 */
export const createSafeHtml = (html: string) => ({
  __html: sanitizeHtml(html)
}); 