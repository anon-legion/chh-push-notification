import { Router } from 'express';
import { param } from 'express-validator';
import {
  getPushNotif,
  getPushNotifByType,
  postPushNotif,
  patchNotifStatus,
  getStatsByDate,
  getStatsByDateRange,
  deleteAllNotif,
  getPendingNotif,
  getNotifByRecipientId,
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
    // enumsValidation('messageType', ['admission', 'approve', 'diagResults', 'pf']),
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

// prettier-ignore
router.route('/message_type/:messageType')
  .get(
    validatePagination,
    param('messageType').isString().trim().notEmpty(),
    getPushNotifByType
  )

// prettier-ignore
router.route('/:recipientId')
  .get(
    validatePagination,
    param('recipientId').isString().trim().notEmpty(),
    getNotifByRecipientId
  )

export default router;
