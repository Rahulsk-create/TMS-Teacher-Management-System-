$html=Get-Content -LiteralPath 'C:\Users\RAHUL S KUMAR\Downloads\Xylem_Class_Session_Control_Final.html' -Raw
$html=$html.Replace('Xylem','TMS').Replace('xylem','tms').Replace('Class Session Control','Teacher Management System').Replace('class session control','Teacher Management System').Replace('brand-mark">X','brand-mark">T').Replace('Manager / Stakeholder','Principal / Coordinator').Replace('Signed in as','Access view').Replace('All centres &amp; verticals share this workspace. Changes sync for everyone every ~20 seconds.','Local HTML edition. Records stay in this browser. Role switching is a demonstration, not secure sign-in.').Replace("'Synced '+timeAgo(syncStatus.lastSync)","'Saved locally '+timeAgo(syncStatus.lastSync)").Replace("'Connected'","'Local storage ready'").Replace('▶ Start class','▶ Mark entry / start').Replace('■ Stop class','■ Mark exit / finish').Replace('It will retry automatically.','Please allow browser storage and try again.')
$html=$html.Replace('/* ================= UTILITIES ================= */',@'
window.storage={async get(key){const value=localStorage.getItem(key);return value===null?null:{value};},async set(key,value){localStorage.setItem(key,value);return {value};}};
/* ================= UTILITIES ================= */
'@)
$html=$html.Replace('const todayISO = () => new Date().toISOString().slice(0,10);',"const todayISO = () => {const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};")
$html=$html.Replace('${renderPersonaBox()}', '${renderPersonaBox()}${roleButton(''attendance'',''✓'',currentUser.viewAs===''mentor''?''Attendance approvals'':''Teacher attendance'')}')
$html=$html.Replace('${isStakeholderView() ? `', '${currentUser.viewAs===''mentor'' ? '''' : isStakeholderView() ? `')
$html=$html.Replace('const [t,s] = titles[currentUser.role];',"const [t,s] = titles[currentUser.role] || ['Teacher attendance','Recorded entry and exit times with mentor verification.'];")
$html=$html.Replace("if(currentUser.role==='dashboard') return renderTeacherMyDashboard();", "if(currentUser.role==='attendance' || currentUser.viewAs==='mentor') return renderTmsAttendance();`n  if(currentUser.role==='dashboard') return renderTeacherMyDashboard();")
$html=$html.Replace("s.status='live'; s.actualStart=new Date().toISOString(); s.actualEnd=null;", "s.status='live'; s.actualStart=new Date().toISOString(); s.actualEnd=null; s.entryReview={status:'pending'}; s.exitReview=null;")
$html=$html.Replace("s.status='completed'; s.actualEnd=new Date().toISOString();", "s.status='completed'; s.actualEnd=new Date().toISOString(); s.exitReview={status:'pending'};")
$html=$html.Replace("if(false", "if(false")
$html=$html.Replace("if('Notification' in window && Notification.permission==='default'){", "if(false && 'Notification' in window && Notification.permission==='default'){")
$extra=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'attendance.js') -Raw
$html=$html.Replace('/* ================= INIT ================= */',$extra+"`n/* ================= INIT ================= */")
New-Item -ItemType Directory -Force -Path (Join-Path $PSScriptRoot '..\outputs') | Out-Null
[IO.File]::WriteAllText((Join-Path $PSScriptRoot '..\outputs\TMS_Teacher_Management_System.html'),$html,[Text.UTF8Encoding]::new($false))
