import express, { type Response } from 'express';
import 'express-async-errors'; // import immediately to patch express
// import security packages
import helmet from 'helmet';
import cors from 'cors';
// import modules
import { WebPubSubServiceClient } from '@azure/web-pubsub';
import publishRouter from './routes/publish.route';
import subscribeRouter from './routes/subscribe.route';

// initialize express
const app = express();
const port = process.env.PORT ?? 3000;

const serviceClient = new WebPubSubServiceClient(process.env.AZURE_PUBSUB_CONNSTRING ?? '', 'notification');
console.log('serviceClient created');

// const corsOptions = {
//   origin: 'http://localhost:8100',
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

// middlewares
app.use(express.json());
app.use(helmet());
// app.use(cors(corsOptions));
app.use(cors());
app.use((req, _, next) => {
  req.serviceClient = serviceClient;
  next();
});

// routes
app.use('/api/v1/publish', publishRouter);
app.use('/api/v1/subscribe', subscribeRouter);
app.use('/api/v1/test_endpoint', (_, res: Response) => {
  res.status(200).send('Express + Typescript Server');
});

async function start(): Promise<void> {
  try {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is listening on port [${port}]`);
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

// start server
void start();
