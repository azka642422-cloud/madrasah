import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { requireAuthentication } from '../../middleware/authentication.js';
import { requirePermission } from '../../middleware/authorization.js';

export const studentImportRouter = Router();
studentImportRouter.use(requireAuthentication, requirePermission('students.import.manage'));

const id = z.coerce.number().int().positive();
const nisCorrection=z.object({reviewedNis:z.string().trim().min(1).max(50).nullable(),note:z.string().trim().max(1000).nullable().optional()}).strict();
const resolution = z.object({
  decision: z.enum(['MATCH_EXISTING', 'CREATE_NEW', 'KEEP_HISTORICAL', 'REVIEW']),
  studentId: z.number().int().positive().nullable().optional(),
  note: z.string().trim().max(1000).nullable().optional(),
}).strict();

studentImportRouter.get('/:batchId/review', async (req, res, next) => {
  try {
    const b = id.safeParse(req.params.batchId);
    if (!b.success) return void res.status(400).json({ error: 'INVALID_IMPORT_BATCH' });
    const [batch]: any = await db.query(`SELECT id,source_type,source_name,source_checksum,status,created_at,approved_at FROM import_batches WHERE id=? AND source_type='WORD_STUDENT_MASTER' LIMIT 1`, [b.data]);
    if (!batch[0]) return void res.status(404).json({ error: 'IMPORT_BATCH_NOT_FOUND' });
    const [rows] = await db.query(`SELECT r.id,r.source_row_number,r.source_nis,r.reviewed_nis,r.source_name,r.source_class,r.birth_place,r.birth_date,r.matched_student_id,r.match_status,r.review_note,r.reviewed_by,r.reviewed_at,c.id matched_class_id,c.code matched_class_code,s.nis matched_student_nis,s.name matched_student_name,s.status matched_student_status FROM import_student_rows r LEFT JOIN classes c ON UPPER(TRIM(c.code))=UPPER(TRIM(r.source_class)) AND c.active=1 LEFT JOIN students s ON s.id=r.matched_student_id WHERE r.batch_id=? ORDER BY r.source_row_number`, [b.data]);
    res.json({ batch: batch[0], rows });
  } catch (e) { next(e); }
});

studentImportRouter.put('/:batchId/review/:rowId/nis', async (req,res,next)=>{const b=id.safeParse(req.params.batchId),row=id.safeParse(req.params.rowId),x=nisCorrection.safeParse(req.body);if(!b.success||!row.success)return void res.status(400).json({error:'INVALID_IMPORT_REVIEW_ID'});if(!x.success)return void res.status(400).json({error:'INVALID_REVIEWED_NIS'});const conn=await db.getConnection();try{await conn.beginTransaction();const[batch]:any=await conn.query(`SELECT status FROM import_batches WHERE id=? AND source_type='WORD_STUDENT_MASTER' FOR UPDATE`,[b.data]);if(!batch[0]){await conn.rollback();return void res.status(404).json({error:'IMPORT_BATCH_NOT_FOUND'})}if(!['STAGED','REVIEW_REQUIRED'].includes(batch[0].status)){await conn.rollback();return void res.status(409).json({error:'IMPORT_BATCH_NOT_REVIEWABLE'})}const[rows]:any=await conn.query(`SELECT id,source_nis,reviewed_nis FROM import_student_rows WHERE id=? AND batch_id=? FOR UPDATE`,[row.data,b.data]);if(!rows[0]){await conn.rollback();return void res.status(404).json({error:'IMPORT_ROW_NOT_FOUND'})}const reviewed=x.data.reviewedNis?.trim()||null;if(reviewed){const[dup]:any=await conn.query(`SELECT id FROM import_student_rows WHERE batch_id=? AND id<>? AND TRIM(COALESCE(reviewed_nis,source_nis))=? LIMIT 1 FOR UPDATE`,[b.data,row.data,reviewed]);if(dup[0]){await conn.rollback();return void res.status(409).json({error:'REVIEWED_NIS_DUPLICATE_IN_BATCH'})}const[owner]:any=await conn.query(`SELECT id,name,status FROM students WHERE nis=? LIMIT 1 FOR UPDATE`,[reviewed]);if(owner[0]){await conn.rollback();return void res.status(409).json({error:'REVIEWED_NIS_ALREADY_USED',studentId:owner[0].id})}}await conn.execute(`UPDATE import_student_rows SET reviewed_nis=?,match_status='REVIEW',review_note=?,reviewed_by=?,reviewed_at=NOW() WHERE id=?`,[reviewed,x.data.note??null,req.auth!.userId,row.data]);await conn.execute(`UPDATE import_batches SET status='REVIEW_REQUIRED' WHERE id=? AND status='STAGED'`,[b.data]);const ip=(req.ip||'').slice(0,45),ua=(req.get('user-agent')||'').slice(0,500);await conn.execute(`INSERT INTO audit_logs(user_id,action,entity_type,entity_id,metadata,ip_address,user_agent) VALUES(?,?,?,?,?,?,?)`,[req.auth!.userId,'STUDENT_IMPORT.NIS_CORRECTED','import_student_row',String(row.data),JSON.stringify({batchId:b.data,sourceNis:rows[0].source_nis,beforeReviewedNis:rows[0].reviewed_nis??null,reviewedNis:reviewed,note:x.data.note??null}),ip||null,ua||null]);await conn.commit();res.status(204).end()}catch(e){await conn.rollback();next(e)}finally{conn.release()}});

