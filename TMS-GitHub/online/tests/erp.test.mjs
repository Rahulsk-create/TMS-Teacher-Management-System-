import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createApp} from '../server.mjs';
import {hashPassword,readState,writeState} from '../store.mjs';
test('ERP messaging, learning, email acceptance and schedule conflicts',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'tms-erp-test-')),origin='http://127.0.0.1:3000';let sends=0;
 const {server,db}=await createApp({dir,origin,emailSender:async r=>{assert.equal(r.recipient,'parent@example.invalid');sends++;return 'fake-provider-id';}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const password='test-only-password-erp-42',hash=await hashPassword(password);for(const [id,role,faculty,student]of [['admin','administrator','',''],['teacher','teacher','AD',''],['student','student','','s1'],['other','student','','s2']])db.prepare('INSERT INTO users(id,username,name,role,faculty,student_id,password,must_change) VALUES(?,?,?,?,?,?,?,0)').run(id,id,id,role,faculty,student,hash);
 const r=readState(db),s=r.state;s.centers=[{id:'c1',name:'Centre'}];s.verticals=['School'];s.faculty=[{id:'AD',name:'Teacher',centers:['c1'],verticals:['School']}];s.programs=[{id:'p1',name:'Grade 10',center:'c1',vertical:'School'},{id:'p2',name:'Other',center:'c1',vertical:'School'}];s.batches=[{id:'b1',programId:'p1',name:'A'},{id:'b2',programId:'p2',name:'B'}];s.classrooms=[{id:'room1',center:'c1',name:'Room'}];s.students=[{id:'s1',name:'Student',code:'S1',programId:'p1',batchId:'b1',medical:'SECRET'},{id:'s2',name:'Other',code:'S2',programId:'p2',batchId:'b2'}];s.schedules=[{id:'lesson1',faculty:'AD',center:'c1',vertical:'School',programId:'p1',batchId:'b1',classroom:'room1',date:'2030-01-07',startTime:'09:00',endTime:'10:00',status:'scheduled'}];writeState(db,s,r.revision);
 async function req(path,auth,method='GET',data){const response=await fetch(base+path,{method,headers:{...(auth?{Cookie:auth.cookie,'X-CSRF-Token':auth.csrf}:{}),...(method!=='GET'?{Origin:origin,'Content-Type':'application/json'}:{})},...(data!==undefined?{body:JSON.stringify(data)}:{})});return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')};}
 async function login(username){const r=await req('/api/login',null,'POST',{username,password});assert.equal(r.status,200);return {cookie:r.cookie.split(';')[0],csrf:r.data.csrf};}
 try{
  const admin=await login('admin'),teacher=await login('teacher'),student=await login('student'),other=await login('other');
  assert.equal((await req('/api/erp/overview',null)).status,401);
  const own=await req('/api/state',student);assert.equal(own.data.state.students.length,1);assert.equal(own.data.state.students[0].medical,undefined);assert.equal(own.data.state.students[0].id,'s1');
  const msg=await req('/api/erp/messages',teacher,'POST',{audience:'user',recipient:'student',subject:'Hello',message:'Class update'});assert.equal(msg.status,201);
  const inbox=await req('/api/erp/messages',student);assert.equal(inbox.data.messages.length,1);assert.equal((await req('/api/erp/messages',other)).data.messages.length,0);
  assert.equal((await req('/api/erp/messages/read',other,'POST',{id:inbox.data.messages[0].id})).status,404);
  assert.equal((await req('/api/erp/messages/read',student,'POST',{id:inbox.data.messages[0].id})).status,200);
  assert.equal((await req('/api/erp/messages',student,'POST',{audience:'staff',subject:'No',message:'Unauthorized broadcast'})).status,403);
  assert.equal((await req('/api/erp/messages',teacher,'POST',{audience:'user',recipient:'other',subject:'No',message:'Outside class'})).status,400);
  const quiz=await req('/api/erp/learning',teacher,'POST',{kind:'quiz',batchId:'b1',title:'Quiz',description:'Choose the answer.',due:'2099-12-31',questions:[{prompt:'2+2?',options:['1','2','3','4'],answer:3}]});assert.equal(quiz.status,201);
  const library=await req('/api/erp/learning',student);assert.equal(library.data.items[0].questions[0].answer,undefined);assert.equal((await req('/api/erp/learning',other)).data.items.length,0);
  assert.equal((await req('/api/erp/submissions',other,'POST',{itemId:quiz.data.id,answers:[3]})).status,403);
  const attempt=await req('/api/erp/submissions',student,'POST',{itemId:quiz.data.id,answers:[3],score:999});assert.equal(attempt.data.score,1);assert.equal(attempt.data.max,1);
  assert.equal((await req('/api/erp/submissions',student,'POST',{itemId:quiz.data.id,answers:[3]})).status,409);
  const worksheet=await req('/api/erp/learning',teacher,'POST',{kind:'worksheet',batchId:'b1',title:'Work',description:'Explain the method.',due:'2099-12-31'});const sub=await req('/api/erp/submissions',student,'POST',{itemId:worksheet.data.id,response:'My answer'});assert.equal(sub.status,201);
  assert.equal((await req('/api/erp/submissions/grade',student,'POST',{id:sub.data.id,score:10,max:10})).status,403);
  assert.equal((await req('/api/erp/submissions/grade',teacher,'POST',{id:sub.data.id,score:9,max:10,feedback:'Good'})).status,200);
  const draft=await req('/api/erp/email',admin,'POST',{recipient:'parent@example.invalid',subject:'Invoice',message:'Test only'});assert.equal(draft.status,201);
  assert.equal((await req('/api/erp/email/send',student,'POST',{id:draft.data.id,confirm:true})).status,403);
  assert.equal((await req('/api/erp/email/send',admin,'POST',{id:draft.data.id})).status,400);
  assert.equal((await req('/api/erp/email/send',admin,'POST',{id:draft.data.id,confirm:true})).data.status,'accepted');await req('/api/erp/email/send',admin,'POST',{id:draft.data.id,confirm:true});assert.equal(sends,1);
  const plan={batchId:'b1',faculty:'AD',roomId:'room1',from:'2030-01-07',to:'2030-01-07',days:[1],start:'09:00',end:'12:00',duration:60,subject:'Math'};const preview=await req('/api/erp/schedule',admin,'POST',plan);assert.equal(preview.status,200);assert.equal(preview.data.created[0].startTime,'10:00');assert.equal(readState(db).state.schedules.length,1);
  assert.equal((await req('/api/erp/schedule',admin,'POST',{...plan,revision:preview.data.revision,commit:true})).status,200);assert.equal(readState(db).state.schedules.length,2);
 }finally{await new Promise(r=>server.close(r));db.close();rmSync(dir,{recursive:true,force:true});}
});
test('unconfigured email never claims to send',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'tms-email-test-')),origin='http://127.0.0.1:3000';const oldKey=process.env.RESEND_API_KEY;delete process.env.RESEND_API_KEY;
 const {server,db}=await createApp({dir,origin});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;const password='test-only-password-42';db.prepare('INSERT INTO users(id,username,name,role,password,must_change) VALUES(?,?,?,?,?,0)').run('a','admin','Admin','administrator',await hashPassword(password));
 try{const login=await fetch(base+'/api/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password})});const me=await login.json();const headers={Origin:origin,'Content-Type':'application/json',Cookie:login.headers.get('set-cookie').split(';')[0],'X-CSRF-Token':me.csrf};db.prepare('INSERT INTO erp_email(id,creator,recipient,subject,message) VALUES(?,?,?,?,?)').run('draft','a','parent@example.invalid','Test','Test only');const result=await fetch(base+'/api/erp/email/send',{method:'POST',headers,body:JSON.stringify({id:'draft',confirm:true})});assert.equal(result.status,503);assert.equal(db.prepare('SELECT status FROM erp_email WHERE id=?').get('draft').status,'draft');}finally{await new Promise(r=>server.close(r));db.close();rmSync(dir,{recursive:true,force:true});if(oldKey!==undefined)process.env.RESEND_API_KEY=oldKey;}
});
