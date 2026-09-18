import type { RequestHandler } from 'express';
import type { RoleCode } from '../types/auth.js';

export const requireRole=(...roles:RoleCode[]):RequestHandler=>(req,res,next)=>{
  if(!req.auth){res.status(401).json({error:'UNAUTHENTICATED'});return;}
  if(!roles.includes(req.auth.role)){res.status(403).json({error:'FORBIDDEN'});return;}
  next();
};

export const requirePermission=(permission:string):RequestHandler=>(req,res,next)=>{
  if(!req.auth){res.status(401).json({error:'UNAUTHENTICATED'});return;}
  if(!req.auth.permissions.includes(permission)){res.status(403).json({error:'FORBIDDEN'});return;}
  next();
};

export const requireSuperAdmin:RequestHandler=requireRole('SUPER_ADMIN');
