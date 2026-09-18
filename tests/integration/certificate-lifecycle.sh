#!/usr/bin/env bash
set -euo pipefail
[[ "${DB_NAME:-}" == *_ci ]] || { echo "Requires an isolated *_ci database" >&2; exit 1; }
API="${API_URL:-http://127.0.0.1:3000}"; DB="${DB_NAME:-madrasah_ci}"; ORIGIN="${FRONTEND_ORIGIN:-http://127.0.0.1:5173}"; PASS='CertificateTest123!'
MYSQL=(mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -N -B "$DB")
HASH=$(cd backend && node --input-type=module -e "import bcrypt from 'bcrypt'; console.log(await bcrypt.hash(process.argv[1],10))" "$PASS")
"${MYSQL[@]}" <<SQL
INSERT INTO academic_years(name,starts_on,ends_on,is_active) VALUES('2027/2028','2027-07-01','2028-06-30',0);
INSERT INTO classes(code,level,name) VALUES('CERT-6',6,'Certificate Test Class');
INSERT INTO students(nis,name,birth_place,birth_date,status) VALUES('CERT-NIS-1','Certificate Test Student','Jombang','2012-01-02','ACTIVE');
INSERT INTO student_enrollments(student_id,academic_year_id,class_id,status) SELECT s.id,ay.id,c.id,'ACTIVE' FROM students s JOIN academic_years ay ON ay.name='2027/2028' JOIN classes c ON c.code='CERT-6' WHERE s.nis='CERT-NIS-1';
INSERT INTO users(username,password_hash,role_id,status,must_change_password) SELECT 'cert-admin','$HASH',id,'ACTIVE',0 FROM roles WHERE code='ADMIN';
INSERT INTO users(username,password_hash,role_id,status,must_change_password) SELECT 'cert-santri','$HASH',id,'ACTIVE',0 FROM roles WHERE code='SANTRI';
INSERT INTO student_user_links(user_id,student_id) SELECT u.id,s.id FROM users u JOIN students s ON s.nis='CERT-NIS-1' WHERE u.username='cert-santri';
SQL
YEAR_ID=$("${MYSQL[@]}" -e "SELECT id FROM academic_years WHERE name='2027/2028'"); STUDENT_ID=$("${MYSQL[@]}" -e "SELECT id FROM students WHERE nis='CERT-NIS-1'")
login(){ local u="$1"; local code; code=$(curl -sS -o /tmp/cert-login.json -w '%{http_code}' -c "/tmp/$u.cookies" -H "Origin: $ORIGIN" -H 'Content-Type: application/json' -d "{\"username\":\"$u\",\"password\":\"$PASS\"}" "$API/api/auth/login"); test "$code" = 200 || { cat /tmp/cert-login.json; exit 1; }; }
call(){ local expected="$1" u="$2" method="$3" path="$4" body="${5:-}"; local args=(-sS -o /tmp/cert-response.json -w '%{http_code}' -b "/tmp/$u.cookies" -H "Origin: $ORIGIN" -X "$method"); [ -z "$body" ] || args+=(-H 'Content-Type: application/json' -d "$body"); local code; code=$(curl "${args[@]}" "$API$path"); [ "$code" = "$expected" ] || { cat /tmp/cert-response.json; echo "$method $path expected $expected got $code" >&2; exit 1; }; }
login cert-admin; login cert-santri
for subject in TASAWWUF FIQIH TAUHID ASWAJA BACA_KITAB BACA_AL_QURAN MUHAFADLOH; do call 204 cert-admin PUT /api/certificates/final-exam "{\"studentId\":$STUDENT_ID,\"academicYearId\":$YEAR_ID,\"subjectCode\":\"$subject\",\"score\":80}"; done
BODY="{\"studentId\":$STUDENT_ID,\"academicYearId\":$YEAR_ID,\"graduationStatus\":\"PASSED\",\"certificateNumber\":\"CERT/TEST/001\",\"issuePlace\":\"Jombang\",\"issueDate\":\"2028-05-30\",\"hijriIssueDate\":\"5 Dzulhijjah 1449 H\",\"hijriAcademicYear\":\"1449 H\",\"finalExamStartDate\":\"2028-04-14\",\"finalExamEndDate\":\"2028-04-18\",\"hijriFinalExamPeriod\":\"19 s.d. 23 Syawal 1449 H\",\"caretakerName\":\"Test Caretaker\",\"caretakerTitle\":\"Pengasuh Test\"}"
call 201 cert-admin POST /api/certificates/draft "$BODY"
CERT_ID=$("${MYSQL[@]}" -e "SELECT id FROM certificates WHERE student_id=$STUDENT_ID AND academic_year_id=$YEAR_ID")
[ -n "$CERT_ID" ] || { echo CERTIFICATE_DRAFT_NOT_PERSISTED >&2; exit 1; }
DB_META=$("${MYSQL[@]}" -e "SELECT CONCAT_WS('|',hijri_academic_year,hijri_final_exam_period,status) FROM certificates WHERE id=$CERT_ID")
[ "$DB_META" = '1449 H|19 s.d. 23 Syawal 1449 H|DRAFT' ] || { echo "CERTIFICATE_METADATA_NOT_PERSISTED: $DB_META" >&2; exit 1; }
call 204 cert-admin POST "/api/certificates/$CERT_ID/issue"
SNAP=$("${MYSQL[@]}" -e "SELECT JSON_UNQUOTE(JSON_EXTRACT(snapshot_json,'$.version')) FROM certificates WHERE id=$CERT_ID")
[ "$SNAP" = 4 ] || { echo "CERTIFICATE_SNAPSHOT_VERSION_INVALID: $SNAP" >&2; exit 1; }
LOCKED=$("${MYSQL[@]}" -e "SELECT CONCAT_WS('|',status,JSON_UNQUOTE(JSON_EXTRACT(snapshot_json,'$.hijriAcademicYear')),JSON_UNQUOTE(JSON_EXTRACT(snapshot_json,'$.hijriFinalExamPeriod'))) FROM certificates WHERE id=$CERT_ID")
[ "$LOCKED" = 'ISSUED|1449 H|19 s.d. 23 Syawal 1449 H' ] || { echo "CERTIFICATE_ISSUE_SNAPSHOT_INVALID: $LOCKED" >&2; exit 1; }
call 409 cert-admin POST /api/certificates/draft "$BODY"
call 409 cert-admin PUT /api/certificates/final-exam "{\"studentId\":$STUDENT_ID,\"academicYearId\":$YEAR_ID,\"subjectCode\":\"TASAWWUF\",\"score\":99}"
call 200 cert-santri GET /api/certificates/student/me
grep -q 'CERT/TEST/001' /tmp/cert-response.json || { echo SANTRI_ISSUED_CERTIFICATE_MISSING >&2; exit 1; }
echo 'Certificate draft, seven scores, issue, snapshot lock, immutability, and Santri access checks passed.'
