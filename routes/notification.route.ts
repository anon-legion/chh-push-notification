import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  getPushNotif,
  postPushNotif,
  patchNotifAsRead,
} from '../controllers/notification.controller';
import validationErrorHandler from '../middlewares/validation-error-handler';
import baseStrValidation from './utils/base-str-validation';
import enumsValidation from './utils/enums-validation';
import sanitizeNumericString from './utils/numeric-string-sanitizer';

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
    (req: Request, _res: Response, next: NextFunction) => {
      let { limit = '15', page = '1' } = req.query;

      limit = sanitizeNumericString(String(limit), '15');
      page = sanitizeNumericString(String(page), '1');

      req.query = { ...req.query, limit, page }

      next();
    },
    getPushNotif
  )
  .patch(patchNotifAsRead)

export default router;
