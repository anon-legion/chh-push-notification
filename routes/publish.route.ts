import { Router, type Request, type Response, type NextFunction } from 'express';
import { startPolling, stopPolling } from '../controllers/publish.controller';

const router = Router();

// prettier-ignore
router.route('/polling')
  .post(
    (req: Request, _res: Response, next: NextFunction) => {
      req.body.secondsInterval = Math.abs(Number(req.body.secondsInterval)) || 6;
      next();
    },
    startPolling
  )
  .get(stopPolling)

// // prettier-ignore
// router.route('/')
//   .post(postPushNotif)
//   .get(getPushNotif);

export default router;
