/* eslint-disable no-console */
import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { odata } from '@azure/web-pubsub';
import { InternalServerError } from '../errors';
import Notif from '../models/Notification';
import resObj from './utilities/success-response';
import type { INotification } from '../models/types';

// interface IFilteredNotification {
//   notification: INotification;
//   isUserConnected: Promise<boolean>;
// }

let pollingInterval: NodeJS.Timeout | null = null;

async function postPushNotif(req: Request, res: Response): Promise<void> {
  const { serviceClient, body } = req;
  console.log(`target: ${body.target}`);
  console.log(body.notification);

  try {
    if (body.target === 'all') {
      await serviceClient.sendToAll({ title: 'test title', message: body.notification });
    } else {
      await serviceClient.sendToUser(body.target, { title: 'irving bayot', message: body.notification });
    }

    res.status(StatusCodes.OK).send(resObj('Publishing push notification', { notification: body.notification }));
  } catch (err: any) {
    console.error(err);
    throw new InternalServerError(err.message ?? 'Something went wrong, try again later');
  }
}

async function getPushNotif(_req: Request, res: Response): Promise<void> {
  try {
    res.status(StatusCodes.OK).send(resObj('Getting push notifications'));
  } catch (err: any) {
    console.error(err);
    throw new InternalServerError(err.message ?? 'Something went wrong, try again later');
  }
}

async function startPolling(req: Request, res: Response): Promise<void> {
  const {
    body: { secondsInterval = 3 },
  } = req;

  if (pollingInterval !== null) {
    console.log('**polling already started**');
    res.status(StatusCodes.OK).send(resObj('Polling already started'));
    return;
  }

  try {
    pollingInterval = setInterval(async () => {
      const pendingNotifications =
        (await Notif.find({ status: 1 }).select('appReceiver message messageType recipientId').lean()) ?? [];

      const filteredNotifications = (
        await Promise.all(
          pendingNotifications.map(async (notif: INotification) => {
            const isUserConnected = await req.serviceClient.userExists(notif.recipientId);
            return { notification: notif, isUserConnected };
          })
        )
      ).filter((item) => item.isUserConnected);

      // console.log(filteredNotifications);
      filteredNotifications.forEach(async (item) => {
        // await Notif.findByIdAndUpdate(item.notification._id, { status: 2 });
        await req.serviceClient.sendToUser(
          item.notification.recipientId,
          {
            title: item.notification.messageType,
            message: item.notification.message,
          },
          {
            filter: odata`${item.notification.appReceiver} in groups`,
          }
        );
      });
    }, secondsInterval * 1000);

    console.log('POLLING START');
    res.status(StatusCodes.OK).send(resObj('Polling start', {}));
  } catch (err: any) {
    console.error(err);
    throw new InternalServerError(err.message ?? 'Something went wrong, try again later');
  }
}

function stopPolling(_req: Request, res: Response): void {
  if (pollingInterval === null) {
    console.log('**polling already stopped**');
    res.status(StatusCodes.OK).send(resObj('Polling already stopped'));
    return;
  }

  clearInterval(pollingInterval);
  pollingInterval = null;

  console.log('POLLING STOP');
  res.status(StatusCodes.OK).send(resObj('Polling stop'));
}

export { postPushNotif, getPushNotif, startPolling, stopPolling };
