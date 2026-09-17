#!/usr/bin/env bash
set -euo pipefail

API="${API_URL:-http://127.0.0.1:3000}"
DB="${DB_NAME:-madrasah_ci}"
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
  local user="$1"
  local code
  code=$(curl -sS -o /tmp/login.json -w '%{http_code}' -c "$(jar "$user")" -H 'Content-Type: application/json' -d "{\"username\":\"$user\",\"password\":\"$PASS\"}" "$API/api/auth/login")
  test "$code" = 200 || { cat /tmp/login.json; echo "login $user expected 200 got $code" >&2; exit 1; }
}
expect(){
  local expected="$1" user="$2" method="$3" path="$4" body="${5:-}"
  local args=(-sS -o /tmp/response.json -w '%{http_code}' -b "$(jar "$user")" -X "$method")
  if [ -n "$body" ]; then args+=(-H 'Content-Type: application/json' -d "$body"); fi
  local code
  code=$(curl "${args[@]}" "$API$path")
  if [ "$code" != "$expected" ]; then cat /tmp/response.json; echo "$user $method $path expected $expected got $code" >&2; exit 1; fi
}

for u in test-super test-admin test-guru test-santri; do login "$u"; done

# Global imports: administrators may reach the resource layer (404 for nonexistent batch), Guru/Santri must be denied at authorization middleware.
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
STUDENT2=$(mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -N -B "$DB" -e "SELECT id FROM students WHERE nis='T-NIS-2'")

# Guru may read assigned class but not another class; direct ID manipulation must not bypass scope.
expect 200 test-guru GET "/api/attendance/class/$CLASS1?from=2026-09-01&to=2026-09-30"
expect 403 test-guru GET "/api/attendance/class/$CLASS2?from=2026-09-01&to=2026-09-30"
expect 200 test-guru GET "/api/grades/class/$CLASS1/subject/$SUBJECT?academicYearId=$YEAR_ID&semester=GANJIL"
expect 403 test-guru GET "/api/grades/class/$CLASS2/subject/$SUBJECT?academicYearId=$YEAR_ID&semester=GANJIL"
expect 403 test-guru PUT '/api/attendance' "{\"studentId\":$STUDENT2,\"attendanceDate\":\"2026-09-10\",\"status\":\"H\"}"
expect 403 test-guru PUT '/api/grades' "{\"studentId\":$STUDENT2,\"subjectId\":$SUBJECT,\"academicYearId\":$YEAR_ID,\"semester\":\"GANJIL\",\"score\":90}"

# Santri self endpoints resolve identity from the authenticated link, while class/admin endpoints remain forbidden.
expect 200 test-santri GET '/api/attendance/student/me?from=2026-09-01&to=2026-09-30'
expect 200 test-santri GET "/api/grades/student/me?academicYearId=$YEAR_ID&semester=GANJIL"
expect 403 test-santri GET "/api/attendance/class/$CLASS1?from=2026-09-01&to=2026-09-30"
expect 403 test-santri GET "/api/grades/class/$CLASS1/subject/$SUBJECT?academicYearId=$YEAR_ID&semester=GANJIL"

echo 'API role isolation checks passed.'