studentImportRouter.put('/:batchId/review/:rowId', async (req, res, next) => {
  const b = id.safeParse(req.params.batchId), row = id.safeParse(req.params.rowId), x = resolution.safeParse(req.body);
  if (!b.success || !row.success) return void res.status(400).json({ error: 'INVALID_IMPORT_REVIEW_ID' });
  if (!x.success) return void res.status(400).json({ error: 'INVALID_IMPORT_REVIEW_DECISION' });
  if (x.data.decision === 'MATCH_EXISTING' && !x.data.studentId) return void res.status(400).json({ error: 'MATCH_EXISTING_REQUIRES_STUDENT' });
  if (x.data.decision !== 'MATCH_EXISTING' && x.data.studentId) return void res.status(400).json({ error: 'STUDENT_ONLY_ALLOWED_FOR_MATCH' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [batch]: any = await conn.query(`SELECT status FROM import_batches WHERE id=? AND source_type='WORD_STUDENT_MASTER' FOR UPDATE`, [b.data]);
    if (!batch[0]) { await conn.rollback(); return void res.status(404).json({ error: 'IMPORT_BATCH_NOT_FOUND' }); }
    if (!['STAGED', 'REVIEW_REQUIRED'].includes(batch[0].status)) { await conn.rollback(); return void res.status(409).json({ error: 'IMPORT_BATCH_NOT_REVIEWABLE' }); }
    const [rows]: any = await conn.query(`SELECT id,source_nis,source_name FROM import_student_rows WHERE id=? AND batch_id=? FOR UPDATE`, [row.data, b.data]);
    if (!rows[0]) { await conn.rollback(); return void res.status(404).json({ error: 'IMPORT_ROW_NOT_FOUND' }); }
    let matchStatus = 'REVIEW', matchedStudentId: null | number = null;
    if (x.data.decision === 'MATCH_EXISTING') {
      const [students]: any = await conn.query(`SELECT id,nis,name,status FROM students WHERE id=? FOR UPDATE`, [x.data.studentId]);
      if (!students[0]) { await conn.rollback(); return void res.status(404).json({ error: 'MATCHED_STUDENT_NOT_FOUND' }); }
      matchedStudentId = students[0].id; matchStatus = 'RESOLVED_MATCH';
    } else if (x.data.decision === 'CREATE_NEW') matchStatus = 'RESOLVED_NEW';
    else if (x.data.decision === 'KEEP_HISTORICAL') matchStatus = 'RESOLVED_HISTORICAL';
    await conn.execute(`UPDATE import_student_rows SET matched_student_id=?,match_status=?,review_note=?,reviewed_by=?,reviewed_at=NOW() WHERE id=?`, [matchedStudentId, matchStatus, x.data.note ?? null, req.auth!.userId, row.data]);
    await conn.execute(`UPDATE import_batches SET status='REVIEW_REQUIRED' WHERE id=? AND status='STAGED'`, [b.data]);
    const ip = (req.ip || '').slice(0, 45), ua = (req.get('user-agent') || '').slice(0, 500);
    await conn.execute(`INSERT INTO audit_logs(user_id,action,entity_type,entity_id,metadata,ip_address,user_agent) VALUES(?,?,?,?,?,?,?)`, [req.auth!.userId, 'STUDENT_IMPORT.REVIEW_RESOLVED', 'import_student_row', String(row.data), JSON.stringify({ batchId: b.data, decision: x.data.decision, matchedStudentId, note: x.data.note ?? null }), ip || null, ua || null]);
    await conn.commit(); res.status(204).end();
  } catch (e) { await conn.rollback(); next(e); } finally { conn.release(); }
});

studentImportRouter.post('/:batchId/approve', async (req, res, next) => {
  const b = id.safeParse(req.params.batchId);
  if (!b.success) return void res.status(400).json({ error: 'INVALID_IMPORT_BATCH' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [batch]: any = await conn.query(`SELECT status FROM import_batches WHERE id=? AND source_type='WORD_STUDENT_MASTER' FOR UPDATE`, [b.data]);
    if (!batch[0]) { await conn.rollback(); return void res.status(404).json({ error: 'IMPORT_BATCH_NOT_FOUND' }); }
    if (!['STAGED', 'REVIEW_REQUIRED'].includes(batch[0].status)) { await conn.rollback(); return void res.status(409).json({ error: 'IMPORT_BATCH_NOT_REVIEWABLE' }); }

    const [duplicates]: any = await conn.query(`SELECT TRIM(COALESCE(reviewed_nis,source_nis)) source_nis FROM import_student_rows WHERE batch_id=? AND COALESCE(reviewed_nis,source_nis) IS NOT NULL AND TRIM(COALESCE(reviewed_nis,source_nis))<>'' GROUP BY TRIM(COALESCE(reviewed_nis,source_nis)) HAVING COUNT(*)>1`, [b.data]);
    if (duplicates.length) {
      const duplicateNis = duplicates.map((d: any) => String(d.source_nis));
      const placeholders = duplicateNis.map(() => '?').join(',');
      await conn.execute(`UPDATE import_student_rows SET match_status='REVIEW',review_note=CASE WHEN review_note IS NULL OR TRIM(review_note)='' THEN 'Duplicate official NIS in source batch; requires Admin/Super Admin verification.' ELSE review_note END,reviewed_by=NULL,reviewed_at=NULL WHERE batch_id=? AND TRIM(COALESCE(reviewed_nis,source_nis)) IN (${placeholders})`, [b.data, ...duplicateNis]);
      await conn.execute(`UPDATE import_batches SET status='REVIEW_REQUIRED' WHERE id=?`, [b.data]);
      const ip = (req.ip || '').slice(0, 45), ua = (req.get('user-agent') || '').slice(0, 500);
      await conn.execute(`INSERT INTO audit_logs(user_id,action,entity_type,entity_id,metadata,ip_address,user_agent) VALUES(?,?,?,?,?,?,?)`, [req.auth!.userId, 'STUDENT_IMPORT.DUPLICATE_NIS_REVIEW_REQUIRED', 'import_batch', String(b.data), JSON.stringify({ duplicateNis }), ip || null, ua || null]);
      await conn.commit();
      return void res.status(409).json({ error: 'DUPLICATE_OFFICIAL_NIS_REQUIRES_REVIEW', duplicateNis });
    }

    const [bad]: any = await conn.query(`SELECT COUNT(*) n FROM import_student_rows r WHERE r.batch_id=? AND (COALESCE(r.reviewed_nis,r.source_nis) IS NULL OR TRIM(COALESCE(r.reviewed_nis,r.source_nis))='' OR TRIM(r.source_name)='' OR r.source_class IS NULL OR TRIM(r.source_class)='' OR r.match_status IN('AMBIGUOUS','EXACT_NAME_REVIEW','REVIEW','RESOLVED_HISTORICAL') OR (SELECT COUNT(*) FROM classes c WHERE UPPER(TRIM(c.code))=UPPER(TRIM(r.source_class)) AND c.active=1)<>1)`, [b.data]);
    if (Number(bad[0].n) > 0) { await conn.rollback(); return void res.status(409).json({ error: 'IMPORT_REVIEW_INCOMPLETE' }); }
    const [result]: any = await conn.execute(`UPDATE import_batches SET status='APPROVED',approved_by=?,approved_at=NOW() WHERE id=? AND status IN('STAGED','REVIEW_REQUIRED')`, [req.auth!.userId, b.data]);
    if (result.affectedRows !== 1) { await conn.rollback(); return void res.status(409).json({ error: 'IMPORT_BATCH_STATE_CHANGED' }); }
    await conn.commit(); res.status(204).end();
  } catch (e) { await conn.rollback(); next(e); } finally { conn.release(); }
});

studentImportRouter.post('/:batchId/apply', async (req, res, next) => {
  const b = id.safeParse(req.params.batchId);
  if (!b.success) return void res.status(400).json({ error: 'INVALID_IMPORT_BATCH' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [batch]: any = await conn.query(`SELECT id,status FROM import_batches WHERE id=? AND source_type='WORD_STUDENT_MASTER' FOR UPDATE`, [b.data]);
    if (!batch[0]) { await conn.rollback(); return void res.status(404).json({ error: 'IMPORT_BATCH_NOT_FOUND' }); }
    if (batch[0].status !== 'APPROVED') { await conn.rollback(); return void res.status(409).json({ error: 'IMPORT_BATCH_NOT_APPROVED' }); }
    const [years]: any = await conn.query(`SELECT id FROM academic_years WHERE is_active=1 FOR UPDATE`);
    if (years.length !== 1) throw new Error('EXACTLY_ONE_ACTIVE_ACADEMIC_YEAR_REQUIRED');
    const academicYearId = years[0].id;
    const [rows]: any = await conn.query(`SELECT id,source_nis,reviewed_nis,source_name,source_class,birth_place,birth_date,matched_student_id,match_status FROM import_student_rows WHERE batch_id=? ORDER BY source_row_number FOR UPDATE`, [b.data]);
    if (!rows.length) { await conn.rollback(); return void res.status(409).json({ error: 'IMPORT_BATCH_EMPTY' }); }
    const seenNis = new Set<string>();
    for (const r of rows) {
      if (['REVIEW', 'AMBIGUOUS', 'EXACT_NAME_REVIEW', 'RESOLVED_HISTORICAL'].includes(r.match_status)) throw new Error('IMPORT_ROW_REQUIRES_REVIEW');
      const nis = String(r.reviewed_nis ?? r.source_nis ?? '').trim(), name = String(r.source_name ?? '').trim(), sourceClass = String(r.source_class ?? '').trim();
      if (!nis || !name || !sourceClass) throw new Error('INVALID_OFFICIAL_WORD_ROW');
      if (seenNis.has(nis)) throw new Error('DUPLICATE_OFFICIAL_NIS_REQUIRES_REVIEW');
      seenNis.add(nis);
      const [classes]: any = await conn.query(`SELECT id FROM classes WHERE UPPER(TRIM(code))=UPPER(?) AND active=1`, [sourceClass]);
      if (classes.length !== 1) throw new Error('OFFICIAL_CLASS_REQUIRES_REVIEW');
      const classId = classes[0].id;
      let studentId = r.matched_student_id;
      if (r.match_status === 'RESOLVED_NEW' && studentId) throw new Error('RESOLVED_NEW_MUST_NOT_HAVE_STUDENT');
      if (studentId) {
        const [s]: any = await conn.query(`SELECT id,nis,status FROM students WHERE id=? FOR UPDATE`, [studentId]);
        if (!s[0]) throw new Error('MATCHED_STUDENT_NOT_FOUND');
        if (s[0].status !== 'ACTIVE') throw new Error('STUDENT_REACTIVATION_REQUIRES_REVIEW');
        const [nisOwner]: any = await conn.query(`SELECT id FROM students WHERE nis=? AND id<>? LIMIT 1 FOR UPDATE`, [nis, studentId]);
        if (nisOwner[0]) throw new Error('OFFICIAL_NIS_CONFLICT');
        await conn.execute(`UPDATE students SET nis=?,name=?,birth_place=?,birth_date=?,source_reference='WORD_STUDENT_MASTER',official_source_batch_id=? WHERE id=?`, [nis, name, r.birth_place ?? null, r.birth_date ?? null, b.data, studentId]);
      } else {
        const [existing]: any = await conn.query(`SELECT id,status FROM students WHERE nis=? FOR UPDATE`, [nis]);
        if (existing[0]) {
          if (r.match_status === 'RESOLVED_NEW') throw new Error('RESOLVED_NEW_NIS_ALREADY_EXISTS');
          studentId = existing[0].id;
          if (existing[0].status !== 'ACTIVE') throw new Error('STUDENT_REACTIVATION_REQUIRES_REVIEW');
          await conn.execute(`UPDATE students SET name=?,birth_place=?,birth_date=?,source_reference='WORD_STUDENT_MASTER',official_source_batch_id=? WHERE id=?`, [name, r.birth_place ?? null, r.birth_date ?? null, b.data, studentId]);
        } else {
          const [x]: any = await conn.execute(`INSERT INTO students(nis,name,birth_place,birth_date,status,source_reference,official_source_batch_id) VALUES(?,?,?,?,'ACTIVE','WORD_STUDENT_MASTER',?)`, [nis, name, r.birth_place ?? null, r.birth_date ?? null, b.data]);
          studentId = x.insertId;
        }
      }
      const [enrollments]: any = await conn.query(`SELECT id,class_id,status,ended_on FROM student_enrollments WHERE student_id=? AND academic_year_id=? FOR UPDATE`, [studentId, academicYearId]);
      const enrollment = enrollments[0];
      if (enrollment) {
        if (enrollment.status !== 'ACTIVE') throw new Error('ENROLLMENT_STATUS_REQUIRES_REVIEW');
        if (enrollment.ended_on != null) throw new Error('ENDED_ACTIVE_ENROLLMENT_REQUIRES_REVIEW');
        if (enrollment.class_id !== classId) throw new Error('ACTIVE_ENROLLMENT_CLASS_CONFLICT');
      } else await conn.execute(`INSERT INTO student_enrollments(student_id,class_id,academic_year_id,status,started_on,ended_on) VALUES(?,?,?,'ACTIVE',NULL,NULL)`, [studentId, classId, academicYearId]);
      await conn.execute(`UPDATE import_student_rows SET matched_student_id=?,match_status='APPROVED' WHERE id=?`, [studentId, r.id]);
    }
    const [result]: any = await conn.execute(`UPDATE import_batches SET status='IMPORTED' WHERE id=? AND status='APPROVED'`, [b.data]);
    if (result.affectedRows !== 1) throw new Error('IMPORT_BATCH_STATE_CHANGED');
    await conn.commit(); res.status(204).end();
  } catch (e: any) {
    await conn.rollback();
    if (['INVALID_OFFICIAL_WORD_ROW','MATCHED_STUDENT_NOT_FOUND','OFFICIAL_NIS_CONFLICT','OFFICIAL_CLASS_REQUIRES_REVIEW','EXACTLY_ONE_ACTIVE_ACADEMIC_YEAR_REQUIRED','ACTIVE_ENROLLMENT_CLASS_CONFLICT','IMPORT_BATCH_STATE_CHANGED','STUDENT_REACTIVATION_REQUIRES_REVIEW','ENROLLMENT_STATUS_REQUIRES_REVIEW','ENDED_ACTIVE_ENROLLMENT_REQUIRES_REVIEW','IMPORT_ROW_REQUIRES_REVIEW','RESOLVED_NEW_MUST_NOT_HAVE_STUDENT','RESOLVED_NEW_NIS_ALREADY_EXISTS','DUPLICATE_OFFICIAL_NIS_REQUIRES_REVIEW'].includes(e?.message)) return void res.status(409).json({ error: e.message });
    if (e?.code === 'ER_DUP_ENTRY') return void res.status(409).json({ error: 'OFFICIAL_NIS_OR_ENROLLMENT_CONFLICT' });
    next(e);
  } finally { conn.release(); }
});
