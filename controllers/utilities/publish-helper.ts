import Notif from '../../models/Notification';
import Subscription from '../../models/Subscription';
import type { INotification, MessageType, TWebpush, Zip } from '../../models/types';

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
          icon: 'https://cdn-icons-png.flaticon.com/512/8297/8297354.png',
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

export default { getPendingNotifications, getRecipientSubs, pushNotifications };
