import { Schema, model } from 'mongoose';
import type { INotification } from './types';

const notificationSchema = new Schema<INotification>({
  appReceiver: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    required: true,
  },
  recipientId: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  dateTimeSend: {
    type: Date,
    required: false,
    nullable: true,
    default: null,
  },
  dateTimeRead: {
    type: Date,
    required: false,
    nullable: true,
    default: null,
  },
  urlRedirect: {
    type: String,
    required: false,
    nullable: true,
    default: null,
  },
});

const Notification = model<INotification>('Notification', notificationSchema);

export default Notification;
