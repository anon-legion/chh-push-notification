/* eslint-disable security/detect-object-injection */
import Notif from '../../models/Notification';
import Subscription from '../../models/Subscription';
import type { INotification, MessageType, TWebpush, Zip } from '../../models/types';
import type { Types } from 'mongoose';
import type { SendResult } from 'web-push';

const notificationType = new Map<MessageType, string>([
  ['admission', 'Admission'],
  ['approve', 'Approve'],
  ['diagResults', 'DiagResults'],
  ['pf', 'PF'],
]);

async function getPendingNotifications() {
  return (await Notif.find({ status: 1 }).select('-__v').sort({ recipientId: 1 }).lean()) ?? [];
}

async function getRecipientSubs(pendingNotifications: INotification[]) {
  const recipients = [...new Set(pendingNotifications.map((notif) => notif.recipientId))];

  return (
    (await Subscription.aggregate([
      { $match: { userId: { $in: recipients } } },
      { $group: { _id: '$userId', subscriptions: { $push: '$$ROOT' } } },
      { $sort: { _id: 1 } },
    ])) ?? []
  );
}

async function pushNotifications(zippedNotifications: Zip[], webpush: TWebpush) {
  return Promise.all(
    zippedNotifications.map(async (item) => {
      const notificationPayload = {
        notification: {
          title: notificationType.get(item[0].messageType),
          body: item[0].message,
          icon: 'https://sdg-dokivendor.chonghua.com.ph/assets/icon/logoicon.png',
          actions: item[0].urlRedirect ? [{ action: 'redirect', title: 'View Details' }] : [],
          data: item[0].urlRedirect
            ? {
                onActionClick: {
                  default: { operation: 'openWindow', url: item[0].urlRedirect },
                  redirect: {
                    operation: 'navigateLastFocusedOrOpen',
                    url: item[0].urlRedirect,
                  },
                },
              }
            : {},
        },
      };

      const pushRes = await Promise.allSettled(
        item[1].map(async (sub) => {
          const webpushRes = await webpush.sendNotification(
            sub.subscription,
            JSON.stringify(notificationPayload)
          );
          return webpushRes;
        })
      );

      return pushRes;
    })
  );
}

function processPushedNotifications(
  pushedNotifications: PromiseSettledResult<SendResult>[][],
  zippedNotifications: Zip[]
) {
  const invalidSubIds: Set<Types.ObjectId> = new Set();
  const notificationsSent: INotification[] = [];

  pushedNotifications.forEach((notif, i) =>
    notif.forEach((sub, j) => {
      if (sub.status === 'fulfilled') notificationsSent.push(zippedNotifications[i][0]);
      if (sub.status === 'rejected') invalidSubIds.add(zippedNotifications[i][1][j]._id);
    })
  );

  return { invalidSubIds, notificationsSent };
}

async function updateNotificationStatus(notificationsSent: INotification[]) {
  await Notif.updateMany(
    { _id: { $in: notificationsSent.map((notif) => notif._id) } },
    { status: 2, dateTimeSend: new Date() }
  );
}

async function deleteInvalidSubscriptions(invalidSubIds: Set<Types.ObjectId>) {
  await Subscription.deleteMany({ _id: { $in: [...invalidSubIds] } });
}

export default {
  deleteInvalidSubscriptions,
  getPendingNotifications,
  getRecipientSubs,
  processPushedNotifications,
  pushNotifications,
  updateNotificationStatus,
};
