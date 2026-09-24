# YWAM GP Portal — plan and milestones

A two-way application portal for YWAM Siem Reap, built into the Impact app:
applicants (students per school, potential staff, volunteers, short-term teams)
apply, upload documents and follow their application; the applications
department works the same records as a CRM. One repo, one Netlify site, one
`api.js`, the same `gp-data` Blobs store.

## URL and deep links

The portal is one new page on the existing site:

    https://impact.gonpreah.org/portal.html

Deep links for the public website (ywamsiemreap.org):

| Link | Opens |
|---|---|
| `portal.html?apply=dts` | Create an account, applying to DTS (Siem Reap unless `&campus=poipet`) |
| `portal.html?apply=dbs` / `?apply=bcs` / `?apply=sms` | the other schools |
| `portal.html?apply=staff` | applying as staff |
| `portal.html?apply=volunteer` | applying as a volunteer |
| `portal.html?apply=team` | a short-term team |
| `portal.html?campus=poipet` (combinable, e.g. `?apply=dbs&campus=poipet`) | opens on Poipet |
| `portal.html?lang=km` (combinable, e.g. `?apply=dts&lang=km`) | opens in Khmer |
| `portal.html` | the front door: pick what you are applying for, or sign in |
| `portal.html?ref=<token>` | the leader reference form (milestone 3, no account needed) |

Signed-in applicants and portal staff open `portal.html` and land on their own
side; the page remembers the session under its own key (`gp-portal`), separate
from the staff app's `gp-staff`, so a staff member can be signed into both.

## What already exists and is reused

- **Accounts**: username + 4-digit PIN, `staffRegister` / `staffLogin` /
  `verifyStaff_`, the login throttle, `mutateStaff_` (write-verify-retry).
- **The CRM**: HR → Candidates in the `candidates` blob — `hrCandidates`,
  `hrSaveCandidate`, `hrCandidateNote`, `hrArchiveCandidate`, stages, log,
  assigned owner, next step + date. The portal's staff side IS this CRM: an
  applicant's account creates a candidate record, and staff move that record.
- **Files**: the HR attachment pattern (`hrfile:<id>` blobs holding
  `{name, mime, data}`, meta on the record) is the pattern for applicant
  documents.
- **Admin**: `adminUpdateStaff` and the Admin home / tool pages for the access
  screen. **Bilingual**: `km.js` (`PENDING_KM` for new strings), `t()` / `gpT()`,
  `test-khmer.mjs` walks the source for untranslated literals.

## Roles and access (fail closed)

| Who | On the staff record | Sees |
|---|---|---|
| Applicant | `kind:'applicant'`, `applicant:{type, school, candidateId}` | only their own application (`portalBoot`) |
| Portal staff | `portalStaff:true` (set by an app admin or portal admin) | every applicant, can move stages, notes, owner, next step, edit |
| Portal admin | `portalAdmin:true` (set by an app admin) | everything portal staff sees, plus grant / revoke portal-staff |
| App admin (`isAdmin`) | — | everything, plus grant / revoke portal-admin |
| Everyone else | — | nothing of the portal |

- Access is a flag an admin sets by hand on Admin → Portal access (and on the
  person page). Nothing is automatic for staff.
