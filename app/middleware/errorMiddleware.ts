import {
  type Request,
  type Response,
  type NextFunction,
  type ErrorRequestHandler,
} from 'express';
import { ErrorHandler } from '../errors/ErrorHandler.ts';

const errorMiddleware: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const baseError = ErrorHandler.handleError(err);
  const response = ErrorHandler.formatErrorResponse(baseError);
  res.status(baseError.statusCode).json(response);
};

export default errorMiddleware;
