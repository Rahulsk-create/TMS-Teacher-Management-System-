/* Student register and daily attendance */
const studentBaseNormalize=normalizeState;
normalizeState=function(s){s=studentBaseNormalize(s);s.students=Array.isArray(s.students)?s.students:[];s.studentAttendance=s.studentAttendance||{};return s;};
const studentBaseBody=renderBody;
renderBody=function(){return currentUser.role==='students'?renderStudents():studentBaseBody();};
function visibleStudents(){
 const all=state.students||[];
 if(isStakeholderView())return all;
 if(!isTeacherPersona())return [];
 const sessions=state.schedules.filter(s=>s.faculty===currentUser.name);
 return all.filter(p=>sessions.some(s=>s.programId===p.programId&&(!s.batchId||s.batchId===p.batchId)));
}
function studentBatch(p){return state.batches.find(b=>b.id===p.batchId)?.name||'All batches';}
function studentProgram(p){return state.programs.find(b=>b.id===p.programId)?.name||'Unassigned';}
function studentOptions(selected){return state.batches.map(b=>`<option value="${esc(b.id)}" ${selected===b.id?'selected':''}>${esc(state.programs.find(p=>p.id===b.programId)?.name||'Program')} · ${esc(b.name)}</option>`).join('');}
function renderStudents(){
 const admin=isStakeholderView(),all=visibleStudents(),q=(window.studentSearch||'').toLowerCase(),day=window.studentDay||todayISO();
 const filtered=all.filter(p=>(p.name+' '+p.code+' '+studentProgram(p)+' '+studentBatch(p)).toLowerCase().includes(q));
 const edit=all.find(p=>p.id===window.studentEdit);
 const record=state.studentAttendance?.[day]||{};
 return `<div class="kpi-grid">${kpiCard('Students',String(all.length),'In your view','','var(--teal)')}${kpiCard('Present',String(all.filter(p=>record[p.id]?.status==='present').length),fmtDate(day),'','var(--green)')}${kpiCard('Absent',String(all.filter(p=>record[p.id]?.status==='absent').length),fmtDate(day),'','var(--red)')}${kpiCard('Unmarked',String(all.filter(p=>!record[p.id]).length),fmtDate(day),'','var(--amber)')}</div>
 ${admin?`<div class="card"><h3>${edit?'Edit student':'Add student'}</h3><form id="student-form"><div class="form-grid"><div class="fg"><label for="student-code">Admission number</label><input id="student-code" required maxlength="40" value="${esc(edit?.code||'')}"></div><div class="fg"><label for="student-name">Student name</label><input id="student-name" required maxlength="100" value="${esc(edit?.name||'')}"></div><div class="fg"><label for="student-batch">Program / batch</label><select id="student-batch" required><option value="">Select batch</option>${studentOptions(edit?.batchId)}</select></div><div class="fg"><label for="student-contact">Parent / guardian contact</label><input id="student-contact" type="tel" maxlength="40" value="${esc(edit?.contact||'')}"></div></div><div class="cc-actions"><button class="btn btn-teal" type="submit">${edit?'Save changes':'Add student'}</button>${edit?'<button class="btn btn-outline" type="button" id="student-cancel">Cancel edit</button>':''}</div></form>${!state.batches.length?'<p class="hint">Add a program and batch in Admin setup first.</p>':''}</div>`:''}
 <div class="card"><div class="ov-head"><div><h3>Student register & attendance</h3><div class="hint">Daily attendance for each student. Saved in this browser.</div></div><button class="btn btn-outline" id="student-export">Export CSV</button></div><div class="grid-toolbar"><label for="student-search">Find student</label><input id="student-search" placeholder="Name, admission number or batch" value="${esc(window.studentSearch||'')}"><label for="student-date">Attendance date</label><input id="student-date" type="date" max="${todayISO()}" value="${esc(day)}"></div><div class="table-wrap"><table><thead><tr><th>Student</th><th>Program / batch</th>${admin?'<th>Guardian contact</th>':''}<th>Attendance</th>${admin?'<th>Manage</th>':''}</tr></thead><tbody>${filtered.map(p=>`<tr><td><strong>${esc(p.name)}</strong><div class="cc-meta">${esc(p.code)}</div></td><td>${esc(studentProgram(p))}<div class="cc-meta">${esc(studentBatch(p))}</div></td>${admin?`<td>${esc(p.contact||'—')}</td>`:''}<td><select data-student-att="${p.id}" aria-label="Attendance for ${esc(p.name)}" style="padding:8px;border-radius:6px"><option value="">Unmarked</option>${['present','absent','late','excused'].map(v=>`<option value="${v}" ${record[p.id]?.status===v?'selected':''}>${v[0].toUpperCase()+v.slice(1)}</option>`).join('')}</select>${record[p.id]?`<div class="cc-meta">${esc(record[p.id].by)}</div>`:''}</td>${admin?`<td><button class="btn btn-outline btn-sm" data-student-edit="${p.id}">Edit</button> <button class="btn btn-outline btn-sm" data-student-remove="${p.id}">Remove</button></td>`:''}</tr>`).join('')||'<tr><td colspan="5" class="empty">No students found. Add students using the form above.</td></tr>'}</tbody></table></div></div>`;
}
async function studentSaveMutation(fn){const before=JSON.stringify(state);fn();if(await saveState()){render();}else{state=normalizeState(JSON.parse(before));render();}}
const studentBaseHandlers=attachHandlers;
attachHandlers=function(){studentBaseHandlers();
 const form=document.getElementById('student-form');if(form)form.onsubmit=async e=>{e.preventDefault();if(!isStakeholderView())return;
 const code=document.getElementById('student-code').value.trim(),name=document.getElementById('student-name').value.trim(),batchId=document.getElementById('student-batch').value,contact=document.getElementById('student-contact').value.trim();
 const batch=state.batches.find(b=>b.id===batchId);if(!code||!name||!batch)return showToast('Enter an admission number, student name and batch.');
 if(state.students.some(p=>p.code.toLowerCase()===code.toLowerCase()&&p.id!==window.studentEdit))return showToast('This admission number already exists.');
 await studentSaveMutation(()=>{const p=state.students.find(p=>p.id===window.studentEdit);if(p)Object.assign(p,{code,name,batchId,programId:batch.programId,contact});else state.students.push({id:uid(),code,name,batchId,programId:batch.programId,contact});window.studentEdit=null;});};
 const search=document.getElementById('student-search');if(search)search.onchange=e=>{window.studentSearch=e.target.value;render();};
 const date=document.getElementById('student-date');if(date)date.onchange=e=>{if(e.target.value&&e.target.value<=todayISO()){window.studentDay=e.target.value;render();}else showToast('Select today or a past date.');};
 const cancel=document.getElementById('student-cancel');if(cancel)cancel.onclick=()=>{window.studentEdit=null;render();};
 document.querySelectorAll('[data-student-edit]').forEach(b=>b.onclick=()=>{window.studentEdit=b.dataset.studentEdit;render();});
 document.querySelectorAll('[data-student-remove]').forEach(b=>b.onclick=async()=>{if(!isStakeholderView())return;const id=b.dataset.studentRemove,p=state.students.find(p=>p.id===id);if(!p||!confirm('Remove '+p.name+' and all their attendance records?'))return;await studentSaveMutation(()=>{state.students=state.students.filter(p=>p.id!==id);Object.values(state.studentAttendance).forEach(r=>delete r[id]);});});
 document.querySelectorAll('[data-student-att]').forEach(el=>el.onchange=async()=>{const id=el.dataset.studentAtt,day=window.studentDay||todayISO(),status=el.value;if(!visibleStudents().some(p=>p.id===id)||day>todayISO()||!['','present','absent','late','excused'].includes(status))return;
 const by=isTeacherPersona()?facultyDisplay(currentUser.name):currentUser.coordinator.trim();if(!by){showToast('Enter your name in the sidebar before marking attendance.');render();return;}
 await studentSaveMutation(()=>{state.studentAttendance[day] ||= {};if(status)state.studentAttendance[day][id]={status,by,at:new Date().toISOString()};else delete state.studentAttendance[day][id];});});
 const exp=document.getElementById('student-export');if(exp)exp.onclick=()=>{const day=window.studentDay||todayISO(),safe=v=>/^[=+@\-\t\r]/.test(String(v))?"'"+v:v;const rows=[['Admission number','Name','Program','Batch','Date','Attendance','Marked by']];visibleStudents().forEach(p=>{const r=state.studentAttendance[day]?.[p.id];rows.push([p.code,p.name,studentProgram(p),studentBatch(p),day,r?.status||'unmarked',r?.by||''].map(safe));});downloadBlob('TMS-student-attendance-'+day+'.csv',toCSV(rows),'text/csv;charset=utf-8');};
};
