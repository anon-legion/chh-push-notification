import { Router } from 'express';

import { getApps, postNewApp, updateApp } from '../controllers/app.controller';

const router = Router();

// prettier-ignore
router.route('/')
  .get(getApps)
  .post(postNewApp)

// prettier-ignore
router.route('/:appId')
  .patch(updateApp);

export default router;
