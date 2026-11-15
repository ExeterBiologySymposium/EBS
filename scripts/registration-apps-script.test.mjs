// Tests for apps-script/student-registration/Code.gs with in-memory fakes of the Apps Script
// services it uses. The script is loaded in the main realm with new Function so assertions and
// errors behave normally; Node-only globals are passed as undefined so the script cannot rely on them.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../apps-script/student-registration/', import.meta.url);
const source = await readFile(new URL('Code.gs', root), 'utf8');
const manifest = JSON.parse(await readFile(new URL('appsscript.json', root), 'utf8'));
const FUNCTIONS = [...source.matchAll(/^function\s+([A-Za-z0-9_$]+)\s*\(/gm)].map(match => match[1]);
const SERVICES = ['SpreadsheetApp', 'FormApp', 'DriveApp', 'UrlFetchApp', 'MailApp', 'PropertiesService', 'LockService', 'Session', 'ScriptApp', 'Utilities', 'console', 'Logger', 'Date'];
const NODE_ONLY = ['URL', 'URLSearchParams', 'Buffer', 'fetch', 'TextEncoder', 'TextDecoder', 'setTimeout', 'structuredClone', 'process', 'require'];
const factory = new Function(...SERVICES, ...NODE_ONLY, '"use strict";\n' + source + '\nreturn {' + FUNCTIONS.join(', ') + '};');

const SENDER = 'exeterbiosymposium@gmail.com';
const TOKEN = 'test-token-' + 'k'.repeat(40);
const FORM_URL = 'https://docs.google.com/forms/d/e/TESTFORMIDENTIFIER0123456789/viewform?usp=header';
const STATUS_URL = 'https://www.exeterbiosymposium.page/api/registration-status';
const SUBJECT = '[Action Required] EBS Registration Update';
const T0 = Date.parse('2026-11-16T15:00:00Z');
const QUEUED = 'Queued — sends at the next check (untick to cancel)';
const UNAVAILABLE = 'Check unavailable — retries at the next check (untick to cancel)';
const COL = { SEND: 1, HAND: 2, RECEIVED: 3, NAME: 4, EMAIL: 5, SOURCE: 6, ACCOUNT: 7, STATUS: 8, WELCOME: 9, SENT_AT: 10, SUBMISSION: 11, USER: 12 };
const HEADERS = ['Send welcome email', 'Welcomed by hand', 'Application received', 'Name in email', 'Application email', 'Email source', 'Clerk account', 'EBS status', 'Welcome email', 'Welcome sent at', 'Submission ID', 'Clerk account ID'];
const ITEMS = { name: 1001, account: 1002, adult: 1003, age: 1004 };

const copy = value => value instanceof Date ? new Date(value.getTime()) : value;
const digest = value => createHash('sha256').update(String(value), 'utf8').digest('hex');
const notSent = (reason, action = '') => `Not sent (Nov 16): ${reason}.${action ? ' ' + action : ''}`;
const review = reason => `Needs owner review: ${reason}`;

// ---------------------------------------------------------------- fakes
class Cell { constructor() { this.value = ''; this.formula = ''; this.validation = null; this.note = ''; } }

class FakeRange {
  constructor(sheet, row, column, numRows, numColumns) { Object.assign(this, { sheet, row, column, numRows, numColumns }); }
  getRow() { return this.row; }
  getColumn() { return this.column; }
  getLastRow() { return this.row + this.numRows - 1; }
  getLastColumn() { return this.column + this.numColumns - 1; }
  getNumRows() { return this.numRows; }
  getNumColumns() { return this.numColumns; }
  getSheet() { return this.sheet; }
  map(read) {
    const out = [];
    for (let r = 0; r < this.numRows; r++) { const line = []; for (let c = 0; c < this.numColumns; c++) line.push(read(this.row + r, this.column + c)); out.push(line); }
    return out;
  }
  getValues() { return this.map((r, c) => copy(this.sheet.peek(r, c)?.value ?? '')); }
  getValue() { return copy(this.sheet.peek(this.row, this.column)?.value ?? ''); }
  getFormulas() { return this.map((r, c) => this.sheet.peek(r, c)?.formula ?? ''); }
  getDataValidations() { return this.map((r, c) => this.sheet.peek(r, c)?.validation ?? null); }
  setValues(values) {
    if (!Array.isArray(values) || values.length !== this.numRows || values.some(line => !Array.isArray(line) || line.length !== this.numColumns)) {
      throw new Error(`The number of rows or columns in the data does not match the range (${this.numRows}x${this.numColumns}).`);
    }
    for (const line of values) for (const value of line) checkValue(value);
    this.sheet.w.noteWrite({ kind: 'values', sheet: this.sheet, range: this });
    values.forEach((line, r) => line.forEach((value, c) => { const cell = this.sheet.cell(this.row + r, this.column + c); cell.value = value == null ? '' : copy(value); cell.formula = ''; }));
    return this;
  }
  setValue(value) { return this.setValues(Array.from({ length: this.numRows }, () => Array(this.numColumns).fill(value))); }
  setDataValidation(rule) { this.sheet.w.noteWrite({ kind: 'validation', sheet: this.sheet, range: this }); this.map((r, c) => { this.sheet.cell(r, c).validation = rule; }); return this; }
  setNote(note) { this.sheet.w.noteWrite({ kind: 'note', sheet: this.sheet, range: this }); this.sheet.cell(this.row, this.column).note = String(note); return this; }
  setNumberFormat() { this.sheet.w.noteWrite({ kind: 'format', sheet: this.sheet, range: this }); return this; }
  setFontWeight() { this.sheet.w.noteWrite({ kind: 'format', sheet: this.sheet, range: this }); return this; }
}
function checkValue(value) {
  if (value === null || value === undefined || value instanceof Date || ['string', 'number', 'boolean'].includes(typeof value)) return;
  throw new Error('Unsupported cell value: ' + Object.prototype.toString.call(value));
}

class FakeProtection {
  constructor(sheet) { this.sheet = sheet; this.editors = [SENDER, 'staff.one@example.test']; this.unprotected = []; this.warningOnly = false; this.domainEdit = true; this.description = ''; }
  setDescription(text) { this.description = text; return this; }
  getEditors() { return this.editors.map(email => ({ getEmail: () => email })); }
  addEditor(user) { const email = typeof user === 'string' ? user : user.getEmail(); if (!this.editors.includes(email)) this.editors.push(email); return this; }
  removeEditors(users) { const emails = users.map(user => typeof user === 'string' ? user : user.getEmail()); this.editors = this.editors.filter(email => email === SENDER || !emails.includes(email)); return this; }
  setUnprotectedRanges(ranges) { this.unprotected = ranges.map(range => [range.getRow(), range.getColumn(), range.getNumRows(), range.getNumColumns()]); return this; }
  getUnprotectedRanges() { return this.unprotected.map(([row, column, numRows, numColumns]) => this.sheet.getRange(row, column, numRows, numColumns)); }
  setWarningOnly(value) { this.warningOnly = value; return this; }
  isWarningOnly() { return this.warningOnly; }
  canDomainEdit() { return this.domainEdit; }
  setDomainEdit(value) { this.domainEdit = value; return this; }
}

class FakeSheet {
  constructor(w, spreadsheet, name, id) { Object.assign(this, { w, spreadsheet, name, id }); this.cells = new Map(); this.frozen = 0; this.maxRows = 1000; this.maxColumns = 26; this.protections = []; }
  cell(row, column) { const key = row + ':' + column; if (!this.cells.has(key)) this.cells.set(key, new Cell()); return this.cells.get(key); }
  peek(row, column) { return this.cells.get(row + ':' + column); }
  getName() { return this.name; }
  getSheetId() { return this.id; }
  getParent() { return this.spreadsheet; }
  getMaxRows() { return this.maxRows; }
  getMaxColumns() { return this.maxColumns; }
  getLastRow() { let last = 0; for (const [key, cell] of this.cells) if (cell.value !== '' || cell.formula) last = Math.max(last, Number(key.split(':')[0])); return last; }
  getLastColumn() { let last = 0; for (const [key, cell] of this.cells) if (cell.value !== '' || cell.formula) last = Math.max(last, Number(key.split(':')[1])); return last; }
  getRange(row, column, numRows = 1, numColumns = 1) {
    if (![row, column, numRows, numColumns].every(Number.isInteger) || row < 1 || column < 1 || numRows < 1 || numColumns < 1) throw new Error(`Invalid range ${row},${column},${numRows},${numColumns}`);
    if (row + numRows - 1 > this.maxRows || column + numColumns - 1 > this.maxColumns) throw new Error('Range is outside the sheet');
    return new FakeRange(this, row, column, numRows, numColumns);
  }
  setFrozenRows(count) { this.w.noteWrite({ kind: 'freeze', sheet: this }); this.frozen = count; return this; }
  getFrozenRows() { return this.frozen; }
  insertRowsAfter(after, count) { this.w.noteWrite({ kind: 'insertRows', sheet: this }); this.shift(after, count, 0); this.maxRows += count; return this; }
  insertColumnsAfter(after, count) { this.w.noteWrite({ kind: 'insertColumns', sheet: this }); this.shift(after, count, 1); this.maxColumns += count; return this; }
  shift(after, count, axis) {
    const moved = new Map();
    for (const [key, cell] of this.cells) { const parts = key.split(':').map(Number); if (parts[axis] > after) parts[axis] += count; moved.set(parts.join(':'), cell); }
    this.cells = moved;
  }
  protect() { this.w.noteWrite({ kind: 'protect', sheet: this }); const protection = new FakeProtection(this); this.protections.push(protection); return protection; }
  getProtections(type) { return type === 'SHEET' ? this.protections.slice() : []; }
}

class FakeSpreadsheet {
  constructor(w, id) { this.w = w; this.id = id; this.sheets = []; this.metadata = []; this.nextSheetId = 100; }
  getId() { return this.id; }
  getSheets() { return this.sheets.slice(); }
  getSheetByName(name) { return this.sheets.find(sheet => sheet.name === name) || null; }
  addSheetDirect(name) { const sheet = new FakeSheet(this.w, this, name, this.nextSheetId++); this.sheets.push(sheet); return sheet; }
  insertSheet(name) { if (this.getSheetByName(name)) throw new Error('A sheet with that name already exists.'); this.w.noteWrite({ kind: 'insertSheet' }); return this.addSheetDirect(name); }
  addDeveloperMetadata(key, value, visibility) { this.w.noteWrite({ kind: 'metadata' }); this.metadata.push({ key, value, visibility, project: this.w.scriptId }); return this; }
  getDeveloperMetadata() {
    return this.metadata.filter(item => item.visibility === 'DOCUMENT' || item.project === this.w.scriptId).map(item => ({
      getKey: () => item.key, getValue: () => item.value, getVisibility: () => item.visibility,
      setValue: value => { this.w.noteWrite({ kind: 'metadata' }); item.value = value; },
    }));
  }
}

function makeWorld() {
  const w = {
    clock: T0, props: new Map(), writes: [], mail: [], fetches: [], logs: [], violations: [], triggers: [], spreadsheets: new Map(), files: new Map(),
    quota: 100, quotaError: null, mailError: null, missingScopes: false, effectiveUser: SENDER, scriptId: 'script_main', lockHeld: false, unflushed: false,
    failWrite: null, onFetch: null, onSend: null, onQuota: null, responses: [], deleted: new Set(), getResponsesError: null, accounts: new Map(), endpoint: null,
    form: { id: 'form_main', destination: 'ss_tracker', canEdit: false, summary: false, items: [
      { id: ITEMS.name, title: 'Full Name' }, { id: ITEMS.account, title: 'Researcher Email' }, { id: ITEMS.adult, title: 'Adult Contact Person Email' }, { id: ITEMS.age, title: 'Age' }] },
  };
  w.noteWrite = entry => {
    const range = entry.range;
    const record = { kind: entry.kind, sheet: entry.sheet?.name ?? null, spreadsheet: entry.sheet?.spreadsheet?.id ?? null, key: entry.key, value: entry.value, row: range?.row, column: range?.column, numRows: range?.numRows, numColumns: range?.numColumns };
    if (w.failWrite && w.failWrite(record)) throw new Error('Service error: write failed');
    if (entry.sheet || ['insertSheet', 'metadata', 'validation'].includes(entry.kind)) w.unflushed = true;
    w.writes.push(record);
  };
  class FakeDate extends Date {
    constructor(...args) { if (args.length) super(...args); else super(w.clock); }
    static now() { return w.clock; }
  }
  const properties = {
    getProperty: key => w.props.has(key) ? w.props.get(key) : null,
    setProperty(key, value) { w.noteWrite({ kind: 'prop', key, value: String(value) }); w.props.set(key, String(value)); return properties; },
    setProperties(values, deleteOthers) {
      for (const [key, value] of Object.entries(values)) w.noteWrite({ kind: 'prop', key, value: String(value) });
      if (deleteOthers) w.props.clear();
      for (const [key, value] of Object.entries(values)) w.props.set(key, String(value));
      return properties;
    },
    deleteProperty(key) { w.noteWrite({ kind: 'deleteProp', key }); w.props.delete(key); return properties; },
    getProperties: () => Object.fromEntries(w.props),
    getKeys: () => [...w.props.keys()],
  };
  const lock = {
    tryLock() { if (w.lockHeld) return false; w.lockHeld = true; return true; },
    waitLock() { if (w.lockHeld) throw new Error('Lock timeout: another process was holding the lock for too long.'); w.lockHeld = true; },
    hasLock: () => w.lockHeld,
    releaseLock() { if (w.unflushed) w.violations.push('releaseLock before flush'); w.lockHeld = false; },
  };
  const item = data => ({ getId: () => data.id, getTitle: () => data.title });
  const formResponse = data => ({
    getId: () => data.id,
    getTimestamp: () => new Date(data.at),
    getResponseForItem: it => data.answers.has(it.getId()) ? { getResponse: () => data.answers.get(it.getId()), getItem: () => it } : null,
  });
  const form = {
    getId: () => w.form.id,
    getDestinationId: () => w.form.destination,
    canEditResponse: () => w.form.canEdit,
    isPublishingSummary: () => w.form.summary,
    getItems: () => w.form.items.map(item),
    getItemById: id => { const found = w.form.items.find(entry => entry.id === id); return found ? item(found) : null; },
    getResponses: () => { if (w.getResponsesError) throw w.getResponsesError; return w.responses.filter(r => !w.deleted.has(r.id)).map(formResponse); },
    getResponse: id => { const found = w.responses.find(r => r.id === id && !w.deleted.has(r.id)); if (!found) throw new Error('No response with ID ' + id); return formResponse(found); },
  };
  const services = {
    SpreadsheetApp: {
      openById: id => { const found = w.spreadsheets.get(id); if (!found) throw new Error('Spreadsheet not found'); return found; },
      flush: () => { w.unflushed = false; },
      newDataValidation: () => { const rule = { type: null, allowInvalid: true }; const builder = { requireCheckbox: () => { rule.type = 'CHECKBOX'; return builder; }, setAllowInvalid: value => { rule.allowInvalid = value; return builder; }, build: () => ({ getCriteriaType: () => rule.type, getAllowInvalid: () => rule.allowInvalid }) }; return builder; },
      DataValidationCriteria: { CHECKBOX: 'CHECKBOX' },
      DeveloperMetadataVisibility: { DOCUMENT: 'DOCUMENT', PROJECT: 'PROJECT' },
      ProtectionType: { SHEET: 'SHEET', RANGE: 'RANGE' },
    },
    FormApp: { openById: id => { if (id !== w.form.id) throw new Error('Form not found'); return form; } },
    DriveApp: {
      getFileById: id => { const file = w.files.get(id); if (!file) throw new Error('File not found'); return { getSharingAccess: () => file.access, isShareableByEditors: () => file.shareable }; },
      Access: { PRIVATE: 'PRIVATE', ANYONE: 'ANYONE', ANYONE_WITH_LINK: 'ANYONE_WITH_LINK', DOMAIN: 'DOMAIN', DOMAIN_WITH_LINK: 'DOMAIN_WITH_LINK' },
    },
    UrlFetchApp: {
      fetch(url, params) {
        w.fetches.push({ url, params });
        if (w.onFetch) { const hook = w.onFetch; w.onFetch = null; hook(); }
        const reply = (w.endpoint || defaultEndpoint)(w, url, params);
        return { getResponseCode: () => reply.code, getContentText: () => reply.body, getHeaders: () => ({}) };
      },
    },
    MailApp: {
      sendEmail(message) {
        if (typeof message !== 'object' || message === null || arguments.length !== 1) throw new Error('The test fake only supports sendEmail(message)');
        if (w.mailError) throw w.mailError;
        if (w.onSend) { const hook = w.onSend; w.onSend = null; hook(message); }
        w.mail.push({ ...message });
        w.quota -= 1 + (message.bcc ? 1 : 0);
      },
      getRemainingDailyQuota: () => { if (w.onQuota) { const hook = w.onQuota; w.onQuota = null; hook(); } if (w.quotaError) throw w.quotaError; return w.quota; },
    },
    PropertiesService: { getScriptProperties: () => properties },
    LockService: { getScriptLock: () => lock },
    Session: { getEffectiveUser: () => ({ getEmail: () => w.effectiveUser }), getActiveUser: () => ({ getEmail: () => w.effectiveUser }), getScriptTimeZone: () => 'America/New_York' },
    ScriptApp: {
      AuthMode: { FULL: 'FULL' },
      AuthorizationStatus: { REQUIRED: 'REQUIRED', NOT_REQUIRED: 'NOT_REQUIRED' },
      EventType: { ON_EDIT: 'ON_EDIT', ON_FORM_SUBMIT: 'ON_FORM_SUBMIT', CLOCK: 'CLOCK' },
      getScriptId: () => w.scriptId,
      requireAllScopes: () => { if (w.missingScopes) throw new Error('Authorization is required to perform that action.'); },
      getAuthorizationInfo: (mode, scopes) => ({ getAuthorizationStatus: () => (w.missingScopes || !Array.isArray(scopes) ? 'REQUIRED' : 'NOT_REQUIRED') }),
      getProjectTriggers: () => w.triggers.slice(),
      deleteTrigger: trigger => { w.triggers = w.triggers.filter(entry => entry !== trigger); },
      newTrigger: handler => {
        const spec = { handler };
        const done = { create: () => { const trigger = { ...spec, getHandlerFunction: () => handler, getEventType: () => spec.event, getTriggerSourceId: () => spec.source }; w.triggers.push(trigger); return trigger; } };
        return {
          forSpreadsheet: id => ({ onEdit: () => { Object.assign(spec, { event: 'ON_EDIT', source: id }); return done; } }),
          forForm: id => ({ onFormSubmit: () => { Object.assign(spec, { event: 'ON_FORM_SUBMIT', source: id }); return done; } }),
          timeBased: () => ({ everyHours: hours => { Object.assign(spec, { event: 'CLOCK', hours }); return done; } }),
        };
      },
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'SHA_256' },
      Charset: { UTF_8: 'UTF_8' },
      computeDigest: (algorithm, value) => { assert.equal(algorithm, 'SHA_256'); return [...createHash('sha256').update(String(value), 'utf8').digest()].map(byte => byte > 127 ? byte - 256 : byte); },
      formatDate: (date, timeZone, pattern) => {
        const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(date).map(part => [part.type, part.value]));
        return pattern.replace('MMM', parts.month).replace('yyyy', parts.year).replace(/\bd\b/, parts.day).replace('h:mm a', `${parts.hour}:${parts.minute} ${parts.dayPeriod}`);
      },
    },
    console: { log: (...args) => w.logs.push(args.join(' ')), info: (...args) => w.logs.push(args.join(' ')), warn: (...args) => w.logs.push(args.join(' ')), error: (...args) => w.logs.push(args.join(' ')) },
    Logger: { log: (...args) => w.logs.push(args.join(' ')) },
    Date: FakeDate,
  };
  w.api = factory(...SERVICES.map(name => services[name]), ...NODE_ONLY.map(() => undefined));
  return w;
}

