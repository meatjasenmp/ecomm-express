import express, { Express } from 'express';
import router from './app/routes/app.routes';

const app: Express = express();
const port = process.env.PORT || 8080;

app.use(router);

app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});