import { StatusCodes } from 'http-status-codes';
import CustomApiError from './custom-api';

class InternalServerError extends CustomApiError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

export default InternalServerError;
