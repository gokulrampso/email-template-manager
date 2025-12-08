/**
 * Sample Data Model Interfaces
 * Sample data is stored separately from templates and doesn't create versions
 */

export interface TemplateSampleData {
  templateId: string;      // PK - Links to template
  sampleData: Record<string, string>; // Key-value pairs for placeholders
  updatedAt: string;      // ISO timestamp
}

export interface UpdateSampleDataInput {
  sampleData: Record<string, string>;
}


