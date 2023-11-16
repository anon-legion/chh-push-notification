import Transport from 'winston-transport';
import { LogEntry } from 'winston';
import Log from '../models/Log';

class MongooseTransport extends Transport {
  async log(info: LogEntry, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

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

    console.log('----logEntry----');
    console.log(logEntry);
    console.log('------saved------');

    callback();
  }
}

export default MongooseTransport;
