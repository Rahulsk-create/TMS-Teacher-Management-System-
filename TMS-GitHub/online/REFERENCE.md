# Reference incorporated into TMS

**Source:** Ayushi Ghill, Yashraj Singh Chundawat, Bharat Shotriya, Aafreen Shaikh, Karan Tejsingh Devda and Sanjay Damor, “Teachers Management System,” IARJSET, Vol. 10, Special Issue 2, ICMART-2023, May 2023, printed pages 173–179. User-provided file: `IARJSET-ICMART-28.pdf`. The paper states a Creative Commons Attribution 4.0 license.

The seven-page paper was reviewed, including its ER/use-case diagrams and interface screenshots. Its functional ideas informed the additions below; its source code, screenshots and personal details were not copied into TMS.

| Reference area | TMS treatment |
|---|---|
| Teacher records and subject-based search (printed pp. 173, 175, 177) | Added a staff-only teacher directory with name/code/qualification search, subject filtering and CSV export. |
| Subject entity and subject management (pp. 175, 177) | Added unique subject codes/names, teacher-to-subject assignments and protection against deleting assigned subjects. |
| Teacher personal and professional details (pp. 175, 177–178) | Added qualifications, experience, joining date, professional summary, email, phone and address. Teacher identifiers and centre mappings reuse the existing faculty register. |
| Query details and communication (p. 178) | Added staff-submitted queries and a principal/coordinator inbox with replies and resolution. This is an internal workflow, not email or SMS delivery. |
| Authentication, validation, reporting (pp. 174–175) | Retained server authentication, role checks, administrator-created accounts and existing attendance/progress exports. Extended server validation and privacy filtering for the new records. |

## Deliberate differences

- Accounts are still created only by administrators, following the user's explicit requirement. There is no public registration or public teacher contact directory.
- Teacher professional summaries are visible to signed-in staff. In the hosted server version, personal email/phone/address fields are returned only to management and the relevant teacher. Other staff do not receive those fields from the API.
- Teachers and mentors can see only their own queries. Management can review and respond to queries. The server stamps staff identity and prevents staff from forging a response or changing a submitted query.
- Staff profiles and subject records are separate from login credentials. Creating or updating a teacher profile does not create a sign-in account.
- The current Node.js/SQLite backend is retained. The paper's PHP/MySQL implementation is a reference, not a requirement to rewrite the application.
- The paper's broad references to encryption are not evidence that the current deployment has encrypted disks or compliant operations. HTTPS hosting, protected persistent storage, backups and an operational security review remain deployment tasks.
- Student/parent portals, teacher photographs and automatic external messaging are not added by this update.

## Where to find the additions

Use **Teacher directory** in the sidebar, then **Teacher directory**, **Subjects** or **Queries**. Select **View profile** to read or edit a teacher's details. Add the underlying teacher record through **Admin → Faculty mapping** first.

The additions are included in both the standalone HTML and the hosted package. Only the hosted server version enforces data privacy and permissions on the server. The hosted version is still not deployed.
