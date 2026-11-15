/**
 * EBS student registration: Registration tracker and welcome email.
 *
 * Paste this file and appsscript.json into a standalone Apps Script project owned by
 * exeterbiosymposium@gmail.com, then follow docs/student-registration.md in the EBS website
 * repository (setup, Script Properties, staff instructions and operations).
 *
 * Staff tick "Send welcome email" in the Registration tracker tab of the Form's response
 * spreadsheet. The welcome email goes out only when the application email belongs to exactly one
 * verified EBS account that is Accepted, the student has never been welcomed, and every safety
 * check passes. Recipient and name always come from the Form response and the EBS lookup, never
 * from tracker cells. Nothing is sent without a tick, and a tick is never kept for later.
 */

const SENDER_EMAIL = 'exeterbiosymposium@gmail.com';
const TEST_RECIPIENT = 'exeterbiosymposium@gmail.com';
const STATUS_URL = 'https://www.exeterbiosymposium.page/api/registration-status';
const TIME_ZONE = 'America/New_York';

const EMAIL = {
  subject: '[Action Required] EBS Registration Update',
  senderName: 'Exeter Biology Symposium',
  greeting: 'Dear [Name],',
  paragraphs: [
    'We are pleased to inform you that you have successfully passed the first round of the EBS application — Congratulations! We have chosen you because of your passion and willingness to dedicate time and effort to our Symposium.',
    'The next step, if you have not already done so, is to fill out a researcher information form via this [link]. You will be receiving an invitation to a Google Drive folder that will be where you can store all your research as well as your research mentor assignment after filling out this form.',
    'The EBS team is beyond excited to have you start your research journey.',
  ],
  closing: 'Best regards,',
  signature: ['Adrian Chan', 'Founder, Exeter Biology Symposium', 'P H I L L I P S   E X E T E R   A C A D E M Y', '20 Main Street | Exeter, NH 03833', 'exeterbiosymposium@gmail.com'],
};

const HEADERS = ['Send welcome email', 'Welcomed by hand', 'Application received', 'Name in email', 'Application email', 'Email source', 'Clerk account', 'EBS status', 'Welcome email', 'Welcome sent at', 'Submission ID', 'Clerk account ID'];
const COL = { SEND: 1, HAND: 2, RECEIVED: 3, NAME: 4, EMAIL: 5, SOURCE: 6, ACCOUNT: 7, STATUS: 8, WELCOME: 9, SENT_AT: 10, SUBMISSION: 11, USER: 12 };
const WIDTH = HEADERS.length;
const FIRST_ROW = 3;
const HANDLERS = ['onTrackerEdit', 'onApplicationSubmit', 'syncRegistrations'];
const CLAIM_KEY = 'ebs-student-registration-script';
const RUN_LIMIT_MS = 6 * 60 * 1000;
const SEND_RESERVE_MS = 60 * 1000;
const LOOKUP_RESERVE_MS = 90 * 1000;
const FULL_REFRESH_MS = 20 * 60 * 60 * 1000;
const BULK_TICK_LIMIT = 5;
const LOOKUP_BATCH = 10;
const LOOKUP_BATCH_BYTES = 3500;
const SENDING_SCOPES = ['https://www.googleapis.com/auth/script.send_mail', 'https://www.googleapis.com/auth/script.external_request'];

const STATUS = {
  SENT: 'Sent',
  HAND: 'Welcomed by hand',
  DELIVERY_UNKNOWN: 'Needs owner review: delivery unknown',
  OTHER_APPLICANT: 'Needs owner review: account already welcomed for another applicant',
  DELETED: 'Response deleted',
  QUEUED: 'Queued — sends at the next check (untick to cancel)',
  UNAVAILABLE: 'Check unavailable — retries at the next check (untick to cancel)',
  NOT_REQUESTED: 'Not requested',
};
const REVIEW = {
  SHARED_EMAIL: 'several applicants share this email',
  AMBIGUOUS: 'more than one EBS account',
  EMAIL_OTHER_ACCOUNT: 'email welcomed under another account',
  RECORD_MISSING: 'send record missing',
  NAME: 'name needs checking',
  DUPLICATE: 'duplicate row',
};
const NOT_SENT = {
  PENDING: ['account is Pending', 'Approve in Participants, then tick again.'],
  NO_STATUS: ['account has no EBS status yet', 'Ask the student to sign in and open their Account page, approve them in Participants, then tick again.'],
  NO_ACCOUNT: ['no EBS account uses this email', 'Ask the student to add and verify it in their EBS account, or email them by hand and tick Welcomed by hand.'],
  NO_EMAIL: ['no valid email in the application', 'Email the student by hand and tick Welcomed by hand.'],
  BEFORE_START: ['approved before the tracker started', 'If not yet welcomed, email them by hand and tick Welcomed by hand.'],
  IN_TRACKER: ['already in the Researcher tracker', ''],
  OFF: ['sending is off', 'Ask the owner to turn sending on, then tick again.'],
  TEST_MODE: ['test mode', ''],
  BULK: ['too many boxes ticked at once', 'Tick 5 or fewer.'],
};
const PROBLEM = {
  WRONG_USER: 'the script is not running as exeterbiosymposium@gmail.com',
  CLAIM: 'another Apps Script project manages this tracker',
  SHARING: 'the response spreadsheet must be Restricted, and editors must not be able to share it',
  DESTINATION: 'the Form is not linked to this spreadsheet',
  FORM_SETTINGS: 'turn off response editing and summary publishing in the Form',
  QUESTIONS: 'a configured Form question changed — owner runs setup()',
  LAYOUT: 'Tracker layout changed — owner runs setup()',
  CYCLE: 'REGISTRATION_CYCLE changed — owner runs enableSending()',
  SCOPES: 'permissions are missing — owner runs setup() and grants every permission',
  FORM_URL: 'RESEARCHER_FORM_URL is not a Google Form link',
  TEST_ONLY: 'TEST_ONLY_RECIPIENT must be exeterbiosymposium@gmail.com or a +tag of it',
  RECORDS: 'send records could not be saved; sending stopped for this check',
  RESEARCHER: 'Researcher tracker unavailable — welcomes wait and list updates retry',
  QUOTA: 'the mail quota could not be read',
};
// Statuses recomputed from records on every run; the other "Needs owner review" and "Not sent"
// statuses describe the last tick and stay until the row is ticked again.
const DERIVED_STATUSES = [STATUS.DELIVERY_UNKNOWN, STATUS.OTHER_APPLICANT, 'Needs owner review: ' + REVIEW.DUPLICATE, 'Needs owner review: ' + REVIEW.EMAIL_OTHER_ACCOUNT];
const ACCOUNT_LABEL = { verified: 'Verified match', none: 'No match', ambiguous: 'Ambiguous', invalid: 'No valid email' };
const LEGEND = [
  'How to use this tracker',
  '1. Approve the participant in EBS administration → Participants.',
  '2. Tick Send welcome email on their row. The box clears once the row is handled.',
  '',
  'Sent: the welcome email went out (see Welcome sent at).',
  'Welcomed by hand: recorded as welcomed outside the tracker; never sent again.',
  'Already welcomed (row N): this student was welcomed from another row.',
  'Queued / Check unavailable: tried again at the next check; untick to cancel.',
  'Not sent: the reason and the next step are shown; tick again once it is fixed.',
  'Needs owner review: the account owner must check before anything is sent.',
  'Not requested: nothing has been asked for this row.',
  '',
  'Edit only the two checkbox columns. Use Data → Filter views to filter or sort.',
];

// ---------------------------------------------------------------- entry points

/** Owner: builds or repairs the tracker, pins the configuration and installs the triggers. */
function setup() {
  requireAllScopes_();
  const started = Date.now();
  withLock_('owner', function () { setup_(started); });
}

/** Installable on-edit trigger on the tracker spreadsheet. */
function onTrackerEdit(e) {
  const started = Date.now();
  if (!e || !e.range) return;
  const range = e.range;
  if (range.getLastRow() < FIRST_ROW || range.getColumn() > COL.HAND) return;
  const pinned = readJson_(PropertiesService.getScriptProperties().getProperty('PINNED'));
  if (!pinned || range.getSheet().getSheetId() !== pinned.sheetId) return;
  const edit = {
    first: Math.max(FIRST_ROW, range.getRow()),
    last: range.getLastRow(),
    send: range.getColumn() <= COL.SEND,
    hand: range.getLastColumn() >= COL.HAND,
  };
  withLock_('edit', function () { run_({ mode: 'edit', started: started, edit: edit }); });
}

/** Installable form-submit trigger: adds the new application to the tracker. Never sends. */
function onApplicationSubmit(e) {
  const started = Date.now();
  withLock_('trigger', function () { run_({ mode: 'submit', started: started }); });
}

