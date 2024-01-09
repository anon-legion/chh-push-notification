import { StatusCodes } from 'http-status-codes';
import { InternalServerError, NotFoundError } from '../errors';
import Notification from '../models/Notification';
import notifHelper from './utilities/notification-helper';
import statusKey from './utilities/status-key';
import resObj from './utilities/success-response';
import type { ByType, ByStatus, IStats } from '../models/types';
import type { Request, Response, NextFunction } from 'express';

async function populateNotificaiton(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { mockDataCount = 3 } = req.body;
  const arraySize = !Number.isNaN(Number(mockDataCount)) ? Math.abs(Number(mockDataCount)) : 3;

  try {
    const notifications = Array(arraySize)
      .fill(null)
      .map(() => ({
        appReceiver: notifHelper.randomAppReceiver(),
        message: notifHelper.randomMessage(),
        messageType: notifHelper.randomMessageType(),
        recipientId: notifHelper.randomRecipientId(),
        status: 1,
      }));

    const createdNotifications = await Notification.create(notifications);

    res.status(StatusCodes.CREATED).send(resObj('Mock data generated', createdNotifications));
  } catch (err: any) {
    next(err);
  }
}

async function postPushNotif(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { appReceiver, message, messageType, recipientId, urlRedirect = null } = req.body;

  const notification = {
    appReceiver,
    message,
    messageType,
    recipientId,
    urlRedirect,
  };

  try {
    const notificationQuery = await Notification.create(notification);

    if (notificationQuery == null || !Object.keys(notificationQuery).length)
      throw new InternalServerError('Something went wrong, notification not created');

    res.status(StatusCodes.CREATED).send(resObj('Notification created', notificationQuery));
  } catch (err: any) {
    next(err);
  }
}

async function patchNotifStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { notificationId, status } = req.body;

  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { status, dateTimeRead: new Date() },
      { new: true }
    )
      .select('-__v')
      .lean();

    if (!notification) throw new NotFoundError('Notification not found');

    res.status(StatusCodes.OK).send(resObj('Notification marked as read', notification));
  } catch (err: any) {
    next(err);
  }
}

async function getStatsByDate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { datemmddyy } = req.params;
  const dateTimeStart = new Date(datemmddyy);
  const dateTimeEnd = new Date(dateTimeStart);
  dateTimeEnd.setDate(dateTimeEnd.getDate() + 1);

  try {
    const [statsByType, statsByStatus] = await Promise.all([
      Notification.aggregate(notifHelper.queryCountByType(dateTimeStart, dateTimeEnd)),
      Notification.aggregate(notifHelper.queryCountByStatus(dateTimeStart, dateTimeEnd)),
    ]);

    const response: IStats = {
      total: 0,
      doki: notifHelper.createStatsObject(),
      nursi: notifHelper.createStatsObject(),
      pxi: notifHelper.createStatsObject(),
      resi: notifHelper.createStatsObject(),
    };

    statsByType.forEach((item) => {
      item.byType.forEach((typeInfo: any) => {
        (
          response[item.appReceiver as keyof IStats] as { byType: ByType; byStatus: ByStatus }
        ).byType[typeInfo.type as keyof ByType] = typeInfo.count;
        response.total += typeInfo.count;
      });
    });

    statsByStatus.forEach((item) => {
      item.byStatus.forEach((statusInfo: any) => {
        const key = statusKey(statusInfo.status);
        (
          response[item.appReceiver as keyof IStats] as { byType: ByType; byStatus: ByStatus }
        ).byStatus[key as keyof ByStatus] = statusInfo.count;
      });
    });

    res
      .status(StatusCodes.OK)
      .send(
        resObj(`Generated stats for ${datemmddyy}`, { ...response, dateTimeStart, dateTimeEnd })
      );
  } catch (err: any) {
    next(err);
  }
}

