/* TRMS: Teachers Management System (Based on Ayushi Ghill et al., IARJSET Vol. 10, Special Issue 2, May 2023) */
const trmsNormalizeBase = normalizeState;
normalizeState = function(s) {
  s = trmsNormalizeBase(s);
  s.trmsSubjects = Array.isArray(s.trmsSubjects) ? s.trmsSubjects : [];
  s.trmsTeachers = Array.isArray(s.trmsTeachers) ? s.trmsTeachers : [];
  s.trmsQueries = Array.isArray(s.trmsQueries) ? s.trmsQueries : [];
  s.trmsAudit = Array.isArray(s.trmsAudit) ? s.trmsAudit : [];

  if (!s.trmsSubjects.length) s.trmsSubjects = defaultTrmsSubjects();
  if (!s.trmsTeachers.length) s.trmsTeachers = defaultTrmsTeachers();
  if (!s.trmsQueries.length) s.trmsQueries = defaultTrmsQueries();
  return s;
};

let trmsTab = 'overview', trmsSearchQuery = '', trmsSubjectFilter = '', trmsExpFilter = '', trmsViewTeacherId = null;
let trmsQueryStatusFilter = 'all', trmsStudentLookup = '', trmsReportFrom = '', trmsReportTo = todayISO();
const trmsTabs = {
  overview: 'Dashboard',
  search: 'Search Teachers (Public)',
  teachers: 'Manage Teachers',
  subjects: 'Manage Subjects',
  queries: 'Query & Feedback',
  reports: 'Teacher Reports',
  diagrams: 'ER & Use Case Architecture'
};

function defaultTrmsSubjects() {
  const d = '2023-01-15';
  return [
    { id: 'SUB-101', code: 'CS401', name: 'Operating Systems', description: 'Process synchronization, memory management, file systems, and deadlocks.', creationDate: d },
    { id: 'SUB-102', code: 'CS402', name: 'Database Management Systems', description: 'Relational data models, normalization, SQL, indexing, and transaction management.', creationDate: d },
    { id: 'SUB-103', code: 'CS301', name: 'Data Structures & Algorithms', description: 'Arrays, linked lists, trees, graphs, sorting, and dynamic programming.', creationDate: d },
    { id: 'SUB-104', code: 'CS501', name: 'Web Technology & PHP', description: 'Full stack development, HTML5, CSS3, JavaScript, PHP scripts, and MySQL backend.', creationDate: d },
    { id: 'SUB-105', code: 'CS502', name: 'Computer Networks', description: 'OSI reference model, TCP/IP protocol suite, routing protocols, and network security.', creationDate: d },
    { id: 'SUB-106', code: 'CS503', name: 'Software Engineering', description: 'SDLC methodologies, Agile development, UML design diagrams, and software testing.', creationDate: d },
    { id: 'SUB-107', code: 'CS601', name: 'Python Programming & ML', description: 'Python syntax, NumPy, pandas, data processing, and machine learning models.', creationDate: d },
    { id: 'SUB-108', code: 'CS302', name: 'Discrete Mathematics', description: 'Propositional logic, set theory, combinatorics, graph theory, and recurrence.', creationDate: d },
    { id: 'SUB-109', code: 'CS602', name: 'Multimedia Systems', description: 'Digital media compression, streaming protocols, audio/video encoding standards.', creationDate: d }
  ];
}

function defaultTrmsTeachers() {
  const svgMale = (bg, fg) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="${encodeURIComponent(bg)}"/><circle cx="50" cy="38" r="18" fill="${encodeURIComponent(fg)}"/><path d="M22 84c0-16 13-26 28-26s28 10 28 26" fill="${encodeURIComponent(fg)}"/><path d="M42 58h16v12H42z" fill="#fff" opacity="0.9"/><polygon points="46,64 54,64 50,74" fill="#0E6B63"/></svg>`;
  const svgFemale = (bg, fg) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="${encodeURIComponent(bg)}"/><circle cx="50" cy="36" r="17" fill="${encodeURIComponent(fg)}"/><path d="M30 36c0-12 9-18 20-18s20 6 20 18c0 8-3 15-5 18-5-4-8-12-8-12s-3 8-8 12c-2-3-5-10-5-18z" fill="#283835"/><path d="M22 84c0-15 13-25 28-25s28 10 28 25" fill="${encodeURIComponent(fg)}"/></svg>`;

  return [
    {
      id: 'TEA-001', code: 'AG', name: 'Ayushi Ghill',
      email: 'ayushi.ghill@gits.ac.in', mobileNumber: '9829012345',
      address: 'Department of CSE, Geetanjali Institute of Technical Studies, Udaipur, India',
      qualifications: 'M.Tech (CSE), Ph.D, B.Tech', experience: 5,
      subjectId: 'SUB-101', subjectName: 'Operating Systems',
      description: 'Assistant Professor. Published research on Teacher Management Systems (TRMS) and operating system architectures.',
      joiningDate: '2019-07-15', regDate: '2019-07-15', isPublic: true,
      picture: svgFemale('#193E37', '#83DDC9')
    },
    {
      id: 'TEA-002', code: 'BS', name: 'Bharat Shotriya',
      email: 'bharatshotriya426@gmail.com', mobileNumber: '9166854251',
      address: 'Geetanjali Institute of Technical Studies, Udaipur, Rajasthan, India',
      qualifications: 'MCA, B.Sc (Computer Science)', experience: 4,
      subjectId: 'SUB-102', subjectName: 'Database Management Systems',
      description: 'Lecturer in Computer Science. Focuses on SQL optimization, database design, and normalization algorithms.',
      joiningDate: '2020-08-01', regDate: '2020-08-01', isPublic: true,
      picture: svgMale('#3E3320', '#F0BC66')
    },
    {
      id: 'TEA-003', code: 'YC', name: 'Yashraj Singh Chundawat',
      email: 'yashraj.chundawat@gits.ac.in', mobileNumber: '9414056789',
      address: 'Udaipur, Rajasthan, India',
      qualifications: 'B.Tech (CSE), M.Tech', experience: 3,
      subjectId: 'SUB-104', subjectName: 'Web Technology & PHP',
      description: 'Researcher and educator specializing in web engineering, AJAX communication, and PHP/MySQL systems.',
      joiningDate: '2021-01-10', regDate: '2021-01-10', isPublic: true,
      picture: svgMale('#303149', '#B3B4F1')
    },
    {
      id: 'TEA-004', code: 'AS', name: 'Aafreen Shaikh',
      email: 'aafreen.shaikh@gits.ac.in', mobileNumber: '9785023456',
      address: 'Udaipur, Rajasthan, India',
      qualifications: 'M.Tech (Software Engineering), B.Tech', experience: 4,
      subjectId: 'SUB-103', subjectName: 'Data Structures & Algorithms',
      description: 'Specializes in algorithmic complexity, sorting techniques, tree traversals, and dynamic programming.',
      joiningDate: '2020-09-15', regDate: '2020-09-15', isPublic: true,
      picture: svgFemale('#402A29', '#F39183')
    },
    {
      id: 'TEA-005', code: 'KD', name: 'Karan Tejsingh Devda',
      email: 'karan.devda@gits.ac.in', mobileNumber: '9636034567',
      address: 'Udaipur, Rajasthan, India',
      qualifications: 'B.Tech (CSE)', experience: 2,
      subjectId: 'SUB-105', subjectName: 'Computer Networks',
      description: 'Expert in routing protocols, socket programming, and packet transmission over wireless networks.',
      joiningDate: '2022-03-01', regDate: '2022-03-01', isPublic: true,
      picture: svgMale('#203A2C', '#80CEA0')
    },
    {
      id: 'TEA-006', code: 'SD', name: 'Sanjay Damor',
      email: 'sanjay.damor@gits.ac.in', mobileNumber: '9828045678',
      address: 'Udaipur, Rajasthan, India',
      qualifications: 'M.Tech (CSE), B.Tech', experience: 3,
      subjectId: 'SUB-106', subjectName: 'Software Engineering',
      description: 'Focuses on UML modeling, software design patterns, agile sprints, and verification standards.',
      joiningDate: '2021-07-20', regDate: '2021-07-20', isPublic: true,
      picture: svgMale('#372D44', '#CAA9ED')
    },
    {
      id: 'TEA-007', code: 'RV', name: 'Ruchi Vyas',
      email: 'ruchi.vyas@gits.ac.in', mobileNumber: '9166078901',
      address: 'Udaipur, Rajasthan, India',
      qualifications: 'M.Tech (AI/ML), Ph.D (Pursuing)', experience: 6,
      subjectId: 'SUB-107', subjectName: 'Python Programming & ML',
      description: 'Senior educator leading research in artificial intelligence, machine learning pipelines, and predictive algorithms.',
      joiningDate: '2018-08-10', regDate: '2018-08-10', isPublic: true,
      picture: svgFemale('#412C37', '#EDA0BD')
    },
    {
      id: 'TEA-008', code: 'VJ', name: 'Vishal Jain',
      email: 'vishal.jain@gits.ac.in', mobileNumber: '9413089012',
      address: 'Udaipur, Rajasthan, India',
      qualifications: 'M.Sc (Mathematics), M.Tech (CSE)', experience: 7,
      subjectId: 'SUB-108', subjectName: 'Discrete Mathematics',
      description: 'Professor of theoretical computer science, cryptography, graph theory, and mathematical foundations of computing.',
      joiningDate: '2017-01-15', regDate: '2017-01-15', isPublic: true,
      picture: svgMale('#193E37', '#83DDC9')
    },
    {
      id: 'TEA-009', code: 'AD', name: 'Arun Dev',
      email: 'arun.dev@tms.edu', mobileNumber: '9876543210',
      address: 'Academic Complex, Palakkad Centre, India',
      qualifications: 'M.Tech (CSE), B.Tech', experience: 8,
      subjectId: 'SUB-101', subjectName: 'Operating Systems',
      description: 'Senior faculty coordinator managing multi-centre academic timetables and operating systems laboratories.',
      joiningDate: '2016-06-01', regDate: '2016-06-01', isPublic: true,
      picture: svgMale('#3E3320', '#F0BC66')
    }
  ];
}

