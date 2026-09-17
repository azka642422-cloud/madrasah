import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { requirePermission } from '../../middleware/authorization.js';

export const classRouter=Router();
classRouter.use(requireAuthentication);
classRouter.get('/',async(_req,res,next)=>{try{const [rows]=await db.query('SELECT id,code,level,name,room_name,floor_name,active FROM classes WHERE active=1 ORDER BY level,code');res.json({classes:rows});}catch(e){next(e);}});

const enrollmentSchema=z.object({studentId:z.number().int().positive(),academicYearId:z.number().int().positive(),classId:z.number().int().positive(),status:z.enum(['ACTIVE','BOYONG','PROMOTED','GRADUATED','INACTIVE']).default('ACTIVE')});
classRouter.post('/enrollments',requirePermission('students.manage'),async(req,res,next)=>{try{const p=enrollmentSchema.parse(req.body);const [r]:any=await db.execute(`INSERT INTO student_enrollments(student_id,academic_year_id,class_id,status) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE class_id=VALUES(class_id),status=VALUES(status),ended_on=NULL`,[p.studentId,p.academicYearId,p.classId,p.status]);res.status(201).json({id:r.insertId||null});}catch(e){next(e);}});

const assignmentSchema=z.object({teacherId:z.number().int().positive(),classId:z.number().int().positive(),subjectId:z.number().int().positive(),academicYearId:z.number().int().positive(),semester:z.enum(['GANJIL','GENAP'])});
classRouter.post('/teaching-assignments',requirePermission('schedules.manage'),async(req,res,next)=>{try{const p=assignmentSchema.parse(req.body);const [r]:any=await db.execute('INSERT INTO teaching_assignments(teacher_id,class_id,subject_id,academic_year_id,semester) VALUES(?,?,?,?,?)',[p.teacherId,p.classId,p.subjectId,p.academicYearId,p.semester]);res.status(201).json({id:r.insertId});}catch(e){next(e);}});

const homeroomSchema=z.object({teacherId:z.number().int().positive(),classId:z.number().int().positive(),academicYearId:z.number().int().positive(),assignmentType:z.enum(['WALI_KELAS','MUSRIF'])});
classRouter.post('/homeroom-assignments',requirePermission('schedules.manage'),async(req,res,next)=>{try{const p=homeroomSchema.parse(req.body);const [r]:any=await db.execute('INSERT INTO homeroom_assignments(teacher_id,class_id,academic_year_id,assignment_type) VALUES(?,?,?,?)',[p.teacherId,p.classId,p.academicYearId,p.assignmentType]);res.status(201).json({id:r.insertId});}catch(e){next(e);}});
