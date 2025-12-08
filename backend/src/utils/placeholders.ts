/**
 * Extract placeholder variables from HTML content
 * Finds all {{variable}} patterns in the HTML
 * 
 * @param html - The HTML content to parse
 * @returns Array of unique placeholder variable names
 */
export function extractPlaceholders(html: string): string[] {
  // Match {{variable}} or {{object.property}} patterns
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = html.matchAll(regex);
  
  const placeholders = new Set<string>();
  
  for (const match of matches) {
    // Trim whitespace from the variable name
    const placeholder = match[1].trim();
    if (placeholder) {
      placeholders.add(placeholder);
    }
  }
  
  return Array.from(placeholders).sort();
}

/**
 * Validate placeholder format
 * Valid: {{user.name}}, {{firstName}}, {{order_id}}
 * Invalid: {{123}}, {{user name}}, {{}}
 */
export function isValidPlaceholder(placeholder: string): boolean {
  // Allow alphanumeric, underscore, and dots (for nested objects)
  const validPattern = /^[a-zA-Z_][a-zA-Z0-9_.]*$/;
  return validPattern.test(placeholder);
}

/**
 * Replace placeholders with sample data for preview
 */
export function replacePlaceholdersWithSample(
  html: string,
  sampleData: Record<string, string> = {}
): string {
  return html.replace(/\{\{([^}]+)\}\}/g, (match, placeholder) => {
    const trimmed = placeholder.trim();
    return sampleData[trimmed] || `[${trimmed}]`;
  });
}