function defaultTrmsQueries() {
  return [
    {
      id: 'QRY-001',
      fullName: 'Bharat shotriya',
      email: 'bharatshotriya426@gmail.com',
      mobileNumber: '9166854251',
      teacherId: 'TEA-001',
      teacherName: 'Ayushi Ghill',
      subjectName: 'Operating Systems',
      queryDate: '2022-11-07 21:42:23',
      query: 'what is deadlock',
      reply: 'A deadlock in an operating system occurs when a set of processes are blocked because each process is holding a resource and waiting for another resource held by another process in the same set. The four necessary conditions for deadlock are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, and 4. Circular Wait.',
      repliedAt: '2022-11-08 09:30:15',
      repliedBy: 'Ayushi Ghill',
      status: 'answered'
    },
    {
      id: 'QRY-002',
      fullName: 'Kavya Patel',
      email: 'kavya.p@student.edu',
      mobileNumber: '9829123400',
      teacherId: 'TEA-002',
      teacherName: 'Bharat Shotriya',
      subjectName: 'Database Management Systems',
      queryDate: '2026-10-02 14:15:10',
      query: 'Could you please explain the practical difference between 3NF and BCNF with a database schema example?',
      reply: '',
      repliedAt: null,
      repliedBy: null,
      status: 'pending'
    }
  ];
}

function trmsAdmin() { return isStakeholderView(); }
function trmsActor() {
  if (currentUser.viewAs === 'public') return 'Student / Public Visitor';
  return isTeacherPersona() ? facultyDisplay(currentUser.name) : (currentUser.coordinator?.trim() || 'Principal / Coordinator');
}

async function trmsMutate(action, fn) {
  const actor = trmsActor();
  const before = JSON.stringify(state);
  try {
    fn();
    state.trmsAudit = state.trmsAudit || [];
    state.trmsAudit.unshift({ id: uid(), at: new Date().toISOString(), by: actor, action });
    if (!await saveState()) {
      state = normalizeState(JSON.parse(before));
      return false;
    }
    render();
    return true;
  } catch (e) {
    state = normalizeState(JSON.parse(before));
    showToast(e.message);
    return false;
  }
}

function trmsAvatar(name, pic) {
  if (pic) return `<img src="${pic}" class="trms-avatar" alt="${esc(name)}">`;
  const initials = (name || 'T').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return `<div class="trms-avatar trms-avatar-fallback">${esc(initials)}</div>`;
}

