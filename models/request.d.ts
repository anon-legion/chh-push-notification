import type { NotificationHubsClient } from '@azure/notification-hubs';
import type { WebPubSubServiceClient } from '@azure/web-pubsub';
// import type { Types } from 'mongoose';

declare global {
  namespace Express {
    export interface Request {
      serviceClient: WebPubSubServiceClient;
      notifHubClient: NotificationHubsClient;
      // for authentication middleware
      user: {
        userId: Types.ObjectId;
        username: string;
      };
    }
  }
}
