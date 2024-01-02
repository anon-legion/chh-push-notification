import { Schema, model } from 'mongoose';
import { IMessageType } from './types';

const messageTypeSchema = new Schema<IMessageType>({
  appReceiver: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const MessageType = model<IMessageType>('MessageType', messageTypeSchema);

export default MessageType;
