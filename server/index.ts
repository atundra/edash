import express from 'express';
import bodyParser from 'body-parser';

import { router as apiRouter } from './api';
import { PORT } from './config';

const app = express();

app.use(bodyParser.json());

app.use('/api', apiRouter);
app.listen(PORT, () => console.log(`Server started on ${PORT} port`));
