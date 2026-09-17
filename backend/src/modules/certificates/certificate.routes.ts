import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { requirePermission,requireRole } from '../../middleware/authorization.js';

export const certificateRouter=Router();
certificateRouter.use(requireAuthentication);

certificateRouter.get('/student/me',requireRole('SANTRI'),async(req,res,next)=>{try{if(!req.auth!.studentId){res.status(403).json({error:'STUDENT_PROFILE_REQUIRED'});return;}const [rows]=await db.query(`SELECT id,certificate_number,issue_place,issue_date,hijri_issue_date,graduation_status,status,snapshot_json,issued_at FROM certificates WHERE student_id=? AND status='ISSUED' ORDER BY issued_at DESC`,[req.auth!.studentId]);res.json({certificates:rows});}catch(e){next(e);}});

const draftSchema=z.object({studentId:z.number().int().positive(),academicYearId:z.number().int().positive(),graduationStatus:z.enum(['PENDING','PASSED','NOT_PASSED']),certificateNumber:z.string().trim().min(1).max(100).nullable().optional(),issuePlace:z.string().trim().max(150).nullable().optional(),issueDate:z.string().date().nullable().optional(),hijriIssueDate:z.string().trim().max(100).nullable().optional()});
certificateRouter.post('/draft',requirePermission('certificates.manage'),async(req,res,next)=>{try{const p=draftSchema.parse(req.body);
 const [student]:any=await db.query(`SELECT s.id,s.nis,s.name,s.birth_place,s.birth_date,se.class_id,c.code AS class_code,ay.name AS academic_year FROM students s JOIN student_enrollments se ON se.student_id=s.id AND se.academic_year_id=? JOIN classes c ON c.id=se.class_id JOIN academic_years ay ON ay.id=se.academic_year_id WHERE s.id=? LIMIT 1`,[p.academicYearId,p.studentId]);if(!student[0]){res.status(400).json({error:'STUDENT_ENROLLMENT_NOT_FOUND'});return;}
 const [existing]:any=await db.query(`SELECT id,status FROM certificates WHERE student_id=? AND academic_year_id=? LIMIT 1`,[p.studentId,p.academicYearId]);if(existing[0]?.status==='ISSUED'){res.status(409).json({error:'ISSUED_CERTIFICATE_IMMUTABLE'});return;}
 const snapshot={version:1,student:student[0],graduationStatus:p.graduationStatus,certificateNumber:p.certificateNumber??null,issuePlace:p.issuePlace??null,issueDate:p.issueDate??null,hijriIssueDate:p.hijriIssueDate??null};
 if(existing[0]){await db.execute(`UPDATE certificates SET certificate_number=?,issue_place=?,issue_date=?,hijri_issue_date=?,graduation_status=?,status='DRAFT',snapshot_json=?,updated_by=? WHERE id=?`,[p.certificateNumber??null,p.issuePlace??null,p.issueDate??null,p.hijriIssueDate??null,p.graduationStatus,JSON.stringify(snapshot),req.auth!.userId,existing[0].id]);res.json({id:existing[0].id});return;}
 const [r]:any=await db.execute(`INSERT INTO certificates(student_id,academic_year_id,certificate_number,issue_place,issue_date,hijri_issue_date,graduation_status,status,snapshot_json,created_by,updated_by) VALUES(?,?,?,?,?,?,?,'DRAFT',?,?,?)`,[p.studentId,p.academicYearId,p.certificateNumber??null,p.issuePlace??null,p.issueDate??null,p.hijriIssueDate??null,p.graduationStatus,JSON.stringify(snapshot),req.auth!.userId,req.auth!.userId]);res.status(201).json({id:r.insertId});
}catch(e:any){if(e?.code==='ER_DUP_ENTRY'){res.status(409).json({error:'CERTIFICATE_NUMBER_ALREADY_USED'});return;}next(e);}});

certificateRouter.post('/:certificateId/issue',requirePermission('certificates.manage'),async(req,res,next)=>{try{const id=Number(req.params.certificateId);if(!Number.isSafeInteger(id)||id<=0){res.status(400).json({error:'INVALID_CERTIFICATE_ID'});return;}const [rows]:any=await db.query(`SELECT id,status,graduation_status,certificate_number,issue_date,snapshot_json FROM certificates WHERE id=? LIMIT 1`,[id]);const cert=rows[0];if(!cert){res.status(404).json({error:'CERTIFICATE_NOT_FOUND'});return;}if(cert.status!=='DRAFT'){res.status(409).json({error:'CERTIFICATE_NOT_DRAFT'});return;}if(cert.graduation_status!=='PASSED'){res.status(409).json({error:'GRADUATION_NOT_PASSED'});return;}if(!cert.certificate_number||!cert.issue_date){res.status(409).json({error:'CERTIFICATE_IDENTITY_INCOMPLETE'});return;}
 await db.execute(`UPDATE certificates SET status='ISSUED',issued_at=NOW(),issued_by=?,updated_by=? WHERE id=? AND status='DRAFT'`,[req.auth!.userId,req.auth!.userId,id]);res.status(204).end();
}catch(e){next(e);}});

certificateRouter.post('/:certificateId/void',requirePermission('certificates.manage'),async(req,res,next)=>{try{const id=Number(req.params.certificateId);if(!Number.isSafeInteger(id)||id<=0){res.status(400).json({error:'INVALID_CERTIFICATE_ID'});return;}const [r]:any=await db.execute(`UPDATE certificates SET status='VOID',voided_at=NOW(),voided_by=?,updated_by=? WHERE id=? AND status IN('DRAFT','ISSUED')`,[req.auth!.userId,req.auth!.userId,id]);if(!r.affectedRows){res.status(409).json({error:'CERTIFICATE_NOT_VOIDABLE'});return;}res.status(204).end();}catch(e){next(e);}});
