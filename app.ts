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

app.set('trust proxy', 1);
// middlewares
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xssSanitizer(['body']));
app.use(morgan('common'));
app.use((req, _res, next) => {
  const reqWebpush = { ...webpush, vapidKeys };
  req.webpush = reqWebpush;
  next();
});

const sub = {
  endpoint:
    'https://updates.push.services.mozilla.com/wpush/v2/gAAAAABlXGYv6Wn2dwvxESXpfmifdbWSw4bRLlnVO5dxpwHZeH_fAWfe8txEOH5LVSXIveh7r96Vbo4y59sOY6pctbVX6EvCcKoH-0Jk6Cw6FvEbVW6vwOJJdhKJB_RWmL3wm3UTE0tEB4ZtFrpRltwrEK35gBYay-7eWHMuhIdLl2CRKn_w8bA',
  expirationTime: null,
  keys: {
    auth: 'H6W6lIzMRLHRSPlTY7MmTw',
    p256dh:
      'BHRi02RBoxC8z8e7jKDtasD6EOUlh21O4PFN68VWvZS_fAgnyyxIgDvEwJbozh0zb5emQuOEMlYlUT9B_yxqDQ8',
  },
};

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/generate_mock_notif', authMiddleware, mockDataRouter);
app.use('/api/v1/publish', authMiddleware, publishRouter);
app.use('/api/v1/subscribe', subscribeRouter);
app.use('/api/v1/test_endpoint', async (req, res: Response, next) => {
  // res.status(200).send('Express + Typescript Server');
  const notificationPayload = {
    notification: {
      title: req.body.title,
      body: req.body.body,
      icon: 'https://cdn-icons-png.flaticon.com/512/8297/8297354.png',
    },
  };
  try {
    const webpushRes = await webpush.sendNotification(sub, JSON.stringify(notificationPayload));
    res.status(200).send(webpushRes);
  } catch (err) {
    next(err);
  }
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
