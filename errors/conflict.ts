import { StatusCodes } from 'http-status-codes';
import CustomApiError from './custom-api';

class ConflictError extends CustomApiError {
  errors: string[];

  constructor(message: string, errors: string[]) {
    super(message);
    this.statusCode = StatusCodes.CONFLICT;
    this.errors = errors;
  }
}

export default ConflictError;
