import type { Types } from 'mongoose';
import type * as IWebpush from 'web-push';

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isActive: boolean;
  createJwt: () => string;
  comparePassword: (password: string) => Promise<boolean>;
}

export type ChhApps = 'doki' | 'nursi' | 'pxi' | 'resi';
type Status = 1 | 2 | 3;

export interface INotification {
  _id: Types.ObjectId;
  appReceiver: ChhApps;
  message: string;
  messageType: string;
  recipientId: string;
  status: Status;
  dateTimeSend: Date;
  dateTimeRead: Date;
  urlRedirect: string | null;
  dateTimeIn: Date;
}

interface Keys {
  auth: string;
  p256dh: string;
}

export interface Subscription {
  endpoint: string;
  expirationTime: number | null;
  keys: Keys;
}

export interface ISubscription {
  _id: Types.ObjectId;
  userId: string;
  app: ChhApps;
  subscription: Subscription;
  timeStamp: Date;
}

export interface ILog {
  _id: Types.ObjectId;
  body: Body;
  ip: string;
  level: string;
  message: string;
  method: string;
  path: string;
  stack: string[];
  timestamp: Date;
}

export interface ByType {
  admission: number;
  approve: number;
  diagResults: number;
  pf: number;
}

export interface ByStatus {
  pending: number;
  sent: number;
  read: number;
}

export interface IStats {
  total: number;
  doki: {
    byType: ByType;
    byStatus: ByStatus;
  };
  nursi: {
    byType: ByType;
    byStatus: ByStatus;
  };
  pxi: {
    byType: ByType;
    byStatus: ByStatus;
  };
  resi: {
    byType: ByType;
    byStatus: ByStatus;
  };
}

interface IVapidKeys {
  publicKey: string;
  privateKey: string;
}

export type TWebpush = typeof IWebpush & { vapidKeys: IVapidKeys };

export type Zip = [INotification, ISubscription[]];

export interface IMessageType {
  _id: Types.ObjectId;
  appReceiver: ChhApps;
  messageType: string;
  title: string;
  isActive: boolean;
}

export interface IApp {
  _id: Types.ObjectId;
  appCode: string;
  appName: string;
  isActive: boolean;
}
