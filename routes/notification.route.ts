import { Router } from 'express';
import {
  getPushNotif,
  postPushNotif,
  patchNotifStatus,
  getStatsByDate,
  getStatsByDateRange,
  deleteAllNotif,
  getPendingNotif,
} from '../controllers/notification.controller';
import validationErrorHandler from '../middlewares/validation-error-handler';
import baseStrValidation from './utils/base-str-validation';
import enumsValidation from './utils/enums-validation';
import validatePagination from './utils/pagination-validation';

const router = Router();

// prettier-ignore
router.route('/pending')
  .get(
    validatePagination,
    getPendingNotif
    )

// prettier-ignore
router.route('/')
  .post(
    enumsValidation('appReceiver', ['doki', 'nursi', 'pxi', 'resi']),
    baseStrValidation('message'),
    enumsValidation('messageType', ['admission', 'approve', 'diagResults', 'pf']),
    baseStrValidation('recipientId'),
    validationErrorHandler,
    postPushNotif
  )
  .get(
    validatePagination,
    getPushNotif
  )
  .patch(patchNotifStatus)
  .delete(deleteAllNotif);

// prettier-ignore
router.route('/stats/:datemmddyy')
  .get(getStatsByDate)
  .post(getStatsByDateRange)

export default router;
