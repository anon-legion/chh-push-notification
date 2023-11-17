import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import validationErrorHandler from '../middlewares/validation-error-handler';
import baseStrValidation from './utils/base-str-validation';

const router = Router();

// prettier-ignore
router.route('/register')
  .post(
    baseStrValidation('username'),
    baseStrValidation('email'),
    baseStrValidation('password'),
    validationErrorHandler,
    register
  );

// prettier-ignore
router.route('/login')
  .post(
    baseStrValidation('email'),
    baseStrValidation('password'),
    validationErrorHandler,
    login
  );

export default router;
