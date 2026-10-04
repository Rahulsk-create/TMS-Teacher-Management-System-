# TMS — Teacher Management System

A standalone HTML application for teacher scheduling, attendance, mentor reviews and student administration. Includes a navy blue and gold theme and responsive layouts.

## Run locally

Download `index.html` and open it in a modern browser. No build or installation is required. Keep using the same browser and file location to retain access to saved records. Data is stored in browser localStorage, not in this repository.

External fonts and the Excel import library load from Google Fonts and cdnjs. CSV import works without the Excel library. Classroom session check-in uses browser location permission; configure centre coordinates first, and note that browser restrictions may require serving the page from localhost or HTTPS for location access.

## Features

- Principal/coordinator: teacher setup, programs, batches, classrooms, individual and recurring timetables, bulk schedule import and change approvals.
- Teachers: personal timetable, entry/exit timestamps and requests.
- Mentors: approve or reject recorded teacher attendance with review notes.
- Students: register, batch mapping, guardian contacts, CSV/Excel import and daily attendance.
- Student operations: profiles, academic history, progress notes, application documents, waitlists and enrollment into student records.
- Assessments and progress exports; exam scheduling checks room and cohort clashes at creation time.
- INR fee invoices, installment invoices, manual payment recording, balance calculations and downloadable payment acknowledgments.
- Communication drafts and deduplicated absence alert drafts; no automatic sending.
- Date-filtered attendance and academic reports, local activity records and JSON backup export.

## Suggested workflow

1. On first use, create an administrator account with your own User ID and password (10–128 characters). There are no default credentials. Use **User accounts** to add staff, map teachers, disable accounts or reset passwords.
2. Set up programs, batches, teachers and rooms under **Admin**. Initial timetable entries are sample data.
3. Add or import students under **Student management**. Import template columns are Admission number, Student name, Program, Batch and Guardian contact. Program/batch names must already exist and match uniquely.
4. Open **Student operations** for admissions, profiles, grades, exams, fees, communication drafts and reports.
5. Sign out and sign in with a teacher account to view assigned classes and students, or a mentor account to review teacher entry/exit records.

Batch strength is used as enrollment capacity when processing applications. Supporting documents are limited to one PDF, PNG or JPEG per application, up to 250 KB. Browser storage capacity is limited; export backups regularly. Backup restoration is not implemented.

## Important local-edition limitations

This is a local prototype, not a production student information service:

- Browser-local sign-in gates the UI and maps each account to its role. Passwords use salted PBKDF2-SHA-256 hashes (210,000 iterations). This is not server authentication: someone with browser storage or developer-tool access can bypass it. There is no server-enforced authorization, encryption at rest or tamper-proof audit log.
- Devices do not share records. Publicly hosting this HTML does not create shared storage or real staff, parent or student accounts.
- Use sample data for sensitive medical, safeguarding and identity-document fields until secure storage is implemented.
- No online payments, tax receipt generation, RFID/biometric integration, LMS/HR/finance API connection or outbound messaging is configured.
- Payments are manually recorded; receipts are payment acknowledgments, not tax receipts.
- Waitlisting uses configured capacity; promotion is manual. Exams are manually scheduled, not automatically optimized.
- No GDPR or FERPA compliance certification is claimed.

No browser-saved student records, application documents, private backups or credentials are included in this source repository.

## Checks

With Node.js installed, run from the repository root:

```sh
node tests/check.cjs
node tests/sms-check.cjs
node tests/login-check.cjs
```

These checks run application logic with a simulated browser environment. They cover teacher attendance, mentor review, student scoping and persistence, enrollment capacity, grade bounds, payment balance precision, overpayment rejection, absence draft deduplication and exam clash checks. They do not replace real-browser UI testing.

## Local account storage

Accounts are saved separately from student records in this browser. Sign-in is required after a reload. User IDs are case-insensitive; passwords are case-sensitive. Existing operational records are retained when first creating an account. Administrators can reset staff passwords; there is no administrator password-recovery service. JSON data backups do not include account password hashes. Do not clear browser storage to recover a password, as doing so can remove operational data.
