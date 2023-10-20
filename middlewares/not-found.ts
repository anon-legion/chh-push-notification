import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const notFound = (_req: Request, res: Response): void => {
  res.status(StatusCodes.NOT_FOUND).send({ message: 'Route does not exist' });
};

export default notFound;