- An applicant account is refused by every staff handler: `verifyStaff_` returns
  null for applicants unless the handler explicitly opts in (`portalBoot`,
  `portalRegister`, the applicant's own form/document handlers). `getMyBoot`,
  `staffLogin` on the staff app, `saveDaily`, goals, HR, admin — all closed.
  Applicants are also left out of every roster, the staff count and the Admin /
  HR lists.
- Reference tokens (milestone 3) are random, single-use, expire, and are the
  only thing a leader needs — no account.
- Documents are personal data: their own blobs, readable only by portal staff /
  admins and the applicant they belong to; never in the repo, never in a test
  fixture as real data.

## Campuses and schools

Applicants pick **where** first: Poipet runs DTS and DBS; Siem Reap runs DTS, DBS, BCS
and SMS (`PORTAL_CAMPUSES` in api.js is the rule; the page mirrors it). DBS
(Discipleship Bible School), BCS (Biblical Counseling School) and SMS (Social Media
School) are secondary schools with a completed DTS as the prerequisite — the cards say
so, and the forms (milestone 2) ask about it. The account and the candidate record carry
the campus; the staff view opens on the staff member's own campus with an All-campuses
chip. A third campus is one more row in `PORTAL_CAMPUSES` and `CAMPUS_LIST`.

The staff list has a tab row — All · DTS · DBS · BCS · SMS · Staff · Volunteer · Teams —
with counts. **Scope by ministry** (`portalTypes_` in api.js, enforced on every CRM write,
not just hidden): someone on Community Service → Outreach Teams sees and works team
applications only, and gets just the Teams tab; everyone else with portal access sees
every kind. Admins, portal admins and HR see everything. Portal admins can also **delete**
an application and the account behind it from the record panel (`portalDeleteApplicant`,
name typed back to confirm) — applicant accounts live nowhere else.

## Data

- **Candidate record** (extended): `{id, campus, name, type∈student|staff|volunteer|team,
  stage, subtype, school∈dts|dbs|bcs|sms, email, phone, messenger∈whatsapp|telegram,
  country, source:'portal', assignedTo, nextStep, nextDate, expected, notes,
  staffId (the applicant's account), portal:{createdAt, submittedAt, form:{…},
  docs:[…], references:[…]}, log[], archived}`.
- **Stages** (CRM, both sides): `new → contacted → applied → interview →
  accepted → practical → arrived` (`practical` is new: fees, packing list,
  visa, travel). Staff may move a record to any stage.
- **The applicant's timeline** is derived from the record on the server
  (`portalAppOut_`): create account → fill out the application → received →
  we get in touch → documents & reference → video interview → accepted →
  getting ready → arrival. The current step is highlighted; documents and the
  reference show as checked / pending items.
- **Application questions** live in one data file per form
  (`public/portal-forms.js`): section titles, questions, help text, options,
  each with `en` and `km` — so wording changes never touch logic.

## Milestones

1. **Accounts, roles, admin access screen, applicant dashboard shell**
   (this pull request). `portalRegister`, `portalBoot`, `portalSetAccess`,
   applicant isolation, Admin → Portal access, `portal.html` with the front
   door (deep links), sign-up, sign-in, the dashboard with the status pill and
   the timeline, and a first staff view (every applicant, stage, owner, notes,
   one-tap WhatsApp / Telegram). Tests for every access rule.
2. **Application forms** (built). `netlify/functions/portal-forms-default.js` is the
   shipped question set (one form per kind — the Google Forms were not reachable from the
   build sandbox, so these are a sensible start); a portal admin edits any form on the
   staff side (Applications → Forms, Google Forms style: sections, question cards with
   English + Khmer, type, required, audience, options) — `portalSaveForm` /
   `portalResetForm`, stored per form in the `portalForms` blob. The applicant fills it
   section by section with draft autosave (`portalSaveDraft`) and submits
   (`portalSubmit` → stage `applied`, required checked for their audience). Staff read and
   correct answers on the record (`portalStaffSaveAnswers`).
   The applicant can edit their own answers after submitting (`portalUpdateAnswers`, logged) —
   teams apply with estimates and firm dates and head counts up later.
   **Accounts** (staff side, portal admins): every applicant account, with add / edit / new
   PIN / delete (`portalListAccounts`, `portalCreateApplicant`, `portalUpdateAccount`,
   `portalDeleteApplicant`).
   **Khmer vs international**: country at sign-up decides the audience — Khmer students
   need no leader reference; everyone not from Cambodia gets the **e-visa guide** on the
   dashboard from acceptance on, with two staff-set ticks (flights confirmed, letter of
   invitation sent — `portalSetVisaFlags`). Teams need no reference and their dashboard
   lists what we need (team photo with names, passport photos, flight confirmations).
3. **Documents and the leader reference.** The leader reference is built:
   `portalReferenceLink` (applicant or staff) → single-use token, 14 days, hash only on the
   record; the leader fills `forms.reference` (the base's Leader Reference Form) at
   `?ref=<token>` with no account (`portalReferenceForm`, `portalReferenceSubmit`);
   "Received from …" on the dashboard and on the record, where staff read it. Khmer students
   and teams are exempt. Still to come: the per-type required-document list (you supply the
   exact list) and upload with checked / pending state (`portalUploadDoc`, `portalGetDoc`,
   own blobs).
4. **The staff CRM, desktop-first.** Filters, search, columns, the record
   page (answers, documents, reference, log), owner / next step / next date,
   editing an application, archive, bell reminders for portal staff.
5. **Interview → acceptance → practical → arrival.** Stage-specific content
   on the applicant side (what to prepare, fees, packing list, visa steps,
   travel), acceptance letter, arrival confirmation; polish, Khmer review.

Each milestone is its own branch and pull request against `main`; `main`
deploys production, so nothing lands there without the suite green.
