import express, { type Response } from 'express';
import 'express-async-errors'; // import immediately to patch express
// import security packages
import helmet from 'helmet';
import cors from 'cors';
// import modules
import publishRouter from './routes/publish.route';

// initialize express
const app = express();
const port = process.env.PORT ?? 3000;

// middlewares
app.use(express.json());
app.use(helmet());
app.use(cors());

// routes
app.use('/api/v1/publish', publishRouter);
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
