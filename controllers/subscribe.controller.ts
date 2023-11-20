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

async function postSubcription(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { userId = '', app = '', subscription = defaultSubObj }: RequestBody = req.body;

  try {
    // // check if access token already exists
    // const userSubscription = await Subscription.findOne({ userId, app })
    //   .select('-_id accessToken timeStamp')
    //   .lean();

    // if (userSubscription) {
    //   res.status(StatusCodes.OK).send(
    //     resObj('Existing subscription found', {
    //       ...userSubscription.subscription,
    //       timeStamp: userSubscription.timeStamp,
    //     })
    //   );
    //   return;
    // }

    // upsert access token
    const subscriptionQuery = await Subscription.findOneAndUpdate(
      { userId, app },
      { userId, app, subscription, timeStamp: new Date() },
      {
        upsert: true,
        runValidators: true,
        new: true,
      }
    )
      .select('-_id accessToken timeStamp')
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

function getServerPubKey(req: Request, res: Response): void {
  const { publicKey } = req.webpush.vapidKeys;
  res.status(StatusCodes.OK).send(resObj('VAPID keys retrieved', { publicKey }));
}

export { postSubcription, getServerPubKey };
