import { Request, Response } from 'express';
import { asyncHandler, apiResponse } from '../utils/asyncHandler.js';
import {
  getSampleData,
  upsertSampleData,
  deleteSampleData,
} from '../services/sampleDataService.js';
import { getLatestTemplate } from '../services/templateService.js';
import type { UpdateSampleDataInput } from '../models/sampleData.js';

/**
 * GET /templates/:id/sample-data
 * Get sample data for a template
 */
export const get = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verify template exists
  const template = await getLatestTemplate(id);
  if (!template) {
    return apiResponse.notFound(res, 'Template not found');
  }

  const sampleData = await getSampleData(id);
  
  if (!sampleData) {
    return apiResponse.success(res, { templateId: id, sampleData: {} }, 'No sample data found');
  }

  return apiResponse.success(res, sampleData, 'Sample data retrieved successfully');
});

/**
 * PUT /templates/:id/sample-data
 * Create or update sample data for a template
 * This does NOT create a new template version
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const input: UpdateSampleDataInput = req.body;

  // Validation
  if (!input.sampleData || typeof input.sampleData !== 'object') {
    return apiResponse.error(res, 'sampleData object is required', 400);
  }

  // Verify template exists
  const template = await getLatestTemplate(id);
  if (!template) {
    return apiResponse.notFound(res, 'Template not found');
  }

  const result = await upsertSampleData(id, input);
  return apiResponse.success(res, result, 'Sample data updated successfully');
});

/**
 * DELETE /templates/:id/sample-data
 * Delete sample data for a template
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verify template exists
  const template = await getLatestTemplate(id);
  if (!template) {
    return apiResponse.notFound(res, 'Template not found');
  }

  await deleteSampleData(id);
  return apiResponse.success(res, { templateId: id }, 'Sample data deleted successfully');
});

