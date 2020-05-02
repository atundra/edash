import express from 'express';
import { router as apiRouter } from './api';
import { PORT } from './config';

const app = express();
app.use('/api', apiRouter);
app.listen(PORT, () => console.log(`Server started on ${PORT} port`));
