import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ConflictError } from '../errors';

interface CustomError {
  statusCode: number;
  message: string;
}

interface ErrorResponse {
  message: string;
  errors?: any[];
}

// if CustomApiError is thrown, it will assign the statusCode and message to customError object
// and will be caught by this error handler middleware
const errorHandlerMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  // set default
  const customError: CustomError = {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    message: err.message || 'Something went wrong, try again later',
  };

  // error object to be sent as error response
  const errObj: ErrorResponse = {
    message: customError.message,
    errors: [],
  };

  if (err instanceof ConflictError) {
    customError.statusCode = err.statusCode;
    errObj.errors = err.errors;
  }

  res.status(customError.statusCode).json(errObj);
};

export default errorHandlerMiddleware;
