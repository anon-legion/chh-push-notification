import { Router, type Request, type Response, type NextFunction } from 'express';
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
    (req: Request, _res: Response, next: NextFunction) => {
      let { limit = '15', page = '1' } = req.query;

      limit = Number.isNaN(Number(limit)) ? '15' : limit;
      page = Number.isNaN(Number(page)) ? '1' : page;

      req.query = { ...req.query, limit, page }

      next();
    },
    getPushNotif
  )

export default router;
