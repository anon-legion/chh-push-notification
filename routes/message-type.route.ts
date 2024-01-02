import { Router } from 'express';
import {
  getMessageTypes,
  postMessageType,
  updateMessageType,
} from '../controllers/message-type.controller';

const router = Router();

// prettier-ignore
router.route('/')
  .post(postMessageType)
  .patch(updateMessageType);

// prettier-ignore
router.route('/:appReceiver')
  .get(getMessageTypes);

export default router;
