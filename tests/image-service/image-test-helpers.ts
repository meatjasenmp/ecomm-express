import fs from 'fs';
import path from 'path';
import { ImageService, type UploadedFile } from '../../app/services/ImageService.ts';
import { clearDatabase } from '../helpers/database.ts';
import { setupS3Mocks, restoreS3Mocks } from '../helpers/s3-mock.ts';

export const setupImageServiceTest = async (): Promise<{
  imageService: ImageService;
  testImageBuffer: Buffer;
  testImagePath: string;
  mockFile: UploadedFile;
}> => {
  await clearDatabase();
  const imageService = new ImageService();

  const testImagePath = path.join(__dirname, 'test-image.jpg');
  const testImageBuffer = fs.readFileSync(testImagePath);

  setupS3Mocks();

  const mockFile = {
    buffer: testImageBuffer,
    originalname: 'test-image.jpg',
    mimetype: 'image/jpeg',
    size: testImageBuffer.length,
    fieldname: 'image',
    encoding: '7bit',
    destination: '',
    filename: '',
    path: '',
    stream: null as unknown as NodeJS.ReadableStream,
    key: `uploads/test-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`,
    location: `https://s3.amazonaws.com/ test-bucket/uploads/test-${Date.now()}.jpg`,
  };

  return { imageService, testImageBuffer, testImagePath, mockFile };
};

export const teardownImageServiceTest = (): void => {
  restoreS3Mocks();
};
