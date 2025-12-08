import { Request, Response } from 'express';
import { asyncHandler, apiResponse } from '../utils/asyncHandler.js';
import {
  createTemplate,
  getLatestTemplate,
  getTemplateVersion,
  updateTemplate,
  listTemplates,
  listTemplateVersions,
  restoreVersion,
  deleteTemplateById,
  checkTemplateNameExists,
} from '../services/templateService.js';
import { upsertSampleData } from '../services/sampleDataService.js';
import { toSnakeCase } from '../utils/stringUtils.js';
import type { CreateTemplateInput, UpdateTemplateInput } from '../models/template.js';

/**
 * GET /templates/check-name
 * Check if a template name already exists
 */
export const checkName = asyncHandler(async (req: Request, res: Response) => {
  const { name, excludeId } = req.query;

  if (!name || typeof name !== 'string') {
    return apiResponse.error(res, 'Name query parameter is required', 400);
  }

  const snakeCaseName = toSnakeCase(name);
  const result = await checkTemplateNameExists(name, excludeId as string | undefined);

  return apiResponse.success(res, {
    name: name,
    snakeCaseName: snakeCaseName,
    exists: result.exists,
    existingTemplateId: result.templateId,
  }, result.exists ? 'Template name already exists' : 'Template name is available');
});

/**
 * POST /templates
 * Create a new template (version = 1)
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateTemplateInput = req.body;

  // Validation
  if (!input.name || typeof input.name !== 'string') {
    return apiResponse.error(res, 'Name is required', 400);
  }

  if (!input.htmlContent || typeof input.htmlContent !== 'string') {
    return apiResponse.error(res, 'HTML content is required', 400);
  }

  // Check for duplicate name
  const nameCheck = await checkTemplateNameExists(input.name);
  if (nameCheck.exists) {
    return apiResponse.error(res, `Template name "${toSnakeCase(input.name)}" already exists`, 409);
  }

  // Create template (without sampleData)
  const template = await createTemplate(input);
  
  // Save sampleData separately if provided
  if (input.sampleData && Object.keys(input.sampleData).length > 0) {
    await upsertSampleData(template.templateId, { sampleData: input.sampleData });
  }
  
  return apiResponse.created(res, template, 'Template created successfully');
});

/**
 * GET /templates
 * List all templates (latest version only)
 */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const templates = await listTemplates();
  return apiResponse.success(res, templates, 'Templates retrieved successfully');
});

/**
 * GET /templates/:id
 * Get the latest version of a template
 */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const template = await getLatestTemplate(id);

  if (!template) {
    return apiResponse.notFound(res, 'Template not found');
  }

  return apiResponse.success(res, template, 'Template retrieved successfully');
});

/**
 * PUT /templates/:id
 * Update template → creates a new version only if HTML/template content changed
 * Note: sampleData is NOT accepted here - use /templates/:id/sample-data endpoint
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const input: UpdateTemplateInput = req.body;

  // At least one field should be provided (sampleData is not part of this)
  if (!input.name && !input.htmlContent && !input.brandId && !input.language) {
    return apiResponse.error(res, 'At least one field to update is required', 400);
  }

  const result = await updateTemplate(id, input);

  if (!result) {
    return apiResponse.notFound(res, 'Template not found');
  }

  const { template, created } = result;
  
  if (created) {
    return apiResponse.success(res, template, `Template updated successfully (new version ${template.version} created)`);
  } else {
    return apiResponse.success(res, template, 'No changes detected - version unchanged');
  }
});

/**
 * GET /templates/:id/versions
 * List all versions of a template
 */
export const listVersions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const versions = await listTemplateVersions(id);

  if (versions.length === 0) {
    return apiResponse.notFound(res, 'Template not found or has no versions');
  }

  return apiResponse.success(res, versions, 'Versions retrieved successfully');
});

/**
 * GET /templates/:id/versions/:v
 * Get a specific version of a template
 */
export const getVersion = asyncHandler(async (req: Request, res: Response) => {
  const { id, v } = req.params;
  const version = parseInt(v, 10);

  if (isNaN(version) || version < 1) {
    return apiResponse.error(res, 'Invalid version number', 400);
  }

  const template = await getTemplateVersion(id, version);

  if (!template) {
    return apiResponse.notFound(res, 'Version not found');
  }

  return apiResponse.success(res, template, 'Version retrieved successfully');
});

/**
 * POST /templates/:id/versions/:v/restore
 * Restore a specific version → creates a new version from old content
 */
export const restore = asyncHandler(async (req: Request, res: Response) => {
  const { id, v } = req.params;
  const version = parseInt(v, 10);

  if (isNaN(version) || version < 1) {
    return apiResponse.error(res, 'Invalid version number', 400);
  }

  const template = await restoreVersion(id, version);

  if (!template) {
    return apiResponse.notFound(res, 'Version not found');
  }

  return apiResponse.success(res, template, `Version ${version} restored as version ${template.version}`);
});

/**
 * DELETE /templates/:id
 * Delete a template and all its versions
 */
export const deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deleted = await deleteTemplateById(id);

  if (!deleted) {
    return apiResponse.notFound(res, 'Template not found');
  }

  return apiResponse.success(res, { templateId: id }, 'Template deleted successfully');
});

