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

type AppReceiver = 'doki' | 'nursi' | 'pxi' | 'resi';
type MessageType = 'admission' | 'approve' | 'diagResults' | 'pf';
type Status = 1 | 2 | 3;

export interface INotification {
  _id: Types.ObjectId;
  appReceiver: AppReceiver;
  message: string;
  messageType: MessageType;
  recipientId: string;
  status: Status;
  dateTimeSend: Date;
  dateTimeRead: Date;
  urlRedirect: string | null;
}
