import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { InternalServerError } from '../errors';
import App from '../models/App';

async function getApps(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const apps = await App.find().sort({ appCode: 1 }).select('-__v').lean();

    res.status(StatusCodes.OK).send(apps);
  } catch (err: any) {
    next(err);
  }
}

async function postNewApp(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { appCode, appName } = req.body;

  try {
    const newApp = await App.create({
      appCode,
      appName,
    });

    if (newApp == null || !Object.keys(newApp).length)
      throw new InternalServerError('Something went wrong, app not created');

    res.status(StatusCodes.CREATED).send(newApp);
  } catch (err: any) {
    next(err);
  }
}

async function updateApp(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { appCode, appName, isActive = true } = req.body;
  const { appId } = req.params;

  try {
    const updatedApp = await App.findByIdAndUpdate(
      appId,
      {
        appCode,
        appName,
        isActive,
      },
      { new: true }
    )
      .select('-__v')
      .lean();

    if (updatedApp == null || !Object.keys(updatedApp).length)
      throw new InternalServerError('Something went wrong, app not updated');

    res.status(StatusCodes.OK).send(updatedApp);
  } catch (err: any) {
    next(err);
  }
}

export { getApps, postNewApp, updateApp };