function defaultEndpoint(w, url, params) {
  if (url !== STATUS_URL || params.headers?.Authorization !== 'Bearer ' + TOKEN) return { code: 401, body: '{"state":"unauthorized"}' };
  const { emails } = JSON.parse(params.payload);
  return { code: 200, body: JSON.stringify({ results: emails.map(email => {
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return { email, account: 'invalid' };
    const account = w.accounts.get(email);
    if (!account) return { email, account: 'none' };
    if (account === 'ambiguous') return { email, account: 'ambiguous' };
    return { email, account: 'verified', userId: account.userId, status: account.status, acceptedAt: account.status === 'accepted' ? account.acceptedAt : null };
  }) }) };
}

// ---------------------------------------------------------------- scenario helpers
let responseCounter = 0;
function addResponse(w, { name, email = '', adult = '', at = w.clock - 3_600_000 }) {
  const id = 'resp_' + (++responseCounter).toString().padStart(4, '0');
  const answers = new Map([[ITEMS.name, name], [ITEMS.account, email], [ITEMS.adult, adult], [ITEMS.age, '15']]);
  w.responses.push({ id, at, answers });
  return id;
}
function account(w, email, userId, status = 'pending') { w.accounts.set(email, { userId, status, acceptedAt: status === 'accepted' ? w.clock : null }); }
function accept(w, email) { const entry = w.accounts.get(email); entry.status = 'accepted'; entry.acceptedAt = w.clock; }