/** Hourly trigger: refreshes rows, handles boxes that are still ticked and retries list updates. */
function syncRegistrations() {
  const started = Date.now();
  withLock_('trigger', function () { run_({ mode: 'sync', started: started }); });
}

/** Owner: turns sending on after clearing ticks left from while it was off. */
function enableSending() {
  requireAllScopes_();
  const started = Date.now();
  withLock_('owner', function () {
    const props = PropertiesService.getScriptProperties();
    props.setProperty('SENDING_ENABLED', 'false');
    const pass = run_({ mode: 'enable', started: started });
    if (!pass.ok) throw new Error('Sending stays off: ' + pass.problem + '.');
    const config = readConfig_(props);
    if (!validResearcherFormUrl_(config.researcherFormUrl)) throw new Error('Sending stays off: ' + PROBLEM.FORM_URL + '.');
    if (!config.testOnlyValid) throw new Error('Sending stays off: ' + PROBLEM.TEST_ONLY + '.');
    if (ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL, SENDING_SCOPES).getAuthorizationStatus() !== ScriptApp.AuthorizationStatus.NOT_REQUIRED) {
      throw new Error('Sending stays off: ' + PROBLEM.SCOPES + '.');
    }
    props.setProperties({ SENDING_CYCLE: config.cycle, SENDING_ENABLED: 'true' });
    refreshStatusLine_(props, pass.ctx.sheet);
    console.log('Sending is on' + (config.testOnly ? ' in test mode' : '') + '. ' + pass.ctx.counts.rows + ' rows in the tracker.');
  });
}

/** Owner: stops sending at once. Safe to run while another run is busy. */
function pauseSending() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('SENDING_ENABLED', 'false');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    console.log('Sending is paused. The tracker status line updates at the next check.');
    return;
  }
  try {
    const config = readConfig_(props);
    const sheet = config.pinned && config.trackerId ? findSheet_(SpreadsheetApp.openById(config.trackerId), config.pinned.sheetId) : null;
    refreshStatusLine_(props, sheet);
  } catch (error) {
    console.log('Sending is paused. The status line could not be updated.');
  } finally {
    try { SpreadsheetApp.flush(); } finally { lock.releaseLock(); }
  }
  console.log('Sending is paused.');
}

/** Owner: sends the welcome email with a [Test] subject to the EBS inbox only. Writes no records. */
function sendTestEmail() {
  if (String(Session.getEffectiveUser().getEmail() || '').toLowerCase() !== SENDER_EMAIL) throw new Error('Run sendTestEmail() as ' + SENDER_EMAIL + '.');
  const url = validResearcherFormUrl_(PropertiesService.getScriptProperties().getProperty('RESEARCHER_FORM_URL'));
  if (!url) throw new Error('Set RESEARCHER_FORM_URL to the researcher information form link first.');
  const message = buildEmail_('Test Researcher', url);
  MailApp.sendEmail({ to: TEST_RECIPIENT, replyTo: SENDER_EMAIL, name: EMAIL.senderName, subject: '[Test] ' + EMAIL.subject, body: message.text, htmlBody: message.html });
  console.log('Test email sent to the EBS inbox.');
}

/**
 * Owner: settles a send marked "Needs owner review". Set RESOLVE_SUBMISSION_ID and RESOLVE_OUTCOME
 * (sent = it was delivered or you emailed by hand; retry = no copy in the EBS inbox) first.
 */
function resolveSend() {
  const started = Date.now();
  withLock_('owner', function () {
    const props = PropertiesService.getScriptProperties();
    const submissionId = String(props.getProperty('RESOLVE_SUBMISSION_ID') || '').trim();
    const outcome = String(props.getProperty('RESOLVE_OUTCOME') || '').trim().toLowerCase();
    props.deleteProperty('RESOLVE_SUBMISSION_ID');
    props.deleteProperty('RESOLVE_OUTCOME');
    if (!submissionId || (outcome !== 'sent' && outcome !== 'retry')) {
      throw new Error('Set RESOLVE_SUBMISSION_ID and RESOLVE_OUTCOME (sent or retry) in Script Properties, then run resolveSend() again.');
    }
    const result = run_({ mode: 'resolve', started: started, resolve: { submissionId: submissionId, outcome: outcome } });
    if (!result.ok) throw new Error('The tracker is paused: ' + result.problem + '.');
  });
}

/** Owner: removes this project's tracker triggers. */
function removeTriggers() {
  let removed = 0;
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (HANDLERS.indexOf(trigger.getHandlerFunction()) >= 0) { ScriptApp.deleteTrigger(trigger); removed++; }
  });
  console.log('Removed ' + removed + ' tracker trigger' + (removed === 1 ? '' : 's') + '.');
}

// ---------------------------------------------------------------- locking and setup

// Asks the owner to grant every scope in appsscript.json (granular consent lets people untick some).
function requireAllScopes_() {
  if (typeof ScriptApp.requireAllScopes === 'function') ScriptApp.requireAllScopes(ScriptApp.AuthMode.FULL);
}

function withLock_(kind, action) {
  const lock = LockService.getScriptLock();
  if (kind === 'owner') {
    lock.waitLock(30000);
  } else if (!lock.tryLock(kind === 'edit' ? 25000 : 10000)) {
    // Another run holds the lock; it re-scans the checkboxes before it finishes.
    if (kind === 'edit') PropertiesService.getScriptProperties().setProperty('PENDING_EDIT', String(Date.now()));
    return null;
  }
  try {
    return action();
  } finally {
    try { SpreadsheetApp.flush(); } finally { lock.releaseLock(); }
  }
}

function setup_(started) {
  const props = PropertiesService.getScriptProperties();
  const config = readConfig_(props);
  if (config.missing.length) throw new Error('Set these Script Properties first: ' + config.missing.join(', ') + '.');
  if (String(Session.getEffectiveUser().getEmail() || '').toLowerCase() !== SENDER_EMAIL) throw new Error('Run setup() as ' + SENDER_EMAIL + '.');
  const form = FormApp.openById(config.formId);
  const ss = SpreadsheetApp.openById(config.trackerId);
  // Every check comes before the first change, so a refusal leaves everything as it was.
  const scriptId = ScriptApp.getScriptId();
  const claim = findClaim_(ss);
  const takeover = !!claim && claim.getValue() !== scriptId;
  if (takeover && String(props.getProperty('TAKEOVER_FROM_SCRIPT_ID') || '').trim() !== claim.getValue()) {
    throw new Error('Another Apps Script project manages this tracker. To move it here, set TAKEOVER_FROM_SCRIPT_ID to that project\'s script ID and run setup() again.');
  }
  const problem = sharingProblem_(config.trackerId) || formProblem_(form, config.trackerId);
  if (problem) throw new Error('Setup stopped: ' + problem + '.');
  const items = pinItems_(form, config);
  let sheet = config.pinned ? findSheet_(ss, config.pinned.sheetId) : null;
  if (!sheet) sheet = ss.getSheetByName(config.sheetName);
  if (sheet) {
    const header = sheet.getRange(2, 1, 1, Math.min(WIDTH, sheet.getMaxColumns())).getValues()[0];
    const empty = header.every(function (value) { return value === '' || value === null; });
    if (!empty && header.join('\u0001') !== HEADERS.join('\u0001')) {
      throw new Error('Setup stopped: row 2 of the tracker no longer has the expected headers. Undo the layout change (File → Version history), then run setup() again.');
    }
  }

  if (takeover) {
    claim.setValue(scriptId);
    props.deleteProperty('TAKEOVER_FROM_SCRIPT_ID');
    props.setProperties({ SENDING_ENABLED: 'false', AUTOMATION_START: String(Date.now()) });
  } else if (!claim) {
    ss.addDeveloperMetadata(CLAIM_KEY, scriptId, SpreadsheetApp.DeveloperMetadataVisibility.DOCUMENT);
  }
  if (!props.getProperty('AUTOMATION_START')) props.setProperty('AUTOMATION_START', String(Date.now()));
  if (!props.getProperty('SENDING_ENABLED')) props.setProperty('SENDING_ENABLED', 'false');
  if (!sheet) sheet = ss.insertSheet(config.sheetName);
  props.setProperty('PINNED', JSON.stringify({ sheetId: sheet.getSheetId(), items: items }));
  formatSheet_(sheet);
  installTriggers_(config);
  const result = run_({ mode: 'setup', started: started });
  console.log(result.ok
    ? 'Setup complete. Sending is ' + (props.getProperty('SENDING_ENABLED') === 'true' ? 'on' : 'off') + '.'
    : 'Setup finished, but the tracker is paused: ' + result.problem + '.');
}

function pinItems_(form, config) {
  const items = form.getItems();
  const find = function (title) {
    const matches = items.filter(function (item) { return String(item.getTitle()).trim() === title; });
    if (matches.length !== 1) throw new Error('The Form must have exactly one question titled "' + title + '" (found ' + matches.length + ').');
    return matches[0].getId();
  };
  return { account: find(config.questions.account), fallback: find(config.questions.fallback), name: find(config.questions.name) };
}

