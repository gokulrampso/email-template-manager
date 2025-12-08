import { Request, Response } from 'express';
import { asyncHandler, apiResponse } from '../utils/asyncHandler.js';
import { uploadImage } from '../services/s3Service.js';

/**
 * POST /assets/upload
 * Upload an image to S3 and return the URL
 */
export const upload = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const { templateId } = req.body;

  if (!file) {
    return apiResponse.error(res, 'No file uploaded', 400);
  }

  if (!templateId) {
    return apiResponse.error(res, 'Template ID is required', 400);
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.mimetype)) {
    return apiResponse.error(
      res,
      'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG',
      400
    );
  }

  // Max file size: 5MB
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return apiResponse.error(res, 'File size exceeds 5MB limit', 400);
  }

  try {
    const imageUrl = await uploadImage(templateId, {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    return apiResponse.success(
      res,
      { url: imageUrl },
      'Image uploaded successfully'
    );
  } catch (error) {
    console.error('S3 upload error:', error);
    return apiResponse.error(res, 'Failed to upload image to S3', 500);
  }
});

