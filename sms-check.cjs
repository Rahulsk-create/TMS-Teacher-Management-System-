const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const script=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').split('/* ================= INIT ================= */')[0];
const store=new Map(),items=new Map(),el=id=>{if(!items.has(id))items.set(id,{value:'',style:{},innerHTML:'',classList:{add(){},remove(){}}});return items.get(id)};
const c={console,Date,Math,JSON,Set,Map,Intl,Blob,URL,Uint8Array,FormData:class{constructor(v){this.v=v}entries(){return Object.entries(this.v)}},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:el,querySelector:()=>null,querySelectorAll:()=>[],activeElement:null},navigator:{},Notification:{permission:'denied'},confirm:()=>true};c.window=c;vm.createContext(c);vm.runInContext(script,c);
(async()=>{await vm.runInContext(`(async()=>{
 refreshScheduleForm=()=>{};state=defaultState();currentUser.viewAs='stakeholder';currentUser.coordinator='Tester';currentUser.role='sms';
 const b=state.batches[0];b.strength=1;state.applications.push({id:'a1',name:'Student One',code:'S1',batchId:b.id,contact:'',status:'applied'},{id:'a2',name:'Student Two',code:'S2',batchId:b.id,contact:'',status:'applied'});
 smsEnroll('a1');smsEnroll('a2');if(state.students.length!==1||state.applications[1].status!=='waitlisted')throw Error('Enrollment capacity failed');
 const id=state.students[0].id;
 await smsSubmit('grade',{studentId:id,subject:'Math',title:'Term 1',date:todayISO(),score:'80',max:'100'});
 await smsSubmit('grade',{studentId:id,subject:'Math',title:'Invalid',date:todayISO(),score:'101',max:'100'});
 if(state.assessments.length!==1)throw Error('Grade bounds failed');
 await smsSubmit('invoice',{studentId:id,description:'Term 1',due:todayISO(),amount:'1000.50'});const i=state.invoices[0];
 await smsSubmit('payment',{invoiceId:i.id,date:todayISO(),reference:'TEST1',amount:'400.25'});if(smsBalance(i)!==60025)throw Error('Payment precision failed');
 await smsSubmit('payment',{invoiceId:i.id,date:todayISO(),reference:'TEST2',amount:'601'});if(state.payments.length!==1)throw Error('Overpayment accepted');
 state.studentAttendance[todayISO()]={[id]:{status:'absent'}};await smsAction('absence-drafts','');await smsAction('absence-drafts','');if(state.messages.length!==1)throw Error('Duplicate absence drafts');
 const existing=state.schedules.find(s=>s.batchId===b.id&&s.classroom&&s.status!=='cancelled');let clash=false;try{smsAddExam({title:'Clash',batchId:b.id,roomId:existing.classroom,date:existing.date,startTime:existing.startTime,endTime:existing.endTime});}catch(e){clash=true}if(!clash)throw Error('Exam clash accepted');
 for(const tab of Object.keys(smsTabs)){smsTab=tab;render();}
 await saveState();const restored=await loadState();if(restored.invoices.length!==1||restored.assessments.length!==1)throw Error('New records not persisted');
 currentUser.viewAs='teacher';currentUser.name='RS';smsTab='fees';render();if(smsTab!=='overview'||smsPeople().length)throw Error('Teacher scope failed');
 })()`,c);console.log('PASS: admissions capacity/waitlist, grade validation, exact payment balances, overpayment rejection, absence draft deduplication, exam clashes, all module renders, persistence and teacher scope.');})().catch(e=>{console.error(e);process.exitCode=1});
