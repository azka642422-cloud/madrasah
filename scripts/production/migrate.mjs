import 'dotenv/config';
import mysql from 'mysql2/promise';
import {readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const required=['DB_HOST','DB_NAME','DB_USER','DB_PASSWORD'];for(const key of required)if(process.env[key]===undefined)throw Error('Missing '+key);
const conn=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT??3306),database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASSWORD,multipleStatements:true});
try{
 const[[lock]]=await conn.query("SELECT GET_LOCK('madrasah_schema_migrations',30) acquired");if(lock.acquired!==1)throw Error('Another migration process holds the lock');
 await conn.query('CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(255) PRIMARY KEY,sha256 CHAR(64) NOT NULL,applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB');
 const[applied]=await conn.query('SELECT name,sha256 FROM schema_migrations');const known=new Map(applied.map(r=>[r.name,r.sha256]));
 const files=(await readdir(new URL('../../database/migrations/',import.meta.url))).filter(n=>/^\d+_.*\.sql$/.test(n)).sort();
 for(const name of files){const sql=await readFile(new URL('../../database/migrations/'+name,import.meta.url),'utf8'),sha=createHash('sha256').update(sql).digest('hex');
  if(known.has(name)){if(known.get(name)!==sha)throw Error('Applied migration changed: '+name);continue}
  console.log('Applying '+name);await conn.query(sql);await conn.execute('INSERT INTO schema_migrations(name,sha256) VALUES(?,?)',[name,sha]);
 }
 console.log('Schema is up to date; '+files.length+' checked migrations.');
}finally{await conn.query("SELECT RELEASE_LOCK('madrasah_schema_migrations')").catch(()=>{});await conn.end()}
