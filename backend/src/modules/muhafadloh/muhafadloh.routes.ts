import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { requirePermission,requireRole } from '../../middleware/authorization.js';

export const muhafadlohRouter=Router();
muhafadlohRouter.use(requireAuthentication);
const yearSchema=z.object({academicYearId:z.coerce.number().int().positive()});

muhafadlohRouter.get('/student/me',requireRole('SANTRI'),async(req,res,next)=>{try{
 if(!req.auth!.studentId){res.status(403).json({error:'STUDENT_PROFILE_REQUIRED'});return;}const p=yearSchema.safeParse(req.query);if(!p.success){res.status(400).json({error:'INVALID_ACADEMIC_YEAR'});return;}
 const [rows]:any=await db.query(`SELECT m.m1,m.m2,m.m3,m.m4,m.m5,m.m6,m.m7,m.m8,c.code AS class_code,ay.name AS academic_year FROM student_enrollments se JOIN classes c ON c.id=se.class_id JOIN academic_years ay ON ay.id=se.academic_year_id LEFT JOIN muhafadloh m ON m.student_id=se.student_id AND m.academic_year_id=se.academic_year_id WHERE se.student_id=? AND se.academic_year_id=? LIMIT 1`,[req.auth!.studentId,p.data.academicYearId]);res.json({muhafadloh:rows[0]??null});
}catch(e){next(e);}});

muhafadlohRouter.get('/class/:classId',requirePermission('muhafadloh.manage'),async(req,res,next)=>{try{
 const classId=Number(req.params.classId),p=yearSchema.safeParse(req.query);if(!Number.isSafeInteger(classId)||classId<=0||!p.success){res.status(400).json({error:'INVALID_QUERY'});return;}
 if(req.auth!.role==='GURU'){
  if(!req.auth!.teacherId){res.status(403).json({error:'TEACHER_PROFILE_REQUIRED'});return;}
  const [scope]:any=await db.query(`SELECT 1 WHERE EXISTS(SELECT 1 FROM teaching_assignments ta WHERE ta.teacher_id=? AND ta.class_id=? AND ta.academic_year_id=? AND ta.active=1) OR EXISTS(SELECT 1 FROM homeroom_assignments ha WHERE ha.teacher_id=? AND ha.class_id=? AND ha.academic_year_id=? AND ha.active=1)`,[req.auth!.teacherId,classId,p.data.academicYearId,req.auth!.teacherId,classId,p.data.academicYearId]);if(!scope[0]){res.status(403).json({error:'OUTSIDE_TEACHER_SCOPE'});return;}
 }
 const [rows]=await db.query(`SELECT s.id AS student_id,s.nis,s.name,m.m1,m.m2,m.m3,m.m4,m.m5,m.m6,m.m7,m.m8 FROM student_enrollments se JOIN students s ON s.id=se.student_id LEFT JOIN muhafadloh m ON m.student_id=s.id AND m.academic_year_id=se.academic_year_id WHERE se.class_id=? AND se.academic_year_id=? AND se.status='ACTIVE' ORDER BY s.name`,[classId,p.data.academicYearId]);res.json({muhafadloh:rows});
}catch(e){next(e);}});

const writeSchema=z.object({studentId:z.number().int().positive(),academicYearId:z.number().int().positive(),execution:z.enum(['m1','m2','m3','m4','m5','m6','m7','m8']),value:z.number().nonnegative().nullable()});
muhafadlohRouter.put('/',requirePermission('muhafadloh.manage'),async(req,res,next)=>{try{
 const p=writeSchema.parse(req.body);const [enroll]:any=await db.query(`SELECT class_id FROM student_enrollments WHERE student_id=? AND academic_year_id=? AND status IN('ACTIVE','PROMOTED','GRADUATED') LIMIT 1`,[p.studentId,p.academicYearId]);if(!enroll[0]){res.status(400).json({error:'STUDENT_NOT_ENROLLED'});return;}
 if(req.auth!.role==='GURU'){
  if(!req.auth!.teacherId){res.status(403).json({error:'TEACHER_PROFILE_REQUIRED'});return;}const [scope]:any=await db.query(`SELECT 1 WHERE EXISTS(SELECT 1 FROM teaching_assignments ta WHERE ta.teacher_id=? AND ta.class_id=? AND ta.academic_year_id=? AND ta.active=1) OR EXISTS(SELECT 1 FROM homeroom_assignments ha WHERE ha.teacher_id=? AND ha.class_id=? AND ha.academic_year_id=? AND ha.active=1)`,[req.auth!.teacherId,enroll[0].class_id,p.academicYearId,req.auth!.teacherId,enroll[0].class_id,p.academicYearId]);if(!scope[0]){res.status(403).json({error:'OUTSIDE_TEACHER_SCOPE'});return;}
 }
 // Current operational phase is M1 only. Future executions stay NULL until explicitly opened by configuration/migration.
 if(p.execution!=='m1'){res.status(409).json({error:'MUHAFADLOH_EXECUTION_NOT_OPEN'});return;}
 await db.execute(`INSERT INTO muhafadloh(student_id,academic_year_id,m1,recorded_by) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE m1=VALUES(m1),recorded_by=VALUES(recorded_by)`,[p.studentId,p.academicYearId,p.value,req.auth!.userId]);res.status(204).end();
}catch(e){next(e);}});
