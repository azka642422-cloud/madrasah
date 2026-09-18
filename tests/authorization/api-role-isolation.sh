#!/usr/bin/env bash
set -euo pipefail
[[ "${DB_NAME:-}" == *_ci ]] || { echo "Requires an isolated *_ci database" >&2; exit 1; }

API="${API_URL:-http://127.0.0.1:3000}"
DB="${DB_NAME:-madrasah_ci}"
ORIGIN="${FRONTEND_ORIGIN:-http://127.0.0.1:5173}"
PASS='TestPassword123!'
HASH=$(cd backend && node --input-type=module -e "import bcrypt from 'bcrypt'; console.log(await bcrypt.hash(process.argv[1],10))" "$PASS")

mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" "$DB" <<SQL
INSERT INTO academic_years(name,starts_on,ends_on,is_active) VALUES('2026/2027','2026-07-01','2027-06-30',1);
INSERT INTO classes(code,level,name) VALUES('T1',1,'Test Class 1'),('T2',2,'Test Class 2');
INSERT INTO subjects(code,name) VALUES('T-SUB','Test Subject');
INSERT INTO teachers(code,name,status) VALUES('T-G1','Guru Scope 1','ACTIVE'),('T-G2','Guru Scope 2','ACTIVE');
INSERT INTO students(nis,name,status) VALUES('T-NIS-1','Santri One','ACTIVE'),('T-NIS-2','Santri Two','ACTIVE');
INSERT INTO student_enrollments(student_id,academic_year_id,class_id,status)
SELECT s.id,ay.id,c.id,'ACTIVE' FROM students s JOIN academic_years ay ON ay.name='2026/2027' JOIN classes c ON c.code=IF(s.nis='T-NIS-1','T1','T2') WHERE s.nis IN('T-NIS-1','T-NIS-2');
INSERT INTO teaching_assignments(teacher_id,class_id,subject_id,academic_year_id,semester,active)
SELECT t.id,c.id,su.id,ay.id,'GANJIL',1 FROM teachers t JOIN classes c ON c.code=IF(t.code='T-G1','T1','T2') JOIN subjects su ON su.code='T-SUB' JOIN academic_years ay ON ay.name='2026/2027' WHERE t.code IN('T-G1','T-G2');
INSERT INTO users(username,password_hash,role_id,status,must_change_password)
SELECT x.username,'$HASH',r.id,'ACTIVE',0 FROM (
 SELECT 'test-super' username,'SUPER_ADMIN' role_code UNION ALL SELECT 'test-admin','ADMIN' UNION ALL SELECT 'test-guru','GURU' UNION ALL SELECT 'test-santri','SANTRI'
) x JOIN roles r ON r.code=x.role_code;
INSERT INTO teacher_user_links(user_id,teacher_id) SELECT u.id,t.id FROM users u JOIN teachers t ON t.code='T-G1' WHERE u.username='test-guru';
INSERT INTO student_user_links(user_id,student_id) SELECT u.id,s.id FROM users u JOIN students s ON s.nis='T-NIS-1' WHERE u.username='test-santri';
SQL

jar(){ echo "/tmp/madin-$1.cookies"; }
login(){
  local user="$1" code
  code=$(curl -sS -o /tmp/login.json -w '%{http_code}' -c "$(jar "$user")" -H "Origin: $ORIGIN" -H 'Content-Type: application/json' -d "{\"username\":\"$user\",\"password\":\"$PASS\"}" "$API/api/auth/login")
  test "$code" = 200 || { cat /tmp/login.json; echo "login $user expected 200 got $code" >&2; exit 1; }
}
expect(){
  local expected="$1" user="$2" method="$3" path="$4" body="${5:-}" cookie_jar
  cookie_jar="$(jar "$user")"
  local args=(-sS -o /tmp/response.json -w '%{http_code}' -b "$cookie_jar" -c "$cookie_jar" -X "$method" -H "Origin: $ORIGIN")
  if [ -n "$body" ]; then args+=(-H 'Content-Type: application/json' -d "$body"); fi
  local code
  code=$(curl "${args[@]}" "$API$path")
  if [ "$code" != "$expected" ]; then cat /tmp/response.json; echo "$user $method $path expected $expected got $code" >&2; exit 1; fi
}

for u in test-super test-admin test-guru test-santri; do login "$u"; done

