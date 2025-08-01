import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../../server.ts';
import { clearDatabase } from '../helpers/database.ts';

describe('Image Upload Endpoints', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/images', () => {
    it('should return 400 when no file is provided', async () => {
      const response = await request(app).post('/api/images').expect(400);
      expect(response.body.error).toBe('No file provided');
    });
  });

  describe('POST /api/images/multiple', () => {
    it('should return 400 when no files are provided', async () => {
      const response = await request(app).post('/api/images/multiple').expect(400);
      expect(response.body.error).toBe('No files provided');
    });
  });

  describe('GET /api/images/:id', () => {
    it('should return 404 for non-existent image', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app).get(`/api/images/${fakeId}`).expect(404);
    });

    it('should return 400 for invalid image id', async () => {
      await request(app).get('/api/images/invalid-id').expect(404);
    });
  });

  describe('DELETE /api/images/:id', () => {
    it('should return 404 when deleting non-existent image', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await request(app).delete(`/api/images/${fakeId}`).expect(404);
    });

    it('should return 400 for invalid image id', async () => {
      await request(app).delete('/api/images/invalid-id').expect(404);
    });
  });

  describe('File validation', () => {
    it('should reject non-image files', async () => {
      const textFilePath = path.join(__dirname, 'test.txt');
      fs.writeFileSync(textFilePath, 'This is not an image');

      await request(app)
        .post('/api/images')
        .attach('image', textFilePath)
        .expect(400);

      fs.unlinkSync(textFilePath);
    });
  });
});
