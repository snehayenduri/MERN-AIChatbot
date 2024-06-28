import express from 'express'
import {config} from 'dotenv'
import morgan from 'morgan'
import appRouter from './routes/index.js';

config();
const app=express();

//middlewares
app.use(express.json())

//for loggin purpose, can remove it in higher production
app.use(morgan("dev"))

app.use("/api/v1", appRouter);

export default app;
