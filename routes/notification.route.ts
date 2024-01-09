import { Router } from 'express';
import { param, query } from 'express-validator';
import {
  getPushNotifByType,
  postPushNotif,
  postPushNotifSearch,
  patchNotifStatus,
  getStatsByDate,
  getStatsByDateRange,
  deleteOldNotifs,
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
    query('messageType').isString().trim().notEmpty(),
    validationErrorHandler,
    getPendingNotif
  )

// prettier-ignore
router.route('/search')
  .post(
    validatePagination,
    baseStrValidation('search'),
    validationErrorHandler,
    postPushNotifSearch
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
  .patch(patchNotifStatus)
  .delete(deleteOldNotifs);

// prettier-ignore
router.route('/stats/:datemmddyy')
  .get(getStatsByDate)
  .post(getStatsByDateRange)

// prettier-ignore
router.route('/message_type/:messageType')
  .get(
    validatePagination,
    param('messageType').isString().trim().notEmpty(),
    validationErrorHandler,
    getPushNotifByType
  )

// prettier-ignore
router.route('/:recipientId')
  .get(
    validatePagination,
    param('recipientId').isString().trim().notEmpty(),
    validationErrorHandler,
    getNotifByRecipientId
  )

export default router;