function baseWorld({ responses = true } = {}) {
  const w = makeWorld();
  for (const [key, value] of Object.entries({ EBS_STATUS_TOKEN: TOKEN, FORM_ID: 'form_main', TRACKER_SPREADSHEET_ID: 'ss_tracker', RESEARCHER_FORM_URL: FORM_URL, RESEARCHER_TRACKER_ID: 'ss_researchers' })) w.props.set(key, value);
  const tracker = new FakeSpreadsheet(w, 'ss_tracker');
  tracker.addSheetDirect('Researcher Signup');
  w.spreadsheets.set('ss_tracker', tracker);
  const researchers = new FakeSpreadsheet(w, 'ss_researchers');
  const list = researchers.addSheetDirect('Sheet1');
  [['Reseacher', 'Email', 'Mentor'], ['Existing Person', 'existing@example.test', '']].forEach((line, r) => line.forEach((value, c) => { list.cell(r + 1, c + 1).value = value; }));
  w.spreadsheets.set('ss_researchers', researchers);
  w.files.set('ss_tracker', { access: 'PRIVATE', shareable: false });
  w.files.set('ss_researchers', { access: 'PRIVATE', shareable: false });
  w.ids = {};
  if (responses) {
    w.ids.avery = addResponse(w, { name: 'Avery Stone', email: 'avery@example.test' });
    w.ids.blake = addResponse(w, { name: 'Blake Rivers', email: 'Blake@Example.test ' });
    w.ids.casey = addResponse(w, { name: 'Casey Moore', email: '', adult: 'parent.moore@example.test' });
    w.ids.drew = addResponse(w, { name: 'Drew Patel', email: 'drew@example.test' });
    account(w, 'avery@example.test', 'user_avery');
    account(w, 'blake@example.test', 'user_blake');
    account(w, 'parent.moore@example.test', 'user_casey');
  }
  return w;
}
// Setup and enable sending, then move the clock forward so new approvals come after the cut-over.
function readyWorld(options) {
  const w = baseWorld(options);
  w.api.setup();
  w.api.enableSending();
  w.clock += 60_000;
  return w;
}
const trackerSheet = w => w.spreadsheets.get('ss_tracker').getSheetByName('Registration tracker');
const researcherRows = w => { const sheet = w.spreadsheets.get('ss_researchers').getSheetByName('Sheet1'); const last = sheet.getLastRow(); return last < 2 ? [] : sheet.getRange(2, 1, last - 1, 2).getValues(); };
function rowOf(w, id) { const sheet = trackerSheet(w); for (let r = 3; r <= sheet.getLastRow(); r++) if (sheet.peek(r, COL.SUBMISSION)?.value === id) return r; return null; }
const cell = (w, row, column) => trackerSheet(w).peek(row, column)?.value ?? '';
const status = (w, id) => cell(w, rowOf(w, id), COL.WELCOME);
function staffSet(w, row, column, value, formula = '') { const target = trackerSheet(w).cell(row, column); target.value = value; target.formula = formula; }
function editEvent(w, row, column, numRows = 1, numColumns = 1) { return { range: trackerSheet(w).getRange(row, column, numRows, numColumns), source: w.spreadsheets.get('ss_tracker') }; }
function tick(w, id, column = COL.SEND) { const row = rowOf(w, id); staffSet(w, row, column, true); w.api.onTrackerEdit(editEvent(w, row, column)); return row; }
const records = w => Object.fromEntries([...w.props].filter(([key]) => key.startsWith('ebs:')).map(([key, value]) => [key, JSON.parse(value)]));
const writesSince = (w, start) => w.writes.slice(start);
function onlyRowOneWrites(w, start) {
  for (const entry of writesSince(w, start)) {
    if (entry.kind === 'prop' && entry.key === 'SENDING_ENABLED' && entry.value === 'false') continue;
    if (entry.kind === 'prop' && ['PENDING_EDIT', 'LAST_STATUS'].includes(entry.key)) continue;
    assert.ok(entry.kind === 'values' && entry.sheet === 'Registration tracker' && entry.row === 1 && entry.numRows === 1, 'unexpected write ' + JSON.stringify(entry));
  }
}

