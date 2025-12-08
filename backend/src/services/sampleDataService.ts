import {
  PutCommand,
  GetCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, DYNAMODB_TABLE } from '../config/aws.js';
import type { TemplateSampleData, UpdateSampleDataInput } from '../models/sampleData.js';

const SAMPLE_DATA_VERSION = 0; // Use version 0 for sample data (templates start at 1)

/**
 * Get sample data for a template
 */
export async function getSampleData(templateId: string): Promise<TemplateSampleData | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: DYNAMODB_TABLE,
      Key: {
        templateId,
        version: SAMPLE_DATA_VERSION,
      },
    })
  );

  if (!result.Item) {
    return null;
  }

  return {
    templateId: result.Item.templateId as string,
    sampleData: result.Item.sampleData as Record<string, string>,
    updatedAt: result.Item.updatedAt as string,
  };
}

/**
 * Create or update sample data for a template
 */
export async function upsertSampleData(
  templateId: string,
  input: UpdateSampleDataInput
): Promise<TemplateSampleData> {
  const now = new Date().toISOString();

  const sampleData: TemplateSampleData = {
    templateId,
    sampleData: input.sampleData,
    updatedAt: now,
  };

  // Store with version 0 (templates start at version 1)
  await docClient.send(
    new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        templateId,
        version: SAMPLE_DATA_VERSION,
        sampleData: input.sampleData,
        updatedAt: now,
      },
    })
  );

  return sampleData;
}

/**
 * Delete sample data for a template
 */
export async function deleteSampleData(templateId: string): Promise<boolean> {
  await docClient.send(
    new DeleteCommand({
      TableName: DYNAMODB_TABLE,
      Key: {
        templateId,
        version: SAMPLE_DATA_VERSION,
      },
    })
  );

  return true;
}

