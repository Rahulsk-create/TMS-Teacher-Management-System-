/* TMS: individual teacher attendance and mentor review */
renderPersonaBox=function(){
 const mentor=currentUser.viewAs==='mentor';
 const value=mentor?'__mentor':isStakeholderView()?'__stakeholder':currentUser.name;
 return `<div class="persona"><label for="persona-select">Access view</label><select id="persona-select"><option value="__stakeholder" ${value==='__stakeholder'?'selected':''}>Principal / Coordinator</option><option value="__mentor" ${mentor?'selected':''}>Mentor</option><optgroup label="Individual teachers">${state.faculty.map(f=>`<option value="${esc(f.id)}" ${value===f.id?'selected':''}>${esc(facultyDisplay(f.id))}</option>`).join('')}</optgroup></select>${mentor||isStakeholderView()?`<label for="persona-name">${mentor?'Mentor':'Principal / coordinator'} name</label><input id="persona-name" placeholder="Enter your name" value="${esc(currentUser.coordinator)}">`:''}<div class="p-note">${mentor?'Verify recorded entry and exit times.':isStakeholderView()?'Publish timetables and manage teachers.':'Your timetable and attendance records.'}</div></div>`;
};
const tmsOriginalHandlers=attachHandlers;
attachHandlers=function(){
 tmsOriginalHandlers();
 document.getElementById('persona-select').onchange=e=>{
  const v=e.target.value;
  currentUser.viewAs=v==='__mentor'?'mentor':v==='__stakeholder'?'stakeholder':'teacher';
  currentUser.name=v.startsWith('__')?'':v; currentUser.coordinator='';
  currentUser.role=currentUser.viewAs==='mentor'?'attendance':currentUser.viewAs==='teacher'?'teacher':'coordinator';
  activeSubTab.teacher='today';activeSubTab.coordinator='overview';
  window.__tdTeacher=null;window.__ovPanel=null;expandedRequestForm=null;sidebarOpen=false;
  stopGeoWatch();if(isTeacherPersona())startGeoWatch();render();
 };
 document.querySelectorAll('[data-tms-review]').forEach(b=>b.onclick=()=>reviewTmsAttendance(b.dataset.id,b.dataset.stage,b.dataset.tmsReview));
 const filter=document.getElementById('tms-filter');if(filter)filter.onchange=e=>{window.tmsFilter=e.target.value;render();};
 const exp=document.getElementById('tms-export');if(exp)exp.onclick=exportTmsAttendance;
};
const tmsStart=startClass,tmsStop=stopClass;
startClass=async function(id){const s=state.schedules.find(s=>s.id===id);if(!isTeacherPersona()||s?.faculty!==currentUser.name)return;return tmsStart(id);};
stopClass=async function(id){const s=state.schedules.find(s=>s.id===id);if(!isTeacherPersona()||s?.faculty!==currentUser.name)return;return tmsStop(id);};
function tmsRecords(){return state.schedules.filter(s=>currentUser.viewAs!=='teacher'||s.faculty===currentUser.name).sort((a,b)=>(b.date+b.startTime).localeCompare(a.date+a.startTime));}
function tmsTime(v){return v?new Date(v).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',second:'2-digit'}):'Not recorded';}
function tmsReview(s,k){return s[k+'Review']||{status:'pending'};}
function tmsCell(s,k){
 if(!s[k==='entry'?'actualStart':'actualEnd'])return '<span class="geo-note">Not recorded</span>';
 const r=tmsReview(s,k);
 return `<strong>${esc(tmsTime(s[k==='entry'?'actualStart':'actualEnd']))}</strong><div style="margin-top:7px"><span class="badge ${r.status==='approved'?'b-completed':r.status==='rejected'?'b-noshow':'b-pending'}">${r.status==='pending'?'Awaiting mentor':r.status==='approved'?'Approved':'Rejected'}</span></div>${r.by?`<div class="cc-meta">${esc(r.by)} · ${esc(tmsTime(r.at))}${r.note?'<br>'+esc(r.note):''}</div>`:''}${currentUser.viewAs==='mentor'&&r.status==='pending'?`<label class="cc-meta" for="note-${s.id}-${k}">Review note (required to reject)</label><input id="note-${s.id}-${k}" maxlength="300" style="display:block;width:100%;margin:6px 0;padding:8px;border:1px solid var(--line);border-radius:6px" placeholder="Approval note or rejection reason"><div class="cc-actions"><button class="btn btn-green btn-sm" data-tms-review="approved" data-stage="${k}" data-id="${s.id}">Approve ${k}</button><button class="btn btn-outline btn-sm" data-tms-review="rejected" data-stage="${k}" data-id="${s.id}">Reject</button></div>`:''}`;
}
function renderTmsAttendance(){
 const all=tmsRecords(),filter=window.tmsFilter||'all';
 const pending=all.reduce((n,s)=>n+['entry','exit'].filter(k=>s[k==='entry'?'actualStart':'actualEnd']&&tmsReview(s,k).status==='pending').length,0);
 const rows=all.filter(s=>filter==='all'||['entry','exit'].some(k=>s[k==='entry'?'actualStart':'actualEnd']&&tmsReview(s,k).status===filter));
 return `<div class="kpi-grid">${kpiCard('Scheduled sessions',String(all.length),'All dates in this view','','var(--teal)')}${kpiCard('Entries recorded',String(all.filter(s=>s.actualStart).length),'Teacher check-ins','','var(--indigo)')}${kpiCard('Pending reviews',String(pending),'Entry and exit reviewed separately','','var(--amber)')}${kpiCard('Fully approved',String(all.filter(s=>s.entryReview?.status==='approved'&&s.exitReview?.status==='approved').length),'Entry and exit approved','','var(--green)')}</div><div class="card"><div class="ov-head"><div><h3>${currentUser.viewAs==='mentor'?'Mentor attendance approval':'Teacher attendance register'}</h3><div class="hint">Teachers mark entry and exit from My classes. Mentors verify each recorded time.</div></div><button class="btn btn-outline" id="tms-export">Export attendance CSV</button></div><div class="grid-toolbar"><label for="tms-filter">Review status</label><select id="tms-filter">${['all','pending','approved','rejected'].map(v=>`<option value="${v}" ${filter===v?'selected':''}>${v==='all'?'All records':v[0].toUpperCase()+v.slice(1)}</option>`).join('')}</select></div><div class="table-wrap"><table><thead><tr><th>Teacher / session</th><th>Timetable</th><th>Recorded entry</th><th>Recorded exit</th></tr></thead><tbody>${rows.map(s=>`<tr><td><strong>${esc(facultyDisplay(s.faculty))}</strong><div>${esc(s.subject)}</div><div class="cc-meta">${esc(cohortLabel(s))}<br>${esc(centerName(s.center))}</div></td><td>${esc(fmtDate(s.date))}<br>${esc(to12h(s.startTime))}–${esc(to12h(s.endTime))}<div style="margin-top:6px">${statusBadge(s.status)}</div></td><td style="min-width:210px">${tmsCell(s,'entry')}</td><td style="min-width:210px">${tmsCell(s,'exit')}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">No records match this view.</td></tr>'}</tbody></table></div></div>`;
}
async function reviewTmsAttendance(id,k,decision){
 if(currentUser.viewAs!=='mentor'||!['entry','exit'].includes(k)||!['approved','rejected'].includes(decision))return;
 if(!currentUser.coordinator.trim()){showToast('Enter the mentor name in the sidebar before reviewing attendance.');return;}
 const s=state.schedules.find(s=>s.id===id);
 if(!s||!s[k==='entry'?'actualStart':'actualEnd']||tmsReview(s,k).status!=='pending')return;
 const note=document.getElementById('note-'+id+'-'+k)?.value.trim()||'';
 if(decision==='rejected'&&!note){showToast('Enter a reason for rejecting this attendance time.');return;}
 const before=s[k+'Review'],audit=state.auditLog.slice();
 s[k+'Review']={status:decision,by:currentUser.coordinator.trim(),at:new Date().toISOString(),note};
 logAudit(currentUser.coordinator,decision+' teacher '+k,facultyDisplay(s.faculty)+' · '+s.subject+(note?' · '+note:''),id);
 if(await saveState()){render();showToast('Attendance '+k+' '+decision+'.',3000);}
 else{s[k+'Review']=before;state.auditLog=audit;}
}
function exportTmsAttendance(){
 const safe=v=>/^[=+@\-\t\r]/.test(String(v??''))?"'"+v:v;
 const rows=[['Teacher','Date','Subject','Scheduled start','Scheduled end','Entry time','Entry status','Entry mentor','Entry note','Exit time','Exit status','Exit mentor','Exit note']];
 tmsRecords().forEach(s=>rows.push([facultyDisplay(s.faculty),s.date,s.subject,s.startTime,s.endTime,s.actualStart||'',s.actualStart?tmsReview(s,'entry').status:'Not recorded',s.entryReview?.by||'',s.entryReview?.note||'',s.actualEnd||'',s.actualEnd?tmsReview(s,'exit').status:'Not recorded',s.exitReview?.by||'',s.exitReview?.note||''].map(safe)));
 downloadBlob('TMS-teacher-attendance.csv',toCSV(rows),'text/csv;charset=utf-8');
}