function formatSheet_(sheet) {
  if (sheet.getMaxColumns() < WIDTH) sheet.insertColumnsAfter(sheet.getMaxColumns(), WIDTH - sheet.getMaxColumns());
  const header = sheet.getRange(2, 1, 1, WIDTH);
  if (header.getValues()[0].join('\u0001') !== HEADERS.join('\u0001')) header.setValues([HEADERS]);
  header.setFontWeight('bold');
  sheet.getRange(2, COL.WELCOME).setNote(LEGEND.join('\n'));
  sheet.getRange(1, 1).setFontWeight('bold');
  sheet.setFrozenRows(2);
  const last = lastIdRow_(sheet);
  if (last >= FIRST_ROW) sheet.getRange(FIRST_ROW, COL.SEND, last - FIRST_ROW + 1, 2).setDataValidation(checkboxRule_());
  [COL.RECEIVED, COL.SENT_AT].forEach(function (column) {
    sheet.getRange(FIRST_ROW, column, sheet.getMaxRows() - FIRST_ROW + 1, 1).setNumberFormat('mmm d, yyyy h:mm am/pm');
  });
  const existing = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  const protection = existing.length ? existing[0] : sheet.protect();
  protection.setDescription('Registration tracker: staff edit only Send welcome email and Welcomed by hand.');
  protection.setWarningOnly(false);
  protection.addEditor(Session.getEffectiveUser());
  protection.removeEditors(protection.getEditors().filter(function (user) { return String(user.getEmail()).toLowerCase() !== SENDER_EMAIL; }));
  if (protection.canDomainEdit()) protection.setDomainEdit(false);
  updateProtection_(sheet, last);
}

function installTriggers_(config) {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (HANDLERS.indexOf(trigger.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('onTrackerEdit').forSpreadsheet(config.trackerId).onEdit().create();
  ScriptApp.newTrigger('onApplicationSubmit').forForm(config.formId).onFormSubmit().create();
  ScriptApp.newTrigger('syncRegistrations').timeBased().everyHours(1).create();
}

function updateProtection_(sheet, last) {
  const protection = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0];
  if (!protection) return; // The layout check reports a missing protection.
  protection.setUnprotectedRanges(last >= FIRST_ROW ? [sheet.getRange(FIRST_ROW, COL.SEND, last - FIRST_ROW + 1, 2)] : []);
}

// ---------------------------------------------------------------- one run

function run_(options) {
  const props = PropertiesService.getScriptProperties();
  const config = readConfig_(props);
  const ctx = { props: props, config: config, mode: options.mode, started: options.started, problems: [], lookups: {}, outcomes: {}, sends: 0, stopSending: false, counts: { rows: 0, sent: 0, hand: 0, review: 0, waiting: 0 } };
  if (config.missing.length) return fail_(ctx, 'a required Script Property is missing: ' + config.missing.join(', '), false);
  try {
    ctx.form = FormApp.openById(config.formId);
    ctx.ss = SpreadsheetApp.openById(config.trackerId);
  } catch (error) {
    return fail_(ctx, 'the Form or the tracker spreadsheet could not be opened; the next check retries', false);
  }
  ctx.sheet = config.pinned ? findSheet_(ctx.ss, config.pinned.sheetId) : null;
  if (!ctx.sheet) return fail_(ctx, 'the tracker is not set up — owner runs setup()', false);
  let problem;
  try { problem = guardProblem_(ctx); } catch (error) { return fail_(ctx, 'a safety check could not run; the next check retries', false); }
  if (problem) return fail_(ctx, problem, true);
  ctx.sendingOn = config.sendingEnabled && options.mode !== 'enable';
  if (ctx.sendingOn) {
    try { problem = sendingProblem_(ctx); } catch (error) { return fail_(ctx, 'a safety check could not run; the next check retries', false); }
    if (problem) return fail_(ctx, problem, true);
  }
  try { ctx.responses = readResponses_(ctx); } catch (error) { return fail_(ctx, 'Form responses could not be read; the next check retries', false); }

  ctx.records = readRecords_(props);
  convertStaleAttempts_(ctx);
  ctx.table = readTable_(ctx);
  const added = appendMissingRows_(ctx);
  if (added.length) ctx.table = readTable_(ctx);
  lookup_(ctx, emailsToRefresh_(ctx, added));
  completeHandRecords_(ctx);
  if (options.mode === 'edit') processTicks_(ctx, ticksInEdit_(ctx, options.edit), options.edit);
  else if (options.mode === 'sync' || options.mode === 'enable') processTicks_(ctx, ctx.table.rows, null);
  if (options.resolve) resolve_(ctx, options.resolve);
  handlePendingEdits_(ctx);
  retryAppends_(ctx);
  ctx.records = readRecords_(props);
  writeTable_(ctx);
  finishRun_(ctx);
  return { ok: true, ctx: ctx };
}

function fail_(ctx, message, definite) {
  if (definite) ctx.props.setProperty('SENDING_ENABLED', 'false');
  console.log('Registration tracker paused: ' + message + '.');
  if (ctx.sheet) {
    try {
      ctx.sheet.getRange(1, 1).setValue(cellText_('Paused — ' + message + ' · Last successful check: ' + formatTime_(ctx.props.getProperty('LAST_SUCCESS'))));
    } catch (error) {
      console.log('The status line could not be updated.');
    }
  }
  return { ok: false, problem: message };
}

function readConfig_(props) {
  const all = props.getProperties();
  const get = function (key) { return String(all[key] == null ? '' : all[key]).trim(); };
  const missing = ['EBS_STATUS_TOKEN', 'FORM_ID', 'TRACKER_SPREADSHEET_ID', 'RESEARCHER_TRACKER_ID'].filter(function (key) { return !get(key); });
  if (get('EBS_STATUS_TOKEN') && get('EBS_STATUS_TOKEN').length < 32) missing.push('EBS_STATUS_TOKEN (at least 32 characters)');
  const cap = parseInt(get('MAX_SENDS_PER_RUN') || '10', 10);
  const testOnly = get('TEST_ONLY_RECIPIENT').toLowerCase();
  return {
    missing: missing,
    token: get('EBS_STATUS_TOKEN'),
    formId: get('FORM_ID'),
    trackerId: get('TRACKER_SPREADSHEET_ID'),
    researcherFormUrl: get('RESEARCHER_FORM_URL'),
    researcherTrackerId: get('RESEARCHER_TRACKER_ID'),
    researcherSheet: get('RESEARCHER_TRACKER_SHEET') || 'Sheet1',
    sheetName: get('TRACKER_SHEET_NAME') || 'Registration tracker',
    questions: {
      account: get('ACCOUNT_EMAIL_QUESTION') || 'Researcher Email',
      fallback: get('FALLBACK_EMAIL_QUESTION') || 'Adult Contact Person Email',
      name: get('NAME_QUESTION') || 'Full Name',
    },
    cycle: get('REGISTRATION_CYCLE') || '2027',
    maxSends: cap > 0 ? Math.min(cap, 50) : 10,
    testOnly: testOnly,
    testOnlyValid: !testOnly || validTestRecipient_(testOnly),
    sendingEnabled: get('SENDING_ENABLED') === 'true',
    sendingCycle: get('SENDING_CYCLE'),
    automationStart: Number(get('AUTOMATION_START')) || 0,
    lastFullRefresh: Number(get('LAST_FULL_REFRESH')) || 0,
    pinned: readJson_(all.PINNED),
  };
}

// ---------------------------------------------------------------- guards

function guardProblem_(ctx) {
  const config = ctx.config;
  if (String(Session.getEffectiveUser().getEmail() || '').toLowerCase() !== SENDER_EMAIL) return PROBLEM.WRONG_USER;
  const claim = findClaim_(ctx.ss);
  if (!claim || claim.getValue() !== ScriptApp.getScriptId()) return PROBLEM.CLAIM;
  const sharing = sharingProblem_(config.trackerId);
  if (sharing) return sharing;
  const form = formProblem_(ctx.form, config.trackerId);
  if (form) return form;
  const items = config.pinned.items || {};
  const keys = ['account', 'fallback', 'name'];
  for (let i = 0; i < keys.length; i++) {
    const item = items[keys[i]] ? ctx.form.getItemById(items[keys[i]]) : null;
    if (!item || String(item.getTitle()).trim() !== config.questions[keys[i]]) return PROBLEM.QUESTIONS;
  }
  return layoutProblem_(ctx.sheet);
}

function sendingProblem_(ctx) {
  const config = ctx.config;
  if (config.sendingCycle !== config.cycle) return PROBLEM.CYCLE;
  if (ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL, SENDING_SCOPES).getAuthorizationStatus() !== ScriptApp.AuthorizationStatus.NOT_REQUIRED) return PROBLEM.SCOPES;
  if (!validResearcherFormUrl_(config.researcherFormUrl)) return PROBLEM.FORM_URL;
  if (!config.testOnlyValid) return PROBLEM.TEST_ONLY;
  return null;
}

