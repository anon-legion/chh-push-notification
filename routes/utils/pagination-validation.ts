import sanitizeNumericString from './numeric-string-sanitizer';
import type { Request, Response, NextFunction } from 'express';

const validatePagination = (req: Request, _res: Response, next: NextFunction) => {
  let { limit = '15', page = '1' } = req.query;

  limit = sanitizeNumericString(String(limit), '15');
  page = sanitizeNumericString(String(page), '1');

  req.query = { ...req.query, limit, page };

  next();
};

export default validatePagination;