// ---------------------------------------------------------------- static checks
test('the manifest and source expose only the planned scopes and entry points', () => {
  assert.equal(manifest.runtimeVersion, 'V8');
  assert.equal(manifest.timeZone, 'America/New_York');
  assert.deepEqual([...manifest.oauthScopes].sort(), [
    'https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/forms', 'https://www.googleapis.com/auth/script.external_request',
    'https://www.googleapis.com/auth/script.scriptapp', 'https://www.googleapis.com/auth/script.send_mail', 'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/userinfo.email']);
  assert.equal(manifest.webapp, undefined);
  assert.equal(manifest.executionApi, undefined);
  assert.doesNotMatch(source, /function\s+do(Get|Post)\b/);
  assert.deepEqual(FUNCTIONS.filter(name => !name.endsWith('_')).sort(), ['enableSending', 'onApplicationSubmit', 'onTrackerEdit', 'pauseSending', 'removeTriggers', 'resolveSend', 'sendTestEmail', 'setup', 'syncRegistrations']);
  assert.doesNotMatch(source, /docs\.google\.com\/(spreadsheets|forms)\/d\/[A-Za-z0-9_-]{20,}/, 'no real IDs in the script');
});

// ---------------------------------------------------------------- setup
test('setup builds a protected tracker, pins the configuration, installs three triggers and fills rows without sending', () => {
  const w = baseWorld();
  w.api.setup();
  const sheet = trackerSheet(w);
  assert.deepEqual(sheet.getRange(2, 1, 1, 12).getValues()[0], HEADERS);
  assert.equal(sheet.getFrozenRows(), 2);
  assert.match(sheet.peek(2, COL.WELCOME).note, /Sent/);
  const [protection] = sheet.protections;
  assert.equal(protection.isWarningOnly(), false);
  assert.equal(protection.canDomainEdit(), false);
  assert.deepEqual(protection.editors, [SENDER]);
  assert.deepEqual(protection.unprotected, [[3, 1, 4, 2]]);
  assert.equal(sheet.peek(3, COL.SEND).validation.getCriteriaType(), 'CHECKBOX');
  assert.equal(sheet.peek(6, COL.HAND).validation.getAllowInvalid(), false);
  assert.deepEqual(w.triggers.map(t => [t.handler, t.event]).sort(), [['onApplicationSubmit', 'ON_FORM_SUBMIT'], ['onTrackerEdit', 'ON_EDIT'], ['syncRegistrations', 'CLOCK']]);
  assert.equal(w.triggers.find(t => t.handler === 'onTrackerEdit').source, 'ss_tracker');
  assert.equal(w.triggers.find(t => t.handler === 'onApplicationSubmit').source, 'form_main');
  assert.deepEqual(w.spreadsheets.get('ss_tracker').metadata.map(m => [m.value, m.visibility]), [['script_main', 'DOCUMENT']]);
  assert.equal(w.props.get('AUTOMATION_START'), String(T0));
  assert.equal(w.props.get('SENDING_ENABLED'), 'false');
  // Rows come from the Form responses: names, application emails (with the adult-contact fallback) and lookups.
  const avery = rowOf(w, w.ids.avery), casey = rowOf(w, w.ids.casey), drew = rowOf(w, w.ids.drew), blake = rowOf(w, w.ids.blake);
  assert.deepEqual([cell(w, avery, COL.SEND), cell(w, avery, COL.HAND), cell(w, avery, COL.NAME), cell(w, avery, COL.EMAIL), cell(w, avery, COL.SOURCE), cell(w, avery, COL.ACCOUNT), cell(w, avery, COL.STATUS), cell(w, avery, COL.WELCOME), cell(w, avery, COL.USER)],
    [false, false, 'Avery Stone', 'avery@example.test', 'Researcher Email', 'Verified match', 'Pending', 'Not requested', 'user_avery']);
  assert.ok(cell(w, avery, COL.RECEIVED) instanceof Date);
  assert.deepEqual([cell(w, casey, COL.EMAIL), cell(w, casey, COL.SOURCE), cell(w, casey, COL.USER)], ['parent.moore@example.test', 'Adult contact', 'user_casey']);
  assert.deepEqual([cell(w, drew, COL.ACCOUNT), cell(w, drew, COL.STATUS)], ['No match', '—']);
  assert.equal(cell(w, blake, COL.EMAIL), 'Blake@Example.test');
  assert.match(String(cell(w, 1, 1)), /Last successful check: Nov 16, 2026 10:00 AM · Sending: Paused/);
  assert.equal(w.mail.length, 0);
  assert.deepEqual(w.violations, []);
});

test('re-running setup keeps ticks and the cut-over time, and leaves exactly three triggers', () => {
  const w = readyWorld();
  const row = rowOf(w, w.ids.avery);
  staffSet(w, row, COL.SEND, true);
  const start = w.props.get('AUTOMATION_START');
  w.clock += 3_600_000;
  w.api.setup();
  assert.equal(cell(w, row, COL.SEND), true);
  assert.equal(w.props.get('AUTOMATION_START'), start);
  assert.equal(w.triggers.length, 3);
  assert.equal(w.mail.length, 0);
});

test('setup refuses a tracker claimed by another project unless the owner hands it over', () => {
  const w = baseWorld();
  w.spreadsheets.get('ss_tracker').metadata.push({ key: 'ebs-student-registration-script', value: 'script_other', visibility: 'DOCUMENT', project: 'script_other' });
  const before = { writes: w.writes.length, props: JSON.stringify([...w.props]) };
  assert.throws(() => w.api.setup(), /Another Apps Script project manages this tracker/);
  assert.equal(w.writes.length, before.writes);
  assert.equal(JSON.stringify([...w.props]), before.props);
  assert.equal(w.triggers.length, 0);
  w.props.set('TAKEOVER_FROM_SCRIPT_ID', 'script_other');
  w.props.set('AUTOMATION_START', String(T0 - 86_400_000));
  w.props.set('SENDING_ENABLED', 'true');
  w.api.setup();
  assert.equal(w.spreadsheets.get('ss_tracker').metadata[0].value, 'script_main');
  assert.equal(w.props.get('SENDING_ENABLED'), 'false');
  assert.equal(w.props.get('AUTOMATION_START'), String(T0));
  assert.equal(w.props.has('TAKEOVER_FROM_SCRIPT_ID'), false);
});

test('setup and sendTestEmail refuse to run as anyone but the EBS account', () => {
  const w = baseWorld();
  w.effectiveUser = 'someone.else@example.test';
  assert.throws(() => w.api.setup(), /exeterbiosymposium@gmail\.com/);
  assert.throws(() => w.api.sendTestEmail(), /exeterbiosymposium@gmail\.com/);
  assert.equal(w.mail.length, 0);
  assert.equal(w.triggers.length, 0);
});

// ---------------------------------------------------------------- sending
test('a tick on an Accepted row sends one welcome from the Form data, records it and adds the Researcher tracker row', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  const row = rowOf(w, w.ids.avery);
  // Edited display cells must not redirect the email or change the greeting.
  w.spreadsheets.get('ss_tracker').getSheetByName('Registration tracker').cell(row, COL.EMAIL).value = 'attacker@example.test';
  w.spreadsheets.get('ss_tracker').getSheetByName('Registration tracker').cell(row, COL.NAME).value = 'Mallory';
  tick(w, w.ids.avery);
  assert.equal(w.mail.length, 1);
  const [message] = w.mail;
  assert.equal(message.to, 'avery@example.test');
  assert.equal(message.bcc, SENDER);
  assert.equal(message.replyTo, SENDER);
  assert.equal(message.name, 'Exeter Biology Symposium');
  assert.equal(message.subject, SUBJECT);
  assert.match(message.body, /^Dear Avery Stone,\n\nWe are pleased to inform you that you have successfully passed the first round of the EBS application — Congratulations!/);
  assert.ok(message.body.includes(`fill out a researcher information form via this link (${FORM_URL}). You will be receiving an invitation`));
  assert.ok(message.body.endsWith('Best regards,\nAdrian Chan\nFounder, Exeter Biology Symposium\nP H I L L I P S   E X E T E R   A C A D E M Y\n20 Main Street | Exeter, NH 03833\nexeterbiosymposium@gmail.com'));
  assert.ok(message.htmlBody.includes('<p>Dear Avery Stone,</p>'));
  assert.ok(message.htmlBody.includes(`via this <a href="${FORM_URL}">link</a>. You will`));
  assert.ok(message.htmlBody.includes('P H I L L I P S &nbsp;&nbsp;E X E T E R &nbsp;&nbsp;A C A D E M Y'));
  assert.doesNotMatch(message.body + message.htmlBody, /Mallory|attacker/);
  assert.equal(cell(w, row, COL.SEND), false);
  assert.equal(status(w, w.ids.avery), 'Sent');
  assert.ok(cell(w, row, COL.SENT_AT) instanceof Date);
  const saved = records(w);
  assert.deepEqual(Object.keys(saved).sort(), [`ebs:acct:2027:user_avery`, `ebs:email:2027:${digest('avery@example.test')}`, `ebs:sub:form_main:${w.ids.avery}`].sort());
  for (const value of Object.values(saved)) assert.deepEqual([value.state, value.submissionId, value.appended], ['sent', w.ids.avery, true]);
  assert.deepEqual(researcherRows(w), [['Existing Person', 'existing@example.test'], ['Avery Stone', 'avery@example.test']]);
  // Nothing sends again: a re-tick, a second application from the same student, and more checks.
  tick(w, w.ids.avery);
  const second = addResponse(w, { name: 'avery  stone', email: 'AVERY@example.test' });
  w.api.syncRegistrations();
  tick(w, second);
  w.api.syncRegistrations();
  w.api.syncRegistrations();
  assert.equal(w.mail.length, 1);
  assert.equal(status(w, second), `Already welcomed (row ${row})`);
  assert.equal(cell(w, rowOf(w, second), COL.SEND), false);
  assert.equal(researcherRows(w).length, 2);
  assert.deepEqual(w.violations, []);
});

