/* Bulk student import */
const studentImportBaseRender=renderStudents;
renderStudents=function(){return (isStakeholderView()?`<div class="card"><h3>Import students</h3><div class="hint">Upload CSV or Excel (.xlsx). Use existing program and batch names. Admission numbers must be unique; existing students are not overwritten.</div><div class="cc-actions"><button class="btn btn-outline" id="student-template">Download CSV template</button><label class="btn btn-teal" for="student-import-file">Choose file</label><input id="student-import-file" type="file" accept=".csv,.xlsx" aria-label="Import students"><button class="btn btn-teal" id="student-import-confirm" disabled>Import valid students</button></div><div id="student-import-preview" aria-live="polite" style="margin-top:14px"></div></div>`:'')+studentImportBaseRender();};
let studentImportRows=[];
function validateStudentImport(matrix){
 if(!matrix.length)throw Error('The file is empty.');
 const headers=matrix[0].map(v=>String(v??'').trim().toLowerCase().replace(/[^a-z0-9]/g,''));
 const aliases={code:['admissionnumber','admissionno','studentid','code'],name:['studentname','name'],program:['program','programname'],batch:['batch','batchname'],contact:['guardiancontact','parentcontact','contact','phone']};
 const indices={};Object.entries(aliases).forEach(([k,names])=>indices[k]=headers.findIndex(h=>names.includes(h)));
 if(['code','name','program','batch'].some(k=>indices[k]<0))throw Error('Required columns: Admission number, Student name, Program, Batch.');
 const seen=new Set((state.students||[]).map(p=>p.code.toLowerCase()));
 return matrix.slice(1).map((cells,index)=>({cells,row:index+2})).filter(o=>o.cells.some(c=>String(c??'').trim())).map(({cells,row})=>{
  const value=k=>indices[k]<0?'':String(cells[indices[k]]??'').trim();
  const code=value('code'),name=value('name'),program=value('program'),batch=value('batch'),contact=value('contact'),errors=[];
  if(!code||code.length>40)errors.push('Admission number required (maximum 40 characters)');
  if(!name||name.length>100)errors.push('Student name required (maximum 100 characters)');
  if(contact.length>40)errors.push('Contact exceeds 40 characters');
  if(seen.has(code.toLowerCase()))errors.push('Duplicate admission number');
  const matches=state.batches.filter(b=>b.name.toLowerCase()===batch.toLowerCase()&&state.programs.some(p=>p.id===b.programId&&p.name.toLowerCase()===program.toLowerCase()));
  if(matches.length!==1)errors.push(matches.length?'Program / batch is ambiguous across centres':'Program / batch not found in Admin setup');
  if(!errors.length)seen.add(code.toLowerCase());
  return {row,code,name,contact,program,batch,batchId:matches[0]?.id,programId:matches[0]?.programId,errors};
 });
}
const studentImportBaseHandlers=attachHandlers;
attachHandlers=function(){studentImportBaseHandlers();
 const template=document.getElementById('student-template');if(template)template.onclick=()=>downloadBlob('TMS-student-import-template.csv',toCSV([['Admission number','Student name','Program','Batch','Guardian contact']]),'text/csv;charset=utf-8');
 const input=document.getElementById('student-import-file');if(input)input.onchange=async()=>{
  const file=input.files[0],preview=document.getElementById('student-import-preview'),button=document.getElementById('student-import-confirm');studentImportRows=[];button.disabled=true;if(!file)return;
  try{
   if(file.size>5*1024*1024)throw Error('Please use a file smaller than 5 MB.');
   let matrix;if(/\.csv$/i.test(file.name))matrix=parseDelimited((await file.text()).replace(/^\uFEFF/,''));
   else if(/\.xlsx$/i.test(file.name)){if(typeof XLSX==='undefined')throw Error('Excel support is unavailable. Save the file as CSV and upload it.');const book=XLSX.read(await file.arrayBuffer(),{type:'array'});matrix=XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]],{header:1,defval:'',raw:false});}
   else throw Error('Choose a CSV or .xlsx file.');
   if(matrix.length>5001)throw Error('Please import up to 5,000 students at a time.');
   studentImportRows=validateStudentImport(matrix);const valid=studentImportRows.filter(r=>!r.errors.length);
   preview.innerHTML=`<p><strong>${valid.length} ready to import</strong> · ${studentImportRows.length-valid.length} invalid rows will be skipped.</p><div class="table-wrap"><table><thead><tr><th>Row</th><th>Admission number</th><th>Student</th><th>Validation</th></tr></thead><tbody>${studentImportRows.slice(0,100).map(r=>`<tr><td>${r.row}</td><td>${esc(r.code)}</td><td>${esc(r.name)}</td><td>${esc(r.errors.join('; ')||'Ready')}</td></tr>`).join('')}</tbody></table></div>${studentImportRows.length>100?'<p>Preview shows the first 100 rows.</p>':''}`;
   button.disabled=!valid.length;
  }catch(e){preview.textContent=e.message;}
 };
 const button=document.getElementById('student-import-confirm');if(button)button.onclick=async()=>{
  if(!isStakeholderView())return;button.disabled=true;
  const valid=studentImportRows.filter(r=>!r.errors.length),before=JSON.stringify(state);let added=0;
  valid.forEach(r=>{if(state.students.some(s=>s.code.toLowerCase()===r.code.toLowerCase())||!state.batches.some(b=>b.id===r.batchId&&b.programId===r.programId))return;state.students.push({id:uid(),code:r.code,name:r.name,contact:r.contact,programId:r.programId,batchId:r.batchId});added++;});
  if(await saveState()){studentImportRows=[];render();showToast(added+' students imported. '+(valid.length-added)+' skipped because records changed.',5000);}
  else{state=normalizeState(JSON.parse(before));button.disabled=false;}
 };
};
