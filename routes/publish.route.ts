import { Router } from 'express';
import { getPushNotif, postPushNotif } from '../controllers/publish.controller';

const router = Router();

// prettier-ignore
router.route('/')
  .post(postPushNotif)
  .get(getPushNotif);

export default router;
