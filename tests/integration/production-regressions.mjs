import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
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
 // Model an already published artifact; refresh must preserve its exact snapshot.
 await db.execute("UPDATE reports SET status='PUBLISHED',snapshot_json=JSON_OBJECT('regression','immutable') WHERE id=?",[draft.id]);
 await expect(409,admin,'POST','/reports/draft',key);
 const[[report]]=await db.query('SELECT status,snapshot_json FROM reports WHERE id=?',[draft.id]);assert.equal(report.status,'PUBLISHED');assert.deepEqual(report.snapshot_json,{regression:'immutable'});
 await expect(409,admin,'PUT','/reports/assessment',{...key,mqKelancaran:null,mqMakhroj:null,mqTajwid:null,pengajianSore:0,kerajinan:'TEST',kerapian:'TEST',kelakuan:'TEST',catatan:null,keputusan:null});
 const[[y]]=await db.query('SELECT starts_on FROM academic_years WHERE id=?',[student.academic_year_id]);assert.equal(y.starts_on,'2026-07-01');
 const years=await expect(200,admin,'GET','/academic-years');assert.ok(years.academicYears.some(y=>y.starts_on==='2026-07-01'));
 // A copied cookie must stop working after logout.
 await expect(204,admin,'POST','/auth/logout');await expect(401,admin,'GET','/auth/me');
 console.log('Production security, provenance, date, report immutability and logout regressions passed.');
}finally{await db.end()}