function sharingProblem_(fileId) {
  const file = DriveApp.getFileById(fileId);
  return file.getSharingAccess() !== DriveApp.Access.PRIVATE || file.isShareableByEditors() ? PROBLEM.SHARING : null;
}

function formProblem_(form, trackerId) {
  if (form.getDestinationId() !== trackerId) return PROBLEM.DESTINATION;
  if (form.canEditResponse() || form.isPublishingSummary()) return PROBLEM.FORM_SETTINGS;
  return null;
}

function layoutProblem_(sheet) {
  if (sheet.getMaxColumns() < WIDTH) return PROBLEM.LAYOUT;
  const header = sheet.getRange(2, 1, 1, WIDTH).getValues()[0];
  for (let i = 0; i < WIDTH; i++) if (String(header[i]).trim() !== HEADERS[i]) return PROBLEM.LAYOUT;
  const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  if (protections.length !== 1 || protections[0].isWarningOnly()) return PROBLEM.LAYOUT;
  const last = lastIdRow_(sheet);
  if (last >= FIRST_ROW) {
    const rules = sheet.getRange(FIRST_ROW, COL.SEND, last - FIRST_ROW + 1, 2).getDataValidations();
    for (let r = 0; r < rules.length; r++) {
      for (let c = 0; c < 2; c++) {
        if (!rules[r][c] || rules[r][c].getCriteriaType() !== SpreadsheetApp.DataValidationCriteria.CHECKBOX) return PROBLEM.LAYOUT;
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------- Form responses and tracker rows

function readResponses_(ctx) {
  const form = ctx.form, pinned = ctx.config.pinned.items;
  const items = { account: form.getItemById(pinned.account), fallback: form.getItemById(pinned.fallback), name: form.getItemById(pinned.name) };
  const map = {};
  form.getResponses().forEach(function (response) {
    const id = String(response.getId());
    const accountAnswer = answer_(response, items.account).trim();
    const raw = accountAnswer || answer_(response, items.fallback).trim();
    const email = normalizeEmail_(raw);
    const valid = plausibleEmail_(email);
    const name = normalizeName_(answer_(response, items.name));
    const timestamp = response.getTimestamp();
    map[id] = {
      id: id,
      timestamp: timestamp,
      time: timestamp ? timestamp.getTime() : 0,
      rawEmail: raw,
      email: valid ? email : '',
      emailHash: valid ? hashEmail_(email) : '',
      source: raw ? (accountAnswer ? 'Researcher Email' : 'Adult contact') : '',
      name: name,
      nameKey: name.toLowerCase(),
    };
  });
  return map;
}

function answer_(response, item) {
  if (!item) return '';
  const itemResponse = response.getResponseForItem(item);
  const value = itemResponse ? itemResponse.getResponse() : '';
  return Array.isArray(value) ? value.join(' ') : String(value == null ? '' : value);
}

function readTable_(ctx) {
  const sheet = ctx.sheet, lastRow = sheet.getLastRow();
  const table = { rows: [], byRow: {}, rowOf: {}, last: FIRST_ROW - 1, ignored: 0 };
  if (lastRow < FIRST_ROW) return table;
  const count = lastRow - FIRST_ROW + 1;
  const values = sheet.getRange(FIRST_ROW, 1, count, WIDTH).getValues();
  const formulas = sheet.getRange(FIRST_ROW, 1, count, 2).getFormulas();
  const blank = function (value) { return value === false || value === '' || value === null || value === undefined; };
  const seen = {};
  values.forEach(function (v, i) {
    const number = FIRST_ROW + i;
    const id = String(v[COL.SUBMISSION - 1] == null ? '' : v[COL.SUBMISSION - 1]).trim();
    const send = v[COL.SEND - 1] === true && !formulas[i][0];
    const hand = v[COL.HAND - 1] === true && !formulas[i][1];
    if (!id) {
      if (!blank(v[COL.SEND - 1]) || !blank(v[COL.HAND - 1])) table.ignored++;
      return;
    }
    if (!blank(v[COL.SEND - 1]) && !send) table.ignored++;
    if (!blank(v[COL.HAND - 1]) && !hand) table.ignored++;
    table.last = number;
    const row = {
      row: number,
      submissionId: id,
      send: send,
      hand: hand,
      status: String(v[COL.WELCOME - 1] == null ? '' : v[COL.WELCOME - 1]),
      sentAt: v[COL.SENT_AT - 1],
      account: String(v[COL.ACCOUNT - 1] == null ? '' : v[COL.ACCOUNT - 1]),
      emailCell: String(v[COL.EMAIL - 1] == null ? '' : v[COL.EMAIL - 1]),
      userId: String(v[COL.USER - 1] == null ? '' : v[COL.USER - 1]).trim(),
      duplicate: false,
    };
    // Every copy of a repeated Submission ID waits for the owner; none of them sends.
    if (seen[id]) { seen[id].duplicate = true; row.duplicate = true; } else { seen[id] = row; table.rowOf[id] = number; }
    table.rows.push(row);
    table.byRow[number] = row;
  });
  return table;
}

function appendMissingRows_(ctx) {
  const sheet = ctx.sheet, table = ctx.table;
  const missing = Object.keys(ctx.responses)
    .filter(function (id) { return !table.rowOf[id]; })
    .map(function (id) { return ctx.responses[id]; })
    .sort(function (a, b) { return a.time - b.time; });
  if (!missing.length) return [];
  const start = table.last + 1, end = start + missing.length - 1;
  if (end > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), end - sheet.getMaxRows());
  sheet.getRange(start, 1, missing.length, WIDTH).setValues(missing.map(function (response) {
    return [false, false, response.timestamp, cellText_(response.name), cellText_(response.rawEmail), response.source, '', '', STATUS.NOT_REQUESTED, '', response.id, ''];
  }));
  sheet.getRange(start, COL.SEND, missing.length, 2).setDataValidation(checkboxRule_());
  updateProtection_(sheet, end);
  return missing.map(function (response) { return response.id; });
}

function writeTable_(ctx) {
  const table = ctx.table, sheet = ctx.sheet;
  if (table.last < FIRST_ROW) return;
  const count = table.last - FIRST_ROW + 1;
  const fresh = sheet.getRange(FIRST_ROW, 1, count, WIDTH).getValues();
  const block = [], users = [];
  let changed = false;
  fresh.forEach(function (v, i) {
    const row = table.byRow[FIRST_ROW + i];
    const id = String(v[COL.SUBMISSION - 1] == null ? '' : v[COL.SUBMISSION - 1]).trim();
    let cells = v.slice(COL.RECEIVED - 1, COL.SENT_AT);
    let user = v[COL.USER - 1];
    // A row whose Submission ID changed since it was read keeps its current values.
    if (row && id === row.submissionId) {
      const shown = displayRow_(ctx, row, v);
      if (!sameCells_(shown.cells, cells) || shown.user !== user) changed = true;
      cells = shown.cells;
      user = shown.user;
      tally_(ctx.counts, cells[COL.WELCOME - COL.RECEIVED]);
    }
    block.push(cells);
    users.push([user]);
  });
  if (!changed) return;
  sheet.getRange(FIRST_ROW, COL.RECEIVED, count, COL.SENT_AT - COL.RECEIVED + 1).setValues(block);
  sheet.getRange(FIRST_ROW, COL.USER, count, 1).setValues(users);
}

function displayRow_(ctx, row, v) {
  const response = ctx.responses[row.submissionId];
  const status = statusFor_(ctx, row);
  let sentAt = v[COL.SENT_AT - 1];
  const sub = ctx.records[subKey_(ctx, row.submissionId)];
  if (sub && sub.state === 'sent' && (sentAt === '' || sentAt === null)) sentAt = new Date(sub.at);
  if (!response) return { cells: [v[COL.RECEIVED - 1], '', '', '', '', '', status, sentAt], user: '' };
  let account = v[COL.ACCOUNT - 1], ebs = v[COL.STATUS - 1], user = v[COL.USER - 1];
  if (!response.email) {
    account = ACCOUNT_LABEL.invalid; ebs = '—'; user = '';
  } else {
    const result = ctx.lookups[response.email];
    if (result === 'unavailable') {
      account = 'Unavailable';
    } else if (result) {
      account = ACCOUNT_LABEL[result.account];
      ebs = result.account === 'verified' ? (result.status === 'accepted' ? 'Accepted' : result.status === 'pending' ? 'Pending' : '—') : '—';
      user = result.account === 'verified' ? result.userId : '';
    }
  }
  return { cells: [response.timestamp, cellText_(response.name), cellText_(response.rawEmail), response.source, account, ebs, status, sentAt], user: user };
}

function statusFor_(ctx, row) {
  if (row.duplicate) return review_(REVIEW.DUPLICATE);
  const sub = ctx.records[subKey_(ctx, row.submissionId)];
  if (sub) return recordStatus_(sub);
  if (hasEvidence_(row)) return row.status || STATUS.SENT; // Never downgrade a welcome already shown.
  const response = ctx.responses[row.submissionId];
  const userId = userIdFor_(ctx, row);
  const accountRecord = userId ? ctx.records[acctKey_(ctx, userId)] : null;
  if (accountRecord) return welcomedStatus_(ctx, row, accountRecord);
  const emailRecord = response && response.emailHash ? ctx.records[emailKey_(ctx, response.emailHash)] : null;
  if (emailRecord) {
    return emailRecord.userId && userId && emailRecord.userId !== userId ? review_(REVIEW.EMAIL_OTHER_ACCOUNT) : welcomedStatus_(ctx, row, emailRecord);
  }
  if (!response) return STATUS.DELETED;
  if (ctx.outcomes[row.submissionId]) return ctx.outcomes[row.submissionId];
  const current = row.status;
  if (current === STATUS.QUEUED || current === STATUS.UNAVAILABLE) return row.send ? current : STATUS.NOT_REQUESTED;
  if (DERIVED_STATUSES.indexOf(current) < 0 && (current.indexOf('Not sent (') === 0 || current.indexOf('Needs owner review: ') === 0)) return current;
  return STATUS.NOT_REQUESTED;
}

function recordStatus_(record) {
  if (record.state === 'sent') return STATUS.SENT;
  if (record.state === 'hand') return STATUS.HAND;
  return STATUS.DELIVERY_UNKNOWN;
}

function welcomedStatus_(ctx, row, record) {
  if (record.state !== 'sent' && record.state !== 'hand') return STATUS.DELIVERY_UNKNOWN;
  if (record.submissionId === row.submissionId) return recordStatus_(record);
  const mine = ctx.responses[row.submissionId], theirs = ctx.responses[record.submissionId];
  const otherRow = ctx.table.rowOf[record.submissionId];
  if (mine && theirs && mine.nameKey && mine.nameKey === theirs.nameKey && otherRow) return 'Already welcomed (row ' + otherRow + ')';
  return STATUS.OTHER_APPLICANT;
}

function hasEvidence_(row) {
  return row.status === STATUS.SENT || row.status === STATUS.HAND || (row.sentAt !== '' && row.sentAt !== null && row.sentAt !== undefined);
}

// Rows the tracker shows as welcomed but that have no record (for example after the project was
// re-created). They block every send for the same submission, account or email.
function evidence_(ctx) {
  if (ctx.evidenceTable === ctx.table) return ctx.evidence;
  const list = [];
  ctx.table.rows.forEach(function (row) {
    if (!hasEvidence_(row)) return;
    const sub = ctx.records[subKey_(ctx, row.submissionId)];
    if (sub && (sub.state === 'sent' || sub.state === 'hand')) return;
    const response = ctx.responses[row.submissionId];
    const email = response && response.email ? response.email : normalizeEmail_(row.emailCell);
    list.push({ submissionId: row.submissionId, userId: row.userId, emailHash: plausibleEmail_(email) ? hashEmail_(email) : '' });
  });
  ctx.evidence = list;
  ctx.evidenceTable = ctx.table;
  return list;
}

function userIdFor_(ctx, row) {
  const response = ctx.responses[row.submissionId];
  const fromLookup = response ? verifiedUserId_(ctx, response.email) : '';
  return fromLookup || row.userId || '';
}

function verifiedUserId_(ctx, email) {
  const result = email ? ctx.lookups[email] : null;
  return result && result !== 'unavailable' && result.account === 'verified' ? result.userId : '';
}

// ---------------------------------------------------------------- EBS lookups

function emailsToRefresh_(ctx, added) {
  const mode = ctx.mode;
  const full = mode === 'setup' || mode === 'enable' || (mode === 'sync' && Date.now() - ctx.config.lastFullRefresh >= FULL_REFRESH_MS);
  if (full) ctx.fullRefresh = true;
  const emails = [];
  ctx.table.rows.forEach(function (row) {
    const response = ctx.responses[row.submissionId];
    if (!response || !response.email) return;
    const sub = ctx.records[subKey_(ctx, row.submissionId)];
    const handWithoutAccount = !!sub && sub.state === 'hand' && !sub.userId;
    const finished = !!sub && (sub.state === 'sent' || (sub.state === 'hand' && !!sub.userId));
    if (added.indexOf(row.submissionId) >= 0
      || (mode === 'sync' && (row.send || row.hand || row.account === '' || row.account === 'Unavailable' || handWithoutAccount))
      || (full && !finished)) emails.push(response.email);
  });
  return emails;
}

function lookup_(ctx, emails) {
  const queue = [];
  emails.forEach(function (email) { if (email && !(email in ctx.lookups) && queue.indexOf(email) < 0) queue.push(email); });
  const batches = [];
  let batch = [];
  queue.forEach(function (email) {
    const next = batch.concat([email]);
    if (batch.length && (next.length > LOOKUP_BATCH || utf8Length_(JSON.stringify({ emails: next })) > LOOKUP_BATCH_BYTES)) {
      batches.push(batch);
      batch = [email];
    } else {
      batch = next;
    }
  });
  if (batch.length) batches.push(batch);
  for (let i = 0; i < batches.length; i++) {
    if (ctx.lookupStopped || timeLeft_(ctx) < LOOKUP_RESERVE_MS) { markUnavailable_(ctx, batches.slice(i)); ctx.lookupStopped = true; return; }
    const result = fetchStatuses_(ctx, batches[i]);
    if (result === 'rate-limited') { markUnavailable_(ctx, batches.slice(i)); ctx.lookupStopped = true; return; }
    if (!result) { markUnavailable_(ctx, [batches[i]]); continue; }
    batches[i].forEach(function (email) { ctx.lookups[email] = result[email]; });
  }
}

function markUnavailable_(ctx, batches) {
  batches.forEach(function (list) { list.forEach(function (email) { ctx.lookups[email] = 'unavailable'; }); });
}

function fetchStatuses_(ctx, emails) {
  let response;
  try {
    response = UrlFetchApp.fetch(STATUS_URL, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + ctx.config.token },
      payload: JSON.stringify({ emails: emails }),
      followRedirects: false,
      muteHttpExceptions: true,
    });
  } catch (error) {
    return null;
  }
  const code = response.getResponseCode();
  if (code === 429) return 'rate-limited';
  if (code !== 200) return null;
  return parseStatuses_(emails, response.getContentText());
}

// The reply must answer exactly the requested emails, in order, with known values only.
function parseStatuses_(requested, text) {
  let body;
  try { body = JSON.parse(text); } catch (error) { return null; }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).join(',') !== 'results' || !Array.isArray(body.results) || body.results.length !== requested.length) return null;
  const map = {};
  for (let i = 0; i < requested.length; i++) {
    const result = body.results[i];
    if (!result || typeof result !== 'object' || Array.isArray(result) || result.email !== requested[i]) return null;
    const keys = Object.keys(result).sort().join(',');
    if (result.account === 'verified') {
      if (keys !== 'acceptedAt,account,email,status,userId' || typeof result.userId !== 'string' || !/^user_[A-Za-z0-9]+$/.test(result.userId)) return null;
      if (['accepted', 'pending', 'none'].indexOf(result.status) < 0) return null;
      if (result.status === 'accepted' ? !(typeof result.acceptedAt === 'number' && isFinite(result.acceptedAt)) : result.acceptedAt !== null) return null;
      map[result.email] = { account: 'verified', userId: result.userId, status: result.status, acceptedAt: result.acceptedAt };
    } else if (['invalid', 'none', 'ambiguous'].indexOf(result.account) >= 0 && keys === 'account,email') {
      map[result.email] = { account: result.account };
    } else {
      return null;
    }
  }
  return map;
}

