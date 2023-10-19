import { Router } from 'express';
import getAccessToken from '../controllers/subscribe.controller';

const router = Router();

// prettier-ignore
router.route('/')
  .get(getAccessToken)
  .post(getAccessToken);

export default router;