function trmsOverview() {
  const subs = state.trmsSubjects || [];
  const teachers = state.trmsTeachers || [];
  const queries = state.trmsQueries || [];
  const publicTeachers = teachers.filter(t => t.isPublic);
  const pendingQueries = queries.filter(q => q.status === 'pending');

  return `
    <div class="kpi-grid">
      ${kpiCard('Total Subjects', String(subs.length), 'Curriculum subjects configured', '', 'var(--red)')}
      ${kpiCard('Registered Teachers', String(teachers.length), 'Faculty members in registry', '', 'var(--teal)')}
      ${kpiCard('Listed Teachers (Public)', String(publicTeachers.length), 'Visible in online teacher search', '', 'var(--green)')}
      ${kpiCard('Student Queries', String(queries.length), `${pendingQueries.length} awaiting feedback`, pendingQueries.length ? 'warn' : 'good', 'var(--amber)')}
    </div>

    <div class="dash-cols">
      <div class="card">
        <h3>Teachers Management System (TRMS)</h3>
        <p class="hint">Systematically record, store, update teacher records, and provide public online teacher search with student query feedback.</p>
        <div class="sms-tiles" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:14px;">
          <button class="btn btn-outline" data-trms-tab="search">🔍 Search Teachers (Public)</button>
          ${trmsAdmin() ? `<button class="btn btn-outline" data-trms-tab="teachers">👥 Manage Teachers</button>` : ''}
          ${trmsAdmin() ? `<button class="btn btn-outline" data-trms-tab="subjects">📚 Manage Subjects</button>` : ''}
          <button class="btn btn-outline" data-trms-tab="queries">💬 Query & Feedback ${pendingQueries.length ? `<span class="badge b-pending">${pendingQueries.length}</span>` : ''}</button>
          <button class="btn btn-outline" data-trms-tab="reports">📊 Teacher Reports</button>
          <button class="btn btn-outline" data-trms-tab="diagrams">📐 ER & Use Case Architecture</button>
        </div>
      </div>

      <div class="card">
        <div class="ov-head">
          <div>
            <h3>Academic Reference & Research Base</h3>
            <div class="hint">Published in IARJSET Vol. 10, Special Issue 2, May 2023 (ICMART-2023)</div>
          </div>
          <span class="badge b-completed">Peer Reviewed</span>
        </div>
        <p><strong>Title:</strong> Teachers Management System</p>
        <p><strong>Authors:</strong> Ayushi Ghill, Yashraj Singh Chundawat, Bharat Shotriya, Aafreen Shaikh, Karan Tejsingh Devda, Sanjay Damor</p>
        <p class="cc-meta">Department of Computer Science & Engineering, Geetanjali Institute of Technical Studies, Udaipur, Rajasthan, India.</p>
        <p style="margin-top:8px;font-size:12.5px;color:var(--ink-soft);line-height:1.5;">
          "The main purpose of TRMS is to systematically record, store and update the teacher's records... The information from TRMS is used to search teachers online. With the help of this software person can easily search teacher according to his/her requirement... Any others teachers to the query it will be feed back to teachers to report it. It the process to easy way to communicate with teachers it more useful to the students."
        </p>
      </div>
    </div>

    <div class="dash-cols">
      <div class="card">
        <div class="ov-head">
          <div>
            <h3>Recently Listed Faculty</h3>
            <div class="hint">Preview of teachers active in the directory</div>
          </div>
          <button class="btn btn-outline btn-sm" data-trms-tab="search">View all ${publicTeachers.length}</button>
        </div>
        <div class="trms-mini-roster">
          ${publicTeachers.slice(0, 4).map(t => `
            <div class="center-row" style="padding:10px 0;">
              <div style="display:flex;align-items:center;gap:12px;">
                ${trmsAvatar(t.name, t.picture)}
                <div>
                  <div class="center-name">${esc(t.name)}</div>
                  <div class="center-meta">${esc(t.subjectName)} · ${esc(t.qualifications)} · ${t.experience} yrs exp</div>
                </div>
              </div>
              <button class="btn btn-outline btn-sm" data-trms-action="view-teacher" data-id="${t.id}">Details</button>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <div class="ov-head">
          <div>
            <h3>Recent Student Queries</h3>
            <div class="hint">Questions submitted by students to teachers</div>
          </div>
          <button class="btn btn-outline btn-sm" data-trms-tab="queries">Manage queries</button>
        </div>
        ${queries.length ? queries.slice(0, 3).map(q => `
          <div style="border-bottom:1px solid var(--line);padding:10px 0;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong>${esc(q.fullName)}</strong>
              <span class="badge ${q.status === 'answered' ? 'b-completed' : 'b-pending'}">${q.status === 'answered' ? 'Answered' : 'Pending reply'}</span>
            </div>
            <div class="cc-meta">To: ${esc(q.teacherName || 'Faculty')} · ${esc(q.subjectName)} · ${esc(q.queryDate)}</div>
            <div style="margin-top:6px;font-style:italic;">"${esc(q.query)}"</div>
          </div>
        `).join('') : '<div class="empty">No student queries yet.</div>'}
      </div>
    </div>
  `;
}

function trmsSearch() {
  const teachers = state.trmsTeachers || [];
  const subs = state.trmsSubjects || [];
  const q = (trmsSearchQuery || '').trim().toLowerCase();

  const filtered = teachers.filter(t => {
    if (!t.isPublic && !trmsAdmin()) return false;
    if (trmsSubjectFilter && t.subjectId !== trmsSubjectFilter && t.subjectName !== trmsSubjectFilter) return false;
    if (trmsExpFilter) {
      const minExp = Number(trmsExpFilter);
      if (t.experience < minExp) return false;
    }
    if (q) {
      const haystack = (t.name + ' ' + t.subjectName + ' ' + t.qualifications + ' ' + t.description + ' ' + t.email + ' ' + t.address).toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const subjectOptions = '<option value="">All Subjects</option>' + subs.map(s => `<option value="${esc(s.id)}" ${trmsSubjectFilter === s.id ? 'selected' : ''}>${esc(s.name)} (${esc(s.code)})</option>`).join('');

  return `
    <div class="card trms-search-hero">
      <div style="text-align:center;max-width:700px;margin:0 auto 16px;">
        <h2 style="font-size:22px;color:#fff;">Search Teacher Online</h2>
        <p class="hint" style="margin-top:4px;">Find qualified faculty by name, specialization, or subject, view detailed profiles, or submit direct academic queries.</p>
      </div>

      <div class="trms-search-bar" style="display:flex;gap:8px;max-width:800px;margin:0 auto 14px;">
        <input id="trms-search-input" type="text" placeholder="Search Teacher by Name or Subject (e.g. Ayushi, Operating Systems, DBMS)..." value="${esc(trmsSearchQuery)}" style="flex:1;padding:12px 16px;border-radius:8px;border:1px solid var(--line);background:#142022;color:#fff;font-size:14px;">
        <button class="btn btn-teal" id="trms-search-btn" style="padding:0 20px;">Search</button>
        ${trmsSearchQuery || trmsSubjectFilter || trmsExpFilter ? `<button class="btn btn-outline" id="trms-search-reset">Reset</button>` : ''}
      </div>

      <div class="grid-toolbar" style="justify-content:center;gap:12px;">
        <label for="trms-subject-filter" style="display:flex;align-items:center;gap:6px;font-size:12.5px;">
          Subject:
          <select id="trms-subject-filter" style="padding:6px 10px;">${subjectOptions}</select>
        </label>
        <label for="trms-exp-filter" style="display:flex;align-items:center;gap:6px;font-size:12.5px;">
          Min Experience:
          <select id="trms-exp-filter" style="padding:6px 10px;">
            <option value="">Any Experience</option>
            <option value="2" ${trmsExpFilter === '2' ? 'selected' : ''}>2+ Years</option>
            <option value="4" ${trmsExpFilter === '4' ? 'selected' : ''}>4+ Years</option>
            <option value="6" ${trmsExpFilter === '6' ? 'selected' : ''}>6+ Years</option>
          </select>
        </label>
      </div>
    </div>

    <div class="card">
      <div class="ov-head">
        <div>
          <h3>Listed Teachers (${filtered.length})</h3>
          <div class="hint">Showing faculty matching your criteria</div>
        </div>
        ${trmsAdmin() ? `<button class="btn btn-teal btn-sm" data-trms-tab="teachers">＋ Add New Teacher</button>` : ''}
      </div>

      ${filtered.length ? `
        <div class="trms-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:16px;">
          ${filtered.map(t => `
            <div class="trms-card" style="background:#172224;border:1px solid var(--line);border-radius:10px;padding:20px;display:flex;flex-direction:column;align-items:center;text-align:center;box-shadow:var(--shadow);transition:border-color .15s, transform .15s;">
              <div style="margin-bottom:12px;">${trmsAvatar(t.name, t.picture)}</div>
              <h4 style="font-size:16px;color:#fff;margin-bottom:4px;">${esc(t.name)}</h4>
              <span class="tpill tp-acad" style="margin-bottom:8px;">${esc(t.subjectName)}</span>
              <div class="cc-meta" style="font-size:12px;margin-bottom:6px;"><strong>${esc(t.qualifications)}</strong></div>
              <div class="cc-meta" style="font-size:12px;color:var(--ink-soft);margin-bottom:14px;">Teaching Experience: <strong>${t.experience} Years</strong></div>
              <p style="font-size:12px;color:var(--ink-faint);line-height:1.4;margin:0 0 16px;flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${esc(t.description || 'Dedicated faculty member.')}</p>
              <div style="display:flex;gap:8px;width:100%;justify-content:center;">
                <button class="btn btn-outline btn-sm" data-trms-action="view-teacher" data-id="${t.id}" style="flex:1;">View Details</button>
                <button class="btn btn-teal btn-sm" data-trms-action="ask-teacher" data-id="${t.id}" style="flex:1;">💬 Ask Query</button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty">No teachers found matching your search. Try adjusting the subject or keyword.</div>
      `}
    </div>

    ${trmsViewTeacherModal()}
  `;
}

function trmsViewTeacherModal() {
  if (!trmsViewTeacherId) return '';
  const t = (state.trmsTeachers || []).find(x => x.id === trmsViewTeacherId);
  if (!t) return '';

  const teacherQueries = (state.trmsQueries || []).filter(q => q.teacherId === t.id);

  return `
    <div class="trms-modal-backdrop" id="trms-modal-backdrop" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:900;display:flex;align-items:center;justify-content:center;padding:16px;">
      <div class="card" style="max-width:650px;width:100%;max-height:90vh;overflow-y:auto;position:relative;margin:0;">
        <button class="btn btn-ghost btn-sm" id="trms-modal-close" style="position:absolute;top:16px;right:16px;">✕</button>
        <div style="display:flex;gap:20px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:18px;margin-bottom:16px;">
          <div>${trmsAvatar(t.name, t.picture)}</div>
          <div>
            <h3 style="font-size:20px;color:#fff;">${esc(t.name)}</h3>
            <span class="tpill tp-acad" style="margin-top:4px;">${esc(t.subjectName)}</span>
            <div class="cc-meta" style="margin-top:4px;">Faculty Code: <strong>${esc(t.code || t.id)}</strong> · Registered: ${esc(t.regDate || t.joiningDate)}</div>
          </div>
        </div>

        <div class="two-col" style="margin-bottom:16px;">
          <div>
            <div class="cc-meta">QUALIFICATIONS</div>
            <div style="font-size:13.5px;font-weight:600;color:var(--ink);">${esc(t.qualifications)}</div>
          </div>
          <div>
            <div class="cc-meta">TEACHING EXPERIENCE</div>
            <div style="font-size:13.5px;font-weight:600;color:var(--amber);">${t.experience} Years</div>
          </div>
        </div>

        <div class="two-col" style="margin-bottom:16px;">
          <div>
            <div class="cc-meta">EMAIL ADDRESS</div>
            <div style="font-size:13px;"><a href="mailto:${esc(t.email)}" style="color:var(--teal-dark);">${esc(t.email)}</a></div>
          </div>
          <div>
            <div class="cc-meta">MOBILE NUMBER</div>
            <div style="font-size:13px;color:var(--ink);">${esc(t.mobileNumber)}</div>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <div class="cc-meta">INSTITUTIONAL ADDRESS</div>
          <div style="font-size:13px;color:var(--ink);">${esc(t.address)}</div>
        </div>

        <div style="margin-bottom:16px;">
          <div class="cc-meta">BIOGRAPHY & SPECIALIZATION</div>
          <p style="font-size:13px;color:var(--ink-soft);line-height:1.5;">${esc(t.description || 'Experienced faculty member committed to student success.')}</p>
        </div>

        <div style="margin-bottom:18px;">
          <div class="cc-meta">JOINING DATE</div>
          <div style="font-size:13px;color:var(--ink);">${esc(fmtDate(t.joiningDate))}</div>
        </div>

        <div class="cc-actions" style="border-top:1px solid var(--line);padding-top:14px;justify-content:space-between;">
          <button class="btn btn-teal" data-trms-action="ask-teacher" data-id="${t.id}">💬 Submit Query to ${esc(t.name)}</button>
          <button class="btn btn-outline" id="trms-modal-close-btn">Close</button>
        </div>
      </div>
    </div>
  `;
}

function trmsTeachers() {
  trmsRequireAdmin();
  const teachers = state.trmsTeachers || [];
  const subs = state.trmsSubjects || [];
  const edit = teachers.find(t => t.id === window.__trmsEditTeacherId);

  return `
    <div class="card">
      <div class="ov-head">
        <div>
          <h3>${edit ? 'Edit Teacher Details' : 'Add New Teacher'}</h3>
          <div class="hint">Enter teacher profile, qualifications, teaching experience, and subject assignment.</div>
        </div>
        ${edit ? `<button class="btn btn-outline btn-sm" id="trms-teacher-cancel">Cancel Edit</button>` : ''}
      </div>

      <form data-trms-form="teacher">
        <input type="hidden" name="teacherId" value="${edit ? esc(edit.id) : ''}">
        <div class="form-grid">
          <div class="fg"><label for="t-name">Teacher Name</label><input id="t-name" name="name" required maxlength="100" value="${esc(edit?.name || '')}" placeholder="e.g. Ayushi Ghill"></div>
          <div class="fg"><label for="t-code">Faculty Code</label><input id="t-code" name="code" maxlength="30" value="${esc(edit?.code || '')}" placeholder="e.g. AG"></div>
          <div class="fg"><label for="t-email">Email ID</label><input id="t-email" name="email" type="email" required maxlength="100" value="${esc(edit?.email || '')}" placeholder="name@gits.ac.in"></div>
          <div class="fg"><label for="t-mobile">Mobile Number</label><input id="t-mobile" name="mobileNumber" type="tel" required maxlength="30" value="${esc(edit?.mobileNumber || '')}" placeholder="9829012345"></div>
          <div class="fg"><label for="t-subject">Teacher Subject</label><select id="t-subject" name="subjectId" required><option value="">Select Subject</option>${subs.map(s => `<option value="${s.id}" ${edit?.subjectId === s.id ? 'selected' : ''}>${esc(s.name)} (${esc(s.code)})</option>`).join('')}</select></div>
          <div class="fg"><label for="t-exp">Teaching Experience (Years)</label><input id="t-exp" name="experience" type="number" min="0" max="60" step="0.5" required value="${edit ? edit.experience : ''}" placeholder="5"></div>
          <div class="fg"><label for="t-joining">Joining Date</label><input id="t-joining" name="joiningDate" type="date" required value="${edit?.joiningDate || todayISO()}"></div>
          <div class="fg"><label for="t-pic">Photo / Avatar Upload</label><input id="t-pic" name="pictureFile" type="file" accept="image/png,image/jpeg,image/webp"></div>
        </div>

        <div style="margin-top:10px;">
          <div class="fg"><label for="t-qual">Qualifications (Separated by comma)</label><input id="t-qual" name="qualifications" required maxlength="160" value="${esc(edit?.qualifications || '')}" placeholder="e.g. MCA, B.Tech, M.Tech, Ph.D"></div>
        </div>

        <div style="margin-top:10px;">
          <div class="fg"><label for="t-addr">Teacher Address</label><input id="t-addr" name="address" maxlength="250" value="${esc(edit?.address || '')}" placeholder="e.g. Geetanjali Institute of Technical Studies, Udaipur"></div>
        </div>

        <div style="margin-top:10px;">
          <div class="fg"><label for="t-desc">Description / Specialization (if any)</label><textarea id="t-desc" name="description" rows="2" maxlength="500">${esc(edit?.description || '')}</textarea></div>
        </div>

        <div style="margin-top:12px;display:flex;align-items:center;gap:8px;">
          <input type="checkbox" id="t-public" name="isPublic" ${edit ? (edit.isPublic ? 'checked' : '') : 'checked'}>
          <label for="t-public" style="font-size:13px;cursor:pointer;">List in public teacher search directory (students and visitors can search and ask queries)</label>
        </div>

        <div class="cc-actions" style="margin-top:16px;">
          <button class="btn btn-teal" type="submit">${edit ? 'Update Teacher Details' : 'Save Teacher'}</button>
          ${edit ? `<button class="btn btn-outline" type="button" id="trms-teacher-cancel-btn">Cancel</button>` : ''}
        </div>
      </form>
    </div>

    <div class="card">
      <div class="ov-head">
        <div>
          <h3>Registered Teachers Directory (${teachers.length})</h3>
          <div class="hint">All teachers currently stored in the system</div>
        </div>
        <button class="btn btn-outline btn-sm" id="trms-export-teachers-btn">Export Teachers CSV</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Subject</th>
              <th>Qualifications</th>
              <th>Experience</th>
              <th>Contact</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${teachers.map(t => `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px;">
                    ${trmsAvatar(t.name, t.picture)}
                    <div>
                      <strong>${esc(t.name)}</strong>
                      <div class="cc-meta">Code: ${esc(t.code || t.id)}</div>
                    </div>
                  </div>
                </td>
                <td><span class="tpill tp-acad">${esc(t.subjectName)}</span></td>
                <td>${esc(t.qualifications)}</td>
                <td><strong>${t.experience} yrs</strong></td>
                <td>
                  <div>${esc(t.email)}</div>
                  <div class="cc-meta">${esc(t.mobileNumber)}</div>
                </td>
                <td>${esc(fmtDate(t.joiningDate))}</td>
                <td><span class="badge ${t.isPublic ? 'b-completed' : 'b-pending'}">${t.isPublic ? 'Public' : 'Unlisted'}</span></td>
                <td>
                  <div class="cc-actions" style="margin-top:0;">
                    <button class="btn btn-outline btn-sm" data-trms-action="view-teacher" data-id="${t.id}">View</button>
                    <button class="btn btn-outline btn-sm" data-trms-action="edit-teacher" data-id="${t.id}">Edit</button>
                    <button class="btn btn-outline btn-sm" data-trms-action="toggle-public" data-id="${t.id}">${t.isPublic ? 'Unlist' : 'List'}</button>
                    <button class="btn btn-outline btn-sm" data-trms-action="delete-teacher" data-id="${t.id}" style="color:var(--red);">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="8" class="empty">No teachers registered yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    ${trmsViewTeacherModal()}
  `;
}

function trmsSubjects() {
  trmsRequireAdmin();
  const subs = state.trmsSubjects || [];
  const teachers = state.trmsTeachers || [];
  const edit = subs.find(s => s.id === window.__trmsEditSubjectId);

  return `
    <div class="card">
      <div class="ov-head">
        <div>
          <h3>${edit ? 'Edit Subject Details' : 'Add Subject'}</h3>
          <div class="hint">Manage institutional subjects and courses for teacher mapping.</div>
        </div>
        ${edit ? `<button class="btn btn-outline btn-sm" id="trms-subject-cancel">Cancel Edit</button>` : ''}
      </div>

      <form data-trms-form="subject">
        <input type="hidden" name="subjectId" value="${edit ? esc(edit.id) : ''}">
        <div class="form-grid" style="grid-template-columns:repeat(3,1fr);">
          <div class="fg"><label for="sub-name">Subject Name</label><input id="sub-name" name="name" required maxlength="120" value="${esc(edit?.name || '')}" placeholder="e.g. Operating Systems"></div>
          <div class="fg"><label for="sub-code">Subject Code</label><input id="sub-code" name="code" required maxlength="30" value="${esc(edit?.code || '')}" placeholder="e.g. CS401"></div>
          <div class="fg"><label for="sub-date">Creation Date</label><input id="sub-date" name="creationDate" type="date" required value="${edit?.creationDate || todayISO()}"></div>
        </div>
        <div style="margin-top:10px;">
          <div class="fg"><label for="sub-desc">Subject Description / Curriculum Overview</label><textarea id="sub-desc" name="description" rows="2" maxlength="400">${esc(edit?.description || '')}</textarea></div>
        </div>
        <div class="cc-actions" style="margin-top:14px;">
          <button class="btn btn-teal" type="submit">${edit ? 'Update Subject' : 'Add Subject'}</button>
          ${edit ? `<button class="btn btn-outline" type="button" id="trms-subject-cancel-btn">Cancel</button>` : ''}
        </div>
      </form>
    </div>

    <div class="card">
      <div class="ov-head">
        <div>
          <h3>Manage Subjects (${subs.length})</h3>
          <div class="hint">Subjects configured in Teachers Management System</div>
        </div>
        <button class="btn btn-outline btn-sm" id="trms-export-subjects-btn">Export Subjects CSV</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject Name</th>
              <th>Description</th>
              <th>Creation Date</th>
              <th>Assigned Faculty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${subs.map(s => {
              const mapped = teachers.filter(t => t.subjectId === s.id || t.subjectName === s.name);
              return `
                <tr>
                  <td><strong>${esc(s.code)}</strong></td>
                  <td><strong>${esc(s.name)}</strong></td>
                  <td style="color:var(--ink-soft);max-width:320px;">${esc(s.description || '—')}</td>
                  <td>${esc(fmtDate(s.creationDate))}</td>
                  <td><span class="badge b-scheduled">${mapped.length} teacher(s)</span></td>
                  <td>
                    <div class="cc-actions" style="margin-top:0;">
                      <button class="btn btn-outline btn-sm" data-trms-action="edit-subject" data-id="${s.id}">Edit</button>
                      <button class="btn btn-outline btn-sm" data-trms-action="filter-subject" data-id="${s.id}">View Teachers</button>
                      <button class="btn btn-outline btn-sm" data-trms-action="delete-subject" data-id="${s.id}" style="color:var(--red);">Delete</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('') || '<tr><td colspan="6" class="empty">No subjects created yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function trmsQueries() {
  const queries = state.trmsQueries || [];
  const teachers = state.trmsTeachers || [];
  const subs = state.trmsSubjects || [];

  const filter = trmsQueryStatusFilter;
  const filtered = queries.filter(q => {
    if (filter !== 'all' && q.status !== filter) return false;
    if (trmsStudentLookup) {
      const qLookup = trmsStudentLookup.toLowerCase().trim();
      const match = (q.fullName + ' ' + q.email + ' ' + q.mobileNumber).toLowerCase();
      if (!match.includes(qLookup)) return false;
    }
    if (isTeacherPersona() && !trmsAdmin()) {
      const currentTeacher = teachers.find(t => t.code === currentUser.name || t.name === currentUser.name);
      if (currentTeacher && q.teacherId !== currentTeacher.id) return false;
    }
    return true;
  });

  const pending = queries.filter(q => q.status === 'pending').length;

  return `
    <div class="dash-cols">
      <div class="card">
        <h3>Submit a Query to a Teacher</h3>
        <p class="hint">Ask a subject or concept question directly to any registered faculty member.</p>
        <form data-trms-form="query">
          <div class="form-grid" style="grid-template-columns:1fr 1fr;">
            <div class="fg"><label for="q-name">Your Full Name</label><input id="q-name" name="fullName" required maxlength="80" placeholder="e.g. Bharat shotriya"></div>
            <div class="fg"><label for="q-email">Your Email Address</label><input id="q-email" name="email" type="email" required maxlength="100" placeholder="e.g. bharatshotriya426@gmail.com"></div>
            <div class="fg"><label for="q-mobile">Mobile Number</label><input id="q-mobile" name="mobileNumber" type="tel" required maxlength="30" placeholder="e.g. 9166854251"></div>
            <div class="fg"><label for="q-teacher">Select Teacher</label><select id="q-teacher" name="teacherId" required><option value="">Choose a teacher</option>${teachers.filter(t => t.isPublic).map(t => `<option value="${t.id}">${esc(t.name)} (${esc(t.subjectName)})</option>`).join('')}</select></div>
          </div>
          <div style="margin-top:10px;">
            <div class="fg"><label for="q-text">Query / Question</label><textarea id="q-text" name="query" rows="3" required maxlength="1000" placeholder="e.g. what is deadlock"></textarea></div>
          </div>
          <div class="cc-actions" style="margin-top:14px;">
            <button class="btn btn-teal" type="submit">Submit Query</button>
          </div>
        </form>
      </div>

      <div class="card">
        <h3>Query Lookup & Status</h3>
        <p class="hint">Check the feedback reply for your submitted question by entering your name or email.</p>
        <div style="display:flex;gap:8px;margin-bottom:14px;">
          <input id="trms-query-lookup-input" type="text" placeholder="Enter student name, email, or mobile..." value="${esc(trmsStudentLookup)}" style="flex:1;padding:8px 12px;border:1px solid var(--line);border-radius:6px;background:#142022;color:#fff;">
          <button class="btn btn-teal btn-sm" id="trms-query-lookup-btn">Search</button>
          ${trmsStudentLookup ? `<button class="btn btn-outline btn-sm" id="trms-query-lookup-clear">Clear</button>` : ''}
        </div>
        <div class="p-note">Total queries recorded: <strong>${queries.length}</strong> (${pending} awaiting teacher feedback).</div>
      </div>
    </div>

    <div class="card">
      <div class="ov-head">
        <div>
          <h3>Query Details & Feedback (${filtered.length})</h3>
          <div class="hint">Academic queries and teacher feedback responses</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <label style="font-size:12px;color:var(--ink-faint);">Filter Status:</label>
          <select id="trms-query-status-filter" style="padding:6px 10px;">
            <option value="all" ${filter === 'all' ? 'selected' : ''}>All Queries</option>
            <option value="pending" ${filter === 'pending' ? 'selected' : ''}>Pending (${pending})</option>
            <option value="answered" ${filter === 'answered' ? 'selected' : ''}>Answered</option>
          </select>
          <button class="btn btn-outline btn-sm" id="trms-export-queries-btn">Export Queries CSV</button>
        </div>
      </div>

      ${filtered.length ? `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${filtered.map(q => `
            <div class="class-card" style="border:1px solid var(--line);border-radius:9px;padding:16px;background:#172224;">
              <div class="cc-top" style="margin-bottom:8px;">
                <div>
                  <h4 style="font-size:15px;color:#fff;">${esc(q.fullName)} <span class="cc-meta" style="font-weight:400;">(${esc(q.email)} · ${esc(q.mobileNumber)})</span></h4>
                  <div class="cc-meta" style="margin-top:2px;">Query Date: <strong>${esc(q.queryDate)}</strong> · To Teacher: <strong>${esc(q.teacherName)}</strong> (${esc(q.subjectName)})</div>
                </div>
                <span class="badge ${q.status === 'answered' ? 'b-completed' : 'b-pending'}">${q.status === 'answered' ? 'Answered' : 'Pending Response'}</span>
              </div>

              <div style="background:#142022;border:1px solid var(--line);border-radius:6px;padding:12px;margin:10px 0;">
                <div class="cc-meta" style="font-weight:700;color:var(--teal-dark);margin-bottom:4px;">STUDENT QUERY:</div>
                <div style="font-size:13.5px;color:#fff;line-height:1.4;">${esc(q.query)}</div>
              </div>

              ${q.status === 'answered' ? `
                <div style="background:#193E37;border:1px solid var(--teal);border-radius:6px;padding:12px;margin-top:10px;">
                  <div class="cc-meta" style="font-weight:700;color:var(--teal-dark);margin-bottom:4px;">TEACHER FEEDBACK (Replied by ${esc(q.repliedBy || 'Teacher')} on ${esc(q.repliedAt)}):</div>
                  <div style="font-size:13.5px;color:#E6EFED;line-height:1.5;">${esc(q.reply)}</div>
                </div>
              ` : `
                ${(trmsAdmin() || isTeacherPersona()) ? `
                  <form data-trms-form="reply" style="margin-top:12px;border-top:1px dashed var(--line);padding-top:10px;">
                    <input type="hidden" name="queryId" value="${q.id}">
                    <div class="fg">
                      <label style="font-size:11.5px;color:var(--ink-faint);text-transform:uppercase;font-weight:700;">Submit Teacher Feedback / Reply</label>
                      <textarea name="reply" rows="2" required maxlength="1500" placeholder="Type your answer or feedback to this query..."></textarea>
                    </div>
                    <div class="cc-actions" style="margin-top:8px;">
                      <button class="btn btn-teal btn-sm" type="submit">Submit Feedback & Resolve</button>
                    </div>
                  </form>
                ` : `
                  <div class="geo-note" style="color:var(--amber);margin-top:6px;">Waiting for teacher reply.</div>
                `}
              `}
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty">No queries match the selected filter.</div>
      `}
    </div>
  `;
}

function trmsReports() {
  const teachers = state.trmsTeachers || [];
  const subs = state.trmsSubjects || [];

  const from = trmsReportFrom, to = trmsReportTo;
  const filtered = teachers.filter(t => {
    const d = t.joiningDate || t.regDate || '';
    if (from && d < from) return false;
    if (to && d > to) return false;
    if (trmsSubjectFilter && t.subjectId !== trmsSubjectFilter && t.subjectName !== trmsSubjectFilter) return false;
    if (trmsExpFilter && t.experience < Number(trmsExpFilter)) return false;
    return true;
  });

  const avgExp = filtered.length ? (filtered.reduce((n, t) => n + t.experience, 0) / filtered.length).toFixed(1) : 0;
  const phdCount = filtered.filter(t => (t.qualifications || '').toLowerCase().includes('ph.d')).length;

  return `
    <div class="card">
      <div class="ov-head">
        <div>
          <h3>Teacher Analytics & Institutional Reports</h3>
          <div class="hint">Filter teacher records by date range, subject, and qualification level.</div>
        </div>
        <button class="btn btn-teal btn-sm" id="trms-export-report-btn">⬇ Export Report CSV</button>
      </div>

      <div class="grid-toolbar">
        <label for="trms-rep-from" style="font-size:12px;">Joining Date From:</label>
        <input id="trms-rep-from" type="date" value="${esc(from)}">
        <label for="trms-rep-to" style="font-size:12px;">To:</label>
        <input id="trms-rep-to" type="date" value="${esc(to)}">
        <label for="trms-rep-sub" style="font-size:12px;">Subject:</label>
        <select id="trms-rep-sub">
          <option value="">All Subjects</option>
          ${subs.map(s => `<option value="${s.id}" ${trmsSubjectFilter === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
        </select>
        <button class="btn btn-outline btn-sm" id="trms-rep-reset">Reset Filters</button>
      </div>

      <div class="kpi-grid" style="margin-top:14px;">
        ${kpiCard('Filtered Faculty', String(filtered.length), 'Matching reporting criteria', '', 'var(--teal)')}
        ${kpiCard('Average Experience', avgExp + ' Years', 'Calculated across filtered cohort', '', 'var(--amber)')}
        ${kpiCard('Doctorate Holders', String(phdCount), 'Ph.D faculty in this selection', '', 'var(--indigo)')}
        ${kpiCard('Publicly Searchable', String(filtered.filter(t => t.isPublic).length), 'Available in online search', '', 'var(--green)')}
      </div>

      <div class="table-wrap" style="margin-top:16px;">
        <table>
          <thead>
            <tr>
              <th>Teacher Name</th>
              <th>Assigned Subject</th>
              <th>Qualifications</th>
              <th>Experience</th>
              <th>Joining Date</th>
              <th>Contact Email</th>
              <th>Mobile</th>
              <th>Public Listing</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(t => `
              <tr>
                <td><strong>${esc(t.name)}</strong></td>
                <td><span class="tpill tp-acad">${esc(t.subjectName)}</span></td>
                <td>${esc(t.qualifications)}</td>
                <td><strong>${t.experience} yrs</strong></td>
                <td>${esc(fmtDate(t.joiningDate))}</td>
                <td>${esc(t.email)}</td>
                <td>${esc(t.mobileNumber)}</td>
                <td><span class="badge ${t.isPublic ? 'b-completed' : 'b-pending'}">${t.isPublic ? 'Yes' : 'No'}</span></td>
              </tr>
            `).join('') || '<tr><td colspan="8" class="empty">No teachers match this date and subject range.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function trmsDiagrams() {
  return `
    <div class="card">
      <div class="ov-head">
        <div>
          <h3>System Architecture & Design Diagrams</h3>
          <div class="hint">Exact UML Use Case and Entity-Relationship diagrams from the research paper (Ayushi Ghill et al., May 2023)</div>
        </div>
        <span class="badge b-completed">TRMS Architecture</span>
      </div>

      <div class="dash-cols" style="align-items:stretch;">
        <div class="card" style="margin-bottom:0;background:#142022;">
          <h4 style="color:var(--teal-dark);margin-bottom:10px;">FIG 1: ER DIAGRAM (Entity Relationship)</h4>
          <p class="hint">Entities, attributes, and relational cardinalities implemented in TRMS.</p>
          <div style="background:#101819;border:1px solid var(--line);border-radius:8px;padding:16px;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.7;">
            <div style="color:var(--amber);">[ADMIN ENTITY]</div>
            <div>├── AdminName</div>
            <div>├── UserName (Login ID)</div>
            <div>├── MobileNumber</div>
            <div>├── Email</div>
            <div>├── Password (Encrypted)</div>
            <div>└── AdminRegdate</div>
            <div style="color:var(--teal);margin:8px 0;">│ (Adds 1:N) ▼</div>
            <div style="color:var(--indigo);">[SUBJECT ENTITY]</div>
            <div>├── ID (Primary Key)</div>
            <div>├── Subject Name</div>
            <div>├── Subject Code</div>
            <div>└── CreationDate</div>
            <div style="color:var(--teal);margin:8px 0;">│ (Belongs to 1:N) ▼</div>
            <div style="color:var(--green);">[TEACHER ENTITY]</div>
            <div>├── ID (Primary Key)</div>
            <div>├── Name</div>
            <div>├── Picture (Avatar)</div>
            <div>├── Email & MobileNumber</div>
            <div>├── Qualifications</div>
            <div>├── Address</div>
            <div>├── TeacherSub (Foreign Key → Subject)</div>
            <div>├── JoiningDate & RegDate</div>
            <div>└── isPublic</div>
            <div style="color:var(--rose);margin:8px 0;">▲ (Query / Feedback 1:N)</div>
            <div style="color:var(--amber);">[USERS / STUDENTS]</div>
            <div>├── Search Teacher Online (by Subject or Name)</div>
            <div>└── Submit Query → Receive Teacher Feedback</div>
          </div>
        </div>

        <div class="card" style="margin-bottom:0;background:#142022;">
          <h4 style="color:var(--teal-dark);margin-bottom:10px;">FIG 2: USE CASE DIAGRAM</h4>
          <p class="hint">Interactions between Admin, Teachers, Students, and System modules.</p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${[
              ['Dashboard', 'View real-time KPIs (Total Subjects, Registered Teachers, Public status, Queries).'],
              ['Add Subject', 'Register new academic subject with code and syllabus overview.'],
              ['Manage Subject', 'Update subject details, inspect mapped faculty, or remove subjects.'],
              ['Add Teacher', 'Store faculty records including picture, qualifications, experience, and contact.'],
              ['Manage Teacher', 'Update teacher profile, toggle public directory status, or archive.'],
              ['Search Teacher', 'Public/User online lookup by teacher name or subject with instant filtering.'],
              ['Query Page', 'Students ask questions directly to teachers; teachers supply feedback replies.'],
              ['Generate Reports', 'Date-range filtered administrative and faculty analytics with CSV export.'],
              ['User Authentication', 'Role switching between Admin, Teacher, and Public Student portal.'],
              ['Workflow Management', 'Data validation, CRUD routines, and localized persistent browser storage.']
            ].map(([uc, desc]) => `
              <div style="background:#172224;border:1px solid var(--line);border-radius:6px;padding:8px 12px;display:flex;align-items:center;gap:10px;">
                <span class="badge b-scheduled" style="flex:none;min-width:130px;justify-content:center;">${uc}</span>
                <span style="font-size:12px;color:var(--ink-soft);">${desc}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:16px;">
        <h4>Section IV: Algorithms Employed in TRMS</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:10px;">
          <div style="background:#142022;border:1px solid var(--line);border-radius:8px;padding:12px;">
            <strong style="color:var(--teal-dark);">A. Database Algorithms</strong>
            <p class="hint" style="margin-top:4px;">Normalized key indexing and relational retrieval linking Teachers with Subjects and Queries.</p>
          </div>
          <div style="background:#142022;border:1px solid var(--line);border-radius:8px;padding:12px;">
            <strong style="color:var(--amber);">B. Sorting Algorithms</strong>
            <p class="hint" style="margin-top:4px;">Multi-criteria sorting (by faculty name, teaching experience, and joining dates) for performant display.</p>
          </div>
          <div style="background:#142022;border:1px solid var(--line);border-radius:8px;padding:12px;">
            <strong style="color:var(--indigo);">C. Data Validation & Security</strong>
            <p class="hint" style="margin-top:4px;">Input validation on mobile numbers, email formatting, and boundary protection for experience values.</p>
          </div>
          <div style="background:#142022;border:1px solid var(--line);border-radius:8px;padding:12px;">
            <strong style="color:var(--green);">D. Search Algorithms</strong>
            <p class="hint" style="margin-top:4px;">Instant multi-token substring search across teacher names, subject titles, and qualifications.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function trmsRequireAdmin() {
  if (!trmsAdmin()) throw Error('This action is restricted to the Principal / Coordinator (Admin) view.');
}

function renderTrms() {
  return `
    <div class="sms-tabs" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px;">
      ${Object.entries(trmsTabs).map(([k, label]) => {
        if (!trmsAdmin() && (k === 'teachers' || k === 'subjects')) return '';
        const active = trmsTab === k;
        return `<button class="btn ${active ? 'btn-teal' : 'btn-outline'}" data-trms-tab="${k}">${label}</button>`;
      }).join('')}
    </div>
    ${({
      overview: trmsOverview,
      search: trmsSearch,
      teachers: trmsTeachers,
      subjects: trmsSubjects,
      queries: trmsQueries,
      reports: trmsReports,
      diagrams: trmsDiagrams
    }[trmsTab] || trmsOverview)()}
  `;
}

const trmsBodyBase = renderBody;
renderBody = function() {
  if (currentUser.role === 'trms') return renderTrms();
  return trmsBodyBase();
};

async function trmsAction(action, id) {
  try {
    if (action === 'view-teacher') {
      trmsViewTeacherId = id;
      render();
      return;
    }
    if (action === 'ask-teacher') {
      trmsViewTeacherId = null;
      trmsTab = 'queries';
      render();
      const select = document.getElementById('q-teacher');
      if (select) select.value = id;
      const formCard = document.querySelector('[data-trms-form="query"]');
      if (formCard && formCard.scrollIntoView) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (action === 'edit-teacher') {
      trmsRequireAdmin();
      window.__trmsEditTeacherId = id;
      render();
      return;
    }
    if (action === 'toggle-public') {
      trmsRequireAdmin();
      await trmsMutate('Toggled teacher public status', () => {
        const t = (state.trmsTeachers || []).find(x => x.id === id);
        if (t) t.isPublic = !t.isPublic;
      });
      return;
    }
    if (action === 'delete-teacher') {
      trmsRequireAdmin();
      const t = (state.trmsTeachers || []).find(x => x.id === id);
      if (t && confirm(`Remove ${t.name} from the teachers directory?`)) {
        await trmsMutate('Deleted teacher ' + t.name, () => {
          state.trmsTeachers = state.trmsTeachers.filter(x => x.id !== id);
        });
      }
      return;
    }
    if (action === 'edit-subject') {
      trmsRequireAdmin();
      window.__trmsEditSubjectId = id;
      render();
      return;
    }
    if (action === 'filter-subject') {
      trmsSubjectFilter = id;
      trmsTab = 'search';
      render();
      return;
    }
    if (action === 'delete-subject') {
      trmsRequireAdmin();
      const s = (state.trmsSubjects || []).find(x => x.id === id);
      if (s) {
        const linked = (state.trmsTeachers || []).filter(t => t.subjectId === id || t.subjectName === s.name);
        if (linked.length) {
          showToast(`Cannot delete: ${linked.length} teacher(s) are mapped to this subject. Reassign them first.`);
          return;
        }
        if (confirm(`Delete subject "${s.name}"?`)) {
          await trmsMutate('Deleted subject ' + s.name, () => {
            state.trmsSubjects = state.trmsSubjects.filter(x => x.id !== id);
          });
        }
      }
      return;
    }
  } catch (e) {
    showToast(e.message);
  }
}

async function trmsSubmit(kind, form) {
  const v = Object.fromEntries(new FormData(form).entries());
  for (const k in v) if (typeof v[k] === 'string') v[k] = v[k].trim();

  let pictureData = null;
  const fileInput = form.querySelector('input[type="file"]');
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    if (file.size > 1024 * 1024) { showToast('Profile photo must be under 1 MB.'); return; }
    pictureData = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(Error('Could not read photo.'));
      r.readAsDataURL(file);
    });
  }

  await trmsMutate('Saved ' + kind, () => {
    if (kind === 'teacher') {
      trmsRequireAdmin();
      if (!v.name || !v.email || !v.mobileNumber || !v.subjectId) throw Error('Please fill in Name, Email, Mobile, and Subject.');
      const sub = (state.trmsSubjects || []).find(s => s.id === v.subjectId);
      if (!sub) throw Error('Selected subject does not exist.');

      const isPublic = form.querySelector('input[name="isPublic"]')?.checked ?? true;
      const experience = Math.max(0, Number(v.experience) || 0);

      if (v.teacherId) {
        const t = (state.trmsTeachers || []).find(x => x.id === v.teacherId);
        if (!t) throw Error('Teacher record not found.');
        Object.assign(t, {
          name: v.name, code: v.code || t.code, email: v.email, mobileNumber: v.mobileNumber,
          address: v.address || '', qualifications: v.qualifications || '', experience,
          subjectId: sub.id, subjectName: sub.name, description: v.description || '',
          joiningDate: v.joiningDate || t.joiningDate, isPublic,
          picture: pictureData || t.picture
        });
        window.__trmsEditTeacherId = null;
      } else {
        const id = 'TEA-' + String((state.trmsTeachers || []).length + 1).padStart(3, '0');
        const code = v.code || v.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4);
        state.trmsTeachers.push({
          id, code, name: v.name, email: v.email, mobileNumber: v.mobileNumber,
          address: v.address || '', qualifications: v.qualifications || '', experience,
          subjectId: sub.id, subjectName: sub.name, description: v.description || '',
          joiningDate: v.joiningDate || todayISO(), regDate: todayISO(), isPublic,
          picture: pictureData
        });
      }
    }
    else if (kind === 'subject') {
      trmsRequireAdmin();
      if (!v.name || !v.code) throw Error('Subject name and code are required.');
      if (v.subjectId) {
        const s = (state.trmsSubjects || []).find(x => x.id === v.subjectId);
        if (!s) throw Error('Subject not found.');
        s.name = v.name; s.code = v.code; s.description = v.description || '';
        if (v.creationDate) s.creationDate = v.creationDate;
        window.__trmsEditSubjectId = null;
      } else {
        if ((state.trmsSubjects || []).some(s => s.code.toLowerCase() === v.code.toLowerCase())) {
          throw Error('A subject with this code already exists.');
        }
        const id = 'SUB-' + String((state.trmsSubjects || []).length + 101);
        state.trmsSubjects.push({
          id, code: v.code, name: v.name,
          description: v.description || '',
          creationDate: v.creationDate || todayISO()
        });
      }
    }
    else if (kind === 'query') {
      if (!v.fullName || !v.email || !v.mobileNumber || !v.query || !v.teacherId) {
        throw Error('Please fill all query fields.');
      }
      const t = (state.trmsTeachers || []).find(x => x.id === v.teacherId);
      if (!t) throw Error('Selected teacher not found.');

      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      state.trmsQueries.unshift({
        id: 'QRY-' + String((state.trmsQueries || []).length + 1).padStart(3, '0'),
        fullName: v.fullName, email: v.email, mobileNumber: v.mobileNumber,
        teacherId: t.id, teacherName: t.name, subjectName: t.subjectName,
        queryDate: dateStr, query: v.query, reply: '', repliedAt: null, repliedBy: null, status: 'pending'
      });
      showToast('Query submitted to ' + t.name + '! You can view feedback here.', 5000);
    }
    else if (kind === 'reply') {
      if (!v.queryId || !v.reply) throw Error('Please provide reply feedback.');
      const q = (state.trmsQueries || []).find(x => x.id === v.queryId);
      if (!q) throw Error('Query record not found.');

      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      q.reply = v.reply;
      q.repliedAt = dateStr;
      q.repliedBy = trmsActor();
      q.status = 'answered';
      showToast('Feedback reply sent to student.', 4000);
    }
  });
}

function trmsCSV(filename, rows) {
  const safe = v => /^[=+@\-\t\r]/.test(String(v ?? '')) ? "'" + v : v ?? '';
  downloadBlob(filename + '.csv', toCSV(rows.map(r => r.map(safe))), 'text/csv;charset=utf-8');
}

const trmsHandlersBase = attachHandlers;
attachHandlers = function() {
  trmsHandlersBase();

  document.querySelectorAll('[data-trms-tab]').forEach(b => b.onclick = () => {
    trmsTab = b.dataset.trmsTab;
    render();
  });

  document.querySelectorAll('[data-trms-action]').forEach(b => b.onclick = async () => {
    if (b.disabled) return;
    b.disabled = true;
    try {
      await trmsAction(b.dataset.trmsAction, b.dataset.id);
    } finally {
      b.disabled = false;
    }
  });

  document.querySelectorAll('[data-trms-form]').forEach(f => f.onsubmit = async e => {
    e.preventDefault();
    const btn = f.querySelector('button[type="submit"]');
    if (btn && btn.disabled) return;
    if (btn) btn.disabled = true;
    try {
      await trmsSubmit(f.dataset.trmsForm, f);
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  const searchInput = document.getElementById('trms-search-input');
  if (searchInput) {
    searchInput.onkeydown = e => {
      if (e.key === 'Enter') {
        trmsSearchQuery = searchInput.value;
        render();
      }
    };
  }
  const searchBtn = document.getElementById('trms-search-btn');
  if (searchBtn) {
    searchBtn.onclick = () => {
      const inp = document.getElementById('trms-search-input');
      trmsSearchQuery = inp ? inp.value : '';
      render();
    };
  }
  const searchReset = document.getElementById('trms-search-reset');
  if (searchReset) {
    searchReset.onclick = () => {
      trmsSearchQuery = '';
      trmsSubjectFilter = '';
      trmsExpFilter = '';
      render();
    };
  }

  const subFilter = document.getElementById('trms-subject-filter');
  if (subFilter) subFilter.onchange = e => { trmsSubjectFilter = e.target.value; render(); };

  const expFilter = document.getElementById('trms-exp-filter');
  if (expFilter) expFilter.onchange = e => { trmsExpFilter = e.target.value; render(); };

  const modalClose = document.getElementById('trms-modal-close');
  if (modalClose) modalClose.onclick = () => { trmsViewTeacherId = null; render(); };
  const modalCloseBtn = document.getElementById('trms-modal-close-btn');
  if (modalCloseBtn) modalCloseBtn.onclick = () => { trmsViewTeacherId = null; render(); };
  const backdrop = document.getElementById('trms-modal-backdrop');
  if (backdrop) backdrop.onclick = e => { if (e.target === backdrop) { trmsViewTeacherId = null; render(); } };

  const tCancel = document.getElementById('trms-teacher-cancel');
  if (tCancel) tCancel.onclick = () => { window.__trmsEditTeacherId = null; render(); };
  const tCancelBtn = document.getElementById('trms-teacher-cancel-btn');
  if (tCancelBtn) tCancelBtn.onclick = () => { window.__trmsEditTeacherId = null; render(); };

  const sCancel = document.getElementById('trms-subject-cancel');
  if (sCancel) sCancel.onclick = () => { window.__trmsEditSubjectId = null; render(); };
  const sCancelBtn = document.getElementById('trms-subject-cancel-btn');
  if (sCancelBtn) sCancelBtn.onclick = () => { window.__trmsEditSubjectId = null; render(); };

  const expTeachers = document.getElementById('trms-export-teachers-btn');
  if (expTeachers) expTeachers.onclick = () => {
    const rows = [['ID', 'Faculty Code', 'Name', 'Subject', 'Qualifications', 'Experience (Years)', 'Email', 'Mobile', 'Joining Date', 'Listed Public']];
    (state.trmsTeachers || []).forEach(t => {
      rows.push([t.id, t.code || '', t.name, t.subjectName, t.qualifications, t.experience, t.email, t.mobileNumber, t.joiningDate, t.isPublic ? 'Yes' : 'No']);
    });
    trmsCSV('TRMS-teachers-directory', rows);
  };

  const expSubjects = document.getElementById('trms-export-subjects-btn');
  if (expSubjects) expSubjects.onclick = () => {
    const rows = [['Code', 'Subject Name', 'Description', 'Creation Date']];
    (state.trmsSubjects || []).forEach(s => rows.push([s.code, s.name, s.description, s.creationDate]));
    trmsCSV('TRMS-subjects-list', rows);
  };

  const qLookupInp = document.getElementById('trms-query-lookup-input');
  if (qLookupInp) {
    qLookupInp.onkeydown = e => {
      if (e.key === 'Enter') {
        trmsStudentLookup = qLookupInp.value;
        render();
      }
    };
  }
  const qLookupBtn = document.getElementById('trms-query-lookup-btn');
  if (qLookupBtn) {
    qLookupBtn.onclick = () => {
      const inp = document.getElementById('trms-query-lookup-input');
      trmsStudentLookup = inp ? inp.value : '';
      render();
    };
  }
  const qLookupClear = document.getElementById('trms-query-lookup-clear');
  if (qLookupClear) {
    qLookupClear.onclick = () => {
      trmsStudentLookup = '';
      render();
    };
  }

  const qStatusFilter = document.getElementById('trms-query-status-filter');
  if (qStatusFilter) qStatusFilter.onchange = e => { trmsQueryStatusFilter = e.target.value; render(); };

  const expQueries = document.getElementById('trms-export-queries-btn');
  if (expQueries) expQueries.onclick = () => {
    const rows = [['Query ID', 'Student Name', 'Email', 'Mobile', 'Subject', 'Teacher', 'Query Date', 'Question', 'Status', 'Feedback Reply', 'Replied Date', 'Replied By']];
    (state.trmsQueries || []).forEach(q => {
      rows.push([q.id, q.fullName, q.email, q.mobileNumber, q.subjectName, q.teacherName, q.queryDate, q.query, q.status, q.reply || '', q.repliedAt || '', q.repliedBy || '']);
    });
    trmsCSV('TRMS-student-queries', rows);
  };

  const rFrom = document.getElementById('trms-rep-from');
  if (rFrom) rFrom.onchange = e => { trmsReportFrom = e.target.value; render(); };
  const rTo = document.getElementById('trms-rep-to');
  if (rTo) rTo.onchange = e => { trmsReportTo = e.target.value; render(); };
  const rSub = document.getElementById('trms-rep-sub');
  if (rSub) rSub.onchange = e => { trmsSubjectFilter = e.target.value; render(); };
  const rReset = document.getElementById('trms-rep-reset');
  if (rReset) rReset.onclick = () => { trmsReportFrom = ''; trmsReportTo = todayISO(); trmsSubjectFilter = ''; trmsExpFilter = ''; render(); };

  const rExp = document.getElementById('trms-export-report-btn');
  if (rExp) rExp.onclick = () => {
    const from = trmsReportFrom, to = trmsReportTo;
    const filtered = (state.trmsTeachers || []).filter(t => {
      const d = t.joiningDate || t.regDate || '';
      if (from && d < from) return false;
      if (to && d > to) return false;
      if (trmsSubjectFilter && t.subjectId !== trmsSubjectFilter && t.subjectName !== trmsSubjectFilter) return false;
      if (trmsExpFilter && t.experience < Number(trmsExpFilter)) return false;
      return true;
    });
    const rows = [['Teacher Name', 'Faculty Code', 'Assigned Subject', 'Qualifications', 'Experience (Years)', 'Joining Date', 'Email', 'Mobile', 'Address', 'Public Listed']];
    filtered.forEach(t => rows.push([t.name, t.code || '', t.subjectName, t.qualifications, t.experience, t.joiningDate, t.email, t.mobileNumber, t.address, t.isPublic ? 'Yes' : 'No']));
    trmsCSV('TRMS-faculty-report', rows);
  };
};
