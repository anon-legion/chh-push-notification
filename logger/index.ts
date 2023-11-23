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

const logger = generateLogger(process.env.LOGGER_ENV ?? 'dev');
logger.info(`Logger initialized in [${process.env.LOGGER_ENV ?? 'dev'}] mode.`);

export default logger;
