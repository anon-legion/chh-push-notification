import type { WebPubSubServiceClient } from '@azure/web-pubsub';

declare global {
  namespace Express {
    export interface Request {
      serviceClient: WebPubSubServiceClient; // replace 'any' with the type of your serviceClient
    }
  }
}
