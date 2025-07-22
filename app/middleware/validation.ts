import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodType } from 'zod';

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };
};

export const validateParams = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: 'Invalid parameters',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };
};