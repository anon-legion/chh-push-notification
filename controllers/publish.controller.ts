import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { InternalServerError } from '../errors';
import Notification from '../models/Notification';
import resObj from './utilities/success-response';

let pollingInterval: NodeJS.Timeout | null = null;

async function postPushNotif(req: Request, res: Response): Promise<void> {
  const { serviceClient, body } = req;
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

async function startPolling(req: Request, res: Response) {
  const { body } = req;
  if (pollingInterval) {
    console.log('**polling already started**');
    res.status(StatusCodes.OK).send(resObj('Polling already started'));
    return;
  }

  try {
    pollingInterval = setInterval(async () => {
      const notificationQuery =
        (await Notification.find({ status: 1 }).select('appReceiver message messageType recipientId').lean()) ?? [];
      console.log(notificationQuery);
      // TODO:
      // 1. iterate through notificationQuery and check if userId is connected to pubsub
      for (let notif of notificationQuery) {
        // 2. if connected, send notification
        const userId = notif.recipientId;
        // const isConnected = await req.serviceClient.hasUser(userId);
      }
      // 3. update notification status to 2
    }, body.secondsInterval * 1000);

    console.log('POLLING START');
    res.status(StatusCodes.OK).send(resObj('Polling start', {}));
  } catch (err: any) {
    console.error(err);
    throw new InternalServerError(err.message ?? 'Something went wrong, try again later');
  }
}

function stopPolling(_req: Request, res: Response) {
  if (!pollingInterval) {
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
