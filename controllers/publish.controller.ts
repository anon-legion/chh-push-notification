import { StatusCodes } from 'http-status-codes';
import logger from '../logger';
import Notif from '../models/Notification';
import Subscription from '../models/Subscription';
import resObj from './utilities/success-response';
// import updateNotification from './utilities/update-notificaiton';
import type {
  INotification,
  MessageType,
  Subscription as ISubscription,
} from '../models/types';
import type { Request, Response, NextFunction } from 'express';

interface IFilteredNotification {
  notification: INotification;
  subscription: ISubscription;
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
      // check db for pending notifications
      const pendingNotifications =
        (await Notif.find({ status: 1 }).select('-__v').lean()) ?? [];

      // check if recipient is connected
      const filteredNotifications: IFilteredNotification[] = (
        await Promise.all(
          pendingNotifications.map(async (notif: INotification) => {
            // const isUserConnected = await req.serviceClient.userExists(notif.recipientId);
            const subscriptionQuery = await Subscription.findOne({
              userId: notif.recipientId,
              app: notif.appReceiver,
            }).select('-_id -__v');
            return {
              notification: notif,
              subscription: (subscriptionQuery
                ? subscriptionQuery.subscription
                : {}) as ISubscription,
            };
          })
        )
      ).filter((item) => Object.keys(item.subscription).length !== 0);

      console.log('----filteredNotifications----');
      console.log(filteredNotifications);
      console.log('----filteredNotifications----');
      // send notification to connected users
      filteredNotifications.forEach(async (item) => {
        const notification = {
          title: notificaitonType.get(item.notification.messageType),
          message: item.notification.message,
        };
        console.log('----notification----');
        console.log(notification);
        console.log('----notification----');
        // send notification to connected users
        try {
          await webpush.sendNotification(item.subscription, JSON.stringify(notification));
        } catch (err) {
          next(err);
        }
      });
      // update notifications of notification was successfully sent
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