test('the adult contact email is used when Researcher Email is blank, and names are escaped in HTML', () => {
  const w = readyWorld();
  const id = addResponse(w, { name: "Zoë O'Brien & Co", email: '  ', adult: 'Guardian@Example.test' });
  account(w, 'guardian@example.test', 'user_zoe');
  w.api.syncRegistrations();
  accept(w, 'guardian@example.test');
  tick(w, id);
  assert.equal(w.mail.length, 1);
  assert.equal(w.mail[0].to, 'guardian@example.test');
  assert.ok(w.mail[0].body.startsWith("Dear Zoë O'Brien & Co,"));
  assert.ok(w.mail[0].htmlBody.includes('<p>Dear Zoë O&#39;Brien &amp; Co,</p>'));
  assert.equal(cell(w, rowOf(w, id), COL.SOURCE), 'Adult contact');
});

test('only real checkbox ticks count; unticked rows and formula or text values never send', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  accept(w, 'blake@example.test');
  accept(w, 'parent.moore@example.test');
  w.api.syncRegistrations();
  assert.equal(w.mail.length, 0);
  staffSet(w, rowOf(w, w.ids.avery), COL.SEND, 'TRUE');
  staffSet(w, rowOf(w, w.ids.blake), COL.SEND, 1);
  staffSet(w, rowOf(w, w.ids.casey), COL.SEND, true, '=TRUE');
  w.api.syncRegistrations();
  w.api.onTrackerEdit(editEvent(w, rowOf(w, w.ids.avery), 1, 3, 1));
  assert.equal(w.mail.length, 0);
  assert.equal(cell(w, rowOf(w, w.ids.casey), COL.SEND), true, 'ignored ticks are left alone');
  assert.match(String(cell(w, 1, 1)), /3 ticks ignored/);
});

test('ticking more than five rows at once sends nothing and clears them', () => {
  const w = readyWorld({ responses: false });
  const ids = Array.from({ length: 6 }, (_, i) => addResponse(w, { name: `Student ${i}`, email: `student${i}@example.test` }));
  ids.forEach((id, i) => account(w, `student${i}@example.test`, `user_s${i}`, 'accepted'));
  w.api.syncRegistrations();
  const first = rowOf(w, ids[0]);
  ids.forEach(id => staffSet(w, rowOf(w, id), COL.SEND, true));
  w.api.onTrackerEdit(editEvent(w, first, 1, 6, 1));
  assert.equal(w.mail.length, 0);
  for (const id of ids) {
    assert.equal(cell(w, rowOf(w, id), COL.SEND), false);
    assert.equal(status(w, id), notSent('too many boxes ticked at once', 'Tick 5 or fewer.'));
  }
});

test('each not-sent reason clears the box with the next step and sends nothing', () => {
  const w = readyWorld({ responses: false });
  const cases = [];
  const add = (label, name, email, setup, expected) => { const id = addResponse(w, { name, email }); cases.push({ label, id, setup, expected }); };
  add('pending', 'Pat Pending', 'pat@example.test', () => account(w, 'pat@example.test', 'user_pat', 'pending'), notSent('account is Pending', 'Approve in Participants, then tick again.'));
  add('no status', 'Nia None', 'nia@example.test', () => account(w, 'nia@example.test', 'user_nia', 'none'), notSent('account has no EBS status yet', 'Ask the student to sign in and open their Account page, approve them in Participants, then tick again.'));
  add('no account', 'Ned Nobody', 'ned@example.test', () => {}, notSent('no EBS account uses this email', 'Ask the student to add and verify it in their EBS account, or email them by hand and tick Welcomed by hand.'));
  add('invalid email', 'Ivy Invalid', 'not-an-email', () => {}, notSent('no valid email in the application', 'Email the student by hand and tick Welcomed by hand.'));
  add('approved before the tracker', 'Olive Older', 'olive@example.test', () => w.accounts.set('olive@example.test', { userId: 'user_olive', status: 'accepted', acceptedAt: T0 - 1 }), notSent('approved before the tracker started', 'If not yet welcomed, email them by hand and tick Welcomed by hand.'));
  add('already in the Researcher tracker', 'Existing Person', 'existing@example.test', () => account(w, 'existing@example.test', 'user_existing', 'accepted'), notSent('already in the Researcher tracker'));
  for (const entry of cases) entry.setup();
  w.api.syncRegistrations();
  for (const entry of cases) {
    tick(w, entry.id);
    assert.equal(status(w, entry.id), entry.expected, entry.label);
    assert.equal(cell(w, rowOf(w, entry.id), COL.SEND), false, entry.label);
  }
  assert.equal(w.mail.length, 0);
  // Approval alone never sends; a new tick after approval sends once.
  accept(w, 'pat@example.test');
  w.api.syncRegistrations();
  assert.equal(w.mail.length, 0);
  assert.equal(status(w, cases[0].id), notSent('account is Pending', 'Approve in Participants, then tick again.'), 'the last outcome stays until the next tick');
  tick(w, cases[0].id);
  assert.equal(w.mail.length, 1);
  assert.equal(status(w, cases[0].id), 'Sent');
});

test('while sending is off or in test mode, ticks are cleared without sending', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  w.api.pauseSending();
  assert.equal(w.props.get('SENDING_ENABLED'), 'false');
  assert.match(String(cell(w, 1, 1)), /Sending: Paused/);
  tick(w, w.ids.avery);
  assert.equal(status(w, w.ids.avery), notSent('sending is off', 'Ask the owner to turn sending on, then tick again.'));
  assert.equal(cell(w, rowOf(w, w.ids.avery), COL.SEND), false);
  w.props.set('TEST_ONLY_RECIPIENT', 'exeterbiosymposium+ebstest@gmail.com');
  w.api.enableSending();
  assert.match(String(cell(w, 1, 1)), /Sending: Test mode/);
  tick(w, w.ids.avery);
  assert.equal(status(w, w.ids.avery), notSent('test mode'));
  const testId = addResponse(w, { name: 'EBS Test', email: 'exeterbiosymposium+ebstest@gmail.com' });
  account(w, 'exeterbiosymposium+ebstest@gmail.com', 'user_test', 'accepted');
  w.api.syncRegistrations();
  tick(w, testId);
  assert.deepEqual(w.mail.map(m => m.to), ['exeterbiosymposium+ebstest@gmail.com']);
  w.props.set('TEST_ONLY_RECIPIENT', 'someone@example.test');
  assert.throws(() => w.api.enableSending(), /TEST_ONLY_RECIPIENT/);
  assert.equal(w.props.get('SENDING_ENABLED'), 'false');
});

test('enableSending clears ticks left from while sending was off before turning sending on', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  w.api.pauseSending();
  staffSet(w, rowOf(w, w.ids.avery), COL.SEND, true);
  w.api.enableSending();
  assert.equal(cell(w, rowOf(w, w.ids.avery), COL.SEND), false);
  assert.equal(status(w, w.ids.avery), notSent('sending is off', 'Ask the owner to turn sending on, then tick again.'));
  w.api.syncRegistrations();
  assert.equal(w.mail.length, 0);
  assert.equal(w.props.get('SENDING_ENABLED'), 'true');
});

