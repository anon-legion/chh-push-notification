import type { Request, Response } from 'express';
import { WebPubSubServiceClient } from '@azure/web-pubsub';
import { StatusCodes } from 'http-status-codes';

const serviceClient = new WebPubSubServiceClient(process.env.AZURE_PUBSUB_CONNSTRING ?? '', 'notification');

async function postPushNotif(req: Request, res: Response): Promise<void> {
  const token = await serviceClient.getClientAccessToken({ userId: 'testUser', groups: ['admin'] });
  console.log(token);
  await serviceClient.sendToAll({ message: 'Hello world!' });
  res.status(StatusCodes.OK).send('Publishing push notification');
}

async function getPushNotif(req: Request, res: Response): Promise<void> {
  res.status(StatusCodes.OK).send('Getting push notification');
}

export { postPushNotif, getPushNotif };
