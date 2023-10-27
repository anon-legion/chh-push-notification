import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { InternalServerError } from '../errors';
import resObj from './utilities/success-response';

async function getAccessToken(req: Request, res: Response): Promise<void> {
  const { serviceClient, body } = req;
  try {
    const token = await serviceClient.getClientAccessToken({ userId: body.userId, groups: [] });

    res.status(StatusCodes.OK).send(resObj('Access token generated', { token }));
  } catch (err: any) {
    console.error(err);
    throw new InternalServerError(err.message ?? 'Something went wrong');
  }
}

export default getAccessToken;
