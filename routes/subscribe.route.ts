import { Router } from 'express';
import { genAccessToken, getServerPubKey } from '../controllers/subscribe.controller';
import validationErrorHandler from '../middlewares/validation-error-handler';
import baseStrValidation from './utils/base-str-validation';

const router = Router();

// prettier-ignore
router.route('/')
  .post(
    baseStrValidation('userId'),
    baseStrValidation('app'),
    validationErrorHandler,
    genAccessToken
  )
  .get(getServerPubKey)

export default router;
