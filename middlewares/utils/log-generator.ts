import type { Request } from 'express';

function generateErrLog(err: any, req: Request) {
  const { body = {}, headers, ip, method, path } = req;
  const { message = 'Something went wrong, try again later', stack } = err;
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const reqOrigin = headers['x-forwarded-for'] || ip;
  const stackTrace =
    stack === '' || stack == null
      ? []
      : err.stack
          .split('\n')
          .slice(1)
          .reverse()
          .map((val: string) => val.trim());
  const errLog = {
    body,
    ip: reqOrigin,
    message,
    method,
    path,
    stack: stackTrace,
  };

  return errLog;
}

export default generateErrLog;
