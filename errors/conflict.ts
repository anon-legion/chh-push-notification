import { StatusCodes } from 'http-status-codes';
import CustomApiError from './custom-api';

class ConflictError extends CustomApiError {
  statusCode: StatusCodes;

  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.CONFLICT;
  }
}

export default ConflictError;
