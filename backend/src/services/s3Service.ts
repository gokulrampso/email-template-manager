import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET, AWS_REGION } from '../config/aws.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

/**
 * Upload an image to S3
 * @param templateId - The template ID for organizing files
 * @param file - The file buffer and metadata
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  templateId: string,
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  }
): Promise<string> {
  // Generate unique filename
  const extension = path.extname(file.originalname);
  const uniqueId = uuidv4();
  const key = `templates/${templateId}/images/${uniqueId}${extension}`;

  // Upload to S3
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Make publicly readable
      ACL: 'public-read',
    })
  );

  // Return public URL
  const publicUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
  
  return publicUrl;
}

/**
 * Delete an image from S3
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  // Extract key from URL
  const url = new URL(imageUrl);
  const key = url.pathname.substring(1); // Remove leading slash

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })
  );
}

/**
 * Get the S3 key from a full URL
 */
export function getKeyFromUrl(imageUrl: string): string {
  const url = new URL(imageUrl);
  return url.pathname.substring(1);
}

