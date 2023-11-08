import { Schema, model } from 'mongoose';
import type { IAccessToken } from './types';

const accessTokenSchema = new Schema<IAccessToken>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
  },
  app: {
    type: String,
    required: [true, 'App is required'],
    enum: ['doki', 'nursi', 'pxi', 'resi'],
  },
  accessToken: {
    token: {
      type: String,
      required: [true, 'Access token is required'],
    },
    baseUrl: {
      type: String,
      required: [true, 'Base URL is required'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
    },
  },
  timeStamp: {
    type: Date,
    required: false,
    default: new Date(),
  },
});

const AccessToken = model<IAccessToken>('AccessToken', accessTokenSchema);

export default AccessToken;
