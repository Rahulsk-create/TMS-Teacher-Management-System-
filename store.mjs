import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {scrypt,randomBytes,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const derive=promisify(scrypt);
export const roles=['administrator','coordinator','teacher','mentor'];
export function fail(message,status=400){throw Object.assign(new Error(message),{status});}
export function userId(v){if(typeof v!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9._-]{2,39}$/.test(v))fail('User ID must contain 3–40 letters, numbers, dots, underscores or hyphens.');return v.toLowerCase();}
export function password(v){if(typeof v!=='string'||v.length<12||v.length>128)fail('Use a password between 12 and 128 characters.');return v;}
export async function hashPassword(value){password(value);const salt=randomBytes(24).toString('hex');const hash=await derive(value,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024});return salt+':'+hash.toString('hex');}
export async function checkPassword(value,stored){if(typeof value!=='string'||value.length>128)return false;const [salt,hex]=stored.split(':');const hash=await derive(value,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024});return timingSafeEqual(hash,Buffer.from(hex,'hex'));}
export const token=()=>randomBytes(32).toString('hex');
export const digest=v=>createHash('sha256').update(v).digest('hex');
export function publicUser(u){return {id:u.id,username:u.username,name:u.name,role:u.role,faculty:u.faculty,disabled:!!u.disabled,mustChange:!!u.must_change};}
export function openStore(dir=process.env.DATA_DIR||'./data'){
 mkdirSync(dir,{recursive:true,mode:0o700});const db=new DatabaseSync(resolve(dir,'tms.sqlite'));
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,username TEXT UNIQUE NOT NULL,name TEXT NOT NULL,role TEXT NOT NULL,faculty TEXT NOT NULL DEFAULT '',password TEXT NOT NULL,disabled INTEGER NOT NULL DEFAULT 0,must_change INTEGER NOT NULL DEFAULT 1);
 CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,csrf TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS state(id INTEGER PRIMARY KEY CHECK(id=1),revision INTEGER NOT NULL,payload TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,at TEXT NOT NULL,actor TEXT NOT NULL,action TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY,count INTEGER NOT NULL,until INTEGER NOT NULL);`);
 const initial={centers:[],verticals:[],schedules:[],requests:[],faculty:[],programs:[],batches:[],classrooms:[],students:[],studentAttendance:{},applications:[],assessments:[],invoices:[],payments:[],messages:[],exams:[],studentNotes:[],auditLog:[],smsAudit:[],subjects:[],teacherProfiles:[],teacherQueries:[]};
 db.prepare('INSERT OR IGNORE INTO state VALUES(1,0,?)').run(JSON.stringify(initial));return db;
}
export function log(db,actor,action){db.prepare('INSERT INTO audit(at,actor,action) VALUES(?,?,?)').run(new Date().toISOString(),actor,action);}
export function readState(db){const r=db.prepare('SELECT * FROM state WHERE id=1').get();const state=JSON.parse(r.payload);for(const key of ['subjects','teacherProfiles','teacherQueries'])state[key]??=[];return {revision:r.revision,state};}
export function writeState(db,state,revision){const r=db.prepare('UPDATE state SET payload=?,revision=revision+1 WHERE id=1 AND revision=?').run(JSON.stringify(state),revision);if(!r.changes)fail('Records changed in another session. Reload and try again.',409);}
