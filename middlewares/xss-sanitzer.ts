import xss from 'xss';
import type { Request, Response, NextFunction } from 'express';

type ValidData = Request['body'] | Request['query'] | Request['params'];
type ValidKeys = 'body' | 'params' | 'query';

function clean<T extends ValidData>(rawData: ValidData): T {
  let data = rawData;
  let isObject = false;
  if (typeof data === 'object') {
    data = JSON.stringify(data);
    isObject = true;
  }

  data = xss(data).trim();
  if (isObject) data = JSON.parse(data);

  return data;
}

function xssSanitizer(keys: ValidKeys[] = []) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (Boolean(req.body) && (keys.includes('body') || !keys.length))
      req.body = clean<Request['body']>(req.body);
    if (Boolean(req.query) && (keys.includes('query') || !keys.length))
      req.query = clean<Request['query']>(req.query);
    if (Boolean(req.params) && (keys.includes('params') || !keys.length))
      req.params = clean<Request['params']>(req.params);

    next();
  };
}

export default xssSanitizer;
