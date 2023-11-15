import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ConflictError, InvalidPayloadError } from '../errors';
import CustomApiError from '../errors/custom-api';
import logger from '../logger';
import generateErrLog from './utils/log-generator';

interface ErrorResponse {
  message: string;
  errors?: any[];
}

// if CustomApiError is thrown, it will assign the statusCode and message to customError object
// and will be caught by this error handler middleware
const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // set default
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  // error object to be sent as error response
  const errObj: ErrorResponse = {
    message: err.message || 'Something went wrong, try again later',
    errors: [],
  };

  if (err instanceof CustomApiError) statusCode = err.statusCode;

  if (err instanceof ConflictError) errObj.errors = err.errors;

  // if error is thrown by express-validator append validationErrors to errorObj
  if (err instanceof InvalidPayloadError) errObj.errors = err.validationErrors;

  logger.error(generateErrLog(err, req));
  res.status(statusCode).json(errObj);
};

export default errorHandlerMiddleware;
