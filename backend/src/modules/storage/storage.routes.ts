import { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import { db } from '../../config/db.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { requirePermission } from '../../middleware/authorization.js';

const ROOT=path.resolve(process.cwd(),'../storage/uploads');
const PHOTO_DIR=path.join(ROOT,'photos');
const DOC_DIR=path.join(ROOT,'documents');
const imageTypes=new Set(['image/jpeg','image/png','image/webp']);
const documentTypes=new Set(['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:10*1024*1024,files:1}});
export const storageRouter=Router();storageRouter.use(requireAuthentication);

function extension(mime:string){return ({'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','application/pdf':'.pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document':'.docx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'.xlsx'} as Record<string,string>)[mime];}
async function savePrivate(dir:string,file:Express.Multer.File){await fs.mkdir(dir,{recursive:true});const name=crypto.randomUUID()+extension(file.mimetype);await fs.writeFile(path.join(dir,name),file.buffer,{flag:'wx'});return name;}

storageRouter.post('/students/:studentId/photo',requirePermission('students.manage'),upload.single('file'),async(req,res,next)=>{try{const studentId=Number(req.params.studentId);if(!Number.isSafeInteger(studentId)||studentId<=0||!req.file||!imageTypes.has(req.file.mimetype)||!extension(req.file.mimetype)){res.status(400).json({error:'INVALID_PHOTO'});return;}if(req.file.size>5*1024*1024){res.status(413).json({error:'PHOTO_TOO_LARGE'});return;}const [exists]:any=await db.query('SELECT id FROM students WHERE id=? LIMIT 1',[studentId]);if(!exists[0]){res.status(404).json({error:'STUDENT_NOT_FOUND'});return;}const name=await savePrivate(PHOTO_DIR,req.file);await db.execute('UPDATE students SET photo_path=? WHERE id=?',[`photos/${name}`,studentId]);res.status(201).json({photo:true});}catch(e){next(e);}});

storageRouter.post('/documents',requirePermission('documents.manage'),upload.single('file'),async(req,res,next)=>{try{if(!req.file||!documentTypes.has(req.file.mimetype)||!extension(req.file.mimetype)){res.status(400).json({error:'INVALID_DOCUMENT'});return;}const {category,title,description='',audience='ALL'}=req.body;if(!['MATERI','BUKU_KERJA_GURU','BUKU_SANTRI','PERATURAN_GURU','SILABUS','SOAL','LAINNYA'].includes(category)||!['ALL','SUPER_ADMIN','ADMIN','GURU','SANTRI'].includes(audience)||typeof title!=='string'||!title.trim()){res.status(400).json({error:'INVALID_DOCUMENT_METADATA'});return;}const name=await savePrivate(DOC_DIR,req.file);const rel=`documents/${name}`;const [r]:any=await db.execute(`INSERT INTO documents(category,title,description,file_path,mime_type,file_size,audience,published,uploaded_by) VALUES(?,?,?,?,?,?,?,0,?)`,[category,title.trim(),description,rel,req.file.mimetype,req.file.size,audience,req.auth!.userId]);res.status(201).json({id:r.insertId});}catch(e){next(e);}});

storageRouter.get('/documents/:id/file',async(req,res,next)=>{try{const id=Number(req.params.id);if(!Number.isSafeInteger(id)||id<=0){res.status(400).json({error:'INVALID_DOCUMENT_ID'});return;}const [rows]:any=await db.query(`SELECT file_path,mime_type,title,audience,published FROM documents WHERE id=? LIMIT 1`,[id]);const d=rows[0];if(!d||!d.published){res.status(404).json({error:'DOCUMENT_NOT_FOUND'});return;}if(d.audience!=='ALL'&&d.audience!==req.auth!.role){res.status(403).json({error:'DOCUMENT_FORBIDDEN'});return;}const full=path.resolve(ROOT,d.file_path);if(!full.startsWith(ROOT+path.sep)){res.status(500).json({error:'INVALID_STORAGE_PATH'});return;}res.type(d.mime_type);res.setHeader('Content-Disposition',`inline; filename*=UTF-8''${encodeURIComponent(d.title)}`);res.sendFile(full);}catch(e){next(e);}});

storageRouter.get('/students/:studentId/photo',async(req,res,next)=>{try{const studentId=Number(req.params.studentId);if(!Number.isSafeInteger(studentId)||studentId<=0){res.status(400).end();return;}let allowed=req.auth!.role==='ADMIN'||req.auth!.role==='SUPER_ADMIN'||req.auth!.studentId===studentId;if(req.auth!.role==='GURU'&&req.auth!.teacherId){const [s]:any=await db.query(`SELECT 1 FROM student_enrollments se WHERE se.student_id=? AND se.status='ACTIVE' AND (EXISTS(SELECT 1 FROM teaching_assignments ta WHERE ta.teacher_id=? AND ta.class_id=se.class_id AND ta.academic_year_id=se.academic_year_id AND ta.active=1) OR EXISTS(SELECT 1 FROM homeroom_assignments ha WHERE ha.teacher_id=? AND ha.class_id=se.class_id AND ha.academic_year_id=se.academic_year_id AND ha.active=1)) LIMIT 1`,[studentId,req.auth!.teacherId,req.auth!.teacherId]);allowed=!!s[0];}if(!allowed){res.status(403).end();return;}const [rows]:any=await db.query('SELECT photo_path FROM students WHERE id=? LIMIT 1',[studentId]);if(!rows[0]?.photo_path){res.status(404).end();return;}const full=path.resolve(ROOT,rows[0].photo_path);if(!full.startsWith(ROOT+path.sep)){res.status(500).end();return;}res.sendFile(full);}catch(e){next(e);}});
