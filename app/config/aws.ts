import { S3Client } from '@aws-sdk/client-s3';

const AWS_REGION = 'us-east-1';

export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET!,
  },
});

export const S3_CONFIG = {
  bucket: process.env.AWS_BUCKET!,
  region: AWS_REGION,
  baseUrl: `https://${process.env.AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com`,
} as const;
