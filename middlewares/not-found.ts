import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const notFound = (_req: Request, res: Response, _next: NextFunction): void => {
  res.status(StatusCodes.NOT_FOUND).send({ message: 'Route does not exist' });
};

export default notFound;
