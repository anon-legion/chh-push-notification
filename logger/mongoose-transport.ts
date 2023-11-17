import { LogEntry } from 'winston';
import Transport from 'winston-transport';
import { InternalServerError } from '../errors';
import Log from '../models/Log';

class MongooseTransport extends Transport {
  async log(info: LogEntry, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    try {
      const logEntry = await Log.create({
        body: info.body,
        ip: info.ip,
        level: info.level,
        message: info.message,
        method: info.method,
        path: info.path,
        stack: info.stack,
        timestamp: info.timestamp,
      });

      if (logEntry == null || Object.keys(logEntry).length === 0)
        throw new InternalServerError('Error transporting log to database');
    } catch (err) {
      throw new InternalServerError('Error transporting log to database');
    }

    callback();
  }
}

export default MongooseTransport;
