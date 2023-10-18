import express from 'express';
import { getPushNotif, postPushNotif } from '../controllers/publish.controller';

const router = express.Router();

// prettier-ignore
router.route('/')
  .post(postPushNotif)
  .get(getPushNotif);
// .get(postPushNotif);

export default router;