for prefix in students attendance grades muhafadloh; do
  expect 404 test-super GET "/api/imports/$prefix/999999/review"
  expect 404 test-admin GET "/api/imports/$prefix/999999/review"
  expect 403 test-guru GET "/api/imports/$prefix/999999/review"
  expect 403 test-santri GET "/api/imports/$prefix/999999/review"
done

YEAR_ID=$(mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -N -B "$DB" -e "SELECT id FROM academic_years WHERE name='2026/2027'")
CLASS1=$(mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -N -B "$DB" -e "SELECT id FROM classes WHERE code='T1'")
CLASS2=$(mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -N -B "$DB" -e "SELECT id FROM classes WHERE code='T2'")
SUBJECT=$(mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -N -B "$DB" -e "SELECT id FROM subjects WHERE code='T-SUB'")
STUDENT1=$(mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -N -B "$DB" -e "SELECT id FROM students WHERE nis='T-NIS-1'")
STUDENT2=$(mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -N -B "$DB" -e "SELECT id FROM students WHERE nis='T-NIS-2'")

expect 200 test-guru GET "/api/attendance/class/$CLASS1?from=2026-09-01&to=2026-09-30"
expect 403 test-guru GET "/api/attendance/class/$CLASS2?from=2026-09-01&to=2026-09-30"
expect 200 test-guru GET "/api/grades/class/$CLASS1/subject/$SUBJECT?academicYearId=$YEAR_ID&semester=GANJIL"
expect 403 test-guru GET "/api/grades/class/$CLASS2/subject/$SUBJECT?academicYearId=$YEAR_ID&semester=GANJIL"
expect 403 test-guru PUT '/api/attendance' "{\"studentId\":$STUDENT2,\"attendanceDate\":\"2026-09-10\",\"status\":\"H\"}"
expect 403 test-guru PUT '/api/grades' "{\"studentId\":$STUDENT2,\"subjectId\":$SUBJECT,\"academicYearId\":$YEAR_ID,\"semester\":\"GANJIL\",\"score\":90}"
expect 200 test-guru GET "/api/muhafadloh/class/$CLASS1?academicYearId=$YEAR_ID"
expect 403 test-guru GET "/api/muhafadloh/class/$CLASS2?academicYearId=$YEAR_ID"
expect 403 test-guru PUT '/api/muhafadloh' "{\"studentId\":$STUDENT2,\"academicYearId\":$YEAR_ID,\"execution\":\"m1\",\"value\":8}"
expect 200 test-santri GET "/api/muhafadloh/student/me?academicYearId=$YEAR_ID"
expect 403 test-santri GET "/api/muhafadloh/class/$CLASS1?academicYearId=$YEAR_ID"
expect 403 test-guru POST '/api/reports/draft' "{\"studentId\":$STUDENT2,\"academicYearId\":$YEAR_ID,\"semester\":\"GANJIL\"}"
expect 200 test-santri GET '/api/reports/student/me'
expect 403 test-santri POST '/api/reports/draft' "{\"studentId\":$STUDENT1,\"academicYearId\":$YEAR_ID,\"semester\":\"GANJIL\"}"
expect 403 test-guru POST '/api/certificates/draft' "{\"studentId\":$STUDENT1,\"academicYearId\":$YEAR_ID,\"graduationStatus\":\"PENDING\"}"
expect 403 test-santri POST '/api/certificates/draft' "{\"studentId\":$STUDENT1,\"academicYearId\":$YEAR_ID,\"graduationStatus\":\"PENDING\"}"
expect 200 test-santri GET '/api/certificates/student/me'
expect 404 test-guru GET "/api/storage/students/$STUDENT1/photo"
expect 403 test-guru GET "/api/storage/students/$STUDENT2/photo"
expect 404 test-santri GET "/api/storage/students/$STUDENT1/photo"
expect 403 test-santri GET "/api/storage/students/$STUDENT2/photo"
expect 200 test-admin GET '/api/users'
if grep -q 'test-super' /tmp/response.json; then echo 'ADMIN_USER_LIST_LEAKS_SUPER_ADMIN' >&2; exit 1; fi
expect 200 test-super GET '/api/users'
grep -q 'test-super' /tmp/response.json || { echo 'SUPER_ADMIN_USER_LIST_MISSING_SUPER_ADMIN' >&2; exit 1; }
expect 403 test-guru GET '/api/users'
expect 403 test-santri GET '/api/users'
expect 403 test-admin POST '/api/users' "{\"username\":\"forbidden-super\",\"password\":\"AnotherPassword123!\",\"role\":\"SUPER_ADMIN\"}"
expect 403 test-guru POST '/api/users' "{\"username\":\"forbidden-admin\",\"password\":\"AnotherPassword123!\",\"role\":\"ADMIN\"}"
expect 200 test-santri GET '/api/attendance/student/me?from=2026-09-01&to=2026-09-30'
expect 200 test-santri GET "/api/grades/student/me?academicYearId=$YEAR_ID&semester=GANJIL"
expect 403 test-santri GET "/api/attendance/class/$CLASS1?from=2026-09-01&to=2026-09-30"
expect 403 test-santri GET "/api/grades/class/$CLASS1/subject/$SUBJECT?academicYearId=$YEAR_ID&semester=GANJIL"

