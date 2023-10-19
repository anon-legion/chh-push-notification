import type { Request, Response } from 'express';
// import { WebPubSubServiceClient } from '@azure/web-pubsub';
import { StatusCodes } from 'http-status-codes';

async function postPushNotif(req: Request, res: Response): Promise<void> {
  const { serviceClient, body } = req;
  console.log(body.notification);

  if (body.target === 'all') {
    await serviceClient.sendToAll({ title: 'test title', message: body.notification });
  } else {
    await serviceClient.sendToUser(body.target, { title: 'irving bayot', message: body.notification });
  }

  res.status(StatusCodes.OK).send('Publishing push notification');
}

async function getPushNotif(req: Request, res: Response): Promise<void> {
  res.status(StatusCodes.OK).send('Getting push notification');
}

export { postPushNotif, getPushNotif };
