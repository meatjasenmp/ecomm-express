import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Mock = mockClient(S3Client);

export const setupS3Mocks = (): void => {
  s3Mock.reset();

  s3Mock.on(PutObjectCommand).resolves({
    ETag: 'mock-etag-123',
  });

  s3Mock.on(DeleteObjectCommand).resolves({});
};

export const setupS3DeleteTrackingMock = (): string[] => {
  const deletedKeys: string[] = [];
  s3Mock.reset();

  s3Mock.on(DeleteObjectCommand).callsFake((params) => {
    deletedKeys.push(params.Key as string);
    return {};
  });

  return deletedKeys;
};

export const restoreS3Mocks = (): void => {
  s3Mock.reset();
};
