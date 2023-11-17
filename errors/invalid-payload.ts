import { StatusCodes } from 'http-status-codes';
import CustomApiError from './custom-api';
import type { ValidationError } from 'express-validator';

class InvalidPayloadError extends CustomApiError {
  validationErrors: ValidationError[];

  constructor(message: string, validationErrors: ValidationError[]) {
    super(message, validationErrors);
    this.statusCode = StatusCodes.BAD_REQUEST;
    this.validationErrors = validationErrors;
  }
}

export default InvalidPayloadError;
