import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../server.mjs';
import {hashPassword,readState,writeState} from '../store.mjs';
import {mergeState,visible} from '../policy.mjs';
test('server authentication, authorization and revocation',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'tms-auth-test-')),origin='http://127.0.0.1:3000';
 const {server,db}=await createApp({dir,origin});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const password='test-only-Strong-password-42',hash=await hashPassword(password);
 for(const [id,role,faculty]of [['admin','administrator',''],['coord','coordinator',''],['teacher','teacher','AD'],['mentor','mentor','']])db.prepare('INSERT INTO users(id,username,name,role,faculty,password,must_change) VALUES(?,?,?,?,?,?,0)').run(id,id,id,role,faculty,hash);
 const {state,revision}=readState(db);state.faculty=[{id:'AD',name:'Teacher A',centers:[],verticals:[]}];state.programs=[{id:'p1',name:'Program'}];state.batches=[{id:'b1',name:'Batch',programId:'p1'}];state.students=[{id:'s1',name:'Visible student',code:'S1',programId:'p1',batchId:'b1',medical:'PRIVATE MEDICAL',contact:'PRIVATE CONTACT'},{id:'s2',name:'Hidden student',code:'S2',programId:'p2',batchId:'b2'}];state.schedules=[{id:'class1',faculty:'AD',programId:'p1',batchId:'b1',date:new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}),status:'scheduled',mode:'online'},{id:'class2',faculty:'OTHER',programId:'p2',batchId:'b2',status:'scheduled'}];writeState(db,state,revision);
 async function request(path,{auth,method='GET',data,csrf=true,from=origin}={}){const res=await fetch(base+path,{method,headers:{...(auth?{Cookie:auth.cookie}:{}),...(method!=='GET'?{Origin:from,'Content-Type':'application/json',...(auth&&csrf?{'X-CSRF-Token':auth.csrf}:{})}:{} )},...(data!==undefined?{body:JSON.stringify(data)}:{})});return {status:res.status,body:await res.json(),cookie:res.headers.get('set-cookie')};}
 async function login(username){const r=await request('/api/login',{method:'POST',data:{username,password}});assert.equal(r.status,200);assert.match(r.cookie,/HttpOnly/);assert.match(r.cookie,/SameSite=Strict/);return {cookie:r.cookie.split(';')[0],csrf:r.body.csrf};}
 try{
  assert.equal((await request('/api/state')).status,401);
  assert.equal((await request('/api/login',{method:'POST',from:'https://evil.example',data:{username:'admin',password}})).status,403);
  assert.equal((await request('/api/login',{method:'POST',data:{username:'admin',password:'incorrect'}})).status,401);
  const admin=await login('admin'),teacher=await login('teacher'),coord=await login('coord'),mentor=await login('mentor');
  assert.equal((await request('/api/users',{auth:teacher})).status,403);assert.equal((await request('/api/users',{auth:coord})).status,403);
  const me=await request('/api/me',{auth:admin});assert.equal(me.body.user.password,undefined);assert.equal(me.body.user.hash,undefined);
  const students=await request('/api/state',{auth:teacher});assert.deepEqual(students.body.state.students.map(s=>s.id),['s1']);assert.equal(students.body.state.students[0].medical,undefined);assert.equal(students.body.state.students[0].contact,undefined);assert.equal(students.body.state.schedules.length,1);
  const mentorState=await request('/api/state',{auth:mentor});assert.equal(mentorState.body.state.students.length,0);
  assert.equal((await request('/api/users',{auth:admin,method:'POST',csrf:false,data:{}})).status,403);
  assert.equal((await request('/api/users',{auth:teacher,method:'POST',data:{username:'attack',name:'Attack',role:'administrator',password}})).status,403);
  const malicious=structuredClone(students.body);malicious.state.students[0].medical='tampered';assert.equal((await request('/api/state',{auth:teacher,method:'PUT',data:malicious})).status,403);
  assert.equal((await request('/api/teacher-attendance',{auth:teacher,method:'POST',data:{id:'class2',action:'entry'}})).status,403);
  assert.equal((await request('/api/teacher-attendance',{auth:teacher,method:'POST',data:{id:'class1',action:'entry',actualStart:'1999-01-01'}})).status,200);
  assert.match(readState(db).state.schedules[0].actualStart,/^20/);
  assert.equal((await request('/api/attendance-review',{auth:teacher,method:'POST',data:{id:'class1',stage:'entry',decision:'approved',note:''}})).status,403);
  assert.equal((await request('/api/attendance-review',{auth:mentor,method:'POST',data:{id:'class1',stage:'entry',decision:'approved',note:''}})).status,200);
  assert.equal((await request('/api/users',{auth:admin,method:'POST',data:{username:'newuser',name:'New User',role:'mentor',password}})).status,201);
  const newAuth=await login('newuser');assert.equal((await request('/api/state',{auth:newAuth})).status,403);
  const changed=await request('/api/password',{auth:newAuth,method:'POST',data:{current:password,password:'Changed-example-password-43'}});assert.equal(changed.status,200);assert.equal((await request('/api/me',{auth:newAuth})).status,401);
  assert.equal((await request('/api/users/teacher',{auth:admin,method:'POST',data:{action:'disable'}})).status,200);assert.equal((await request('/api/state',{auth:teacher})).status,401);
  assert.equal((await request('/api/users/mentor',{auth:admin,method:'POST',data:{action:'reset',password:'Reset-example-password-44'}})).status,200);assert.equal((await request('/api/state',{auth:mentor})).status,401);
  assert.equal((await request('/api/state',{auth:admin,method:'PUT',data:{revision:-1,state:{}}})).status,409);
  assert.equal((await request('/api/logout',{auth:admin,method:'POST',data:{}})).status,200);assert.equal((await request('/api/me',{auth:admin})).status,401);
  for(let i=0;i<8;i++)await request('/api/login',{method:'POST',data:{username:'unknown',password:'bad'}});
  assert.equal((await request('/api/login',{method:'POST',data:{username:'unknown',password:'bad'}})).status,429);
 }finally{await new Promise(r=>server.close(r));db.close();rmSync(dir,{recursive:true,force:true});}
});
test('teacher can save assigned grades and attendance, not forge ownership',()=>{
 const dir=mkdtempSync(join(tmpdir(),'tms-policy-test-'));
 // Pure in-memory policy fixture, no actual student records.
 const s={centers:[],verticals:[],schedules:[{id:'c1',faculty:'AD',programId:'p1',batchId:'b1'}],requests:[],faculty:[],programs:[{id:'p1'}],batches:[{id:'b1',programId:'p1'}],classrooms:[],students:[{id:'s1',name:'Student',code:'S1',programId:'p1',batchId:'b1'}],studentAttendance:{},applications:[],assessments:[],invoices:[],payments:[],messages:[],exams:[],studentNotes:[],auditLog:[],smsAudit:[]};
 try{const u={id:'teacher-a',role:'teacher',faculty:'AD',name:'Teacher'},v=visible(s,u);v.assessments.push({id:'g1',studentId:'s1',subject:'Math',title:'Term',date:'2026-01-01',score:5,max:10,by:'Forged admin'});v.studentAttendance['2026-01-01']={s1:{status:'present',by:'Forged'}};const next=mergeState(s,v,u);assert.equal(next.assessments[0].by,'Teacher');assert.equal(next.assessments[0].actorId,'teacher-a');assert.equal(next.studentAttendance['2026-01-01'].s1.by,'Teacher');const other={...u,id:'teacher-b'},remove=visible(next,other);remove.assessments=[];assert.throws(()=>mergeState(next,remove,other),/another staff member/);v.schedules[0].faculty='OTHER';assert.throws(()=>mergeState(s,v,u),/cannot change schedules/);}finally{rmSync(dir,{recursive:true,force:true});}
});
test('teacher-reference profiles and queries stay scoped and validated',()=>{
 const s={centers:[],verticals:[],schedules:[],requests:[],faculty:[{id:'AD'},{id:'NS'}],programs:[],batches:[],classrooms:[],students:[],studentAttendance:{},applications:[],assessments:[],invoices:[],payments:[],messages:[],exams:[],studentNotes:[],auditLog:[],smsAudit:[],subjects:[{id:'physics',code:'PHY',name:'Physics'}],teacherProfiles:[{id:'p-ad',facultyId:'AD',subjectIds:['physics'],qualification:'MSc',email:'private@example.invalid',phone:'private',address:'private',experienceYears:4}],teacherQueries:[{id:'q1',facultyId:'AD',actorId:'someone-else',title:'Existing',message:'Private question',status:'open'}]};
 const u={id:'u-teacher',role:'teacher',faculty:'NS',name:'Teacher'};const v=visible(s,u);
 assert.equal(v.teacherProfiles[0].qualification,'MSc');assert.equal(v.teacherProfiles[0].email,undefined);assert.equal(v.teacherProfiles[0].address,undefined);assert.equal(v.teacherQueries.length,0);
 assert.equal(visible(s,{...u,faculty:'AD'}).teacherProfiles[0].email,'private@example.invalid');
 v.teacherQueries.push({id:'new-q',facultyId:'AD',actorId:'forged',by:'forged',title:'Question',message:'Please advise',status:'open'});
 const next=mergeState(s,v,u);assert.equal(next.teacherQueries[1].actorId,u.id);assert.equal(next.teacherQueries[1].by,u.name);
 const forged=visible(next,u);forged.teacherQueries[0].status='resolved';forged.teacherQueries[0].reply='Forged reply';assert.throws(()=>mergeState(next,forged,u),/Existing queries/);
 const altered=visible(s,u);altered.teacherProfiles[0].qualification='Forged qualification';assert.throws(()=>mergeState(s,altered,u),/cannot change teacherProfiles/);
 const admin={id:'admin',role:'administrator'},invalid=visible(s,admin);invalid.subjects=[];assert.throws(()=>mergeState(s,invalid,admin),/subject assignment/);
 const mentor={id:'m1',role:'mentor',name:'Mentor'},mv=visible(s,mentor);mv.teacherQueries.push({id:'mentor-q',facultyId:'AD',title:'Question',message:'Please advise',status:'open'});assert.equal(mergeState(s,mv,mentor).teacherQueries[1].actorId,'m1');
});
