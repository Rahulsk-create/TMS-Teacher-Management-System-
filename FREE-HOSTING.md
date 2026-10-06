# Free hosting: Render + Turso

Use Render Free compute with NO persistent disk and Turso Free. Do not enable paid upgrades or overages. Free hosting has usage limits and Render sleeps when idle.

The root Dockerfile.render builds TMS-online.zip and installs the pinned dependencies. Keep that archive updated when changing server code. Deployment uses the Render HTTPS URL automatically unless APP_ORIGIN is explicitly set.

Set these in Render > Environment, never in GitHub:
- TURSO_DATABASE_URL=libsql://tms-rahulsk-create.aws-ap-south-1.turso.io
- TURSO_AUTH_TOKEN: a private read/write token for the tms database only
- INITIAL_ADMIN_USER=ADMIN
- INITIAL_ADMIN_PASSWORD: a NEW private password of 12–128 characters, entered by the owner

The initial account is created only when the database has no users. It must change its password at first login. Remove INITIAL_ADMIN_PASSWORD after successful setup; it cannot reset an existing account. Existing users must use administrator reset or the local admin.mjs console with the same database credentials.

The Render service refuses to start without Turso configuration, preventing accidental use of temporary local storage. Outside Render, local SQLite remains supported. Existing SQLite data is NOT migrated automatically; export and migrate it before changing a service that already contains real records.

The cloud bridge serializes database operations to preserve existing transaction boundaries. It is intended for a small deployment, not high traffic. A timeout closes the connection and requires a restart; uncertain writes are not retried automatically. Tokens stay on the server. All browser access still uses TMS authentication and authorization.

Checks: existing security and ERP tests pass; libSQL local compatibility tests verify rollback, parameter binding and reconnect persistence; bootstrap tests verify one-time account creation. A live cloud connection test remains required after credentials are configured.

Open the Render service URL for login, not GitHub Pages. Outgoing email still needs its separate provider setup. Keep independent database exports/backups and monitor the providers' free-plan limits.
