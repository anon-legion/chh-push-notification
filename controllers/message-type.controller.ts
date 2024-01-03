import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { InternalServerError } from '../errors';
import MessageType from '../models/MessageType';
import resObj from './utilities/success-response';

async function getMessageTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { appReceiver = '' } = req.params;

  try {
    const messageTypes = await MessageType.find({ appReceiver })
      .sort({ MessageType: 1 })
      .select('-__v')
      .lean();

    res.status(200).send(messageTypes);
  } catch (err: any) {
    next(err);
  }
}

async function postMessageType(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { appReceiver, messageType, title, isActive = true } = req.body;

  try {
    const newMessageType = await MessageType.create({
      appReceiver,
      messageType,
      title,
      isActive,
    });

    if (newMessageType == null || !Object.keys(newMessageType).length)
      throw new InternalServerError('Something went wrong, message type not created');

    res.status(StatusCodes.CREATED).send(resObj('Message type created', newMessageType));
  } catch (err: any) {
    next(err);
  }
}

async function updateMessageType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { appReceiver, messageType, title, isActive = true, messageTypeId } = req.body;

  try {
    const updatedMessageType = await MessageType.findByIdAndUpdate(
      messageTypeId,
      {
        appReceiver,
        messageType,
        title,
        isActive,
      },
      { new: true }
    )
      .select('-__v')
      .lean();

    if (updatedMessageType == null || !Object.keys(updatedMessageType).length)
      throw new InternalServerError('Something went wrong, message type not created');

    res.status(StatusCodes.OK).send(resObj('Message type updated', updatedMessageType));
  } catch (err: any) {
    next(err);
  }
}

export { getMessageTypes, postMessageType, updateMessageType };
