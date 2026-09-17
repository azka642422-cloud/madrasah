import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { requirePermission } from '../../middleware/authorization.js';

export const adminStudentRouter=Router();
adminStudentRouter.use(requireAuthentication,requirePermission('students.manage'));
const studentSchema=z.object({nis:z.string().trim().min(1).max(50),name:z.string().trim().min(1).max(150),birthPlace:z.string().trim().max(100).nullable().optional(),birthDate:z.string().date().nullable().optional(),status:z.enum(['ACTIVE','BOYONG','GRADUATED','INACTIVE']).default('ACTIVE')});

adminStudentRouter.get('/',async(_req,res,next)=>{try{const [rows]=await db.query(`SELECT s.id,s.nis,s.name,s.birth_place,s.birth_date,s.photo_path,s.status,c.code AS class_code,ay.name AS academic_year FROM students s LEFT JOIN student_enrollments se ON se.student_id=s.id AND se.status='ACTIVE' LEFT JOIN academic_years ay ON ay.id=se.academic_year_id AND ay.is_active=1 LEFT JOIN classes c ON c.id=se.class_id ORDER BY s.name`);res.json({students:rows});}catch(e){next(e);}});
adminStudentRouter.post('/',async(req,res,next)=>{try{const p=studentSchema.parse(req.body);const [r]:any=await db.execute('INSERT INTO students(nis,name,birth_place,birth_date,status,source_reference) VALUES(?,?,?,?,?,?)',[p.nis,p.name,p.birthPlace??null,p.birthDate??null,p.status,'ADMIN']);res.status(201).json({id:r.insertId});}catch(e){next(e);}});
adminStudentRouter.patch('/:studentId',async(req,res,next)=>{try{const id=Number(req.params.studentId);if(!Number.isSafeInteger(id)||id<=0){res.status(400).json({error:'INVALID_STUDENT_ID'});return;}const p=studentSchema.partial().parse(req.body);const fields:string[]=[];const values:any[]=[];for(const [key,col] of [['nis','nis'],['name','name'],['birthPlace','birth_place'],['birthDate','birth_date'],['status','status']] as const){if(p[key]!==undefined){fields.push(`${col}=?`);values.push(p[key]);}}if(!fields.length){res.status(400).json({error:'NO_CHANGES'});return;}values.push(id);const [r]:any=await db.execute(`UPDATE students SET ${fields.join(',')} WHERE id=?`,values);if(!r.affectedRows){res.status(404).json({error:'STUDENT_NOT_FOUND'});return;}res.status(204).end();}catch(e){next(e);}});
