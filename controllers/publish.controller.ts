/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import logger from '../logger';
import Notif from '../models/Notification';
import Subscription from '../models/Subscription';
import resObj from './utilities/success-response';
import zip from './utilities/zip-function';
// import updateNotification from './utilities/update-notificaiton';
import type {
  INotification,
  MessageType,
  Subscription as ISubscription,
} from '../models/types';
import type { Request, Response, NextFunction } from 'express';

interface IFilteredNotification {
  notification: INotification;
  subscriptions: ISubscription[];
}

let pollingInterval: NodeJS.Timeout | null = null;
const notificaitonType = new Map<MessageType, string>([
  ['admission', 'Patient Status'],
  ['approve', 'Doctor Updates'],
  ['diagResults', 'Diagnostic Results'],
  ['pf', "Doctor's Professional Fee"],
]);

async function startPolling(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { webpush } = req;
  const { secondsInterval = 6 } = req.body;

  if (pollingInterval) {
    logger.info('**polling already started**');
    res.status(StatusCodes.OK).send(resObj('Polling already started'));
    return;
  }

  try {
    pollingInterval = setInterval(async () => {
      // check db for pending notifications and sort by recipientId
      const pendingNotifications =
        (await Notif.find({ status: 1 }).select('-__v').sort({ usrId: 1 }).lean()) ?? [];

      const recipients = pendingNotifications.map((notif) => notif.recipientId);
      // check db for recipient subscriptions and sort by recipientId
      const recipientSubs =
        (await Subscription.aggregate([
          { $match: { userId: { $in: recipients } } },
          { $group: { _id: '$userId', subscriptions: { $push: '$$ROOT' } } },
          { $sort: { _id: 1 } },
        ])) ?? [];

      const zippedNotifications = zip(pendingNotifications, recipientSubs);
      // push notification to connected user
      const sentNotifications = await Promise.all(
        zippedNotifications.map(async (item) => {
          const notificationPayload = {
            notification: {
              title: notificaitonType.get(item[0].messageType),
              body: item[0].message,
              icon: 'https://cdn-icons-png.flaticon.com/512/8297/8297354.png',
            },
          };

          // send notification to subscribed users
          const pushRes = await Promise.allSettled(
            item[1].map(async (sub) => {
              const webpushRes = await webpush.sendNotification(
                sub.subscription,
                JSON.stringify(notificationPayload)
              );
              return webpushRes;
            })
          );
          return pushRes;
        })
      );

      console.log(sentNotifications);
    }, secondsInterval * 1000);

    logger.info('POLLING START');
    res.status(StatusCodes.OK).send(resObj('Polling start'));
  } catch (err: any) {
    next(err);
  }
}

function stopPolling(_req: Request, res: Response): void {
  if (!pollingInterval) {
    logger.info('**polling already stopped**');
    res.status(StatusCodes.OK).send(resObj('Polling already stopped'));
    return;
  }

  clearInterval(pollingInterval);
  pollingInterval = null;

  logger.info('POLLING STOP');
  res.status(StatusCodes.OK).send(resObj('Polling stop'));
}

export { startPolling, stopPolling };
