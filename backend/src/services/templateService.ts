import { v4 as uuidv4 } from 'uuid';
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, DYNAMODB_TABLE } from '../config/aws.js';
import { extractPlaceholders } from '../utils/placeholders.js';
import { toSnakeCase } from '../utils/stringUtils.js';
import type {
  EmailTemplate,
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateListItem,
  VersionListItem,
} from '../models/template.js';

/**
 * Check if a template name already exists
 * Returns the existing template if found, null otherwise
 */
export async function checkTemplateNameExists(name: string, excludeTemplateId?: string): Promise<{ exists: boolean; templateId?: string }> {
  const snakeCaseName = toSnakeCase(name);
  
  // Scan all templates and check for name match
  const result = await docClient.send(
    new ScanCommand({
      TableName: DYNAMODB_TABLE,
    })
  );

  if (!result.Items || result.Items.length === 0) {
    return { exists: false };
  }

  // Group by templateId and get latest version to check names
  const templateMap = new Map<string, EmailTemplate>();
  for (const item of result.Items) {
    const template = item as EmailTemplate;
    const existing = templateMap.get(template.templateId);
    if (!existing || template.version > existing.version) {
      templateMap.set(template.templateId, template);
    }
  }

  // Check if any template has the same snake_case name
  for (const template of templateMap.values()) {
    if (excludeTemplateId && template.templateId === excludeTemplateId) {
      continue; // Skip the current template when updating
    }
    if (toSnakeCase(template.name) === snakeCaseName) {
      return { exists: true, templateId: template.templateId };
    }
  }

  return { exists: false };
}

/**
 * Create a new email template (version 1)
 * Note: sampleData is handled separately via sampleDataService
 */
export async function createTemplate(input: CreateTemplateInput): Promise<EmailTemplate> {
  const now = new Date().toISOString();
  const templateId = uuidv4();
  const placeholders = extractPlaceholders(input.htmlContent);
  
  // Convert name to snake_case
  const snakeCaseName = toSnakeCase(input.name);

  const template: EmailTemplate = {
    templateId,
    version: 1,
    name: snakeCaseName,
    brandId: input.brandId,
    language: input.language,
    htmlContent: input.htmlContent,
    placeholders,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: template,
    })
  );

  return template;
}

/**
 * Get the latest version of a template
 * Excludes version 0 (sample data)
 */
export async function getLatestTemplate(templateId: string): Promise<EmailTemplate | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: DYNAMODB_TABLE,
      KeyConditionExpression: 'templateId = :templateId',
      ExpressionAttributeValues: {
        ':templateId': templateId,
      },
      ScanIndexForward: false, // Descending order (latest first)
    })
  );

  if (!result.Items || result.Items.length === 0) {
    return null;
  }

  // Filter out version 0 (sample data) and get the latest actual template version
  const templateVersions = result.Items.filter(
    (item) => (item as EmailTemplate).version > 0
  );

  if (templateVersions.length === 0) {
    return null;
  }

  return templateVersions[0] as EmailTemplate;
}

/**
 * Get a specific version of a template
 */
export async function getTemplateVersion(
  templateId: string,
  version: number
): Promise<EmailTemplate | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: DYNAMODB_TABLE,
      Key: {
        templateId,
        version,
      },
    })
  );

  return (result.Item as EmailTemplate) || null;
}

/**
 * Check if template content has changed
 * Note: sampleData changes do NOT trigger version creation
 */
function hasTemplateChanged(
  latest: EmailTemplate,
  input: UpdateTemplateInput
): boolean {
  const newName = input.name ?? latest.name;
  const newBrandId = input.brandId ?? latest.brandId;
  const newLanguage = input.language ?? latest.language;
  const newHtmlContent = input.htmlContent ?? latest.htmlContent;

  // Compare only template fields (NOT sampleData - that's managed separately)
  if (newName !== latest.name) return true;
  if (newBrandId !== latest.brandId) return true;
  if (newLanguage !== latest.language) return true;
  if (newHtmlContent !== latest.htmlContent) return true;

  return false;
}

/**
 * Update template - creates a new version only if content has changed
 * Returns { template, created: boolean } where created indicates if a new version was made
 */