// ---------------------------------------------------------------- ticks

function ticksInEdit_(ctx, edit) {
  return ctx.table.rows.filter(function (row) {
    return row.row >= edit.first && row.row <= edit.last && ((edit.send && row.send) || (edit.hand && row.hand));
  });
}

function processTicks_(ctx, rows, edit) {
  let ticked = rows.filter(function (row) { return row.send || row.hand; });
  if (!ticked.length) return;
  if (edit && edit.send) {
    // A paste or fill that ticks many rows at once is cleared without sending.
    const sends = ticked.filter(function (row) { return row.send && !row.hand; });
    if (sends.length > BULK_TICK_LIMIT) {
      sends.forEach(function (row) { clearTick_(ctx, row); ctx.outcomes[row.submissionId] = notSent_(NOT_SENT.BULK); });
      ticked = ticked.filter(function (row) { return row.hand; });
    }
  }
  lookup_(ctx, ticked.map(function (row) { const response = ctx.responses[row.submissionId]; return response ? response.email : ''; }));
  ticked.forEach(function (row) {
    if (row.hand) handleHand_(ctx, row);
    else if (row.send) act_(ctx, row);
  });
}

function handlePendingEdits_(ctx) {
  if (ctx.mode === 'setup' || ctx.mode === 'enable' || ctx.mode === 'resolve') return;
  for (let round = 0; round < 3 && ctx.props.getProperty('PENDING_EDIT'); round++) {
    if (timeLeft_(ctx) < SEND_RESERVE_MS) return;
    ctx.props.deleteProperty('PENDING_EDIT');
    ctx.table = readTable_(ctx);
    processTicks_(ctx, ctx.table.rows, null);
  }
}