// ---------------------------------------------------------------- owner review
test('applications that share an email need one name; ambiguous accounts and foreign email records need review', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  const sibling = addResponse(w, { name: 'Morgan Stone', email: 'avery@example.test' });
  w.api.syncRegistrations();
  tick(w, w.ids.avery);
  assert.equal(status(w, w.ids.avery), review('several applicants share this email'));
  assert.equal(status(w, sibling), 'Not requested');
  w.accounts.set('blake@example.test', 'ambiguous');
  tick(w, w.ids.blake);
  assert.equal(status(w, w.ids.blake), review('more than one EBS account'));
  w.props.set(`ebs:email:2027:${digest('parent.moore@example.test')}`, JSON.stringify({ state: 'sent', submissionId: 'resp_elsewhere', userId: 'user_someone_else', at: T0 }));
  accept(w, 'parent.moore@example.test');
  tick(w, w.ids.casey);
  assert.equal(status(w, w.ids.casey), review('email welcomed under another account'));
  assert.equal(w.mail.length, 0);
});

test('names that look like links or addresses need review', () => {
  const w = readyWorld({ responses: false });
  const id = addResponse(w, { name: 'Visit www.example.test now', email: 'link@example.test' });
  account(w, 'link@example.test', 'user_link');
  w.api.syncRegistrations();
  accept(w, 'link@example.test');
  tick(w, id);
  assert.equal(status(w, id), review('name needs checking'));
  assert.equal(w.mail.length, 0);
});

test('Welcomed by hand records the student so the script never sends to them, even after approval', () => {
  const w = readyWorld();
  const row = tick(w, w.ids.drew, COL.HAND);
  assert.equal(status(w, w.ids.drew), 'Welcomed by hand');
  assert.equal(records(w)[`ebs:sub:form_main:${w.ids.drew}`].state, 'hand');
  assert.equal(records(w)[`ebs:email:2027:${digest('drew@example.test')}`].state, 'hand');
  staffSet(w, row, COL.HAND, false);
  account(w, 'drew@example.test', 'user_drew', 'accepted');
  w.api.syncRegistrations();
  assert.equal(records(w)['ebs:acct:2027:user_drew'].state, 'hand');
  tick(w, w.ids.drew);
  assert.equal(w.mail.length, 0);
  assert.equal(status(w, w.ids.drew), 'Welcomed by hand');
  assert.equal(cell(w, row, COL.SEND), false);
});

test('a Sent row without a matching record blocks every send for that student and is never downgraded', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  const row = rowOf(w, w.ids.avery);
  staffSet(w, row, COL.WELCOME, 'Sent');
  staffSet(w, row, COL.SENT_AT, new Date(T0));
  const second = addResponse(w, { name: 'Avery Stone', email: 'avery@example.test' });
  w.api.syncRegistrations();
  tick(w, second);
  assert.equal(status(w, second), review('send record missing'));
  tick(w, w.ids.avery);
  assert.equal(status(w, w.ids.avery), 'Sent');
  assert.equal(cell(w, row, COL.SEND), false);
  assert.equal(w.mail.length, 0);
});

// ---------------------------------------------------------------- races and failures
test('unticking during the lookup cancels the send', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  const row = rowOf(w, w.ids.avery);
  w.onFetch = () => staffSet(w, row, COL.SEND, false);
  tick(w, w.ids.avery);
  assert.equal(w.mail.length, 0);
  assert.equal(status(w, w.ids.avery), 'Not requested');
});

test('pausing during the first send stops the rest of the batch', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  accept(w, 'blake@example.test');
  const first = rowOf(w, w.ids.avery);
  staffSet(w, first, COL.SEND, true);
  staffSet(w, rowOf(w, w.ids.blake), COL.SEND, true);
  w.onSend = () => w.api.pauseSending();
  w.api.onTrackerEdit(editEvent(w, first, 1, 2, 1));
  assert.equal(w.mail.length, 1);
  assert.equal(status(w, w.ids.blake), notSent('sending is off', 'Ask the owner to turn sending on, then tick again.'));
});

test('a tick made while another run holds the lock is processed by that run', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  accept(w, 'blake@example.test');
  staffSet(w, rowOf(w, w.ids.avery), COL.SEND, true);
  w.onFetch = () => { staffSet(w, rowOf(w, w.ids.blake), COL.SEND, true); w.api.onTrackerEdit(editEvent(w, rowOf(w, w.ids.blake), 1)); };
  w.api.syncRegistrations();
  assert.deepEqual(w.mail.map(m => m.to).sort(), ['avery@example.test', 'blake@example.test']);
  assert.equal(w.props.has('PENDING_EDIT'), false);
  assert.deepEqual(w.violations, []);
});

test('a failed send becomes owner review and stops further sends in that run', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  accept(w, 'blake@example.test');
  staffSet(w, rowOf(w, w.ids.avery), COL.SEND, true);
  staffSet(w, rowOf(w, w.ids.blake), COL.SEND, true);
  w.mailError = new Error('Service invoked too many times: email');
  w.api.onTrackerEdit(editEvent(w, rowOf(w, w.ids.avery), 1, 2, 1));
  assert.equal(w.mail.length, 0);
  const rec = records(w)[`ebs:sub:form_main:${w.ids.avery}`];
  assert.equal(rec.state, 'review');
  assert.match(rec.error, /too many times/);
  assert.equal(status(w, w.ids.avery), 'Needs owner review: delivery unknown');
  assert.equal(cell(w, rowOf(w, w.ids.avery), COL.SEND), false);
  assert.equal(status(w, w.ids.blake), QUEUED);
  assert.equal(cell(w, rowOf(w, w.ids.blake), COL.SEND), true);
  w.mailError = null;
  w.api.syncRegistrations();
  assert.deepEqual(w.mail.map(m => m.to), ['blake@example.test']);
  tick(w, w.ids.avery);
  assert.equal(w.mail.length, 1, 'review is never retried automatically');
});

test('if the sent record cannot be saved, the send is reviewed and never repeated', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  w.failWrite = entry => entry.kind === 'prop' && String(entry.value).includes('"state":"sent"');
  tick(w, w.ids.avery);
  assert.equal(w.mail.length, 1);
  assert.equal(status(w, w.ids.avery), 'Needs owner review: delivery unknown');
  w.failWrite = null;
  w.api.syncRegistrations();
  assert.equal(records(w)[`ebs:sub:form_main:${w.ids.avery}`].state, 'review', 'the stale attempt is converted at the next run');
  tick(w, w.ids.avery);
  assert.equal(w.mail.length, 1);
});

test('resolveSend clears a reviewed send for a retry or records it as sent, and never downgrades a sent record', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  accept(w, 'blake@example.test');
  w.mailError = new Error('Temporary mail failure');
  tick(w, w.ids.avery);
  w.mailError = null;
  w.props.set('RESOLVE_SUBMISSION_ID', w.ids.avery);
  w.props.set('RESOLVE_OUTCOME', 'retry');
  w.api.resolveSend();
  assert.equal(w.props.has('RESOLVE_SUBMISSION_ID'), false);
  assert.deepEqual(Object.keys(records(w)), []);
  assert.equal(status(w, w.ids.avery), 'Not requested');
  assert.ok(w.logs.some(line => /a\*\*\*@example\.test/.test(line)));
  tick(w, w.ids.avery);
  assert.equal(w.mail.length, 1);
  w.props.set('RESOLVE_SUBMISSION_ID', w.ids.avery);
  w.props.set('RESOLVE_OUTCOME', 'retry');
  assert.throws(() => w.api.resolveSend(), /Needs owner review/);
  assert.equal(records(w)[`ebs:sub:form_main:${w.ids.avery}`].state, 'sent');
  // A reviewed send confirmed by hand is recorded as sent and added to the Researcher tracker once.
  w.mailError = new Error('Temporary mail failure');
  tick(w, w.ids.blake);
  w.mailError = null;
  w.props.set('RESOLVE_SUBMISSION_ID', w.ids.blake);
  w.props.set('RESOLVE_OUTCOME', 'sent');
  w.api.resolveSend();
  assert.equal(records(w)[`ebs:sub:form_main:${w.ids.blake}`].state, 'sent');
  assert.equal(status(w, w.ids.blake), 'Sent');
  assert.deepEqual(researcherRows(w).map(r => r[1]), ['existing@example.test', 'avery@example.test', 'blake@example.test']);
  w.props.set('RESOLVE_SUBMISSION_ID', w.ids.blake);
  w.props.set('RESOLVE_OUTCOME', 'sent');
  w.api.resolveSend();
  assert.equal(researcherRows(w).length, 3);
});

