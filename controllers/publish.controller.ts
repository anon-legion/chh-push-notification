/* eslint-disable security/detect-object-injection */
import { StatusCodes } from 'http-status-codes';
import logger from '../logger';
import Notif from '../models/Notification';
import Subscription from '../models/Subscription';
import pnsHelper from './utilities/publish-helper';
import resObj from './utilities/success-response';
import zip from './utilities/zip-function';
import type { MessageType, INotification } from '../models/types';
import type { Request, Response, NextFunction } from 'express';

let pollingInterval: NodeJS.Timeout | null = null;
const notificaitonType = new Map<MessageType, string>([
  ['admission', 'Admission'],
  ['approve', 'Approve'],
  ['diagResults', 'DiagResults'],
  ['pf', 'PF'],
]);

/**
 * Starts the polling process for sending push notifications.
 *
 * @param req - Express request object.
 * @param res - response object.
 * @param next - next function.
 * @returns A promise that resolves to void
 */
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
      const pendingNotifications = await pnsHelper.getPendingNotifications();
      // const pendingNotifications =
      //   (await Notif.find({ status: 1 }).select('-__v').sort({ recipientId: 1 }).lean()) ?? [];
      // console.log(pendingNotifications);

      // get all unique recipientIds
      // const recipients = [...new Set(pendingNotifications.map((notif) => notif.recipientId))];
      // check db for all subscriptions of recipient, group by userId, and sort by recipientId
      const recipientSubs = await pnsHelper.getRecipientSubs(pendingNotifications);
      // const recipientSubs =
      //   (await Subscription.aggregate([
      //     { $match: { userId: { $in: recipients } } },
      //     { $group: { _id: '$userId', subscriptions: { $push: '$$ROOT' } } },
      //     { $sort: { _id: 1 } },
      //   ])) ?? [];

      console.log(recipientSubs);

      if (!recipientSubs.length) return;
      // zip pendingNotifications with their corresponding recipient subscriptions
      const zippedNotifications = zip(pendingNotifications, recipientSubs);

      // push notifications to recipient subscriptions
      const pushedNotifications = await Promise.all(
        zippedNotifications.map(async (item) => {
          const notificationPayload = {
            notification: {
              title: notificaitonType.get(item[0].messageType),
              body: item[0].message,
              icon: 'https://cdn-icons-png.flaticon.com/512/8297/8297354.png',
            },
          };

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

      const invalidSubIds = new Set();
      const notificationsSent: INotification[] = [];

      pushedNotifications.forEach((notif, i) =>
        notif.forEach((sub, j) => {
          if (sub.status === 'fulfilled') notificationsSent.push(zippedNotifications[i][0]);
          if (sub.status === 'rejected') invalidSubIds.add(zippedNotifications[i][1][j]._id);
        })
      );

      // update notification status
      if (notificationsSent.length) {
        await Notif.updateMany(
          { _id: { $in: notificationsSent.map((notif) => notif._id) } },
          { status: 2, dateTimeSend: new Date() }
        );
      }

      // delete invalid subscriptions
      if (invalidSubIds.size) {
        await Subscription.deleteMany({ _id: { $in: [...invalidSubIds] } });
      }
    }, secondsInterval * 1000);

    logger.info('POLLING START');
    res.status(StatusCodes.OK).send(resObj('Polling start'));
  } catch (err: any) {
    next(err);
  }
}

/**
 * Stops the polling process for sending push notifications.
 *
 * @param _req - request object.
 * @param res - response object.
 */
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
