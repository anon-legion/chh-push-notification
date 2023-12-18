/* eslint-disable security/detect-object-injection */
import { INotification, ISubscription, Zip } from '../../models/types';

interface IRecipientSubs {
  _id: string;
  subscriptions: ISubscription[];
}

/**
 * Zips the notifications with recipient subscriptions.
 * Assumes that notifications and recipientSubs are sorted by recipientId in ascending order
 *
 * @param notifications - The array of notifications.
 * @param recipientSubs - The array of recipient subscriptions.
 * @returns An array of zipped objects containing a notification and its corresponding subscriptions.
 */
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
