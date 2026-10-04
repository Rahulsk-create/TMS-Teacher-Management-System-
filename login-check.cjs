const fs=require('fs'),vm=require('vm'),assert=require('assert'),{webcrypto}=require('crypto');
const html=fs.readFileSync('outputs/TMS_Teacher_Management_System.html','utf8');
const code=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n').split('/* ================= INIT ================= */')[0];
const storage=new Map();const ctx={console,Date,Math,JSON,Set,Map,Intl,TextEncoder,Uint8Array,crypto:webcrypto,setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},document:{getElementById:()=>null},navigator:{},addEventListener(){}};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(code,ctx);
(async()=>{await vm.runInContext(`(async()=>{
 state=defaultState();let failed=false;try{await tmsNewAccount({username:'admin',password:'short',name:'Admin'});}catch(e){failed=true;}if(!failed)throw Error('Short password accepted');
 const admin=await tmsNewAccount({username:'Admin',password:'example-only-long-password',name:'Admin'});
 if(admin.role!=='administrator'||admin.username!=='admin')throw Error('Setup role');
 if(tmsAccounts()[0].password||JSON.stringify(tmsAccounts()).includes('example-only-long-password'))throw Error('Plain password stored');
 if(await tmsPasswordHash('wrong',admin.salt)===admin.hash)throw Error('Wrong password accepted');
 if(await tmsPasswordHash('example-only-long-password',admin.salt)!==admin.hash)throw Error('Correct password failed');
 failed=false;try{await tmsNewAccount({username:'other',password:'example-only-long-password',name:'Other',role:'mentor'});}catch(e){failed=true;}if(!failed)throw Error('Account creation allowed while logged out');
 tmsSession=admin;const teacher=await tmsNewAccount({username:'teacher1',password:'another-example-password',name:'Teacher One',role:'teacher',faculty:'AD'});tmsSession=teacher;tmsApplyAccount();if(currentUser.name!=='AD'||currentUser.viewAs!=='teacher'||tmsIsAdmin())throw Error('Teacher mapping failed');
 failed=false;try{await tmsNewAccount({username:'teacher2',password:'another-example-password',name:'Teacher Two',role:'teacher',faculty:'AD'});}catch(e){failed=true;}if(!failed)throw Error('Teacher created account');
 tmsSession=admin;failed=false;try{await tmsNewAccount({username:'ADMIN',password:'another-example-password',name:'Duplicate',role:'mentor'});}catch(e){failed=true;}if(!failed)throw Error('Duplicate user accepted');
 if(tmsAccountPanel().includes(admin.hash))throw Error('Hash exposed in account screen');
 })()`,ctx);console.log('PASS: initial administrator setup, password policy, salted password verification, no plaintext passwords, account creation restriction, teacher mapping, duplicate User IDs and account display.');})().catch(e=>{console.error(e);process.exitCode=1});
