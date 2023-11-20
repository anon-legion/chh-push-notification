import type * as IWebpush from 'web-push';

interface IVapidKeys {
  publicKey: string;
  privateKey: string;
}

type TWebpush = typeof IWebpush & { vapidKeys: IVapidKeys };

declare global {
  namespace Express {
    export interface Request {
      webpush: TWebpush;
      // for authentication middleware
      user: {
        userId: Types.ObjectId;
        username: string;
      };
    }
  }
}
