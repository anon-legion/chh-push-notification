import type { WebPubSubServiceClient } from '@azure/web-pubsub';
import type webpush from 'web-push';

declare global {
  namespace Express {
    export interface Request {
      serviceClient: WebPubSubServiceClient;
      webpush: webpush;
      // for authentication middleware
      user: {
        userId: Types.ObjectId;
        username: string;
      };
    }
  }
}
