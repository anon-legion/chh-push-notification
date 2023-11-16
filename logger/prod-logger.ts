import winston, { type Logger } from 'winston';

const { combine, json, printf, timestamp } = winston.format;
const infoFilter = winston.format((info) => (info.level === 'info' ? info : false));
// const warnFilter = winston.format((info) => (info.level === 'warn' ? info : false));
// const errorFilter = winston.format((info) => (info.level === 'error' ? info : false));
const warnErrorFilter = winston.format((info) =>
  info.level === 'error' || info.level === 'warn' ? info : false
);

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
        format: combine(
          warnErrorFilter(),
          timestamp(),
          printf(
            (info) =>
              `[${info.level}] ${info.timestamp}: ${info.message} - ${JSON.stringify(
                info.body
              )} - ${info.stack.at(-1)} - ${info.ip}`
          )
        ),
      }),
      // new winston.transports.File({
      //   filename: './error.log',
      //   level: 'warn',
      //   format: combine(errorFilter(), timestamp(), json()),
      // }),
    ],
    exitOnError: false,
  });

export default logger;
