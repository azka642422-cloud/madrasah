import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { verifySession } from '../modules/auth/auth.service.js';

export const requireAuthentication:RequestHandler=(req,res,next)=>{
  const token=req.cookies?.[env.AUTH_COOKIE_NAME];
  if(!token){res.status(401).json({error:'UNAUTHENTICATED'});return;}
  try{req.auth=verifySession(token);next();}
  catch{res.clearCookie(env.AUTH_COOKIE_NAME,{path:'/'});res.status(401).json({error:'INVALID_SESSION'});}
};
