/**
 * Email Template Model Interfaces
 */

export interface EmailTemplate {
  templateId: string;      // PK - UUID
  version: number;         // SK - Auto-incremented version
  name: string;            // Template name
  brandId?: string;        // Optional brand identifier
  language?: string;       // Optional language code
  htmlContent: string;     // The HTML content
  placeholders: string[];  // Extracted variables like {{user.name}}
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}

export interface CreateTemplateInput {
  name: string;
  brandId?: string;
  language?: string;
  htmlContent: string;
  sampleData?: Record<string, string>; // Optional: initial sample data
}

export interface UpdateTemplateInput {
  name?: string;
  brandId?: string;
  language?: string;
  htmlContent?: string;
  // Note: sampleData is NOT part of UpdateTemplateInput - it's managed separately
}

export interface TemplateListItem {
  templateId: string;
  name: string;
  version: number;
  brandId?: string;
  language?: string;
  updatedAt: string;
}

export interface VersionListItem {
  version: number;
  createdAt: string;
  updatedAt: string;
}

