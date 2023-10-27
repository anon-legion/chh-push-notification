import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { InternalServerError } from '../errors';
import resObj from './utilities/success-response';

async function populateNotificaiton(_req: Request, res: Response) {
  try {
    const [notif1, notif2, notif3] = await Promise.all([
      Notification.create({
        appReceiver: 'doki',
        message: 'Notification for doki',
        messageType: 'pf',
        recipientId: String(Math.floor(Math.random() * 1000000000000)),
        status: 1,
      }),
      Notification.create({
        appReceiver: 'resi',
        message: 'Notification for resi',
        messageType: 'approve',
        recipientId: String(Math.floor(Math.random() * 1000000000000)),
        status: 1,
      }),
      Notification.create({
        appReceiver: 'pxi',
        message: 'Hello world',
        messageType: 'diagResults',
        recipientId: String(Math.floor(Math.random() * 1000000000000)),
        status: 1,
      }),
    ]);

    res.status(StatusCodes.CREATED).send(resObj('Mock data generated', { notif1, notif2, notif3 }));
  } catch (err: any) {
    console.error(err);
    throw new InternalServerError(err.message ?? 'Something went wrong, try again later');
  }
}

export default populateNotificaiton;
