/**
 * API Error Handling Middleware
 * 统一的错误处理和响应格式
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config, isProd } from '../config';

// ============================================
// Custom Error Classes
// ============================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST', details?: unknown) {
    super(400, message, code, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(401, message, code);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(403, message, code);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(404, message, code);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', code = 'CONFLICT') {
    super(409, message, code);
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message = 'Too many requests', code = 'RATE_LIMIT_EXCEEDED', retryAfter?: number) {
    super(429, message, code, { retryAfter });
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    super(500, message, code);
  }
}

// ============================================
// Error Response Interface
// ============================================

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
    stack?: string;
  };
  requestId?: string;
  timestamp: string;
}

// ============================================
// Error Handler Middleware
// ============================================

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Generate request ID for tracking
  const requestId = req.headers['x-request-id'] as string || generateRequestId();

  // Log error
  console.error(`[${requestId}] Error:`, {
    name: err.name,
    message: err.message,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  // Handle different error types
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorCode = err.code || 'API_ERROR';
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  } else if ((err as any).code === 'ECONNREFUSED') {
    statusCode = 503;
    errorCode = 'SERVICE_UNAVAILABLE';
    message = 'Database connection failed';
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      code: errorCode,
      details: details || undefined,
      // Only include stack trace in development
      stack: !isProd ? err.stack : undefined,
    },
    requestId,
    timestamp: new Date().toISOString(),
  };

  // Send response
  res.status(statusCode).json(errorResponse);
}

// ============================================
// Not Found Handler
// ============================================

export function notFoundHandler(req: Request, res: Response): void {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(errorResponse);
}

// ============================================
// Async Handler Wrapper
// ============================================

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ============================================
// Request ID Generator
// ============================================

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Request ID Middleware
// ============================================

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}

// ============================================
// Success Response Helper
// ============================================

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export function successResponse<T>(data: T, meta?: SuccessResponse<T>['meta']): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}
