/**
 * Utility functions for processing message content
 */

/**
 * Removes citation patterns like [doc1], [doc2], [docN] from text
 * Supports various citation formats:
 * - [doc1], [doc2], [doc123] - basic doc citations
 * - [source1], [source2] - source citations  
 * - [ref1], [ref2] - reference citations
 * - [1], [2], [3] - numeric citations
 * 
 * @param content - The message content to clean
 * @returns The content with citations removed
 */
export const removeCitations = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return content || '';
  }

  // Remove various citation patterns
  return content
    // Remove [doc1], [doc2], [docN] patterns
    .replace(/\[doc\d+\]/gi, '')
    // Remove [source1], [source2], [sourceN] patterns
    .replace(/\[source\d+\]/gi, '')
    // Remove [ref1], [ref2], [refN] patterns
    .replace(/\[ref\d+\]/gi, '')
    // Remove [1], [2], [3] numeric citations (but be careful not to remove other bracketed content)
    .replace(/\[(\d+)\]/g, '')
    // Remove any other common citation patterns
    .replace(/\[cite\d+\]/gi, '')
    .replace(/\[note\d+\]/gi, '')
    // Clean up multiple spaces that might result from removals
    .replace(/\s+/g, ' ')
    // Clean up spaces before punctuation
    .replace(/\s+([.,;:!?])/g, '$1')
    // Trim leading and trailing whitespace
    .trim();
};

/**
 * Enhanced citation removal that preserves markdown formatting
 * @param content - The markdown/text content to clean
 * @returns The content with citations removed while preserving formatting
 */
export const removeMarkdownCitations = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return content || '';
  }

  // First remove citations, then clean up any formatting issues
  let cleaned = removeCitations(content);

  // Fix any markdown formatting issues that might occur after citation removal
  cleaned = cleaned
    // Fix double spaces in markdown
    .replace(/(\*\*|__|\*|_)\s+(\*\*|__|\*|_)/g, '$1$2')
    // Fix spaces around markdown emphasis
    .replace(/(\*\*|__|\*|_)\s+/g, '$1')
    .replace(/\s+(\*\*|__|\*|_)/g, '$1')
    // Clean up line breaks after citation removal
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Clean up trailing spaces on lines
    .replace(/[ \t]+$/gm, '');

  return cleaned;
};

/**
 * Clean content specifically for display purposes
 * @param content - The content to clean for display
 * @param preserveMarkdown - Whether to preserve markdown formatting (default: true)
 * @returns Cleaned content ready for display
 */
export const cleanContentForDisplay = (content: string, preserveMarkdown: boolean = true): string => {
  if (preserveMarkdown) {
    return removeMarkdownCitations(content);
  }
  return removeCitations(content);
};