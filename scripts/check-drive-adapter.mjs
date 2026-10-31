import assert from 'node:assert/strict';
import { createServer } from 'vite';
const vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
try {
  const { createParticipantDrive, DriveError } = await vite.ssrLoadModule('/server/drive/google.ts');
  const calls = [];
  const folders = new Map();
  let timeoutAfterCreate = false;
  let publicPermission = false;
  let pages = false;
  let wrongOwner = false;
  let unexpectedStaff = false;
  let missingCapability = false;
  let folderOwnerWrong = false;
  let foreignDocument = false;
  const owner = {emailAddress:'ebs@example.com'};
  const request = async (path, method = 'GET', body) => {
    calls.push({ path, method, body });
    const url = new URL(path, 'https://www.googleapis.com/drive/v3/');
    if (url.pathname.endsWith('/about')) return { user: {emailAddress: wrongOwner ? 'other@example.com' : owner.emailAddress} };
    if (url.pathname.endsWith('/generateIds')) return { ids: ['generated'] };
    if (url.pathname.endsWith('/parent/permissions')) return { permissions: [{ type: publicPermission ? 'anyone' : 'group', emailAddress: unexpectedStaff ? 'participant@example.com' : 'staff@example.com', role: 'reader' }] };
    if (url.pathname.endsWith('/parent')) return { id: 'parent', mimeType: 'application/vnd.google-apps.folder', owners:[folderOwnerWrong?{emailAddress:'other@example.com'}:owner], capabilities: { canAddChildren: true, canShare: !missingCapability } };
    if (url.pathname.endsWith('/template/copy')) return { id: 'new-doc' };
    if (url.pathname.endsWith('/template')) return { mimeType: 'application/vnd.google-apps.document', capabilities: { canCopy: true } };
    if (url.pathname.endsWith('/folder/permissions')) {
      if (method === 'POST') return { id: 'permission' };
      if (pages && !url.searchParams.has('pageToken')) return { permissions: [], nextPageToken: 'page-2' };
      return { permissions: pages ? [{ type: 'user', emailAddress: 'student@example.com', role: 'writer' }] : [] };
    }
    if (url.pathname.endsWith('/files') && method === 'GET') return { files: [{ id: 'new-doc' }] };
    if (url.pathname.endsWith('/files') && method === 'POST') {
      folders.set(body.id,{...body,owners:[owner]});
      if(timeoutAfterCreate) {timeoutAfterCreate=false;throw new DriveError(503);}
      return {id:body.id};
    }
    if (url.pathname.endsWith('/generated') || url.pathname.endsWith('/retry-folder')) {
      const id=url.pathname.split('/').at(-1);
      if(!folders.has(id))throw new DriveError(404);
      return folders.get(id);
    }
    if (url.pathname.endsWith('/new-doc')) return { id: 'new-doc', owners:[foreignDocument?{emailAddress:'other@example.com'}:owner], mimeType: 'application/vnd.google-apps.document', parents: ['folder'], appProperties: { ebsParticipantDoc: 'folder' } };
    throw Error('Unexpected request ' + path);
  };
  const drive = createParticipantDrive({ parentId: 'parent', templateId: 'template', staffEmails: ['staff@example.com'], ownerEmail: 'ebs@example.com' }, request);
  await drive.preflight();
  publicPermission = true;
  await assert.rejects(drive.preflight());
  publicPermission = false;
  wrongOwner = true; await assert.rejects(drive.preflight()); wrongOwner = false;
  unexpectedStaff = true; await assert.rejects(drive.preflight()); unexpectedStaff = false;
  missingCapability = true; await assert.rejects(drive.preflight()); missingCapability = false;
  folderOwnerWrong = true; await assert.rejects(drive.preflight()); folderOwnerWrong = false;
  await drive.preflight();
  assert.equal(await drive.generateFolderId(), 'generated');
  await drive.ensureFolder('generated','self','student@example.com');
  const firstFolder=calls.find(c=>c.method==='POST'&&c.path.startsWith('files?'));
  assert.deepEqual(firstFolder.body.parents,['parent']);
  assert.equal(firstFolder.body.mimeType,'application/vnd.google-apps.folder');
  const folderWrites=()=>calls.filter(c=>c.method==='POST'&&c.path.startsWith('files?')).length;
  const firstWrites=folderWrites();
  await drive.ensureFolder('generated','self','student@example.com');assert.equal(folderWrites(),firstWrites);
  folders.get('generated').owners=[{emailAddress:'other@example.com'}];
  await assert.rejects(drive.ensureFolder('generated','self','student@example.com'));assert.equal(folderWrites(),firstWrites);
  timeoutAfterCreate=true;await assert.rejects(drive.ensureFolder('retry-folder','self','student@example.com'));
  await drive.ensureFolder('retry-folder','self','student@example.com');assert.equal(folderWrites(),firstWrites+1);
  assert.equal(await drive.copyDocument('folder'), 'new-doc');
  const copy = calls.find(c => c.path.startsWith('files/template/copy'));
  assert.deepEqual(copy.body.parents, ['folder']);
  assert.equal(copy.body.appProperties.ebsParticipantDoc, 'folder');
  assert.equal(copy.body.id, undefined, 'Google Docs cannot use generated IDs');
  foreignDocument=true;await assert.rejects(drive.validateDocument('folder','new-doc'));foreignDocument=false;
  await drive.validateDocument('folder', 'new-doc');
  assert.equal(await drive.findDocument('folder'), 'new-doc');
  const search = new URL(calls.find(c => c.method === 'GET' && c.path.startsWith('files?')).path, 'https://test/');
  assert.equal(search.searchParams.get('corpora'), 'user');
  assert.equal(search.searchParams.has('driveId'), false);
  assert.match(search.searchParams.get('q'), /'folder' in parents/);
  assert.equal(calls.filter(c => c.method === 'POST' && c.path.startsWith('files/template/copy')).length, 1);
  await drive.shareFolder('folder', 'student@example.com');
  const share = calls.find(c => c.method === 'POST' && c.path.startsWith('files/folder/permissions'));
  assert.deepEqual(share.body, { type: 'user', role: 'writer', emailAddress: 'student@example.com' });
  assert(new URL(share.path, 'https://test/').searchParams.get('sendNotificationEmail') === 'false');
  const before = calls.filter(c => c.method === 'POST').length;
  pages = true;
  await drive.shareFolder('folder', 'student@example.com');
  assert.equal(calls.filter(c => c.method === 'POST').length, before);
  for (const c of calls.filter(c => c.method === 'POST')) assert.equal(new URL(c.path, 'https://test/').searchParams.get('supportsAllDrives'), 'true');
  console.log('PASS: personal EBS ownership, pinned identity, staff ACL/capabilities, My Drive search, fixed template, specific sharing, pagination, and no repeated writes.');
} finally { await vite.close(); }
