import { StatusCodes } from 'http-status-codes';
import CustomApiError from './custom-api';

class UnauthenticatedError extends CustomApiError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

export default UnauthenticatedError;
