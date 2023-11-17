import { StatusCodes } from 'http-status-codes';
import Notification from '../models/Notification';
import resObj from './utilities/success-response';
import type { Request, Response, NextFunction } from 'express';

const randomAppReceiver = (): string => {
  const apps = ['doki', 'nursi', 'pxi', 'resi'];
  return apps[Math.floor(Math.random() * apps.length)];
};

const randomMessage = (): string => {
  const messages = [
    'lorem ipsum dolor sit amet',
    'consectetur adipiscing elit',
    'sed do eiusmod tempor',
    'incididunt ut labore',
    'et dolore magna aliqua',
    'ut enim ad minim veniam',
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

const randomMessageType = (): string => {
  const types = ['admission', 'approve', 'diagResults', 'pf'];
  return types[Math.floor(Math.random() * types.length)];
};

const randomRecipientId = (): string => String(Math.floor(Math.random() * 1000000000000));

async function populateNotificaiton(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [notif1, notif2, notif3] = await Promise.all([
      Notification.create({
        appReceiver: randomAppReceiver(),
        message: randomMessage(),
        messageType: randomMessageType(),
        recipientId: randomRecipientId(),
        status: 1,
      }),
      // Notification.create({
      //   appReceiver: randomAppReceiver(),
      //   message: randomMessage(),
      //   messageType: randomMessageType(),
      //   recipientId: randomRecipientId(),
      //   status: 1,
      // }),
      Notification.create({
        appReceiver: 'pxi',
        message: randomMessage(),
        messageType: randomMessageType(),
        recipientId: '987654321012',
        status: 1,
      }),
      Notification.create({
        appReceiver: 'doki',
        message: randomMessage(),
        messageType: randomMessageType(),
        recipientId: '123456789123',
        status: 1,
      }),
    ]);

    res
      .status(StatusCodes.CREATED)
      .send(resObj('Mock data generated', { notif1, notif2, notif3 }));
  } catch (err: any) {
    next(err);
  }
}

export default populateNotificaiton;
