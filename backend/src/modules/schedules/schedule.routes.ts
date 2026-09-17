import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { requirePermission,requireRole } from '../../middleware/authorization.js';

export const scheduleRouter=Router();
scheduleRouter.use(requireAuthentication);

scheduleRouter.get('/admin',requirePermission('schedules.manage'),async(_req,res,next)=>{try{
 const [rows]=await db.query(`SELECT sc.id,sc.day_of_week,sc.starts_at,sc.ends_at,sc.room_name,sc.active,ta.id AS assignment_id,t.id AS teacher_id,t.name AS teacher_name,c.id AS class_id,c.code AS class_code,su.id AS subject_id,su.name AS subject_name,su.book_name,ay.id AS academic_year_id,ay.name AS academic_year,ta.semester FROM schedules sc JOIN teaching_assignments ta ON ta.id=sc.teaching_assignment_id JOIN teachers t ON t.id=ta.teacher_id JOIN classes c ON c.id=ta.class_id JOIN subjects su ON su.id=ta.subject_id JOIN academic_years ay ON ay.id=ta.academic_year_id ORDER BY FIELD(sc.day_of_week,'SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU','MINGGU'),sc.starts_at,c.code`);res.json({schedules:rows});
}catch(e){next(e);}});

scheduleRouter.get('/teacher/me',requireRole('GURU'),async(req,res,next)=>{try{
 if(!req.auth!.teacherId){res.status(403).json({error:'TEACHER_PROFILE_REQUIRED'});return;}
 const [rows]=await db.query(`SELECT sc.id,sc.day_of_week,sc.starts_at,sc.ends_at,sc.room_name,c.code AS class_code,su.name AS subject_name,su.book_name,ay.name AS academic_year,ta.semester FROM schedules sc JOIN teaching_assignments ta ON ta.id=sc.teaching_assignment_id JOIN classes c ON c.id=ta.class_id JOIN subjects su ON su.id=ta.subject_id JOIN academic_years ay ON ay.id=ta.academic_year_id WHERE ta.teacher_id=? AND ta.active=1 AND sc.active=1 AND ay.is_active=1 ORDER BY FIELD(sc.day_of_week,'SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU','MINGGU'),sc.starts_at,c.code`,[req.auth!.teacherId]);res.json({schedules:rows});
}catch(e){next(e);}});

scheduleRouter.get('/student/me',requireRole('SANTRI'),async(req,res,next)=>{try{
 if(!req.auth!.studentId){res.status(403).json({error:'STUDENT_PROFILE_REQUIRED'});return;}
 const [rows]=await db.query(`SELECT sc.id,sc.day_of_week,sc.starts_at,sc.ends_at,sc.room_name,t.name AS teacher_name,c.code AS class_code,su.name AS subject_name,su.book_name,ay.name AS academic_year,ta.semester FROM student_enrollments se JOIN academic_years ay ON ay.id=se.academic_year_id AND ay.is_active=1 JOIN teaching_assignments ta ON ta.class_id=se.class_id AND ta.academic_year_id=se.academic_year_id AND ta.active=1 JOIN schedules sc ON sc.teaching_assignment_id=ta.id AND sc.active=1 JOIN teachers t ON t.id=ta.teacher_id JOIN classes c ON c.id=se.class_id JOIN subjects su ON su.id=ta.subject_id WHERE se.student_id=? AND se.status='ACTIVE' ORDER BY FIELD(sc.day_of_week,'SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU','MINGGU'),sc.starts_at`,[req.auth!.studentId]);res.json({schedules:rows});
}catch(e){next(e);}});

const scheduleSchema=z.object({teachingAssignmentId:z.number().int().positive(),dayOfWeek:z.enum(['SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU','MINGGU']),startsAt:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),endsAt:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),roomName:z.string().trim().max(100).nullable().optional()}).superRefine((v,ctx)=>{if(v.startsAt&&v.endsAt&&v.endsAt<=v.startsAt)ctx.addIssue({code:'custom',message:'endsAt must be after startsAt',path:['endsAt']});});

scheduleRouter.post('/',requirePermission('schedules.manage'),async(req,res,next)=>{try{const p=scheduleSchema.parse(req.body);const [assignment]:any=await db.query('SELECT id FROM teaching_assignments WHERE id=? AND active=1 LIMIT 1',[p.teachingAssignmentId]);if(!assignment[0]){res.status(400).json({error:'INVALID_TEACHING_ASSIGNMENT'});return;}const [r]:any=await db.execute('INSERT INTO schedules(teaching_assignment_id,day_of_week,starts_at,ends_at,room_name) VALUES(?,?,?,?,?)',[p.teachingAssignmentId,p.dayOfWeek,p.startsAt??null,p.endsAt??null,p.roomName??null]);res.status(201).json({id:r.insertId});}catch(e){next(e);}});

scheduleRouter.patch('/:scheduleId',requirePermission('schedules.manage'),async(req,res,next)=>{try{const id=Number(req.params.scheduleId);if(!Number.isSafeInteger(id)||id<=0){res.status(400).json({error:'INVALID_SCHEDULE_ID'});return;}const p=scheduleSchema.partial().parse(req.body);const fields:string[]=[];const values:any[]=[];for(const [key,col] of [['teachingAssignmentId','teaching_assignment_id'],['dayOfWeek','day_of_week'],['startsAt','starts_at'],['endsAt','ends_at'],['roomName','room_name']] as const){if(p[key]!==undefined){fields.push(`${col}=?`);values.push(p[key]);}}if(!fields.length){res.status(400).json({error:'NO_CHANGES'});return;}values.push(id);const [r]:any=await db.execute(`UPDATE schedules SET ${fields.join(',')} WHERE id=?`,values);if(!r.affectedRows){res.status(404).json({error:'SCHEDULE_NOT_FOUND'});return;}res.status(204).end();}catch(e){next(e);}});

scheduleRouter.delete('/:scheduleId',requirePermission('schedules.manage'),async(req,res,next)=>{try{const id=Number(req.params.scheduleId);if(!Number.isSafeInteger(id)||id<=0){res.status(400).json({error:'INVALID_SCHEDULE_ID'});return;}const [r]:any=await db.execute('UPDATE schedules SET active=0 WHERE id=?',[id]);if(!r.affectedRows){res.status(404).json({error:'SCHEDULE_NOT_FOUND'});return;}res.status(204).end();}catch(e){next(e);}});
