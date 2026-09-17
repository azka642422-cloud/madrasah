import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { requirePermission,requireRole } from '../../middleware/authorization.js';

export const gradeRouter=Router();
gradeRouter.use(requireAuthentication);
const termSchema=z.object({academicYearId:z.coerce.number().int().positive(),semester:z.enum(['GANJIL','GENAP'])});

// Santri can only read grades linked to the authenticated student profile.
gradeRouter.get('/student/me',requireRole('SANTRI'),async(req,res,next)=>{try{
 if(!req.auth!.studentId){res.status(403).json({error:'STUDENT_PROFILE_REQUIRED'});return;}
 const p=termSchema.safeParse(req.query);if(!p.success){res.status(400).json({error:'INVALID_TERM'});return;}
 const [rows]=await db.query(`SELECT g.id,su.id AS subject_id,su.name AS subject_name,su.book_name,g.score,g.notes,c.code AS class_code,ay.name AS academic_year,g.semester FROM grades g JOIN subjects su ON su.id=g.subject_id JOIN classes c ON c.id=g.class_id JOIN academic_years ay ON ay.id=g.academic_year_id WHERE g.student_id=? AND g.academic_year_id=? AND g.semester=? ORDER BY su.name`,[req.auth!.studentId,p.data.academicYearId,p.data.semester]);res.json({grades:rows});
}catch(e){next(e);}});

// Admin/Super Admin can inspect a class; Guru only if assigned to that class+subject+term.
gradeRouter.get('/class/:classId/subject/:subjectId',requirePermission('grades.manage'),async(req,res,next)=>{try{
 const classId=Number(req.params.classId),subjectId=Number(req.params.subjectId);const p=termSchema.safeParse(req.query);
 if(!Number.isSafeInteger(classId)||classId<=0||!Number.isSafeInteger(subjectId)||subjectId<=0||!p.success){res.status(400).json({error:'INVALID_QUERY'});return;}
 if(req.auth!.role==='GURU'){
  if(!req.auth!.teacherId){res.status(403).json({error:'TEACHER_PROFILE_REQUIRED'});return;}
  const [scope]:any=await db.query(`SELECT 1 FROM teaching_assignments WHERE teacher_id=? AND class_id=? AND subject_id=? AND academic_year_id=? AND semester=? AND active=1 LIMIT 1`,[req.auth!.teacherId,classId,subjectId,p.data.academicYearId,p.data.semester]);
  if(!scope[0]){res.status(403).json({error:'OUTSIDE_TEACHING_SCOPE'});return;}
 }
 const [rows]=await db.query(`SELECT s.id AS student_id,s.nis,s.name,g.id AS grade_id,g.score,g.notes FROM student_enrollments se JOIN students s ON s.id=se.student_id LEFT JOIN grades g ON g.student_id=s.id AND g.subject_id=? AND g.academic_year_id=? AND g.semester=? WHERE se.class_id=? AND se.academic_year_id=? AND se.status='ACTIVE' ORDER BY s.name`,[subjectId,p.data.academicYearId,p.data.semester,classId,p.data.academicYearId]);res.json({grades:rows});
}catch(e){next(e);}});

const writeSchema=z.object({studentId:z.number().int().positive(),subjectId:z.number().int().positive(),academicYearId:z.number().int().positive(),semester:z.enum(['GANJIL','GENAP']),score:z.number().min(0).max(100).nullable(),notes:z.string().trim().max(2000).nullable().optional()});
gradeRouter.put('/',requirePermission('grades.manage'),async(req,res,next)=>{try{
 const p=writeSchema.parse(req.body);
 const [enrollment]:any=await db.query(`SELECT class_id FROM student_enrollments WHERE student_id=? AND academic_year_id=? AND status IN('ACTIVE','PROMOTED','GRADUATED') LIMIT 1`,[p.studentId,p.academicYearId]);
 if(!enrollment[0]){res.status(400).json({error:'STUDENT_NOT_ENROLLED'});return;}const classId=enrollment[0].class_id;
 if(req.auth!.role==='GURU'){
  if(!req.auth!.teacherId){res.status(403).json({error:'TEACHER_PROFILE_REQUIRED'});return;}
  const [scope]:any=await db.query(`SELECT 1 FROM teaching_assignments WHERE teacher_id=? AND class_id=? AND subject_id=? AND academic_year_id=? AND semester=? AND active=1 LIMIT 1`,[req.auth!.teacherId,classId,p.subjectId,p.academicYearId,p.semester]);
  if(!scope[0]){res.status(403).json({error:'OUTSIDE_TEACHING_SCOPE'});return;}
 }
 await db.execute(`INSERT INTO grades(student_id,subject_id,class_id,academic_year_id,semester,score,notes,recorded_by) VALUES(?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE class_id=VALUES(class_id),score=VALUES(score),notes=VALUES(notes),recorded_by=VALUES(recorded_by)`,[p.studentId,p.subjectId,classId,p.academicYearId,p.semester,p.score,p.notes??null,req.auth!.userId]);res.status(204).end();
}catch(e){next(e);}});
