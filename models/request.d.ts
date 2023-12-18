import { TWebpush } from './types';

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
