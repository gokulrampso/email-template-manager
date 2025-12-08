import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrapper for async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Standard API response format
 */
export const apiResponse = {
  success: <T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  error: (res: Response, message: string, statusCode: number = 500, details?: any) => {
    return res.status(statusCode).json({
      success: false,
      message,
      error: details || null,
    });
  },

  created: <T>(res: Response, data: T, message: string = 'Created successfully') => {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  },

  notFound: (res: Response, message: string = 'Resource not found') => {
    return res.status(404).json({
      success: false,
      message,
    });
  },
};

