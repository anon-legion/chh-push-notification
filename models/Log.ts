import { Schema, model } from 'mongoose';
import { TLog } from './types';

const logSchema = new Schema<TLog>({
  body: {
    type: Object,
    required: false,
  },
  ip: {
    type: String,
    required: false,
  },
  level: {
    type: String,
    required: false,
  },
  message: {
    type: String,
    required: false,
  },
  method: {
    type: String,
    required: false,
  },
  path: {
    type: String,
    required: false,
  },
  stack: {
    type: Array(String),
    required: false,
  },
  timestamp: {
    type: Date,
    required: false,
  },
});

const Log = model<TLog>('Log', logSchema);

export default Log;
