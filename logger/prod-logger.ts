import winston, { type Logger } from 'winston';

const { combine, json, timestamp } = winston.format;
const errorOrWarnFilter = winston.format((info) =>
  info.level === 'error' || info.level === 'warn' ? info : false
);
const infoFilter = winston.format((info) => (info.level === 'info' ? info : false));

const logger: () => Logger = () =>
  winston.createLogger({
    level: 'info',
    format: combine(timestamp(), json()),
    transports: [
      new winston.transports.Console({
        level: 'info',
        format: combine(infoFilter(), timestamp(), json()),
      }),
      new winston.transports.File({
        filename: './error.log',
        level: 'warn',
        format: combine(errorOrWarnFilter(), timestamp(), json()),
      }),
    ],
    exitOnError: false,
  });

export default logger;