function act_(ctx, row) {
  const decision = decide_(ctx, row);
  if (decision.kind === 'clear') {
    clearTick_(ctx, row);
    if (decision.status) ctx.outcomes[row.submissionId] = decision.status;
    return;
  }
  if (decision.kind === 'delay') { ctx.outcomes[row.submissionId] = decision.status; return; }
  let result;
  try {
    result = send_(ctx, row, decision);
  } catch (error) {
    ctx.stopSending = true;
    problem_(ctx, PROBLEM.RECORDS);
    ctx.outcomes[row.submissionId] = STATUS.QUEUED;
    return;
  }
  if (result.clear) clearTick_(ctx, row);
  if (result.status) ctx.outcomes[row.submissionId] = result.status;
}

// Decides what a ticked row gets. Only this function can return a send.
function decide_(ctx, row) {
  const config = ctx.config;
  if (row.duplicate) return clear_(review_(REVIEW.DUPLICATE));
  const sub = ctx.records[subKey_(ctx, row.submissionId)];
  if (sub) return clear_(recordStatus_(sub));
  const response = ctx.responses[row.submissionId];
  if (!response) return clear_(STATUS.DELETED);
  if (hasEvidence_(row)) return clear_(null);
  if (!ctx.sendingOn) return clear_(notSent_(NOT_SENT.OFF));
  if (!response.email) return clear_(notSent_(NOT_SENT.NO_EMAIL));
  const result = ctx.lookups[response.email];
  if (!result || result === 'unavailable') return delay_(STATUS.UNAVAILABLE);
  if (result.account === 'invalid') return clear_(notSent_(NOT_SENT.NO_EMAIL));
  if (result.account === 'none') return clear_(notSent_(NOT_SENT.NO_ACCOUNT));
  if (result.account === 'ambiguous') return clear_(review_(REVIEW.AMBIGUOUS));
  if (result.status === 'pending') return clear_(notSent_(NOT_SENT.PENDING));
  if (result.status !== 'accepted') return clear_(notSent_(NOT_SENT.NO_STATUS));
  const userId = result.userId;
  const accountRecord = ctx.records[acctKey_(ctx, userId)];
  if (accountRecord) return clear_(welcomedStatus_(ctx, row, accountRecord));
  const emailRecord = ctx.records[emailKey_(ctx, response.emailHash)];
  if (emailRecord) return clear_(emailRecord.userId && emailRecord.userId !== userId ? review_(REVIEW.EMAIL_OTHER_ACCOUNT) : welcomedStatus_(ctx, row, emailRecord));
  if (evidence_(ctx).some(function (item) { return (item.userId && item.userId === userId) || (item.emailHash && item.emailHash === response.emailHash); })) {
    return clear_(review_(REVIEW.RECORD_MISSING));
  }
  if (!config.automationStart || !(result.acceptedAt >= config.automationStart)) return clear_(notSent_(NOT_SENT.BEFORE_START));
  const nameIssue = nameProblem_(ctx, response, userId);
  if (nameIssue) return clear_(review_(nameIssue));
  const recipientRow = preferredRow_(ctx, row, userId);
  const recipientResponse = ctx.responses[recipientRow.submissionId];
  const recipient = recipientResponse.email;
  if (!strictAddress_(recipient)) return clear_(notSent_(NOT_SENT.NO_EMAIL));
  if (config.testOnly && recipient !== config.testOnly) return clear_(notSent_(NOT_SENT.TEST_MODE));
  const tracker = researcherTracker_(ctx);
  if (!tracker) return delay_(STATUS.UNAVAILABLE);
  if (tracker.emails[recipient] || tracker.emails[response.email]) return clear_(notSent_(NOT_SENT.IN_TRACKER));
  if (ctx.stopSending || ctx.sends >= config.maxSends || timeLeft_(ctx) < SEND_RESERVE_MS || !quotaOk_(ctx)) return delay_(STATUS.QUEUED);
  const hashes = [response.emailHash];
  if (recipientResponse.emailHash !== response.emailHash) hashes.push(recipientResponse.emailHash);
  return { kind: 'send', userId: userId, emailHashes: hashes, recipient: recipient, recipientSubmissionId: recipientRow.submissionId, name: response.name || 'Researcher' };
}

function clear_(status) { return { kind: 'clear', status: status }; }
function delay_(status) { return { kind: 'delay', status: status }; }

// One name across every application with this email and every row of this account.
function nameProblem_(ctx, response, userId) {
  const names = {};
  Object.keys(ctx.responses).forEach(function (id) {
    const other = ctx.responses[id];
    if (other.email && other.email === response.email && other.nameKey) names[other.nameKey] = true;
  });
  ctx.table.rows.forEach(function (row) {
    if (userIdFor_(ctx, row) !== userId) return;
    const other = ctx.responses[row.submissionId];
    if (other && other.nameKey) names[other.nameKey] = true;
  });
  if (Object.keys(names).length > 1) return REVIEW.SHARED_EMAIL;
  if (response.name && unsafeName_(response.name)) return REVIEW.NAME;
  return null;
}

// If one account applied with two verified emails, use the Researcher Email row (earliest on ties).
function preferredRow_(ctx, row, userId) {
  const candidates = ctx.table.rows.filter(function (other) {
    const data = ctx.responses[other.submissionId];
    return !other.duplicate && data && data.email && verifiedUserId_(ctx, data.email) === userId;
  });
  candidates.sort(function (a, b) {
    const left = ctx.responses[a.submissionId], right = ctx.responses[b.submissionId];
    return ((left.source === 'Researcher Email' ? 0 : 1) - (right.source === 'Researcher Email' ? 0 : 1)) || (left.time - right.time);
  });
  return candidates[0] || row;
}

function quotaOk_(ctx) {
  try {
    return MailApp.getRemainingDailyQuota() >= 2; // The welcome and its bcc copy.
  } catch (error) {
    problem_(ctx, PROBLEM.QUOTA);
    return false;
  }
}

function clearTick_(ctx, row) {
  const sheet = ctx.sheet;
  if (String(sheet.getRange(row.row, COL.SUBMISSION).getValue()).trim() !== row.submissionId) return false;
  sheet.getRange(row.row, COL.SEND).setValue(false);
  row.send = false;
  return true;
}

function handleHand_(ctx, row) {
  if (row.send) clearTick_(ctx, row);
  if (row.duplicate) { ctx.outcomes[row.submissionId] = review_(REVIEW.DUPLICATE); return; }
  if (ctx.records[subKey_(ctx, row.submissionId)]) return; // Already recorded.
  const response = ctx.responses[row.submissionId];
  const hash = response ? response.emailHash : '';
  const userId = response ? verifiedUserId_(ctx, response.email) : '';
  const keys = [subKey_(ctx, row.submissionId)];
  if (hash && !ctx.records[emailKey_(ctx, hash)]) keys.push(emailKey_(ctx, hash));
  if (userId && !ctx.records[acctKey_(ctx, userId)]) keys.push(acctKey_(ctx, userId));
  saveRecord_(ctx, keys, { state: 'hand', submissionId: row.submissionId, userId: userId, emailHashes: hash ? [hash] : [], at: Date.now() });
}

// Adds the account to hand records once a later lookup finds the verified account.
function completeHandRecords_(ctx) {
  ctx.table.rows.forEach(function (row) {
    const key = subKey_(ctx, row.submissionId);
    const sub = ctx.records[key];
    if (!sub || sub.state !== 'hand' || sub.userId) return;
    const response = ctx.responses[row.submissionId];
    const userId = response ? verifiedUserId_(ctx, response.email) : '';
    if (!userId) return;
    const keys = [key];
    if (!ctx.records[acctKey_(ctx, userId)]) keys.push(acctKey_(ctx, userId));
    saveRecord_(ctx, keys, Object.assign({}, sub, { userId: userId }));
  });
}

// ---------------------------------------------------------------- sending and records