// ---------------------------------------------------------------- guards
test('every guard failure stops the run before any student data is written, and definite failures turn sending off', () => {
  const guards = [
    ['tracker shared by link', w => { w.files.get('ss_tracker').access = 'ANYONE_WITH_LINK'; }],
    ['editors can reshare', w => { w.files.get('ss_tracker').shareable = true; }],
    ['Form linked elsewhere', w => { w.form.destination = 'ss_other'; }],
    ['response editing on', w => { w.form.canEdit = true; }],
    ['summary published', w => { w.form.summary = true; }],
    ['question renamed', w => { w.form.items.find(i => i.id === ITEMS.account).title = 'Email'; }],
    ['question deleted', w => { w.form.items = w.form.items.filter(i => i.id !== ITEMS.name); }],
    ['wrong account', w => { w.effectiveUser = 'someone.else@example.test'; }],
    ['claim taken over', w => { w.spreadsheets.get('ss_tracker').metadata[0].value = 'script_other'; }],
    ['cycle changed', w => { w.props.set('REGISTRATION_CYCLE', '2028'); }],
    ['permission missing', w => { w.missingScopes = true; }],
    ['header changed', w => { trackerSheet(w).cell(2, COL.WELCOME).value = 'Status'; }],
    ['checkbox removed', w => { trackerSheet(w).cell(4, COL.SEND).validation = null; }],
    ['protection removed', w => { trackerSheet(w).protections = []; }],
    ['form link invalid', w => { w.props.set('RESEARCHER_FORM_URL', 'https://example.test/form'); }],
  ];
  for (const [label, breakIt] of guards) {
    const w = readyWorld();
    accept(w, 'avery@example.test');
    staffSet(w, rowOf(w, w.ids.avery), COL.SEND, true);
    breakIt(w);
    const start = w.writes.length, fetches = w.fetches.length;
    w.api.syncRegistrations();
    assert.equal(w.mail.length, 0, label);
    assert.equal(w.fetches.length, fetches, label + ': no lookups');
    onlyRowOneWrites(w, start);
    assert.equal(w.props.get('SENDING_ENABLED'), 'false', label);
    assert.match(String(cell(w, 1, 1)), /^Paused — /, label);
    assert.doesNotMatch(String(cell(w, 1, 1)), /Avery|avery/, label);
  }
});

test('a Form read failure skips the run without writing student data', () => {
  const w = readyWorld();
  w.getResponsesError = new Error('Service unavailable');
  const start = w.writes.length;
  w.api.syncRegistrations();
  onlyRowOneWrites(w, start);
  assert.equal(w.props.get('SENDING_ENABLED'), 'true', 'a temporary failure does not turn sending off');
});

// ---------------------------------------------------------------- endpoint distrust
test('malformed or unexpected lookup replies send nothing and leave the box ticked', () => {
  const ok = email => ({ email, account: 'verified', userId: 'user_avery', status: 'accepted', acceptedAt: T0 + 60_000 });
  const replies = [
    ['server error', () => ({ code: 500, body: '{"state":"unavailable"}' })],
    ['redirect', () => ({ code: 302, body: '' })],
    ['not JSON', () => ({ code: 200, body: '<html>' })],
    ['missing result', () => ({ code: 200, body: JSON.stringify({ results: [] }) })],
    ['extra result', emails => ({ code: 200, body: JSON.stringify({ results: [...emails.map(ok), ok('other@example.test')] }) })],
    ['duplicate result', emails => ({ code: 200, body: JSON.stringify({ results: [ok(emails[0]), ok(emails[0])] }) })],
    ['bad user ID', emails => ({ code: 200, body: JSON.stringify({ results: emails.map(email => ({ ...ok(email), userId: 'user-1' })) }) })],
    ['unknown status', emails => ({ code: 200, body: JSON.stringify({ results: emails.map(email => ({ ...ok(email), status: 'approved' })) }) })],
    ['accepted without a time', emails => ({ code: 200, body: JSON.stringify({ results: emails.map(email => ({ ...ok(email), acceptedAt: null })) }) })],
    ['extra field', emails => ({ code: 200, body: JSON.stringify({ results: emails.map(email => ({ ...ok(email), name: 'Avery' })) }) })],
    ['extra top-level field', emails => ({ code: 200, body: JSON.stringify({ results: emails.map(ok), debug: true }) })],
  ];
  for (const [label, reply] of replies) {
    const w = readyWorld();
    accept(w, 'avery@example.test');
    w.endpoint = (_w, _url, params) => reply(JSON.parse(params.payload).emails);
    tick(w, w.ids.avery);
    assert.equal(w.mail.length, 0, label);
    assert.equal(status(w, w.ids.avery), UNAVAILABLE, label);
    assert.equal(cell(w, rowOf(w, w.ids.avery), COL.SEND), true, label);
  }
  const w = readyWorld();
  accept(w, 'avery@example.test');
  accept(w, 'blake@example.test');
  const own = email => ({ ...ok(email), userId: 'user_' + email.split('@')[0] });
  w.endpoint = (_w, _url, params) => ({ code: 200, body: JSON.stringify({ results: JSON.parse(params.payload).emails.map(own).reverse() }) });
  staffSet(w, rowOf(w, w.ids.avery), COL.SEND, true);
  staffSet(w, rowOf(w, w.ids.blake), COL.SEND, true);
  w.api.syncRegistrations();
  assert.equal(w.mail.length, 0, 'reordered results are rejected');
});

test('lookups go in bounded batches with the token, never follow redirects, and a 429 stops the run', () => {
  const w = baseWorld({ responses: false });
  for (let i = 0; i < 23; i++) addResponse(w, { name: `Student ${i}`, email: `student${i}@example.test` });
  let calls = 0;
  w.endpoint = (world, url, params) => { calls++; return calls === 2 ? { code: 429, body: '{"state":"rate-limited"}' } : defaultEndpoint(world, url, params); };
  w.api.setup();
  assert.equal(w.fetches.length, 2);
  for (const { url, params } of w.fetches) {
    assert.equal(url, STATUS_URL);
    assert.deepEqual([params.method, params.contentType, params.followRedirects, params.muteHttpExceptions, params.headers.Authorization], ['post', 'application/json', false, true, 'Bearer ' + TOKEN]);
    const { emails } = JSON.parse(params.payload);
    assert.ok(emails.length <= 10 && Buffer.byteLength(params.payload) <= 3500);
    assert.equal(new Set(emails).size, emails.length);
  }
  const unavailable = [...trackerSheet(w).cells].filter(([key, value]) => key.endsWith(':' + COL.ACCOUNT) && value.value === 'Unavailable').length;
  assert.equal(unavailable, 13);
});

// ---------------------------------------------------------------- rows
test('rows that move or change between reading and writing never receive another row\'s email', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  const averyRow = rowOf(w, w.ids.avery), blakeRow = rowOf(w, w.ids.blake);
  const sheet = trackerSheet(w);
  w.onFetch = () => { for (let c = 1; c <= 12; c++) { const a = sheet.cell(averyRow, c), b = sheet.cell(blakeRow, c); [a.value, b.value] = [b.value, a.value]; } };
  const start = w.writes.length;
  tick(w, w.ids.avery);
  assert.equal(w.mail.length, 0);
  assert.equal(rowOf(w, w.ids.avery), blakeRow);
  assert.equal(cell(w, blakeRow, COL.SEND), true, 'the moved tick is still there');
  assert.equal(writesSince(w, start).some(e => e.kind === 'values' && e.column <= COL.SUBMISSION && e.column + e.numColumns - 1 >= COL.SUBMISSION), false, 'Submission IDs are never rewritten');
  w.api.syncRegistrations();
  assert.deepEqual(w.mail.map(m => m.to), ['avery@example.test']);
});

test('an edited, duplicated or deleted Submission ID row is never sent and the real response is re-added unticked', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  const row = rowOf(w, w.ids.avery);
  staffSet(w, row, COL.SUBMISSION, 'resp_bogus');
  staffSet(w, row, COL.SEND, true);
  w.api.syncRegistrations();
  assert.equal(cell(w, row, COL.WELCOME), 'Response deleted');
  assert.equal(cell(w, row, COL.SEND), false);
  assert.equal(cell(w, row, COL.NAME), '');
  const readded = rowOf(w, w.ids.avery);
  assert.ok(readded > row);
  assert.equal(cell(w, readded, COL.SEND), false);
  // A duplicate of a real Submission ID needs review; only the first row is used.
  const duplicateRow = rowOf(w, w.ids.blake);
  staffSet(w, duplicateRow, COL.SUBMISSION, w.ids.avery);
  staffSet(w, duplicateRow, COL.SEND, true);
  w.api.syncRegistrations();
  assert.equal(cell(w, duplicateRow, COL.WELCOME), review('duplicate row'));
  assert.equal(w.mail.length, 0);
});

