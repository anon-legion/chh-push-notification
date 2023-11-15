import { Router } from 'express';
import genAcessToken from '../controllers/subscribe.controller';
import baseStrValidation from './utils/base-str-validation';
import validationErrorHandler from '../middlewares/validation-error-handler';

const router = Router();

// prettier-ignore
router.route('/')
  .post(
    baseStrValidation('userId'),
    baseStrValidation('app'),
    validationErrorHandler,
    genAcessToken
  );

export default router;
