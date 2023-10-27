import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AccessToken from '../models/AccessToken';
import { InternalServerError } from '../errors';
import resObj from './utilities/success-response';

async function getAccessToken(req: Request, res: Response): Promise<void> {
  const {
    serviceClient,
    body: { userId, app },
  } = req;

  try {
    // delete existing access tokens for user and app
    await AccessToken.deleteOne({ userId, app });

    const token = await serviceClient.getClientAccessToken({ userId, groups: ['all', app] });
    // token guard clause
    if (!token) throw new InternalServerError('Failed to generate access token, try again later');

    const tokenQuery = await AccessToken.create({ userId, app, accessToken: token });
    // db tokenQuery guard clause
    if (!tokenQuery) throw new InternalServerError('Something went wrong, try again later');

    res.status(StatusCodes.OK).send(resObj('Access token generated', { accessToken: token }));
  } catch (err: any) {
    console.error(err);
    throw new InternalServerError(err.message ?? 'Something went wrong, try again later');
  }
}

export default getAccessToken;
