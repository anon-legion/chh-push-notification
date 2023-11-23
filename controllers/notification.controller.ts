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

// async function postPushNotif(req: Request, res: Response, next: NextFunction): Promise<void> {
//   const { serviceClient, body } = req;
//   logger.info(`target: ${body.target}`);
//   logger.info(body.notification);

//   try {
//     if (body.target === '000000000000') {
//       await serviceClient.sendToAll({
//         title: 'Notification for all',
//         message: body.notification,
//       });
//     } else {
//       await serviceClient.sendToUser(body.target, {
//         title: `Notification for ${body.target}`,
//         message: body.notification,
//       });
//     }

//     res
//       .status(StatusCodes.OK)
//       .send(resObj('Publishing push notification', { notification: body.notification }));
//   } catch (err: any) {
//     next(err);
//   }
// }

// async function getPushNotif(_req: Request, res: Response, next: NextFunction): Promise<void> {
//   try {
//     res.status(StatusCodes.OK).send(resObj('Getting push notifications'));
//   } catch (err: any) {
//     next(err);
//   }
// }

export default populateNotificaiton;
