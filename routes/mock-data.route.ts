import { Router } from 'express';
import { populateNotificaiton } from '../controllers/notification.controller';

const router = Router();

// prettier-ignore
router.route('/')
  .get(populateNotificaiton)

export default router;
