import { Router } from 'express';
import { getPushNotif, postPushNotif } from '../controllers/notification.controller';
import validationErrorHandler from '../middlewares/validation-error-handler';
import baseStrValidation from './utils/base-str-validation';
import enumsValidation from './utils/enums-validation';

const router = Router();

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
    getPushNotif
  )

export default router;
