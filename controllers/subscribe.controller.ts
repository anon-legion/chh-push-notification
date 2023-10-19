import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

async function getAccessToken(req: Request, res: Response): Promise<void> {
  const { serviceClient, body } = req;
  console.log(body);
  const token = await serviceClient.getClientAccessToken({ userId: body.userId, groups: [] });
  res.status(StatusCodes.OK).send(token);
}

export default getAccessToken;