expect 200 test-super GET '/api/audit?limit=10'
expect 403 test-admin GET '/api/audit?limit=10'
expect 403 test-guru GET '/api/audit?limit=10'
expect 403 test-santri GET '/api/audit?limit=10'

sleep 1
AUDIT_LOGIN=$(mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -N -B "$DB" -e "SELECT COUNT(*) FROM audit_logs WHERE action='AUTH.LOGIN' AND user_id=(SELECT id FROM users WHERE username='test-admin')")
test "$AUDIT_LOGIN" -ge 1 || { echo 'LOGIN_AUDIT_MISSING' >&2; exit 1; }
CREDENTIAL_LEAK=$(mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -N -B "$DB" -e "SELECT COUNT(*) FROM audit_logs WHERE CAST(metadata AS CHAR) LIKE '%TestPassword123%' OR CAST(metadata AS CHAR) LIKE '%password%'")
test "$CREDENTIAL_LEAK" = 0 || { echo 'AUDIT_CONTAINS_CREDENTIAL_DATA' >&2; exit 1; }

ADMIN_ID=$(mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -N -B "$DB" -e "SELECT id FROM users WHERE username='test-admin'")
expect 204 test-super PATCH "/api/users/$ADMIN_ID" '{"resetPassword":"ResetPassword123!"}'
expect 401 test-admin GET '/api/auth/me'

login_reset(){
  local code
  code=$(curl -sS -o /tmp/login-reset.json -w '%{http_code}' -c "$(jar test-admin-reset)" -H "Origin: $ORIGIN" -H 'Content-Type: application/json' -d '{"username":"test-admin","password":"ResetPassword123!"}' "$API/api/auth/login")
  test "$code" = 200 || { cat /tmp/login-reset.json; echo "reset login expected 200 got $code" >&2; exit 1; }
}
login_reset
expect 200 test-admin-reset GET '/api/auth/me'
expect 403 test-admin-reset GET '/api/users'
expect 204 test-admin-reset POST '/api/auth/change-password' '{"currentPassword":"ResetPassword123!","newPassword":"FinalPassword123!"}'
expect 401 test-admin-reset GET '/api/auth/me'

GURU_ID=$(mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -N -B "$DB" -e "SELECT id FROM users WHERE username='test-guru'")
expect 204 test-super PATCH "/api/users/$GURU_ID" '{"status":"LOCKED"}'
expect 401 test-guru GET '/api/auth/me'
LOCKED_LOGIN=$(curl -sS -o /tmp/locked.json -w '%{http_code}' -H "Origin: $ORIGIN" -H 'Content-Type: application/json' -d "{\"username\":\"test-guru\",\"password\":\"$PASS\"}" "$API/api/auth/login")
test "$LOCKED_LOGIN" = 401 || { cat /tmp/locked.json; echo "locked login expected 401 got $LOCKED_LOGIN" >&2; exit 1; }

expect 204 test-santri POST '/api/auth/logout'
expect 401 test-santri GET '/api/auth/me'

sleep 1
for action in AUTH.LOGIN AUTH.PASSWORD_CHANGED AUTH.LOGOUT; do
  N=$(mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -N -B "$DB" -e "SELECT COUNT(*) FROM audit_logs WHERE action='$action'")
  test "$N" -ge 1 || { echo "AUDIT_EVENT_MISSING: $action" >&2; exit 1; }
done

echo 'Extended API role, session lifecycle, and audit isolation checks passed.'