test('a deleted Form response blanks the student data and an inserted column pauses the tracker', () => {
  const w = readyWorld();
  const row = rowOf(w, w.ids.blake);
  w.deleted.add(w.ids.blake);
  staffSet(w, row, COL.SEND, true);
  w.api.syncRegistrations();
  assert.deepEqual([COL.NAME, COL.EMAIL, COL.SOURCE, COL.ACCOUNT, COL.STATUS, COL.USER].map(c => cell(w, row, c)), ['', '', '', '', '', '']);
  assert.equal(cell(w, row, COL.SUBMISSION), w.ids.blake);
  assert.equal(cell(w, row, COL.WELCOME), 'Response deleted');
  assert.equal(cell(w, row, COL.SEND), false);
  trackerSheet(w).insertColumnsAfter(5, 1);
  const start = w.writes.length;
  w.api.syncRegistrations();
  onlyRowOneWrites(w, start);
  assert.match(String(cell(w, 1, 1)), /Tracker layout changed — owner runs setup\(\)/);
});

test('a copied project with empty records sends nothing for students the tracker already shows as welcomed', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  tick(w, w.ids.avery);
  assert.equal(w.mail.length, 1);
  for (const key of [...w.props.keys()]) if (key.startsWith('ebs:')) w.props.delete(key);
  w.scriptId = 'script_copy';
  w.props.set('TAKEOVER_FROM_SCRIPT_ID', 'script_main');
  w.api.setup();
  w.api.enableSending();
  w.clock += 60_000;
  const again = addResponse(w, { name: 'Avery Stone', email: 'avery@example.test' });
  w.api.syncRegistrations();
  tick(w, again);
  tick(w, w.ids.avery);
  assert.equal(w.mail.length, 1);
  assert.equal(status(w, again), review('send record missing'));
  assert.equal(status(w, w.ids.avery), 'Sent');
});

// ---------------------------------------------------------------- limits
test('quota, the per-run cap and the time budget queue sends for the next check', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  accept(w, 'blake@example.test');
  w.quota = 1;
  tick(w, w.ids.avery);
  assert.equal(status(w, w.ids.avery), QUEUED);
  assert.equal(cell(w, rowOf(w, w.ids.avery), COL.SEND), true);
  w.quota = 100;
  w.props.set('MAX_SENDS_PER_RUN', '1');
  staffSet(w, rowOf(w, w.ids.blake), COL.SEND, true);
  w.api.syncRegistrations();
  assert.equal(w.mail.length, 1);
  assert.equal(w.mail.filter(m => m.to === 'avery@example.test').length + w.mail.filter(m => m.to === 'blake@example.test').length, 1);
  w.props.delete('MAX_SENDS_PER_RUN');
  w.onFetch = () => { w.clock += 5.5 * 60_000; };
  w.api.syncRegistrations();
  assert.equal(w.mail.length, 1, 'too little time left');
  w.api.syncRegistrations();
  assert.equal(w.mail.length, 2);
  assert.deepEqual(w.mail.map(m => m.to).sort(), ['avery@example.test', 'blake@example.test']);
});

// ---------------------------------------------------------------- Researcher tracker
test('the Researcher tracker append is retried after a failure and is skipped when that file is exposed or its headers changed', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  w.failWrite = entry => entry.kind === 'values' && entry.spreadsheet === 'ss_researchers';
  tick(w, w.ids.avery);
  assert.equal(w.mail.length, 1);
  assert.equal(researcherRows(w).length, 1);
  assert.equal(records(w)[`ebs:sub:form_main:${w.ids.avery}`].appended, false);
  assert.match(String(cell(w, 1, 1)), /1 welcome to add to the Researcher tracker/);
  w.failWrite = null;
  w.api.syncRegistrations();
  assert.deepEqual(researcherRows(w).map(r => r[1]), ['existing@example.test', 'avery@example.test']);
  assert.equal(records(w)[`ebs:sub:form_main:${w.ids.avery}`].appended, true);
  w.api.syncRegistrations();
  assert.equal(researcherRows(w).length, 2);
  // An exposed or changed Researcher tracker blocks sends (the duplicate check cannot run) and is never written.
  accept(w, 'blake@example.test');
  w.files.get('ss_researchers').access = 'ANYONE_WITH_LINK';
  tick(w, w.ids.blake);
  assert.equal(status(w, w.ids.blake), UNAVAILABLE);
  w.files.get('ss_researchers').access = 'PRIVATE';
  w.spreadsheets.get('ss_researchers').getSheetByName('Sheet1').cell(1, 3).value = 'Email';
  w.api.syncRegistrations();
  assert.equal(status(w, w.ids.blake), UNAVAILABLE);
  assert.equal(w.mail.length, 1);
  assert.equal(researcherRows(w).length, 2);
});

// ---------------------------------------------------------------- owner tools and hygiene
test('sendTestEmail always goes to the EBS inbox, writes no records and leaves the Researcher tracker alone', () => {
  const w = baseWorld();
  w.props.set('TEST_RECIPIENT', 'someone@example.test');
  w.props.set('SENDER_EMAIL', 'someone@example.test');
  w.api.sendTestEmail();
  assert.equal(w.mail.length, 1);
  assert.equal(w.mail[0].to, SENDER);
  assert.equal(w.mail[0].subject, '[Test] ' + SUBJECT);
  assert.ok(w.mail[0].body.startsWith('Dear Test Researcher,'));
  assert.deepEqual(records(w), {});
  assert.equal(researcherRows(w).length, 1);
});

test('new Form submissions are added at once without sending, and logs and the status line never contain student data', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  const id = addResponse(w, { name: 'Quinn Hart', email: 'quinn@example.test' });
  account(w, 'quinn@example.test', 'user_quinn', 'accepted');
  const row = trackerSheet(w).getLastRow() + 1;
  w.api.onApplicationSubmit({ response: { getId: () => id } });
  assert.equal(rowOf(w, id), row);
  assert.equal(cell(w, row, COL.SEND), false);
  assert.equal(trackerSheet(w).protections[0].unprotected[0][2], row - 2, 'the new row is tickable');
  assert.equal(trackerSheet(w).peek(row, COL.SEND).validation.getCriteriaType(), 'CHECKBOX');
  assert.equal(w.mail.length, 0);
  tick(w, w.ids.avery);
  w.api.syncRegistrations();
  const text = w.logs.join('\n') + '\n' + String(cell(w, 1, 1));
  for (const secret of ['Avery', 'avery@', 'Quinn', 'quinn@', 'parent.moore', 'user_', TOKEN]) assert.ok(!text.includes(secret), secret);
  assert.deepEqual(w.violations, []);
});

test('formula-like application values are written as text', () => {
  const w = baseWorld({ responses: false });
  const id = addResponse(w, { name: '=HYPERLINK("https://example.test")', email: '+1@example.test' });
  w.api.setup();
  assert.equal(cell(w, rowOf(w, id), COL.NAME), '\'=HYPERLINK("https://example.test")');
  assert.equal(cell(w, rowOf(w, id), COL.EMAIL), "'+1@example.test");
});

test('a record written by another process after the decision still stops the send', () => {
  const w = readyWorld();
  accept(w, 'avery@example.test');
  w.onQuota = () => w.props.set('ebs:acct:2027:user_avery', JSON.stringify({ state: 'sent', submissionId: 'resp_other_run', userId: 'user_avery', at: w.clock }));
  tick(w, w.ids.avery);
  assert.equal(w.mail.length, 0);
  assert.equal(cell(w, rowOf(w, w.ids.avery), COL.SEND), false);
});

test('a tick is cleared only on the row it was read from', () => {
  const w = readyWorld();
  const averyRow = rowOf(w, w.ids.avery), blakeRow = rowOf(w, w.ids.blake);
  staffSet(w, blakeRow, COL.SEND, true); // Blake's own tick, not part of this edit.
  const sheet = trackerSheet(w);
  w.onFetch = () => { for (let c = 1; c <= 12; c++) { const a = sheet.cell(averyRow, c), b = sheet.cell(blakeRow, c); [a.value, b.value] = [b.value, a.value]; } };
  tick(w, w.ids.avery); // Avery is Pending, so the decision is to clear the box.
  assert.equal(rowOf(w, w.ids.blake), averyRow);
  assert.equal(cell(w, averyRow, COL.SEND), true, "Blake's tick survives");
  assert.equal(w.mail.length, 0);
});

test('an address that MailApp would read as several recipients is never sent', () => {
  const w = readyWorld({ responses: false });
  const id = addResponse(w, { name: 'Comma Case', email: 'first,second@example.test' });
  account(w, 'first,second@example.test', 'user_comma', 'accepted');
  w.api.syncRegistrations();
  tick(w, id);
  assert.equal(w.mail.length, 0);
  assert.equal(status(w, id), notSent('no valid email in the application', 'Email the student by hand and tick Welcomed by hand.'));
});
