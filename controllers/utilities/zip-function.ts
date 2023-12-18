/* eslint-disable security/detect-object-injection */
import { INotification, ISubscription, Zip } from '../../models/types';

interface IRecipientSubs {
  _id: string;
  subscriptions: ISubscription[];
}

// assumes that notifications and recipientSubs are sorted by recipientId in ascending order
function zip(notifications: INotification[], recipientSubs: IRecipientSubs[]): Zip[] {
  const result: Zip[] = [];
  let notifIndex = 0;
  let lastUserIdMatched = '';
  for (let i = 0; i < recipientSubs.length; i += 1) {
    const userId = recipientSubs[i]._id;
    const subs = recipientSubs[i].subscriptions;
    for (let j = notifIndex; j < notifications.length; j += 1) {
      const notification = notifications[j];
      if (notification.recipientId === userId) {
        result.push([notification, subs]);
        lastUserIdMatched = notification.recipientId;
      }

      // finished processing all notification for this user, move on to next user
      if (notification.recipientId !== userId && lastUserIdMatched === userId) {
        notifIndex = j;
        break;
      }
    }
  }

  return result;
}

export default zip;