async function getStatsByDateRange(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { datemmddyy: dateTimeStartIso } = req.params;
  const { dateTimeEnd: dateTimeEndIso } = req.body;
  const dateTimeStart = new Date(dateTimeStartIso);
  const dateTimeEnd = new Date(dateTimeEndIso);
  dateTimeEnd.setDate(dateTimeEnd.getDate() + 1);

  try {
    const statsByDate = await Notification.aggregate([
      {
        $match: {
          dateTimeIn: {
            $gte: dateTimeStart,
            $lt: dateTimeEnd,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%m/%d/%Y',
              date: '$dateTimeIn',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);

    res
      .status(StatusCodes.OK)
      .send(
        resObj(`Generated stats for ${dateTimeStartIso} to ${dateTimeEndIso}`, statsByDate)
      );
  } catch (err) {
    next(err);
  }
}

async function getPendingNotif(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { limit, page, messageType = 'all' } = req.query;
  const skip = Math.abs((Number(page) - 1) * Number(limit));

  const query: Record<string, any> = { status: 1 };
  if ((messageType as string).toLowerCase() !== 'all') {
    query.messageType = messageType;
  }

  try {
    const [pendingNotifications, totalPending] = await Promise.all([
      Notification.find(query)
        .limit(Math.abs(Number(limit)))
        .skip(skip)
        .sort({ dateTimeIn: -1 })
        .select('-__v')
        .lean(),
      Notification.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalPending / Number(limit));

    if (Number(page) > totalPages && totalPending)
      throw new NotFoundError('You have exceeded the total number of pages');

    if (!pendingNotifications.length && Number(page) <= totalPages)
      throw new InternalServerError(
        'Your request could not be completed due to an internal error. Please try again later.'
      );

    res.status(StatusCodes.OK).send({
      ...resObj('Pending notification count', pendingNotifications ?? []),
      totalCount: totalPending ?? 0,
    });
  } catch (err: any) {
    next(err);
  }
}

async function deleteOldNotifs(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  try {
    const deleteResult = await Notification.deleteMany({ dateTimeIn: { $lt: twoWeeksAgo } });
    if (!deleteResult.deletedCount)
      throw new InternalServerError('Nothing was deleted, try again later');

    res
      .status(StatusCodes.OK)
      .send(resObj(`All notifications deleted: ${deleteResult.deletedCount}`));
  } catch (err: any) {
    next(err);
  }
}

async function getNotifByRecipientId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { recipientId } = req.params;
  const { limit, page } = req.query;
  const skip = Math.abs((Number(page) - 1) * Number(limit));

  try {
    const [notifications, totalNotifications] = await Promise.all([
      Notification.find({ recipientId })
        .limit(Math.abs(Number(limit)))
        .skip(skip)
        .sort({ dateTimeIn: -1 })
        .select('-__v')
        .lean(),
      Notification.countDocuments({ recipientId }),
    ]);

    const totalPages = Math.ceil(totalNotifications / Number(limit));

    if (Number(page) > totalPages && totalNotifications)
      throw new NotFoundError('You have exceeded the total number of pages');

    if (!notifications.length && Number(page) <= totalPages)
      throw new InternalServerError(
        'Your request could not be completed due to an internal error. Please try again later.'
      );

    res.status(StatusCodes.OK).send({
      ...resObj(`Getting push notifications for ${recipientId}`, notifications ?? []),
      totalCount: totalNotifications ?? 0,
    });
  } catch (err: any) {
    next(err);
  }
}

async function getPushNotifByType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { messageType } = req.params;
  const { limit, page, datemmddyy } = req.query;
  const skip = Math.abs((Number(page) - 1) * Number(limit));
  const dateTimeStart = new Date(datemmddyy as string);
  const dateTimeEnd = new Date(dateTimeStart);
  dateTimeEnd.setDate(dateTimeEnd.getDate() + 1);

  const query: Record<string, any> = { dateTimeIn: { $gte: dateTimeStart, $lt: dateTimeEnd } };
  if (messageType.toLowerCase() !== 'all') {
    query.messageType = messageType;
  }

  try {
    const [notifications, totalNotifications] = await Promise.all([
      Notification.find(query)
        .limit(Math.abs(Number(limit)))
        .skip(skip)
        .sort({ dateTimeIn: -1 })
        .select('-__v')
        .lean(),
      Notification.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalNotifications / Number(limit));

    if (Number(page) > totalPages && totalNotifications)
      throw new NotFoundError('You have exceeded the total number of pages');

    if (!notifications.length && Number(page) <= totalPages)
      throw new InternalServerError(
        'Your request could not be completed due to an internal error. Please try again later.'
      );

    res.status(StatusCodes.OK).send({
      ...resObj('Getting push notifications by message type', notifications ?? []),
      totalCount: totalNotifications ?? 0,
    });
  } catch (err: any) {
    next(err);
  }
}

async function postPushNotifSearch(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { limit, page, status = 'all' } = req.query;
  const { search } = req.body;
  const skip = Math.abs((Number(page) - 1) * Number(limit));

  try {
    const [notifications, totalNotifications] = await Promise.all([
      Notification.find(
        notifHelper.queryFuzzyFind(['message', 'recipientId'], search, status as string)
      )
        .limit(Math.abs(Number(limit)))
        .skip(skip)
        .sort({ dateTimeIn: -1 })
        .select('-__v')
        .lean(),
      Notification.countDocuments(
        notifHelper.queryFuzzyFind(['message', 'recipientId'], search, status as string)
      ),
    ]);

    const totalPages = Math.ceil(totalNotifications / Number(limit));

    if (Number(page) > totalPages && totalNotifications)
      throw new NotFoundError('You have exceeded the total number of pages');

    if (!notifications.length && Number(page) <= totalPages)
      throw new InternalServerError(
        'Your request could not be completed due to an internal error. Please try again later.'
      );

    res.status(StatusCodes.OK).send({
      ...resObj('Getting push notifications by message type', notifications ?? []),
      totalCount: totalNotifications ?? 0,
    });
  } catch (err: any) {
    next(err);
  }
}

export {
  populateNotificaiton,
  getPushNotifByType,
  postPushNotif,
  postPushNotifSearch,
  patchNotifStatus,
  getStatsByDate,
  getStatsByDateRange,
  getPendingNotif,
  deleteOldNotifs,
  getNotifByRecipientId,
};
