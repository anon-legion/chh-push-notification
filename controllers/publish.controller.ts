import { StatusCodes } from 'http-status-codes';
import logger from '../logger';
import pnsHelper from './utilities/publish-helper';
import resObj from './utilities/success-response';
import zip from './utilities/zip-function';
import type { Request, Response, NextFunction } from 'express';

let pollingInterval: NodeJS.Timeout | null = null;

/**
 * Starts the polling process for sending push notifications.
 *
 * @param req - Express request object.
 * @param res - response object.
 * @param next - next function.
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
      const pendingNotifications = await pnsHelper.getPendingNotifications();
      const recipientSubs = await pnsHelper.getRecipientSubs(pendingNotifications);

      if (!recipientSubs.length) return;

      const zippedNotifications = zip(pendingNotifications, recipientSubs);
      const pushedNotifications = await pnsHelper.pushNotifications(
        zippedNotifications,
        webpush
      );
      const { invalidSubIds, notificationsSent } = pnsHelper.processPushedNotifications(
        pushedNotifications,
        zippedNotifications
      );

      if (notificationsSent.length) {
        pnsHelper.updateNotificationStatus(notificationsSent);
      }

      if (invalidSubIds.size) {
        await pnsHelper.deleteInvalidSubscriptions(invalidSubIds);
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
