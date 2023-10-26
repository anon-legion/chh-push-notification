import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

let pollingInterval: NodeJS.Timeout | null = null;

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

async function getPushNotif(_req: Request, res: Response): Promise<void> {
  res.status(StatusCodes.OK).send('Getting push notification');
}

function startPolling(req: Request, res: Response) {
  const { body } = req;
  if (pollingInterval) {
    console.log('**polling already started**');
    res.status(StatusCodes.OK).send({ message: 'Polling already started' });
    return;
  }

  pollingInterval = setInterval(() => {
    console.log('polling');
  }, body.secondsInterval * 1000);

  console.log('POLLING START');
  res.status(StatusCodes.OK).send({ message: 'Polling start' });
}

function stopPolling(_req: Request, res: Response) {
  if (!pollingInterval) {
    console.log('**polling already stopped**');
    res.status(StatusCodes.OK).send({ message: 'Polling already stopped' });
    return;
  }

  clearInterval(pollingInterval);
  pollingInterval = null;

  console.log('POLLING STOP');
  res.status(StatusCodes.OK).send({ message: 'Polling stop' });
}
export { postPushNotif, getPushNotif, startPolling, stopPolling };
