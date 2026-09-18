import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { requirePermission } from '../../middleware/authorization.js';
import { writeAudit } from '../audit/audit.service.js';
const id=z.number().int().positive();
const text=(n:number)=>z.string().trim().min(1).max(n);
const nullable=(n:number)=>z.string().trim().max(n).nullable();
const resources={
 teachers:{table:'teachers',permission:'teachers.manage',schema:z.object({code:nullable(50),name:text(150),nip_or_identifier:nullable(100),status:z.enum(['ACTIVE','INACTIVE'])}).strict()},
 classes:{table:'classes',permission:'schedules.manage',schema:z.object({code:text(20),level:z.number().int().min(1).max(6),name:nullable(100),room_name:nullable(100),floor_name:nullable(50),active:z.boolean()}).strict()},
 subjects:{table:'subjects',permission:'schedules.manage',schema:z.object({code:nullable(50),name:text(150),book_name:nullable(255),active:z.boolean()}).strict()},
 years:{table:'academic_years',permission:'settings.operational.manage',schema:z.object({name:text(20),starts_on:z.string().date(),ends_on:z.string().date(),is_active:z.boolean()}).strict().refine(x=>x.ends_on>=x.starts_on)},
 assignments:{table:'teaching_assignments',permission:'schedules.manage',schema:z.object({teacher_id:id,class_id:id,subject_id:id,academic_year_id:id,semester:z.enum(['GANJIL','GENAP']),active:z.boolean()}).strict()},
 homerooms:{table:'homeroom_assignments',permission:'schedules.manage',schema:z.object({teacher_id:id,class_id:id,academic_year_id:id,assignment_type:z.enum(['WALI_KELAS','MUSRIF']),active:z.boolean()}).strict()},
} as const;
export const operationsRouter=Router();
operationsRouter.use(requireAuthentication);
operationsRouter.param('resource',(req,res,next,key)=>{if(!Object.hasOwn(resources,key)){res.status(404).json({error:'RESOURCE_NOT_FOUND'});return}const cfg=resources[key as keyof typeof resources];requirePermission(cfg.permission)(req,res,next)});
operationsRouter.get('/:resource',async(req,res,next)=>{try{const cfg=resources[String(req.params.resource) as keyof typeof resources];const columns=Object.keys(cfg.schema instanceof z.ZodObject?cfg.schema.shape:(cfg.schema as any).shape);const [rows]=await db.query(`SELECT id,${columns.join(',')} FROM ${cfg.table} ORDER BY id DESC LIMIT 2000`);res.json({rows})}catch(e){next(e)}});
operationsRouter.post('/:resource',save);
operationsRouter.put('/:resource/:id',save);
export async function save(req:any,res:any,next:any){
 const cfg=resources[String(req.params.resource) as keyof typeof resources],parsed=cfg.schema.safeParse(req.body),recordId=req.params.id?Number(req.params.id):null;
 if(!parsed.success||(recordId!==null&&(!Number.isSafeInteger(recordId)||recordId<=0)))return void res.status(400).json({error:'INVALID_RESOURCE_DATA'});
 const data:Record<string,any>=parsed.data,conn=await db.getConnection();
 try{await conn.beginTransaction();
 // A shared row serializes year activation and assignment changes, including first insert.
 await conn.query("SELECT id FROM roles WHERE code='SUPER_ADMIN' FOR UPDATE");
 let before:any=null;
 if(recordId){const [rows]:any=await conn.query(`SELECT * FROM ${cfg.table} WHERE id=? FOR UPDATE`,[recordId]);before=rows[0];if(!before){await conn.rollback();return void res.status(404).json({error:'RESOURCE_NOT_FOUND'})}}
 if(cfg.table==='academic_years'){
  const[overlap]:any=await conn.query('SELECT id FROM academic_years WHERE id<>? AND starts_on<=? AND ends_on>=? FOR UPDATE',[recordId??0,data.ends_on,data.starts_on]);
  if(overlap.length)throw Object.assign(Error('ACADEMIC_YEAR_OVERLAP'),{status:409});
  if(before&&(before.starts_on!==data.starts_on||before.ends_on!==data.ends_on)){
   const[terms]:any=await conn.query('SELECT id FROM academic_terms WHERE academic_year_id=? AND (starts_on<? OR ends_on>?)',[recordId,data.starts_on,data.ends_on]);
   const[attendance]:any=await conn.query('SELECT id FROM attendance WHERE academic_year_id=? AND (attendance_date<? OR attendance_date>?) LIMIT 1',[recordId,data.starts_on,data.ends_on]);
   if(terms.length||attendance.length)throw Object.assign(Error('YEAR_PERIOD_CONTAINS_EXISTING_DATA'),{status:409});
  }
  if(data.is_active)await conn.execute('UPDATE academic_years SET is_active=0 WHERE is_active=1 AND id<>?',[recordId??0]);
 }
 if(cfg.table==='teaching_assignments'||cfg.table==='homeroom_assignments'){
  for(const [field,table] of [['teacher_id','teachers'],['class_id','classes'],['academic_year_id','academic_years'],...(cfg.table==='teaching_assignments'?[['subject_id','subjects']]:[])]){
   const[rows]:any=await conn.query(`SELECT id FROM ${table} WHERE id=? ${data.active&&table!=='academic_years'?(table==='teachers'?"AND status='ACTIVE'":'AND active=1'):''} FOR UPDATE`,[data[field!]]);
   if(!rows[0])throw Object.assign(Error('INVALID_ASSIGNMENT_REFERENCE'),{status:409});
  }
  if(before){const fields=['teacher_id','class_id','academic_year_id',...(cfg.table==='teaching_assignments'?['subject_id','semester']:['assignment_type'])];if(fields.some(k=>String(before[k])!==String(data[k])))throw Object.assign(Error('ARCHIVE_ASSIGNMENT_AND_CREATE_REPLACEMENT'),{status:409})}
  if(cfg.table==='homeroom_assignments'&&data.active){
   // Keep the prior assignment as inactive history; never overwrite its teacher.
   await conn.execute('UPDATE homeroom_assignments SET active=0 WHERE class_id=? AND academic_year_id=? AND assignment_type=? AND id<>?',[data.class_id,data.academic_year_id,data.assignment_type,recordId??0]);
  }
 }
 const cols=Object.keys(data),values=Object.values(data);let savedId=recordId;
 if(recordId)await conn.execute(`UPDATE ${cfg.table} SET ${cols.map(c=>c+'=?').join(',')} WHERE id=?`,[...values,recordId]);
 else{const[r]:any=await conn.execute(`INSERT INTO ${cfg.table}(${cols.join(',')}) VALUES(${cols.map(()=>'?').join(',')})`,values);savedId=r.insertId}
 await writeAudit(req,{action:recordId?'OPERATION.UPDATED':'OPERATION.CREATED',entityType:cfg.table,entityId:savedId!,metadata:{before,after:data}},conn);
 await conn.commit();res.status(recordId?200:201).json({id:savedId});
 }catch(e:any){await conn.rollback();if(e.status)return void res.status(e.status).json({error:e.message});next(e)}finally{conn.release()}
}
