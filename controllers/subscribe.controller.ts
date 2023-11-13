import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AccessToken from '../models/AccessToken';
import { BadRequestError, InternalServerError } from '../errors';
import resObj from './utilities/success-response';
import isTokenExpired from './utilities/token-lifetime';

interface RequestBody {
  userId: string;
  app: string;
}

async function getAccessToken(req: Request, res: Response): Promise<void> {
  const { serviceClient } = req;
  const { userId = '', app = '' }: RequestBody = req.body;

  if (!userId || !app) throw new BadRequestError('Missing userId or app');

  try {
    // check if access token already exists
    const userAccessToken = await AccessToken.findOne({ userId, app })
      .select('-_id accessToken timeStamp')
      .lean();

    if (userAccessToken && !isTokenExpired(userAccessToken)) {
      res.status(StatusCodes.OK).send(
        resObj('Access token already exists', {
          ...userAccessToken.accessToken,
          timeStamp: userAccessToken.timeStamp,
        })
      );
      return;
    }

    const newToken = await serviceClient.getClientAccessToken({
      userId,
      groups: ['all', app],
      roles: ['joinLeaveGroup'],
      expirationTimeInMinutes: Number(process.env.TOKEN_LIFE_MINS) ?? 1440,
    });

    // token guard clause
    if (newToken == null)
      throw new InternalServerError('Failed to generate access token, try again later');

    // upsert access token
    const tokenQuery = await AccessToken.findOneAndUpdate(
      { userId, app },
      { userId, app, accessToken: newToken, timeStamp: new Date() },
      {
        upsert: true,
        runValidators: true,
        new: true,
      }
    )
      .select('-_id accessToken timeStamp')
      .lean();
    // const tokenQuery = await AccessToken.create({ userId, app, accessToken: newToken });

    // db tokenQuery guard clause
    if (tokenQuery == null)
      throw new InternalServerError('Something went wrong, try again later');

    res.status(StatusCodes.OK).send(
      resObj('Access token generated', {
        ...tokenQuery.accessToken,
        timeStamp: tokenQuery.timeStamp,
      })
    );
  } catch (err: any) {
    console.error(err);
    throw new InternalServerError(err.message ?? 'Something went wrong, try again later');
  }
}

export default getAccessToken;
