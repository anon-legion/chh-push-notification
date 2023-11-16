import { type Logger } from 'winston';
import devLogger from './dev-logger';
import prodLogger from './prod-logger';

function generateLogger(env: string): Logger {
  let loggerModule = null;

  if (env === 'dev') {
    loggerModule = devLogger();
  }

  if (env === 'prod') {
    loggerModule = prodLogger();
  }

  return loggerModule ?? devLogger();
}

console.log(process.env.NODE_ENV);
const logger = generateLogger(process.env.NODE_ENV ?? 'dev');

export default logger;
