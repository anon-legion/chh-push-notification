import { StatusCodes } from 'http-status-codes';
import CustomApiError from './custom-api';

class BadRequestError extends CustomApiError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export default BadRequestError;
