import { Router } from 'express';
import {
  postSubcription,
  getServerPubKey,
  deleteSubscription,
} from '../controllers/subscribe.controller';
import validationErrorHandler from '../middlewares/validation-error-handler';
import baseStrValidation from './utils/base-str-validation';

const router = Router();

// prettier-ignore
router.route('/')
  .post(
    baseStrValidation('userId'),
    baseStrValidation('app'),
    baseStrValidation('subscription.endpoint'),
    baseStrValidation('subscription.keys.auth'),
    baseStrValidation('subscription.keys.p256dh'),
    validationErrorHandler,
    postSubcription
  )
  .get(getServerPubKey)
  .delete(
    baseStrValidation('endpoint'),
    deleteSubscription
  )

export default router;