function send_(ctx, row, decision) {
  const sheet = ctx.sheet, props = ctx.props;
  // Re-read the row, the switch and the records right before the attempt.
  const fresh = sheet.getRange(row.row, 1, 1, WIDTH).getValues()[0];
  const formulas = sheet.getRange(row.row, COL.SEND, 1, 2).getFormulas()[0];
  if (String(fresh[COL.SUBMISSION - 1]).trim() !== row.submissionId || fresh[COL.SEND - 1] !== true || formulas[0] || fresh[COL.HAND - 1] === true) {
    return { clear: false, status: null };
  }
  if (props.getProperty('SENDING_ENABLED') !== 'true') return { clear: true, status: notSent_(NOT_SENT.OFF) };
  const keys = recordKeys_(ctx, row.submissionId, decision.userId, decision.emailHashes);
  for (let i = 0; i < keys.length; i++) if (props.getProperty(keys[i])) return { clear: true, status: null };
  if (timeLeft_(ctx) < SEND_RESERVE_MS) return { clear: false, status: STATUS.QUEUED };
  const base = { submissionId: row.submissionId, recipientSubmissionId: decision.recipientSubmissionId, userId: decision.userId, emailHashes: decision.emailHashes, at: Date.now(), appended: false };
  saveRecord_(ctx, keys, Object.assign({ state: 'attempting' }, base));
  const message = buildEmail_(decision.name, ctx.config.researcherFormUrl);
  try {
    MailApp.sendEmail({ to: decision.recipient, bcc: SENDER_EMAIL, replyTo: SENDER_EMAIL, name: EMAIL.senderName, subject: EMAIL.subject, body: message.text, htmlBody: message.html });
  } catch (error) {
    ctx.stopSending = true;
    try {
      saveRecord_(ctx, keys, Object.assign({ state: 'review', error: errorText_(error) }, base));
    } catch (ignored) {
      // The attempt record becomes "review" at the start of the next run.
    }
    return { clear: true, status: STATUS.DELIVERY_UNKNOWN };
  }
  ctx.sends++;
  const sent = Object.assign({ state: 'sent' }, base);
  try {
    saveRecord_(ctx, keys, sent);
  } catch (error) {
    ctx.stopSending = true;
    problem_(ctx, PROBLEM.RECORDS);
    return { clear: true, status: STATUS.DELIVERY_UNKNOWN };
  }
  if (appendResearcher_(ctx, decision.name, decision.recipient)) {
    sent.appended = true;
    try { saveRecord_(ctx, keys, sent); } catch (ignored) { /* The next run sees the email listed and marks it. */ }
  }
  return { clear: true, status: STATUS.SENT };
}

function recordKeys_(ctx, submissionId, userId, emailHashes) {
  const keys = [subKey_(ctx, submissionId)];
  if (userId) keys.push(acctKey_(ctx, userId));
  (emailHashes || []).forEach(function (hash) {
    const key = emailKey_(ctx, hash);
    if (hash && keys.indexOf(key) < 0) keys.push(key);
  });
  return keys;
}

function subKey_(ctx, submissionId) { return 'ebs:sub:' + ctx.config.formId + ':' + submissionId; }
function acctKey_(ctx, userId) { return 'ebs:acct:' + ctx.config.cycle + ':' + userId; }
function emailKey_(ctx, hash) { return 'ebs:email:' + ctx.config.cycle + ':' + hash; }

function saveRecord_(ctx, keys, record) {
  const value = JSON.stringify(record), update = {};
  keys.forEach(function (key) { update[key] = value; });
  ctx.props.setProperties(update);
  keys.forEach(function (key) { ctx.records[key] = record; });
}

function readRecords_(props) {
  const all = props.getProperties(), records = {};
  Object.keys(all).forEach(function (key) {
    if (key.indexOf('ebs:') === 0) { const record = readJson_(all[key]); if (record) records[key] = record; }
  });
  return records;
}

// A run that stopped between "attempting" and "sent" may or may not have sent the email.
function convertStaleAttempts_(ctx) {
  const update = {};
  Object.keys(ctx.records).forEach(function (key) {
    const record = ctx.records[key];
    if (record.state !== 'attempting') return;
    const next = Object.assign({}, record, { state: 'review', error: record.error || 'stopped before the send was confirmed' });
    update[key] = JSON.stringify(next);
    ctx.records[key] = next;
  });
  if (Object.keys(update).length) ctx.props.setProperties(update);
}

function resolve_(ctx, request) {
  const response = ctx.responses[request.submissionId];
  if (!response) throw new Error('That submission is not in the Form responses.');
  const row = ctx.table.rowOf[request.submissionId] || '?';
  const key = subKey_(ctx, request.submissionId);
  const record = ctx.records[key];
  const masked = maskEmail_(response.email || response.rawEmail);
  if (request.outcome === 'retry') {
    if (!record || record.state !== 'review') throw new Error('Only a send marked Needs owner review can be retried.');
    Object.keys(ctx.records).forEach(function (other) {
      const value = ctx.records[other];
      if (value.submissionId === request.submissionId && value.state === 'review') { ctx.props.deleteProperty(other); delete ctx.records[other]; }
    });
    console.log('Cleared the review for row ' + row + ' (' + masked + '). Tick Send welcome email to send again.');
    return;
  }
  if (record && (record.state === 'sent' || record.state === 'hand')) {
    console.log('Row ' + row + ' (' + masked + ') is already recorded as ' + (record.state === 'sent' ? 'sent' : 'welcomed by hand') + '.');
    return;
  }
  lookup_(ctx, [response.email]);
  const userId = verifiedUserId_(ctx, response.email);
  const keys = [key];
  const own = function (otherKey) { const existing = ctx.records[otherKey]; return !existing || existing.submissionId === request.submissionId; };
  if (userId && own(acctKey_(ctx, userId))) keys.push(acctKey_(ctx, userId));
  if (response.emailHash && own(emailKey_(ctx, response.emailHash))) keys.push(emailKey_(ctx, response.emailHash));
  const sent = { state: 'sent', submissionId: request.submissionId, recipientSubmissionId: request.submissionId, userId: userId, emailHashes: response.emailHash ? [response.emailHash] : [], at: Date.now(), appended: false, resolved: true };
  saveRecord_(ctx, keys, sent);
  if (response.email && appendResearcher_(ctx, response.name || 'Researcher', response.email)) {
    sent.appended = true;
    saveRecord_(ctx, keys, sent);
  }
  console.log('Recorded row ' + row + ' (' + masked + ') as sent.');
}

// ---------------------------------------------------------------- Researcher tracker

function researcherTracker_(ctx) {
  if (ctx.researcher !== undefined) return ctx.researcher;
  ctx.researcher = null;
  try {
    if (sharingProblem_(ctx.config.researcherTrackerId)) { problem_(ctx, PROBLEM.RESEARCHER); return null; }
    const sheet = SpreadsheetApp.openById(ctx.config.researcherTrackerId).getSheetByName(ctx.config.researcherSheet);
    if (!sheet || sheet.getLastRow() < 1) { problem_(ctx, PROBLEM.RESEARCHER); return null; }
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (value) { return String(value).trim().toLowerCase(); });
    const nameColumns = [], emailColumns = [];
    header.forEach(function (value, index) {
      if (value === 'researcher' || value === 'reseacher') nameColumns.push(index + 1);
      if (value === 'email') emailColumns.push(index + 1);
    });
    if (nameColumns.length !== 1 || emailColumns.length !== 1) { problem_(ctx, PROBLEM.RESEARCHER); return null; }
    const emails = {};
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, emailColumns[0], sheet.getLastRow() - 1, 1).getValues().forEach(function (line) {
        const email = normalizeEmail_(line[0]);
        if (email) emails[email] = true;
      });
    }
    ctx.researcher = { sheet: sheet, nameColumn: nameColumns[0], emailColumn: emailColumns[0], emails: emails };
  } catch (error) {
    problem_(ctx, PROBLEM.RESEARCHER);
    ctx.researcher = null;
  }
  return ctx.researcher;
}

function appendResearcher_(ctx, name, email) {
  const tracker = researcherTracker_(ctx);
  if (!tracker) return false;
  if (tracker.emails[email]) return true;
  try {
    const first = Math.min(tracker.nameColumn, tracker.emailColumn), last = Math.max(tracker.nameColumn, tracker.emailColumn);
    const line = [];
    for (let column = first; column <= last; column++) {
      line.push(column === tracker.nameColumn ? cellText_(name) : column === tracker.emailColumn ? cellText_(email) : '');
    }
    tracker.sheet.getRange(tracker.sheet.getLastRow() + 1, first, 1, line.length).setValues([line]);
    tracker.emails[email] = true;
    return true;
  } catch (error) {
    problem_(ctx, PROBLEM.RESEARCHER);
    return false;
  }
}

