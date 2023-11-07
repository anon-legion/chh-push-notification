import Notification from '../../models/Notification';
import { BadRequestError, InternalServerError } from '../../errors';
import type { INotification } from '../../models/types';

async function updateNotification(notification: INotification, status: number = 2): Promise<INotification> {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(notification._id, { status }, { new: true })
      .select('-__v')
      .lean();

    if (!updatedNotification) {
      throw new BadRequestError('Notification not found');
    }

    return updatedNotification;
  } catch (err: any) {
    console.error(err);
    throw new InternalServerError(err.message ?? 'Something went wrong, try again later');
  }
}

export default updateNotification;
