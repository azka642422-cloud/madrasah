import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import{PDFDocument}from'pdf-lib';
const dbName=process.env.DB_NAME;
if(process.env.NODE_ENV!=='test'||!dbName||!/_ci$/.test(dbName))throw Error('Tests require NODE_ENV=test and an isolated *_ci database');
const db=await mysql.createConnection({host:process.env.DB_HOST??'127.0.0.1',user:process.env.DB_USER??'root',password:process.env.DB_PASSWORD??process.env.MYSQL_PWD,database:dbName,dateStrings:true});
const api=process.env.API_URL??'http://127.0.0.1:3000';
const origin=process.env.FRONTEND_ORIGIN??'http://127.0.0.1:5173';
const secret=process.env.AUTH_JWT_SECRET;
if(!secret)throw Error('Test JWT secret is required');
async function actor(username){const[[u]]=await db.query('SELECT id,session_version FROM users WHERE username=?',[username]);return jwt.sign({userId:u.id,sessionVersion:u.session_version},secret,{expiresIn:'5m',issuer:'madrasah-diniyah-api',audience:'madrasah-diniyah'});}
async function call(token,method,path,body){const r=await fetch(api+'/api'+path,{method,headers:{Origin:origin,Cookie:'madin_session='+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const text=await r.text();let data;try{data=JSON.parse(text)}catch{data=text}return{status:r.status,data};}
async function expect(code,...args){const r=await call(...args);assert.equal(r.status,code,JSON.stringify(r));return r.data;}
try{
 const admin=await actor('test-admin'),superAdmin=await actor('test-super');
 await db.execute("INSERT INTO system_settings(setting_key,setting_value,scope) VALUES('system.regression',JSON_OBJECT('locked',true),'TECHNICAL')");
 await expect(403,admin,'PUT','/support/settings/operational',{key:'system.regression',value:{locked:false}});
 const[[setting]]=await db.query("SELECT scope,setting_value FROM system_settings WHERE setting_key='system.regression'");assert.equal(setting.scope,'TECHNICAL');assert.deepEqual(setting.setting_value,{locked:true});
 await expect(403,admin,'PUT','/support/settings/operational',{key:'auth.new-key',value:false});
 await expect(204,admin,'PUT','/support/settings/operational',{key:'school.regression',value:'TEST ONLY'});
 const[[audit]]=await db.query("SELECT COUNT(*) n FROM audit_logs WHERE action='SETTINGS.OPERATIONAL_UPDATED' AND entity_id='school.regression'");assert.equal(audit.n,1);
 await expect(400,superAdmin,'POST','/users',{username:'overlong-password',role:'ADMIN',password:'あ'.repeat(30)});
 const[[student]]=await db.query("SELECT s.id,se.academic_year_id,se.class_id FROM students s JOIN student_enrollments se ON se.student_id=s.id WHERE s.nis='T-NIS-1'");
 const[[subject]]=await db.query("SELECT id FROM subjects WHERE code='T-SUB'");
 await db.execute("INSERT INTO import_batches(source_type,source_name,status) VALUES('GRADES','REGRESSION TEST ONLY','STAGED')");
 const[[batch]]=await db.query("SELECT id FROM import_batches WHERE source_name='REGRESSION TEST ONLY'");
 await db.execute("INSERT INTO import_grade_rows(batch_id,source_row_number,source_name,source_subject,semester,score,match_status) VALUES(?,1,'TEST','TEST','GANJIL',12,'UNMATCHED')",[batch.id]);
 const[[row]]=await db.query('SELECT id FROM import_grade_rows WHERE batch_id=?',[batch.id]);
 await db.execute("INSERT INTO grades(student_id,subject_id,class_id,academic_year_id,semester,score,import_row_id) VALUES(?,?,?,?,'GANJIL',12,?) ON DUPLICATE KEY UPDATE import_row_id=VALUES(import_row_id)",[student.id,subject.id,student.class_id,student.academic_year_id,row.id]);
 await expect(204,admin,'PUT','/grades',{studentId:student.id,subjectId:subject.id,academicYearId:student.academic_year_id,semester:'GANJIL',score:0});
 const[[grade]]=await db.query("SELECT score,import_row_id FROM grades WHERE student_id=? AND subject_id=? AND semester='GANJIL'",[student.id,subject.id]);assert.equal(Number(grade.score),0);assert.equal(grade.import_row_id,null);
 await expect(409,admin,'POST','/classes/enrollments',{studentId:student.id,academicYearId:student.academic_year_id,classId:student.class_id,status:'ACTIVE'});
 const key={studentId:student.id,academicYearId:student.academic_year_id,semester:'GANJIL'};
 const draft=await expect(201,admin,'POST','/reports/draft',key);

 const[teachers]=await db.query("SELECT id FROM teachers WHERE code='T-G1'");
 await expect(201,admin,'POST','/classes/homeroom-assignments',{teacherId:teachers[0].id,classId:student.class_id,academicYearId:student.academic_year_id,assignmentType:'WALI_KELAS'});
 await expect(204,admin,'PUT',`/academic-years/${student.academic_year_id}/term`,{semester:'GANJIL',startsOn:'2026-07-01',endsOn:'2026-12-31'});
 await expect(409,admin,'PUT',`/academic-years/${student.academic_year_id}/term`,{semester:'GENAP',startsOn:'2026-12-01',endsOn:'2027-06-30'});
 const assessment={...key,mqKelancaran:null,mqMakhroj:null,mqTajwid:null,pengajianSore:0,kerajinan:'TEST',kerapian:'TEST',kelakuan:'TEST',catatan:null,keputusan:null};
 await expect(204,admin,'PUT','/reports/assessment',assessment);
 await expect(204,admin,'PUT','/attendance',{studentId:student.id,attendanceDate:'2026-09-10',status:'H'});
 const pdf=await PDFDocument.create();pdf.addPage([200,80]);const bytes=await pdf.save();const form=new FormData();form.set('signerRole','KEPALA_MADRASAH');form.set('signerName','TEST ONLY');form.set('signerTitle','TEST ONLY');form.set('file',new Blob([bytes],{type:'application/pdf'}),'test-only.pdf');
 const uploaded=await fetch(api+'/api/reports/signatures',{method:'POST',headers:{Origin:origin,Cookie:'madin_session='+admin},body:form});assert.equal(uploaded.status,201,await uploaded.text());
 const results=await Promise.all([call(admin,'POST','/reports/draft',key),call(admin,'POST',`/reports/${draft.id}/publish`)]);
 assert.equal(results[1].status,204,JSON.stringify(results));assert.ok([200,409].includes(results[0].status),JSON.stringify(results));
 const[[report]]=await db.query('SELECT status,snapshot_json FROM reports WHERE id=?',[draft.id]);assert.equal(report.status,'PUBLISHED');assert.equal(Number(report.snapshot_json.grades[0].score),0);
 await expect(409,admin,'POST','/reports/draft',key);
 await expect(409,admin,'PUT','/reports/assessment',assessment);
 const lockedSignature=await fetch(api+`/api/reports/${draft.id}/signature/kepala`,{headers:{Cookie:'madin_session='+admin}});assert.equal(lockedSignature.status,200);
 const t=await expect(201,admin,'POST','/operations/teachers',{code:'REG-NEW',name:'REGRESSION TEST ONLY',nip_or_identifier:null,status:'ACTIVE'});
 await expect(200,admin,'PUT','/operations/teachers/'+t.id,{code:'REG-NEW',name:'REGRESSION TEST EDITED',nip_or_identifier:null,status:'INACTIVE'});
 const yy=await expect(201,admin,'POST','/operations/years',{name:'2090/2091 TEST',starts_on:'2090-07-01',ends_on:'2091-06-30',is_active:false});assert.ok(yy.id);
 await expect(409,admin,'POST','/operations/years',{name:'OVERLAP TEST',starts_on:'2090-08-01',ends_on:'2091-07-01',is_active:false});
 const[assignments]=await db.query('SELECT id FROM teaching_assignments WHERE class_id=? AND academic_year_id=?',[student.class_id,student.academic_year_id]);
 const schedule={teachingAssignmentId:assignments[0].id,dayOfWeek:'SENIN',startsAt:'12:00',endsAt:'13:00'};
 const schedules=await Promise.all([call(admin,'POST','/schedules',schedule),call(admin,'POST','/schedules',schedule)]);assert.deepEqual(schedules.map(r=>r.status).sort(),[201,409]);
 const muhafadlohTarget=n=>({academicYearId:student.academic_year_id,classId:student.class_id,executionNo:n,kitab:null,batasan:null,executionDate:null,status:'OPEN'});
 const openExecutions=await Promise.all([call(admin,'PUT','/muhafadloh/targets',muhafadlohTarget(7)),call(admin,'PUT','/muhafadloh/targets',muhafadlohTarget(8))]);
 assert.deepEqual(openExecutions.map(r=>r.status).sort(),[204,409],JSON.stringify(openExecutions));
 assert.ok(['ANOTHER_MUHAFADLOH_EXECUTION_OPEN','CONCURRENT_CHANGE_RETRY'].includes(openExecutions.find(r=>r.status===409)?.data.error),JSON.stringify(openExecutions));
 const[[openCount]]=await db.query("SELECT COUNT(*) n FROM muhafadloh_execution_targets WHERE academic_year_id=? AND class_id=? AND status='OPEN'",[student.academic_year_id,student.class_id]);assert.equal(openCount.n,1);
 const checksum='regression-replay-checksum';
 await db.execute("INSERT INTO import_batches(source_type,source_name,source_checksum,status) VALUES('GRADES','REPLAY A',?,'STAGED'),('GRADES','REPLAY B',?,'STAGED')",[checksum,checksum]);
 const[replayBatches]=await db.query("SELECT id FROM import_batches WHERE source_name IN('REPLAY A','REPLAY B') ORDER BY id");
 for(const b of replayBatches)await db.execute("INSERT INTO import_grade_rows(batch_id,source_row_number,source_nis,source_name,source_class,source_subject,semester,score,matched_student_id,matched_subject_id,match_status) VALUES(?,1,?,'TEST',?,'TEST','GANJIL',10,?,?,'APPROVED')",[b.id,'T-NIS-1',String(student.class_id),student.id,subject.id]);
 await expect(204,admin,'POST',`/imports/grades/${replayBatches[0].id}/approve`,{academicYearId:student.academic_year_id});
 const replay=await expect(409,admin,'POST',`/imports/grades/${replayBatches[1].id}/approve`,{academicYearId:student.academic_year_id});assert.equal(replay.error,'IMPORT_CHECKSUM_ALREADY_APPROVED');
 // Rollback is verified with an actual database audit failure.
 await db.query("CREATE TRIGGER regression_audit_failure BEFORE INSERT ON audit_logs FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='REGRESSION TEST AUDIT FAILURE'");
 try{await expect(500,admin,'POST','/operations/teachers',{code:'AUDIT-ROLLBACK',name:'TEST ROLLBACK',nip_or_identifier:null,status:'ACTIVE'});const[[n]]=await db.query("SELECT COUNT(*) n FROM teachers WHERE code='AUDIT-ROLLBACK'");assert.equal(n.n,0)}finally{await db.query('DROP TRIGGER regression_audit_failure')}
 const[[y]]=await db.query('SELECT starts_on FROM academic_years WHERE id=?',[student.academic_year_id]);assert.equal(y.starts_on,'2026-07-01');
 const years=await expect(200,admin,'GET','/academic-years');assert.ok(years.academicYears.some(y=>y.starts_on==='2026-07-01'));
 // A copied cookie must stop working after logout.
 await expect(204,admin,'POST','/auth/logout');await expect(401,admin,'GET','/auth/me');
 console.log('Production security, provenance, date, report immutability and logout regressions passed.');
}finally{await db.end()}
