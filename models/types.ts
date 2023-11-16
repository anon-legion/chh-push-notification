import type { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isActive: boolean;
  createJwt: () => string;
  comparePassword: (password: string) => Promise<boolean>;
}

export type MessageType = 'admission' | 'approve' | 'diagResults' | 'pf';
export type ChhApps = 'doki' | 'nursi' | 'pxi' | 'resi';
type Status = 1 | 2 | 3;

export interface INotification {
  _id: Types.ObjectId;
  appReceiver: ChhApps;
  message: string;
  messageType: MessageType;
  recipientId: string;
  status: Status;
  dateTimeSend: Date;
  dateTimeRead: Date;
  urlRedirect: string | null;
}

interface IToken {
  token: string;
  baseUrl: string;
  url: string;
}

export interface IAccessToken {
  _id: Types.ObjectId;
  userId: string;
  app: ChhApps;
  accessToken: IToken;
  timeStamp: Date;
}

export type ILog = {
  _id: Types.ObjectId;
  body: Body;
  ip: string;
  level: string;
  message: string;
  method: string;
  path: string;
  stack: string[];
  timestamp: Date;
};
