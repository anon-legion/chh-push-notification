import { StatusCodes } from 'http-status-codes';
import CustomApiError from './custom-api';

class NotFoundError extends CustomApiError {
  statusCode: StatusCodes;

  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

export default NotFoundError;
