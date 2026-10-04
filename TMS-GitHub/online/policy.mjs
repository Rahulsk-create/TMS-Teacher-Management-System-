import {fail} from './store.mjs';
export const management=u=>['administrator','coordinator'].includes(u.role);
const same=(a,b)=>JSON.stringify(sort(a))===JSON.stringify(sort(b));
function sort(v){if(Array.isArray(v))return v.map(sort);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])]));return v;}
export function visible(s,u){
 if(management(u))return structuredClone(s);
 if(u.role==='student'){
  const result=Object.fromEntries(Object.keys(s).map(k=>[k,k==='studentAttendance'?{}:[]]));const p=s.students.find(p=>p.id===u.student_id);if(!p)return result;
  result.students=[Object.fromEntries(['id','name','code','programId','batchId'].filter(k=>k in p).map(k=>[k,p[k]]))];
  result.programs=s.programs.filter(x=>x.id===p.programId);result.batches=s.batches.filter(x=>x.id===p.batchId);
  result.schedules=s.schedules.filter(x=>x.programId===p.programId&&(!x.batchId||x.batchId===p.batchId)).map(x=>Object.fromEntries(['id','subject','chapter','date','startTime','endTime','status','batchId','programId','mode','link'].filter(k=>k in x).map(k=>[k,x[k]])));
  result.assessments=s.assessments.filter(x=>x.studentId===p.id);result.studentAttendance=Object.fromEntries(Object.entries(s.studentAttendance).filter(([d,r])=>r[p.id]).map(([d,r])=>[d,{[p.id]:r[p.id]}]));return structuredClone(result);
 }
 const result=structuredClone(s);const own=s.schedules.filter(x=>x.faculty===u.faculty);
 result.schedules=u.role==='mentor'?s.schedules:own;
 result.requests=u.role==='teacher'?s.requests.filter(r=>own.some(x=>x.id===r.scheduleId)):[];
 result.students=u.role==='teacher'?s.students.filter(p=>own.some(x=>x.programId===p.programId&&(!x.batchId||x.batchId===p.batchId))).map(p=>Object.fromEntries(['id','name','code','programId','batchId','history'].filter(k=>k in p).map(k=>[k,p[k]]))):[];
 const ids=new Set(result.students.map(p=>p.id));
 for(const k of ['assessments','studentNotes'])result[k]=s[k].filter(r=>ids.has(r.studentId));
 result.studentAttendance=Object.fromEntries(Object.entries(s.studentAttendance).map(([date,rows])=>[date,Object.fromEntries(Object.entries(rows).filter(([id])=>ids.has(id)))]));
 for(const k of ['applications','invoices','payments','messages','auditLog','smsAudit'])result[k]=[];
 result.exams=u.role==='teacher'?s.exams.filter(e=>own.some(x=>x.batchId===e.batchId)):[];
 result.subjects=s.subjects||[];
 result.teacherProfiles=(s.teacherProfiles||[]).map(p=>u.role==='teacher'&&p.facultyId===u.faculty?p:Object.fromEntries(['id','facultyId','qualification','experienceYears','joiningDate','bio','subjectIds'].filter(k=>k in p).map(k=>[k,p[k]])));
 result.teacherQueries=(s.teacherQueries||[]).filter(q=>q.actorId===u.id);
 return structuredClone(result);
}
function safeShape(value,depth=0){if(depth>30)fail('Record nesting limit exceeded.');if(typeof value==='string'&&value.length>400000)fail('Field too large.');if(!value||typeof value!=='object')return;for(const k of Object.keys(value)){if(['__proto__','prototype','constructor'].includes(k))fail('Invalid field.');safeShape(value[k],depth+1);}}
export function validate(s){
 for(const k of ['subjects','teacherProfiles','teacherQueries']){s[k]??=[];if(!Array.isArray(s[k]))fail('Invalid '+k);const ids=new Set();for(const r of s[k]){if(!r||typeof r.id!=='string'||!/^[a-zA-Z0-9_.-]{1,100}$/.test(r.id)||ids.has(r.id))fail('Invalid record ID in '+k);ids.add(r.id);}}
 const subjectCodes=new Set(),subjectNames=new Set();for(const r of s.subjects){if(typeof r.code!=='string'||!r.code.trim()||r.code.length>30||typeof r.name!=='string'||!r.name.trim()||r.name.length>100||subjectCodes.has(r.code.toLowerCase())||subjectNames.has(r.name.toLowerCase()))fail('Invalid or duplicate subject.');subjectCodes.add(r.code.toLowerCase());subjectNames.add(r.name.toLowerCase());}
 const profileTeachers=new Set();for(const p of s.teacherProfiles){if(!s.faculty.some(f=>f.id===p.facultyId)||profileTeachers.has(p.facultyId)||!Array.isArray(p.subjectIds)||p.subjectIds.some(id=>!s.subjects.some(s=>s.id===id)))fail('Invalid teacher profile or subject assignment.');profileTeachers.add(p.facultyId);if(p.experienceYears!==undefined&&(!Number.isFinite(p.experienceYears)||p.experienceYears<0||p.experienceYears>80))fail('Invalid teacher experience.');}
 for(const q of s.teacherQueries)if(!s.faculty.some(f=>f.id===q.facultyId)||typeof q.actorId!=='string'||typeof q.title!=='string'||!q.title.trim()||q.title.length>150||typeof q.message!=='string'||!q.message.trim()||q.message.length>3000||!['open','resolved'].includes(q.status)||q.status==='resolved'&&(typeof q.reply!=='string'||!q.reply.trim()||q.reply.length>3000))fail('Invalid teacher query.');
 safeShape(s);for(const k of ['centers','verticals','schedules','requests','faculty','programs','batches','classrooms','students','applications','assessments','invoices','payments','messages','exams','studentNotes','auditLog','smsAudit']){if(!Array.isArray(s[k])||s[k].length>50000)fail('Invalid '+k);if(k!=='verticals'){const ids=new Set();for(const r of s[k]){if(!r||typeof r.id!=='string'||!/^[a-zA-Z0-9_. -]{1,100}$/.test(r.id)||ids.has(r.id))fail('Invalid or duplicate record ID in '+k);ids.add(r.id);}}}
 if(!s.studentAttendance||Array.isArray(s.studentAttendance)||typeof s.studentAttendance!=='object')fail('Invalid attendance.');
 const students=new Set(s.students.map(p=>p.id)),codes=new Set();for(const p of s.students){if(typeof p.code!=='string'||!p.code.trim()||codes.has(p.code.toLowerCase())||typeof p.name!=='string'||!p.name.trim())fail('Student names and admission numbers must be unique and valid.');codes.add(p.code.toLowerCase());if(!s.batches.some(b=>b.id===p.batchId&&b.programId===p.programId))fail('Invalid student batch.');}
 for(const [date,rows]of Object.entries(s.studentAttendance)){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!rows||typeof rows!=='object'||Array.isArray(rows))fail('Invalid attendance date.');for(const [id,r]of Object.entries(rows)){if(!students.has(id)||!r||!['present','absent','late','excused'].includes(r.status))fail('Invalid attendance record.');}}
 for(const g of s.assessments)if(!students.has(g.studentId)||!Number.isFinite(g.score)||!Number.isFinite(g.max)||g.max<=0||g.score<0||g.score>g.max)fail('Invalid assessment marks.');
 for(const i of s.invoices)if(!students.has(i.studentId)||!Number.isSafeInteger(i.amount)||i.amount<=0)fail('Invalid invoice.');
 const refs=new Set();for(const p of s.payments){if(!s.invoices.some(i=>i.id===p.invoiceId)||!Number.isSafeInteger(p.amount)||p.amount<=0||typeof p.reference!=='string'||!p.reference||refs.has(p.reference.toLowerCase()))fail('Invalid or duplicate payment.');refs.add(p.reference.toLowerCase());}
 for(const i of s.invoices)if(s.payments.filter(p=>p.invoiceId===i.id).reduce((n,p)=>n+p.amount,0)>i.amount)fail('Payment exceeds invoice balance.');
 for(const r of s.studentNotes)if(!students.has(r.studentId))fail('Unknown student in note.');
}
export function mergeState(old,candidate,u){
 if(!candidate||Array.isArray(candidate)||typeof candidate!=='object')fail('Invalid records.');
 const view=visible(old,u),next=structuredClone(old);for(const key of Object.keys(candidate))if(!(key in view))fail('Unknown data collection.');
 if(Object.keys(view).some(k=>!(k in candidate)))fail('Incomplete record update.');
 if(management(u)){for(const key of Object.keys(view))if(!['auditLog','smsAudit'].includes(key))next[key]=candidate[key];}
 else{
  if(!['teacher','mentor'].includes(u.role))fail('This role cannot change records.',403);
  for(const k of Object.keys(view)){
   if(['auditLog','smsAudit'].includes(k)||same(view[k],candidate[k]))continue;
   if(k==='teacherQueries'){
    if(!Array.isArray(candidate[k])||view[k].some(r=>!candidate[k].some(x=>same(x,r))))fail('Existing queries cannot be modified by staff.',403);
    for(const q of candidate[k].filter(q=>!view[k].some(x=>x.id===q.id))){if((old.teacherQueries||[]).some(x=>x.id===q.id)||!old.faculty.some(f=>f.id===q.facultyId)||q.status!=='open'||Object.keys(q).some(k=>!['id','facultyId','title','message','actorId','by','at','status'].includes(k)))fail('Invalid query submission.',403);next.teacherQueries??=[];next.teacherQueries.push({...q,actorId:u.id,by:u.name,at:new Date().toISOString(),status:'open'});}continue;
   }
   if(u.role==='mentor')fail('Mentors can submit queries or use attendance review actions only.',403);
   if(['assessments','studentNotes'].includes(k)){
    if(!Array.isArray(candidate[k]))fail('Invalid collection.');const known=new Map(view[k].map(r=>[r.id,r])),allowed=new Set(view.students.map(p=>p.id));
    for(const r of candidate[k]){if(!allowed.has(r.studentId))fail('Student is not assigned to you.',403);if(known.has(r.id)&&!same(known.get(r.id),r))fail('Existing academic records cannot be overwritten by teachers.',403);if(!known.has(r.id)){if(old[k].some(x=>x.id===r.id))fail('Record ID already exists.',409);const fields=k==='assessments'?['id','studentId','subject','title','date','score','max','by']:['id','studentId','category','note','by','at'];if(Object.keys(r).some(x=>!fields.includes(x)))fail('Invalid academic fields.');r.by=u.name;r.actorId=u.id;r.at=new Date().toISOString();next[k].push(r);}}
    for(const r of view[k])if(!candidate[k].some(x=>x.id===r.id)){if(r.actorId!==u.id)fail('You cannot remove another staff member’s record.',403);next[k]=next[k].filter(x=>x.id!==r.id);}
   }else if(k==='studentAttendance'){
    const ids=new Set(view.students.map(p=>p.id));for(const date of new Set([...Object.keys(view[k]),...Object.keys(candidate[k])])){const before=view[k][date]||{},after=candidate[k][date]||{};for(const id of new Set([...Object.keys(before),...Object.keys(after)])){if(same(before[id],after[id]))continue;if(!ids.has(id))fail('Student is not assigned to you.',403);if(date>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}))fail('Future attendance is not allowed.');next[k][date]||={};if(!after[id])delete next[k][date][id];else next[k][date][id]={status:after[id].status,by:u.name,at:new Date().toISOString()};}}
   }else if(k==='requests'){
    if(!Array.isArray(candidate[k])||view[k].some(r=>!candidate[k].some(x=>same(x,r))))fail('Existing requests cannot be changed.',403);
    for(const r of candidate[k].filter(r=>!view[k].some(x=>x.id===r.id))){const session=old.schedules.find(s=>s.id===r.scheduleId);if(!session||session.faculty!==u.faculty||session.status!=='scheduled'||r.status!=='pending'||!['reschedule','cancel','substitute'].includes(r.type)||old.requests.some(x=>x.id===r.id||x.scheduleId===r.scheduleId&&x.status==='pending'))fail('Invalid session request.',403);next.requests.push({...r,requestedBy:u.faculty,requestedAt:new Date().toISOString()});}
   }else fail('You cannot change '+k+'.',403);
  }
 }
 next.auditLog=old.auditLog;next.smsAudit=old.smsAudit;validate(next);return next;
}
