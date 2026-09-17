import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { requirePermission,requireRole } from '../../middleware/authorization.js';

export const attendanceRouter=Router();
attendanceRouter.use(requireAuthentication);

const periodSchema=z.object({from:z.string().date(),to:z.string().date()}).refine(v=>v.to>=v.from,{message:'Invalid period'});

attendanceRouter.get('/student/me',requireRole('SANTRI'),async(req,res,next)=>{try{
 if(!req.auth!.studentId){res.status(403).json({error:'STUDENT_PROFILE_REQUIRED'});return;}
 const p=periodSchema.safeParse(req.query);if(!p.success){res.status(400).json({error:'INVALID_PERIOD'});return;}
 const [rows]=await db.query(`SELECT a.attendance_date,a.status,c.code AS class_code,a.source FROM attendance a JOIN classes c ON c.id=a.class_id WHERE a.student_id=? AND a.attendance_date BETWEEN ? AND ? ORDER BY a.attendance_date`,[req.auth!.studentId,p.data.from,p.data.to]);
 const [recap]:any=await db.query(`SELECT SUM(status='H') AS H,SUM(status='S') AS S,SUM(status='I') AS I,SUM(status='A') AS A,COUNT(*) AS recorded_days FROM attendance WHERE student_id=? AND attendance_date BETWEEN ? AND ?`,[req.auth!.studentId,p.data.from,p.data.to]);
 res.json({attendance:rows,recap:recap[0]});
}catch(e){next(e);}});

attendanceRouter.get('/class/:classId',requirePermission('attendance.manage'),async(req,res,next)=>{try{
 const classId=Number(req.params.classId);if(!Number.isSafeInteger(classId)||classId<=0){res.status(400).json({error:'INVALID_CLASS_ID'});return;}
 const p=periodSchema.safeParse(req.query);if(!p.success){res.status(400).json({error:'INVALID_PERIOD'});return;}
 if(req.auth!.role==='GURU'){
  if(!req.auth!.teacherId){res.status(403).json({error:'TEACHER_PROFILE_REQUIRED'});return;}
  const [scope]:any=await db.query(`SELECT 1 FROM academic_years ay WHERE ay.is_active=1 AND (EXISTS(SELECT 1 FROM teaching_assignments ta WHERE ta.teacher_id=? AND ta.class_id=? AND ta.academic_year_id=ay.id AND ta.active=1) OR EXISTS(SELECT 1 FROM homeroom_assignments ha WHERE ha.teacher_id=? AND ha.class_id=? AND ha.academic_year_id=ay.id AND ha.active=1)) LIMIT 1`,[req.auth!.teacherId,classId,req.auth!.teacherId,classId]);
  if(!scope[0]){res.status(403).json({error:'OUTSIDE_TEACHER_SCOPE'});return;}
 }
 const [rows]=await db.query(`SELECT s.id AS student_id,s.nis,s.name,a.attendance_date,a.status,a.source FROM student_enrollments se JOIN academic_years ay ON ay.id=se.academic_year_id AND ay.is_active=1 JOIN students s ON s.id=se.student_id LEFT JOIN attendance a ON a.student_id=s.id AND a.attendance_date BETWEEN ? AND ? WHERE se.class_id=? AND se.status='ACTIVE' ORDER BY s.name,a.attendance_date`,[p.data.from,p.data.to,classId]);res.json({attendance:rows});
}catch(e){next(e);}});

const writeSchema=z.object({studentId:z.number().int().positive(),attendanceDate:z.string().date(),status:z.enum(['H','S','I','A'])});
attendanceRouter.put('/',requirePermission('attendance.manage'),async(req,res,next)=>{try{
 const p=writeSchema.parse(req.body);
 const [enroll]:any=await db.query(`SELECT se.class_id,se.academic_year_id FROM student_enrollments se JOIN academic_years ay ON ay.id=se.academic_year_id AND ay.is_active=1 WHERE se.student_id=? AND se.status='ACTIVE' LIMIT 1`,[p.studentId]);
 if(!enroll[0]){res.status(400).json({error:'NO_ACTIVE_ENROLLMENT'});return;}
 if(req.auth!.role==='GURU'){
  if(!req.auth!.teacherId){res.status(403).json({error:'TEACHER_PROFILE_REQUIRED'});return;}
  const [scope]:any=await db.query(`SELECT 1 WHERE EXISTS(SELECT 1 FROM teaching_assignments ta WHERE ta.teacher_id=? AND ta.class_id=? AND ta.academic_year_id=? AND ta.active=1) OR EXISTS(SELECT 1 FROM homeroom_assignments ha WHERE ha.teacher_id=? AND ha.class_id=? AND ha.academic_year_id=? AND ha.active=1)`,[req.auth!.teacherId,enroll[0].class_id,enroll[0].academic_year_id,req.auth!.teacherId,enroll[0].class_id,enroll[0].academic_year_id]);
  if(!scope[0]){res.status(403).json({error:'OUTSIDE_TEACHER_SCOPE'});return;}
 }
 const [locked]:any=await db.query(`SELECT 1 FROM calendar_events WHERE locks_attendance=1 AND ? BETWEEN starts_on AND ends_on LIMIT 1`,[p.attendanceDate]);if(locked[0]){res.status(409).json({error:'ATTENDANCE_LOCKED'});return;}
 await db.execute(`INSERT INTO attendance(student_id,class_id,academic_year_id,attendance_date,status,source,recorded_by) VALUES(?,?,?,?,?,'MANUAL',?) ON DUPLICATE KEY UPDATE class_id=VALUES(class_id),academic_year_id=VALUES(academic_year_id),status=VALUES(status),source='MANUAL',recorded_by=VALUES(recorded_by)`,[p.studentId,enroll[0].class_id,enroll[0].academic_year_id,p.attendanceDate,p.status,req.auth!.userId]);res.status(204).end();
}catch(e){next(e);}});
