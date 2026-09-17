import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { env,isProduction } from '../../config/env.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { authenticate,signSession } from './auth.service.js';

export const authRouter=Router();
const loginSchema=z.object({username:z.string().trim().min(1).max(100),password:z.string().min(1).max(200)});
const loginLimiter=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-8',legacyHeaders:false});
const cookieOptions={httpOnly:true,secure:isProduction,sameSite:'lax' as const,path:'/',maxAge:env.AUTH_TOKEN_MINUTES*60*1000};

authRouter.post('/login',loginLimiter,async(req,res,next)=>{try{
  const parsed=loginSchema.safeParse(req.body);if(!parsed.success){res.status(400).json({error:'INVALID_CREDENTIALS'});return;}
  const principal=await authenticate(parsed.data.username,parsed.data.password);
  if(!principal){res.status(401).json({error:'INVALID_CREDENTIALS'});return;}
  res.cookie(env.AUTH_COOKIE_NAME,signSession(principal),cookieOptions);
  res.json({user:{username:principal.username,role:principal.role,mustChangePassword:principal.mustChangePassword}});
}catch(error){next(error);}});

authRouter.post('/logout',(_req,res)=>{res.clearCookie(env.AUTH_COOKIE_NAME,{httpOnly:true,secure:isProduction,sameSite:'lax',path:'/'});res.status(204).end();});

authRouter.get('/me',requireAuthentication,(req,res)=>{const a=req.auth!;res.json({user:{username:a.username,role:a.role,mustChangePassword:a.mustChangePassword}});});
