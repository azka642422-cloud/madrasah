import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { requirePermission,requireRole } from '../../middleware/authorization.js';

export const teacherRouter=Router();
const teacherSchema=z.object({code:z.string().trim().max(50).nullable().optional(),name:z.string().trim().min(1).max(150),nipOrIdentifier:z.string().trim().max(100).nullable().optional(),status:z.enum(['ACTIVE','INACTIVE']).default('ACTIVE')});

teacherRouter.get('/me/students',requireAuthentication,requireRole('GURU'),async(req,res,next)=>{try{if(!req.auth!.teacherId){res.status(403).json({error:'TEACHER_PROFILE_REQUIRED'});return;}const [rows]=await db.query(`SELECT DISTINCT s.id,s.nis,s.name,s.photo_path,s.status,c.code AS class_code FROM students s JOIN student_enrollments se ON se.student_id=s.id AND se.status='ACTIVE' JOIN academic_years ay ON ay.id=se.academic_year_id AND ay.is_active=1 JOIN classes c ON c.id=se.class_id WHERE EXISTS(SELECT 1 FROM teaching_assignments ta WHERE ta.teacher_id=? AND ta.class_id=se.class_id AND ta.academic_year_id=se.academic_year_id AND ta.active=1) OR EXISTS(SELECT 1 FROM homeroom_assignments ha WHERE ha.teacher_id=? AND ha.class_id=se.class_id AND ha.academic_year_id=se.academic_year_id AND ha.active=1) ORDER BY c.code,s.name`,[req.auth!.teacherId,req.auth!.teacherId]);res.json({students:rows});}catch(e){next(e);}});

teacherRouter.get('/',requireAuthentication,requirePermission('teachers.manage'),async(_req,res,next)=>{try{const [rows]=await db.query('SELECT id,code,name,nip_or_identifier,photo_path,status FROM teachers ORDER BY name');res.json({teachers:rows});}catch(e){next(e);}});
teacherRouter.post('/',requireAuthentication,requirePermission('teachers.manage'),async(req,res,next)=>{try{const p=teacherSchema.parse(req.body);const [r]:any=await db.execute('INSERT INTO teachers(code,name,nip_or_identifier,status) VALUES(?,?,?,?)',[p.code??null,p.name,p.nipOrIdentifier??null,p.status]);res.status(201).json({id:r.insertId});}catch(e){next(e);}});