function retryAppends_(ctx) {
  const prefix = 'ebs:sub:' + ctx.config.formId + ':';
  Object.keys(ctx.records).forEach(function (key) {
    const record = ctx.records[key];
    if (key.indexOf(prefix) !== 0 || record.state !== 'sent' || record.appended !== false) return;
    const response = ctx.responses[record.recipientSubmissionId || record.submissionId];
    if (!response || !response.email) return;
    if (!appendResearcher_(ctx, response.name || 'Researcher', response.email)) return;
    saveRecord_(ctx, recordKeys_(ctx, record.submissionId, record.userId, record.emailHashes), Object.assign({}, record, { appended: true }));
  });
}

// ---------------------------------------------------------------- status line

function finishRun_(ctx) {
  const props = ctx.props, now = Date.now();
  const problems = ctx.problems.slice();
  const ignored = ctx.table.ignored;
  if (ignored) problems.push(ignored + (ignored === 1 ? ' tick' : ' ticks') + ' ignored — use the checkboxes, without formulas');
  let unavailable = 0;
  ctx.table.rows.forEach(function (row) {
    const response = ctx.responses[row.submissionId];
    if (response && response.email && ctx.lookups[response.email] === 'unavailable') unavailable++;
  });
  if (unavailable) problems.push('EBS lookup unavailable for ' + unavailable + (unavailable === 1 ? ' row' : ' rows'));
  const prefix = 'ebs:sub:' + ctx.config.formId + ':';
  const pending = Object.keys(ctx.records).filter(function (key) { const record = ctx.records[key]; return key.indexOf(prefix) === 0 && record.state === 'sent' && record.appended === false; }).length;
  if (pending) problems.push(pending + (pending === 1 ? ' welcome' : ' welcomes') + ' to add to the Researcher tracker');
  const unrecorded = evidence_(ctx).length;
  if (unrecorded) problems.push(unrecorded + (unrecorded === 1 ? ' row shows' : ' rows show') + ' a welcome with no record — see the runbook');
  const c = ctx.counts;
  const summary = { counts: c.rows + ' rows, ' + c.sent + ' sent, ' + c.hand + ' welcomed by hand, ' + c.review + ' need owner review, ' + c.waiting + ' waiting', problems: problems };
  const updates = { LAST_SUCCESS: String(now), LAST_STATUS: JSON.stringify(summary) };
  if (ctx.fullRefresh) updates.LAST_FULL_REFRESH = String(now);
  props.setProperties(updates);
  ctx.sheet.getRange(1, 1).setValue(cellText_(renderStatus_(props, summary)));
}

function refreshStatusLine_(props, sheet) {
  if (!sheet) return;
  const summary = readJson_(props.getProperty('LAST_STATUS')) || { counts: '', problems: [] };
  sheet.getRange(1, 1).setValue(cellText_(renderStatus_(props, summary)));
}

function renderStatus_(props, summary) {
  const sending = props.getProperty('SENDING_ENABLED') === 'true' ? (String(props.getProperty('TEST_ONLY_RECIPIENT') || '').trim() ? 'Test mode' : 'On') : 'Paused';
  const parts = ['Last successful check: ' + formatTime_(props.getProperty('LAST_SUCCESS')), 'Sending: ' + sending, summary.problems && summary.problems.length ? 'Problems: ' + summary.problems.join('; ') : 'No problems'];
  if (summary.counts) parts.push(summary.counts);
  return parts.join(' · ');
}

function tally_(counts, status) {
  counts.rows++;
  if (status === STATUS.SENT) counts.sent++;
  else if (status === STATUS.HAND) counts.hand++;
  else if (String(status).indexOf('Needs owner review') === 0) counts.review++;
  else if (status === STATUS.QUEUED || status === STATUS.UNAVAILABLE) counts.waiting++;
}

function problem_(ctx, text) {
  if (ctx.problems.indexOf(text) < 0) ctx.problems.push(text);
}

// ---------------------------------------------------------------- email

function buildEmail_(name, url) {
  const greeting = EMAIL.greeting.replace('[Name]', name);
  const parts = EMAIL.paragraphs[1].split('[link]');
  const text = [greeting, '', EMAIL.paragraphs[0], '', parts[0] + 'link (' + url + ')' + parts[1], '', EMAIL.paragraphs[2], '', EMAIL.closing].concat(EMAIL.signature).join('\n');
  const html = '<p>' + html_(greeting) + '</p>'
    + '<p>' + html_(EMAIL.paragraphs[0]) + '</p>'
    + '<p>' + html_(parts[0]) + '<a href="' + html_(url) + '">link</a>' + html_(parts[1]) + '</p>'
    + '<p>' + html_(EMAIL.paragraphs[2]) + '</p>'
    + '<p>' + [EMAIL.closing].concat(EMAIL.signature).map(html_).join('<br>') + '</p>';
  return { text: text, html: html };
}

function html_(value) {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    .replace(/ {2,}/g, function (spaces) { return ' ' + new Array(spaces.length).join('&nbsp;'); });
}

// ---------------------------------------------------------------- small helpers

function notSent_(pair) {
  return 'Not sent (' + Utilities.formatDate(new Date(), TIME_ZONE, 'MMM d') + '): ' + pair[0] + '.' + (pair[1] ? ' ' + pair[1] : '');
}

function review_(reason) { return 'Needs owner review: ' + reason; }

function cellText_(value) {
  const text = String(value == null ? '' : value);
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

function normalizeEmail_(value) { return String(value == null ? '' : value).trim().toLowerCase(); }

function plausibleEmail_(email) { return !!email && email.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email); }

// One plain address only: MailApp treats commas and semicolons as recipient separators.
function strictAddress_(email) { return plausibleEmail_(email) && !/[\s,;"()<>\[\]\\:]/.test(email); }

function normalizeName_(value) {
  const text = String(value == null ? '' : value).normalize('NFC').replace(/\s+/g, ' ')
    .replace(/[\u0000-\u001f\u007f-\u009f­؜ᅟᅠ឴឵᠋-᠏​-‏‪-‮⁠-⁯ㅤ︀-️﻿ﾠ￰-￻]/g, '')
    .replace(/ {2,}/g, ' ').trim();
  return text.length > 80 ? text.slice(0, 80).trim() : text;
}

// Names that could carry a link or address into an email from the EBS account need a person.
function unsafeName_(name) { return /[@<>]|:\/\/|www\.|[a-z0-9-]\.[a-z]{2,}(?:[\/\s]|$)/i.test(name); }

function hashEmail_(email) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email, Utilities.Charset.UTF_8)
    .map(function (byte) { return ('0' + (byte & 255).toString(16)).slice(-2); }).join('');
}

function validResearcherFormUrl_(value) {
  const text = String(value == null ? '' : value).trim();
  if (!text || text.length > 2048) return null;
  return /^https:\/\/(?:docs\.google\.com\/forms\/(?:u\/\d+\/)?d\/(?:e\/)?[A-Za-z0-9_-]{10,}(?:\/[A-Za-z0-9_-]+)*\/?|forms\.gle\/[A-Za-z0-9]{5,})(?:\?[A-Za-z0-9_.~=&%-]*)?$/.test(text) ? text : null;
}

function validTestRecipient_(email) { return email === SENDER_EMAIL || /^exeterbiosymposium\+[a-z0-9._-]+@gmail\.com$/.test(email); }

function maskEmail_(email) {
  const text = String(email || ''), at = text.indexOf('@');
  return at > 0 ? text.charAt(0) + '***' + text.slice(at) : '***';
}

function readJson_(text) {
  if (!text) return null;
  try { const value = JSON.parse(text); return value && typeof value === 'object' ? value : null; } catch (error) { return null; }
}

function errorText_(error) { return String((error && error.message) || error || 'unknown error').slice(0, 200); }

function formatTime_(value) {
  const time = Number(value);
  return time ? Utilities.formatDate(new Date(time), TIME_ZONE, 'MMM d, yyyy h:mm a') : 'never';
}

function timeLeft_(ctx) { return RUN_LIMIT_MS - (Date.now() - ctx.started); }

function utf8Length_(text) { return encodeURIComponent(text).replace(/%[0-9A-F]{2}/gi, 'x').length; }

function sameCells_(left, right) {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i++) {
    const a = left[i] instanceof Date ? left[i].getTime() : left[i];
    const b = right[i] instanceof Date ? right[i].getTime() : right[i];
    if (a !== b) return false;
  }
  return true;
}

function findSheet_(ss, sheetId) {
  return ss.getSheets().filter(function (sheet) { return sheet.getSheetId() === sheetId; })[0] || null;
}

function findClaim_(ss) {
  return ss.getDeveloperMetadata().filter(function (item) { return item.getKey() === CLAIM_KEY; })[0] || null;
}

function lastIdRow_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < FIRST_ROW || sheet.getMaxColumns() < COL.SUBMISSION) return FIRST_ROW - 1;
  const ids = sheet.getRange(FIRST_ROW, COL.SUBMISSION, lastRow - FIRST_ROW + 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]).trim()) return FIRST_ROW + i;
  return FIRST_ROW - 1;
}

function checkboxRule_() {
  return SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build();
}
