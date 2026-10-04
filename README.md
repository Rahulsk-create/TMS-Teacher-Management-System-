# TMS online — administrator-controlled staff access

This is the server-backed version of TMS. It preserves the teacher/student interface and replaces browser-local accounts and data storage with server sessions, server permission checks and a persistent SQLite database.

**Prepared for deployment; not hosted yet.** The original standalone HTML edition remains separate. Do not open `public/index.html` directly: it requires this server. GitHub Pages cannot run this application.

## Account rules

- No public signup, registration or web-based first-administrator setup.
- The owner creates the initial administrator using the server console.
- Only administrators create staff User IDs and initial passwords.
- Roles: administrator, coordinator, teacher and mentor.
- Teachers must map to an existing teacher record. They receive only their assigned sessions and students, excluding student medical and guardian details.
- Mentors receive teacher attendance for review, not student profiles or financial data.
- Coordinators manage institutional records but cannot manage user accounts.
- New and reset staff passwords must be changed before accessing records.
- Administrator disable/reset actions immediately revoke that account’s existing sessions. Self-service password changes also revoke other sessions.

## Local verification

Install Node.js 24 LTS (24.15 or later within the 24.x series).

```sh
node admin.mjs
node server.mjs
```

The console asks for the initial administrator User ID, display name and password. Password entry is hidden. There are no default credentials. Open **http://127.0.0.1:3000** and sign in.

The server starts with an empty institutional database. Configure centres, programs, batches and teachers in Admin setup, then create staff accounts under **User accounts**. Existing browser-local accounts are not copied to the server.

```sh
node --test tests/security.test.mjs
```

No npm packages are required by the server. Node's built-in SQLite module stores records in `data/tms.sqlite` by default. SQLite WAL files must remain alongside the database.

## Deploy on a host with persistent storage

Use a host that runs a long-lived Node.js process or Docker container and provides a persistent writable disk. This package is designed for one application instance, not a multi-instance or ephemeral serverless deployment.

1. Upload this folder to a private source repository or your hosting service. Do not upload the `data` directory, environment files, database files, passwords or private backups.
2. Attach a persistent disk at `/data`. The application user must be able to write there. For this Docker image the user is `node` (UID 1000).
3. Set `NODE_ENV=production`, `DATA_DIR=/data`, `HOST=0.0.0.0` and `PORT=3000`.
4. Set `APP_ORIGIN` to the exact HTTPS public origin, for example `https://tms.your-school.example`, without a trailing slash. Use your actual address, not the example.
5. Let the host terminate HTTPS and proxy requests to port 3000. Restrict direct access to the application port. Production startup rejects a non-HTTPS public origin.
6. Run `node admin.mjs` in the host's console **with the same DATA_DIR and persistent disk**. This console command is the only initial-administrator creation path.
7. Start the server using `node server.mjs` or build and run the included Dockerfile. Health check: `GET /health`.
8. Verify HTTPS sign-in, staff password changes, role restrictions, logout and account disabling on the real deployment before inviting staff.

If using Docker directly:

```sh
docker build -t tms-online .
docker volume create tms-data
docker run --rm -it -v tms-data:/data -e DATA_DIR=/data tms-online node admin.mjs
docker run --name tms -d --restart unless-stopped \
  -p 127.0.0.1:3000:3000 -v tms-data:/data \
  -e APP_ORIGIN=https://YOUR-ACTUAL-HOSTNAME \
  tms-online
```

The Docker example assumes an HTTPS reverse proxy on the same machine. It does not create a domain, TLS certificate, cloud account or proxy automatically.

## Password recovery and backups

An administrator resets staff passwords from **User accounts**. For a lost administrator password, a trusted server operator runs `node admin.mjs reset` in the same database environment. This revokes existing sessions; it does not delete institutional records.

Configure encrypted persistent storage and restricted host-console access. Establish database backups and test restoration. Stop the application before making a filesystem copy of the database and its WAL files, or use a SQLite-consistent backup mechanism. Protect backups: they contain student information, password hashes and audit records. Do not put them into GitHub. No automatic backup or recovery service is included.

## Implemented controls

- Salted scrypt password hashes; plaintext passwords are not stored.
- Random eight-hour sessions, with only a hash of each session token stored in the database.
- HttpOnly, SameSite=Strict cookies; Secure and `__Host-` cookies on HTTPS.
- Exact-origin checks and per-session CSRF tokens on authenticated mutations.
- Login attempt limits, bounded password-hash concurrency and request-size limits.
- Server filtering and write authorization for teachers and mentors; server-stamped teacher entry/exit times and mentor decisions.
- Revision checks prevent silent overwrites when another session changes records.
- Audit events are written by the server, not accepted from the client. A trusted server/database operator can still modify them; this is not immutable external audit storage.
- CSP nonces, no third-party executable scripts, no framing and no cached API responses.

## Current boundaries

- CSV imports are supported. The hosted package deliberately excludes the standalone edition's remote Excel script; save Excel files as CSV for import.
- Payments remain manual entries and messages remain drafts. There is no payment gateway, email/SMS delivery, LMS integration or biometric connection.
- Teachers' browser-reported location is checked for distance but is not proof against device location spoofing.
- No MFA, automated email recovery, identity verification, legal compliance certification or independent security audit is included.
- The legacy screen logic and business validations need institution-specific acceptance testing. The included tests focus on authentication, data scoping, write restrictions and session revocation; they do not prove that every administrative workflow is correct.
- Records are encrypted in transit when deployed behind HTTPS. At-rest protection, backups, monitoring, patching and operating procedures are hosting responsibilities.
- The single SQLite record snapshot is suitable for an initial small deployment, not a high-concurrency institutional service. Requests are limited to 8 MB for record saves and 16 KB for account actions.

Technical references: [Node.js 24 SQLite](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html) and [Node.js cryptography](https://nodejs.org/api/crypto.html).

## Teacher-management reference update

The staff-only Teacher directory now supports subject filtering, professional profiles, qualifications, experience, joining dates and directory exports. Management can assign subjects and reply to internal queries. Other staff receive only public professional profile fields; private contact fields are returned only to management and the relevant teacher. Teacher and mentor query submissions are stamped with server identity, and only management can reply or resolve them. These additions were informed by the user-supplied IARJSET-ICMART-28 paper (ICMART-2023, printed pages 173–179). See REFERENCE.md for attribution and the scope mapping.
