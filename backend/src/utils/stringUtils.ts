/**
 * Convert a string to snake_case
 * "Welcome Email" -> "welcome_email"
 * "My Template Name" -> "my_template_name"
 */
export function toSnakeCase(str: string): string {
  if (!str) return '';
  
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '') // Remove special characters except spaces, underscores, hyphens
    .replace(/[\s-]+/g, '_')        // Replace spaces and hyphens with underscores
    .replace(/_+/g, '_')            // Replace multiple underscores with single
    .replace(/^_|_$/g, '');         // Remove leading/trailing underscores
}


