import xss from 'xss';
import type { Request, Response, NextFunction } from 'express';

type ValidKeys = 'body' | 'params' | 'query';
type KeyArray = ValidKeys[];

const clean = (data: any): any => {
  console.log(data);
  let isObject = false;
  if (typeof data === 'object') {
    data = JSON.stringify(data);
    isObject = true;
  }

  data = xss(data).trim();
  if (isObject) data = JSON.parse(data);

  return data;
};

function xssSanitizer(keys: KeyArray = []) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.body && (keys.includes('body') || !keys.length)) req.body = clean(req.body);
    if (req.query && (keys.includes('query') || !keys.length)) req.query = clean(req.query);
    if (req.params && (keys.includes('params') || !keys.length)) req.params = clean(req.params);

    next();
  };
}

export default xssSanitizer;
