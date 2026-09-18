import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { requirePermission } from '../../middleware/authorization.js';

export const subjectRouter=Router();
subjectRouter.use(requireAuthentication);
subjectRouter.get('/',async(_req,res,next)=>{try{const [rows]=await db.query('SELECT id,code,name,book_name,active FROM subjects WHERE active=1 ORDER BY name');res.json({subjects:rows});}catch(e){next(e);}});
const schema=z.object({code:z.string().trim().max(50).nullable().optional(),name:z.string().trim().min(1).max(150),bookName:z.string().trim().max(255).nullable().optional()});
subjectRouter.post('/',requirePermission('schedules.manage'),async(req,res,next)=>{try{const p=schema.parse(req.body);const [r]:any=await db.execute('INSERT INTO subjects(code,name,book_name) VALUES(?,?,?)',[p.code??null,p.name,p.bookName??null]);res.status(201).json({id:r.insertId});}catch(e){next(e);}});
subjectRouter.patch('/:subjectId',requirePermission('schedules.manage'),async(req,res,next)=>{try{const id=Number(req.params.subjectId);if(!Number.isSafeInteger(id)||id<=0){res.status(400).json({error:'INVALID_SUBJECT_ID'});return;}const p=schema.partial().parse(req.body);const fields:string[]=[];const values:any[]=[];for(const [key,col] of [['code','code'],['name','name'],['bookName','book_name']] as const){if(p[key]!==undefined){fields.push(`${col}=?`);values.push(p[key]);}}if(!fields.length){res.status(400).json({error:'NO_CHANGES'});return;}values.push(id);const [r]:any=await db.execute(`UPDATE subjects SET ${fields.join(',')} WHERE id=?`,values);if(!r.affectedRows){res.status(404).json({error:'SUBJECT_NOT_FOUND'});return;}res.status(204).end();}catch(e){next(e);}});
