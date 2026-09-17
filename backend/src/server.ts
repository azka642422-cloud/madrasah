import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { db } from './config/db.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { studentRouter } from './modules/students/student.routes.js';

const app=express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({origin:env.FRONTEND_ORIGIN,credentials:true,methods:['GET','POST','PUT','PATCH','DELETE']}));
app.use(express.json({limit:'1mb'}));
app.use(cookieParser());

app.get('/api/health',async(_req,res,next)=>{try{await db.query('SELECT 1');res.json({status:'ok'});}catch(error){next(error);}});
app.use('/api/auth',authRouter);
app.use('/api/student',studentRouter);
app.use((_req,res)=>res.status(404).json({error:'NOT_FOUND'}));
app.use((error:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{console.error(error);res.status(500).json({error:'INTERNAL_SERVER_ERROR'});});

app.listen(env.PORT,()=>console.log(`Madrasah API listening on port ${env.PORT}`));
