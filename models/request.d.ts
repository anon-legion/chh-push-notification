import type { WebPubSubServiceClient } from '@azure/web-pubsub';
import type { Types } from 'mongoose';

declare global {
  namespace Express {
    export interface Request {
      serviceClient: WebPubSubServiceClient; // replace 'any' with the type of your serviceClient
      user: {
        userId: Types.ObjectId;
        username: string;
      };
    }
  }
}
