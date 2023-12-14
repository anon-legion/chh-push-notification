import { StatusCodes } from 'http-status-codes';
import { InternalServerError, NotFoundError } from '../errors';
import Notification from '../models/Notification';
import statusKey from './utilities/status-key';
import resObj from './utilities/success-response';
import type { ByType, ByStatus, IStats } from '../models/types';
import type { Request, Response, NextFunction } from 'express';

const randomAppReceiver = (): string => {
  const apps = ['doki', 'nursi', 'pxi', 'resi'];
  return apps[Math.floor(Math.random() * apps.length)];
};

const randomMessage = (): string => {
  const messages = [
    'lorem ipsum dolor sit amet',
    'consectetur adipiscing elit',
    'sed do eiusmod tempor',
    'incididunt ut labore',
    'et dolore magna aliqua',
    'ut enim ad minim veniam',
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

const randomMessageType = (): string => {
  const types = ['admission', 'approve', 'diagResults', 'pf'];
  return types[Math.floor(Math.random() * types.length)];
};

const randomRecipientId = (): string => String(Math.floor(Math.random() * 1000000000000));

async function populateNotificaiton(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [notif1, notif2, notif3] = await Promise.all([
      Notification.create({
        appReceiver: randomAppReceiver(),
        message: randomMessage(),
        messageType: randomMessageType(),
        recipientId: randomRecipientId(),
        status: 1,
      }),
      Notification.create({
        appReceiver: randomAppReceiver(),
        message: randomMessage(),
        messageType: randomMessageType(),
        recipientId: randomRecipientId(),
        status: 1,
      }),
      Notification.create({
        appReceiver: randomAppReceiver(),
        message: randomMessage(),
        messageType: randomMessageType(),
        recipientId: randomRecipientId(),
        status: 1,
      }),
    ]);

    res
      .status(StatusCodes.CREATED)
      .send(resObj('Mock data generated', { notif1, notif2, notif3 }));
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

async function getPushNotif(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { limit, page } = req.query;
  const skip = Math.abs((Number(page) - 1) * Number(limit));

  try {
    const notifications =
      (await Notification.find()
        .limit(Math.abs(Number(limit)))
        .skip(skip)
        .select('-__v')
        .lean()) ?? [];

    if (!notifications.length) throw new NotFoundError('No notifications found');

    res.status(StatusCodes.OK).send(resObj('Getting push notifications', notifications));
  } catch (err: any) {
    next(err);
  }
}

async function patchNotifAsRead(
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
      Notification.aggregate([
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
            _id: { appReceiver: '$appReceiver', messageType: '$messageType' },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.appReceiver',
            byType: {
              $push: {
                type: '$_id.messageType',
                count: '$count',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            appReceiver: '$_id',
            byType: 1,
          },
        },
      ]),
      Notification.aggregate([
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
            _id: { appReceiver: '$appReceiver', status: '$status' },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.appReceiver',
            byStatus: {
              $push: {
                status: '$_id.status',
                count: '$count',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            appReceiver: '$_id',
            byStatus: 1,
          },
        },
      ]),
    ]);

    const response: IStats = {
      total: 0,
      doki: {
        byType: {
          admission: 0,
          approve: 0,
          diagResults: 0,
          pf: 0,
        },
        byStatus: {
          pending: 0,
          sent: 0,
          read: 0,
        },
      },
      nursi: {
        byType: {
          admission: 0,
          approve: 0,
          diagResults: 0,
          pf: 0,
        },
        byStatus: {
          pending: 0,
          sent: 0,
          read: 0,
        },
      },
      pxi: {
        byType: {
          admission: 0,
          approve: 0,
          diagResults: 0,
          pf: 0,
        },
        byStatus: {
          pending: 0,
          sent: 0,
          read: 0,
        },
      },
      resi: {
        byType: {
          admission: 0,
          approve: 0,
          diagResults: 0,
          pf: 0,
        },
        byStatus: {
          pending: 0,
          sent: 0,
          read: 0,
        },
      },
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
          dateTimeSend: {
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
              date: '$dateTimeSend',
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
  const { limit, page } = req.query;
  const skip = Math.abs((Number(page) - 1) * Number(limit));
  try {
    const pendingNotifications =
      (await Notification.find({ status: 1 })
        .limit(Math.abs(Number(limit)))
        .skip(skip)
        .sort({ dateTimeIn: -1 })
        .select('-__v')
        .lean()) ?? [];

    res.status(StatusCodes.OK).send(resObj('Pending notification count', pendingNotifications));
  } catch (err: any) {
    next(err);
  }
}

async function deleteAllNotif(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deleteResult = await Notification.deleteMany();
    if (!deleteResult.deletedCount)
      throw new InternalServerError('Nothing was deleted, try again later');

    res
      .status(StatusCodes.OK)
      .send(resObj(`All notifications deleted: ${deleteResult.deletedCount}`));
  } catch (err: any) {
    next(err);
  }
}

export {
  populateNotificaiton,
  getPushNotif,
  postPushNotif,
  patchNotifAsRead,
  getStatsByDate,
  getStatsByDateRange,
  getPendingNotif,
  deleteAllNotif,
};
