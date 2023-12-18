import { StatusCodes } from 'http-status-codes';
import { InternalServerError } from '../errors';
import Subscription from '../models/Subscription';
import resObj from './utilities/success-response';
import type { Subscription as ISubscription } from '../models/types';
import type { Request, Response, NextFunction } from 'express';

interface RequestBody {
  userId: string;
  app: string;
  subscription: ISubscription;
}

const defaultSubObj = {
  endpoint: '',
  expirationTime: null,
  keys: {
    auth: '',
    p256dh: '',
  },
};

/**
 * Subscribes a user for push notifications.
 *
 * @param req - request object.
 * @param res - response object.
 * @param next - next function.
 */
async function postSubcription(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { userId = '', app = '', subscription = defaultSubObj }: RequestBody = req.body;

  try {
    // upsert subscription
    const subscriptionQuery = await Subscription.findOneAndUpdate(
      { subscription },
      { userId, app, subscription, timeStamp: new Date() },
      {
        upsert: true,
        runValidators: true,
        new: true,
      }
    )
      .select('-_id subscription timeStamp')
      .lean();

    // db subscriptionQuery guard clause
    if (subscriptionQuery == null || Object.keys(subscriptionQuery).length === 0)
      throw new InternalServerError('Something went wrong, try again later');

    res.status(StatusCodes.OK).send(
      resObj('New subscription successful', {
        ...subscriptionQuery.subscription,
        timeStamp: subscriptionQuery.timeStamp,
      })
    );
  } catch (err: any) {
    next(err);
  }
}

/**
 * Retrieves the server's public key for VAPID authentication.
 *
 * @param req - request object.
 * @param res - response object.
 */
function getServerPubKey(req: Request, res: Response): void {
  const { publicKey } = req.webpush.vapidKeys;
  res.status(StatusCodes.OK).send(resObj('VAPID keys retrieved', { publicKey }));
}

/**
 * Deletes a subscription based on the provided endpoint.
 *
 * @param req - request object.
 * @param res - response object.
 * @param next - next function.
 */
async function deleteSubscription(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { endpoint } = req.body;

  try {
    const deleteResult = await Subscription.deleteOne({ 'subscription.endpoint': endpoint });
    if (deleteResult.deletedCount === 0)
      throw new InternalServerError('Nothing was deleted, try again later');

    res
      .status(StatusCodes.OK)
      .send(resObj(`Subscription deleted: ${deleteResult.deletedCount}`));
  } catch (err: any) {
    next(err);
  }
}

export { postSubcription, getServerPubKey, deleteSubscription };
