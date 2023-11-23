import { StatusCodes } from 'http-status-codes';
import { InternalServerError, NotFoundError } from '../errors';
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

async function postPushNotif(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { appReceiver, message, messageType, recipientId, urlRedirect = null } = req.body;

  const notification = {
    appReceiver,
    message,
    messageType,
    recipientId,
    urlRedirect,
  };

  try {
    const notificationQuery = await Notification.create(notification);

    if (notificationQuery == null || Object.keys(notificationQuery).length === 0)
      throw new InternalServerError('Something went wrong, notification not created');

    res.status(StatusCodes.CREATED).send(resObj('Notification created', notificationQuery));
  } catch (err: any) {
    next(err);
  }
}

async function getPushNotif(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { limit = 15, page = 1 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const notifications =
      (await Notification.find().limit(Number(limit)).skip(skip).select('-__v').lean()) ?? [];

    if (notifications.length === 0) throw new NotFoundError('No notifications found');

    res.status(StatusCodes.OK).send(resObj('Getting push notifications', notifications));
  } catch (err: any) {
    next(err);
  }
}

export { populateNotificaiton, getPushNotif, postPushNotif };
