import type { RequestHandler } from 'express';
import { db } from '../config/db.js';

export const requireOwnStudent:RequestHandler=(req,res,next)=>{
  if(!req.auth){res.status(401).json({error:'UNAUTHENTICATED'});return;}
  if(req.auth.role!=='SANTRI' || !req.auth.studentId){res.status(403).json({error:'STUDENT_SCOPE_REQUIRED'});return;}
  next();
};

export const requireTeacherStudentScope:RequestHandler=async(req,res,next)=>{
  if(!req.auth){res.status(401).json({error:'UNAUTHENTICATED'});return;}
  if(req.auth.role==='SUPER_ADMIN'||req.auth.role==='ADMIN'){next();return;}
  if(req.auth.role!=='GURU'||!req.auth.teacherId){res.status(403).json({error:'TEACHER_SCOPE_REQUIRED'});return;}
  const studentId=Number(req.params.studentId);
  if(!Number.isSafeInteger(studentId)||studentId<=0){res.status(400).json({error:'INVALID_STUDENT_ID'});return;}
  const [rows]:any=await db.query(`SELECT 1 FROM student_enrollments se JOIN academic_years ay ON ay.id=se.academic_year_id AND ay.is_active=1 WHERE se.student_id=? AND se.status='ACTIVE' AND (EXISTS(SELECT 1 FROM teaching_assignments ta WHERE ta.teacher_id=? AND ta.class_id=se.class_id AND ta.academic_year_id=se.academic_year_id AND ta.active=1) OR EXISTS(SELECT 1 FROM homeroom_assignments ha WHERE ha.teacher_id=? AND ha.class_id=se.class_id AND ha.academic_year_id=se.academic_year_id AND ha.active=1)) LIMIT 1`,[studentId,req.auth.teacherId,req.auth.teacherId]);
  if(!rows[0]){res.status(403).json({error:'OUTSIDE_TEACHER_SCOPE'});return;}
  next();
};
