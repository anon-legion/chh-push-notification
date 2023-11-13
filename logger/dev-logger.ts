import winston, { type Logger } from 'winston';

const { combine, json, timestamp, printf, errors } = winston.format;
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
        format: combine(
          infoFilter(),
          timestamp(),
          printf((info) => `[${info.level}] ${info.timestamp}: ${info.message}`)
        ),
      }),
      new winston.transports.Console({
        level: 'warn',
        format: combine(errorOrWarnFilter(), errors({ stack: true }), timestamp(), json()),
      }),
    ],
    exitOnError: false,
  });

export default logger;
