import express, { type Express } from 'express';
import mongoose from 'mongoose';
import './loadEnvironment.ts';
import router from './app/routes/app.routes';

const app: Express = express();
const connectionString = process.env.ATLAS_URI || '';
const port = process.env.PORT || 8080;

app.use(router);

mongoose
  .connect(connectionString)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is up and running on port ${port}!`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
