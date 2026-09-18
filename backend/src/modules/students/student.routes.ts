import { Router } from 'express';
import { db } from '../../config/db.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { requireOwnStudent } from '../../middleware/scope.js';

export const studentRouter=Router();
studentRouter.get('/me',requireAuthentication,requireOwnStudent,async(req,res,next)=>{try{
 const [rows]:any=await db.query(`SELECT s.id,s.nis,s.name,s.birth_place,s.birth_date,s.photo_path,s.status,c.code AS class_code,ay.name AS academic_year FROM students s LEFT JOIN student_enrollments se ON se.student_id=s.id AND se.status='ACTIVE' LEFT JOIN academic_years ay ON ay.id=se.academic_year_id AND ay.is_active=1 LEFT JOIN classes c ON c.id=se.class_id WHERE s.id=? LIMIT 1`,[req.auth!.studentId]);
 if(!rows[0]){res.status(404).json({error:'STUDENT_NOT_FOUND'});return;}
 res.json({student:rows[0]});
}catch(error){next(error);}});
