import { validationResult } from 'express-validator';
import { InvalidPayloadError } from '../errors';
import type { Request, Response, NextFunction } from 'express';

const expressValidatorHandler = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req).array();
  // validation error guard clause
  if (result.length) next(new InvalidPayloadError('Invalid payload', result));

  // if no validation errors, proceed to controller or next middleware
  next();
};

export default expressValidatorHandler;
