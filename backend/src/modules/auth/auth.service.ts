import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../config/db.js';
import { env } from '../../config/env.js';
import type { AuthPrincipal, RoleCode } from '../../types/auth.js';

interface UserRow { id:number; username:string; password_hash:string; status:string; must_change_password:number; role_code:RoleCode; }
interface PermissionRow { code:string }
interface LinkRow { teacher_id:number|null; student_id:number|null }

export async function authenticate(username:string,password:string):Promise<AuthPrincipal|null>{
  const [rows] = await db.query<UserRow[] & any>('SELECT u.id,u.username,u.password_hash,u.status,u.must_change_password,r.code AS role_code FROM users u JOIN roles r ON r.id=u.role_id WHERE u.username=? LIMIT 1',[username]);
  const user=rows[0];
  if(!user || user.status!=='ACTIVE' || !(await bcrypt.compare(password,user.password_hash))) return null;
  const [permissionRows] = await db.query<PermissionRow[] & any>('SELECT p.code FROM permissions p JOIN role_permissions rp ON rp.permission_id=p.id JOIN users u ON u.role_id=rp.role_id WHERE u.id=?',[user.id]);
  const [linkRows] = await db.query<LinkRow[] & any>('SELECT tul.teacher_id,sul.student_id FROM users u LEFT JOIN teacher_user_links tul ON tul.user_id=u.id LEFT JOIN student_user_links sul ON sul.user_id=u.id WHERE u.id=? LIMIT 1',[user.id]);
  const link=linkRows[0];
  await db.execute('UPDATE users SET last_login_at=NOW() WHERE id=?',[user.id]);
  return {userId:user.id,username:user.username,role:user.role_code,permissions:permissionRows.map((p:any)=>p.code),teacherId:link?.teacher_id??undefined,studentId:link?.student_id??undefined,mustChangePassword:Boolean(user.must_change_password)};
}

export function signSession(principal:AuthPrincipal):string{
  return jwt.sign(principal,env.AUTH_JWT_SECRET,{expiresIn:`${env.AUTH_TOKEN_MINUTES}m` as any,issuer:'madrasah-diniyah-api',audience:'madrasah-diniyah'});
}

export function verifySession(token:string):AuthPrincipal{
  return jwt.verify(token,env.AUTH_JWT_SECRET,{issuer:'madrasah-diniyah-api',audience:'madrasah-diniyah'}) as AuthPrincipal;
}
