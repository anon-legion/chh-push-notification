import { StatusCodes } from 'http-status-codes';

class CustomApiError extends Error {
  statusCode: StatusCodes;

  constructor(
    public message: string,
    public errors?: any[]
  ) {
    super(message);
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

export default CustomApiError;
