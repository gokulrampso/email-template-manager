import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

// DynamoDB Client
const dynamoClient = new DynamoDBClient(awsConfig);
export const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

// S3 Client
export const s3Client = new S3Client(awsConfig);

// Environment variables
export const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'EmailTemplates';
export const S3_BUCKET = process.env.S3_BUCKET || 'email-template-assets';
export const AWS_REGION = process.env.AWS_REGION || 'us-east-1';


