import { Schema, model } from 'mongoose';
import type { ISubscription } from './types';

const subscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
  },
  app: {
    type: String,
    required: [true, 'App is required'],
    enum: ['doki', 'nursi', 'pxi', 'resi'],
  },
  subscription: {
    endpoint: {
      type: String,
      required: [true, 'Endpoint is missing'],
    },
    expirationTime: {
      type: Number,
      required: false,
      default: null,
    },
    keys: {
      auth: {
        type: String,
        required: [true, 'Auth key is missing'],
      },
      p256dh: {
        type: String,
        required: [true, 'P256dh key is missing'],
      },
    },
  },
  timeStamp: {
    type: Date,
    required: false,
    default: new Date(),
  },
});

const Subscription = model<ISubscription>('Subscription', subscriptionSchema);

export default Subscription;
