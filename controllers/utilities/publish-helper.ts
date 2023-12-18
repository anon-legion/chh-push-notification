import Notif from '../../models/Notification';
import Subscription from '../../models/Subscription';
import type { INotification } from '../../models/types';

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

export default { getPendingNotifications, getRecipientSubs };
