import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AccessToken from '../models/AccessToken';
import { BadRequestError, InternalServerError } from '../errors';
import resObj from './utilities/success-response';

async function getAccessToken(req: Request, res: Response): Promise<void> {
  const {
    serviceClient,
    body: { userId = '', app = '' },
  } = req;

  if (!userId || !app) throw new BadRequestError('Missing userId or app');

  try {
    // check if access token already exists
    const userAccessToken = await AccessToken.findOne({ userId, app })
      .select('-_id accessToken timeStamp')
      .lean();

    if (userAccessToken) {
      res.status(StatusCodes.OK).send(
        resObj('Access token already exists', {
          ...userAccessToken.accessToken,
          timeStamp: userAccessToken.timeStamp,
        })
      );
      return;
    }

    const token = await serviceClient.getClientAccessToken({
      userId,
      groups: ['all', app],
    });
    // token guard clause
    if (token === null || token === undefined)
      throw new InternalServerError('Failed to generate access token, try again later');

    const tokenQuery = await AccessToken.create({ userId, app, accessToken: token });
    // db tokenQuery guard clause
    if (tokenQuery === null || tokenQuery === undefined)
      throw new InternalServerError('Something went wrong, try again later');

    res
      .status(StatusCodes.OK)
      .send(resObj('Access token generated', { ...token, timeStamp: new Date() }));
  } catch (err: any) {
    console.error(err);
    throw new InternalServerError(err.message ?? 'Something went wrong, try again later');
  }
}

export default getAccessToken;
