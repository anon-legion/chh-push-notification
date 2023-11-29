import cors from 'cors';
import express, { type Response } from 'express';
import 'express-async-errors'; // import immediately to patch express
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import webpush from 'web-push';

import logger from './logger';
import authMiddleware from './middlewares/authentication';
import errorHandlerMiddleware from './middlewares/error-handler';
import notFoundMiddleware from './middlewares/not-found';
import xssSanitizer from './middlewares/xss-sanitzer';
import authRouter from './routes/auth.route';
import mockDataRouter from './routes/mock-data.route';
import notificationRouter from './routes/notification.route';
import publishRouter from './routes/publish.route';
import subscribeRouter from './routes/subscribe.route';

// initialize express
const app = express();
const port = process.env.PORT ?? 3000;

let vapidKeys = {
  publicKey: process.env.VAPID_PBLC_KEY ?? '',
  privateKey: process.env.VAPID_PRVT_KEY ?? '',
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  vapidKeys = webpush.generateVAPIDKeys();
  logger.info('VAPID keys generated');
}

// webpush.setGCMAPIKey(process.env.GCM_API_KEY ?? '');
webpush.setVapidDetails(
  'mailto:chh_pns@goodappsinc.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// // Required options to allow Access-Control-Allow-Origin: *
// const corsOptions = {
//   credentials: false,
// };

app.set('trust proxy', 1);
// middlewares
app.use(express.json());
app.use(helmet());
// app.use(cors(corsOptions));
app.use(cors());
app.use(xssSanitizer(['body']));
app.use(morgan('common'));
app.use((req, _res, next) => {
  const reqWebpush = { ...webpush, vapidKeys };
  req.webpush = reqWebpush;
  next();
});

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/generate_mock_notif', authMiddleware, mockDataRouter);
app.use('/api/v1/notification', authMiddleware, notificationRouter);
app.use('/api/v1/publish', authMiddleware, publishRouter);
app.use('/api/v1/subscribe', subscribeRouter);
app.use('/api/v1/test_endpoint', async (_req, res: Response) => {
  res.status(200).send('Express + Typescript Server');
});

// 404 and error handler middleware to catch request errors
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

async function start(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await mongoose.connect(process.env.MDB_URI!, { dbName: 'chh-notification' });
    app.listen(port, () => {
      logger.info(`Server is listening on port [${port}]`);
    });
  } catch (e) {
    logger.error(e);
  }
}

// start server
start();