export async function updateTemplate(
  templateId: string,
  input: UpdateTemplateInput
): Promise<{ template: EmailTemplate; created: boolean } | null> {
  // Get the latest version first
  const latestTemplate = await getLatestTemplate(templateId);
  
  if (!latestTemplate) {
    return null;
  }

  // Check if anything has changed
  if (!hasTemplateChanged(latestTemplate, input)) {
    // No changes - return existing template without creating new version
    return { template: latestTemplate, created: false };
  }

  const now = new Date().toISOString();
  const newVersion = latestTemplate.version + 1;
  const htmlContent = input.htmlContent ?? latestTemplate.htmlContent;
  const placeholders = extractPlaceholders(htmlContent);

  const newTemplate: EmailTemplate = {
    templateId,
    version: newVersion,
    name: input.name ?? latestTemplate.name,
    brandId: input.brandId ?? latestTemplate.brandId,
    language: input.language ?? latestTemplate.language,
    htmlContent,
    placeholders,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: newTemplate,
    })
  );

  return { template: newTemplate, created: true };
}

/**
 * List all templates (latest version only)
 */
export async function listTemplates(): Promise<TemplateListItem[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: DYNAMODB_TABLE,
    })
  );

  if (!result.Items || result.Items.length === 0) {
    return [];
  }

  // Group by templateId and get latest version (exclude version 0 - sample data)
  const templateMap = new Map<string, EmailTemplate>();

  for (const item of result.Items) {
    const template = item as EmailTemplate;
    
    // Skip version 0 (sample data)
    if (template.version === 0) {
      continue;
    }
    
    const existing = templateMap.get(template.templateId);

    if (!existing || template.version > existing.version) {
      templateMap.set(template.templateId, template);
    }
  }

  return Array.from(templateMap.values()).map((t) => ({
    templateId: t.templateId,
    name: t.name,
    version: t.version,
    brandId: t.brandId,
    language: t.language,
    updatedAt: t.updatedAt,
  }));
}

/**
 * List all versions of a template
 */
export async function listTemplateVersions(templateId: string): Promise<VersionListItem[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: DYNAMODB_TABLE,
      KeyConditionExpression: 'templateId = :templateId',
      ExpressionAttributeValues: {
        ':templateId': templateId,
      },
      ScanIndexForward: false, // Descending order (latest first)
    })
  );

  if (!result.Items || result.Items.length === 0) {
    return [];
  }

  // Filter out version 0 (sample data) and only return actual template versions
  return result.Items
    .filter((item) => {
      const version = (item as EmailTemplate).version;
      return version > 0; // Exclude version 0 (sample data)
    })
    .map((item) => ({
      version: (item as EmailTemplate).version,
      createdAt: (item as EmailTemplate).createdAt,
      updatedAt: (item as EmailTemplate).updatedAt,
    }));
}

/**
 * Restore a specific version - creates a new version from old content
 */
export async function restoreVersion(
  templateId: string,
  version: number
): Promise<EmailTemplate | null> {
  // Get the version to restore
  const versionToRestore = await getTemplateVersion(templateId, version);
  
  if (!versionToRestore) {
    return null;
  }

  // Get the latest version for version number
  const latestTemplate = await getLatestTemplate(templateId);
  
  if (!latestTemplate) {
    return null;
  }

  const now = new Date().toISOString();
  const newVersion = latestTemplate.version + 1;

  const restoredTemplate: EmailTemplate = {
    ...versionToRestore,
    version: newVersion,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: restoredTemplate,
    })
  );

  return restoredTemplate;
}

/**
 * Delete a template and all its versions
 */
export async function deleteTemplateById(templateId: string): Promise<boolean> {
  // First, get all versions of the template
  const result = await docClient.send(
    new QueryCommand({
      TableName: DYNAMODB_TABLE,
      KeyConditionExpression: 'templateId = :templateId',
      ExpressionAttributeValues: {
        ':templateId': templateId,
      },
    })
  );

  if (!result.Items || result.Items.length === 0) {
    return false;
  }

  // Delete each version
  for (const item of result.Items) {
    const template = item as EmailTemplate;
    await docClient.send(
      new DeleteCommand({
        TableName: DYNAMODB_TABLE,
        Key: {
          templateId: template.templateId,
          version: template.version,
        },
      })
    );
  }

  return true;
}

