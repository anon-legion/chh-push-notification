import { Router } from 'express';
import { getPushNotif, postPushNotif, startPolling, stopPolling } from '../controllers/publish.controller';

const router = Router();

// prettier-ignore
router.route('/polling')
  .post(startPolling)
  .get(stopPolling)

// prettier-ignore
router.route('/')
  .post(postPushNotif)
  .get(getPushNotif);

export default router;
