export function participantDriveFixture() {
  const records = new Map();
  const claims = new Set();
  const shared = [];
  let folders = 0;
  let copies = 0;
  const store = {
    get: async id => structuredClone(records.get(id) ?? null),
    async ensure(userId, email, folderId) {
      if (!records.has(userId)) records.set(userId, { userId, email, folderId, documentId: null, copyStarted: false, ready: false });
    },
    async claim(id) {
      if (claims.has(id) || records.get(id).ready) return null;
      claims.add(id);
      return 'fixture-claim';
    },
    async release(id) { claims.delete(id); },
    async startCopy(id) {
      const record = records.get(id);
      if (record.copyStarted) return false;
      record.copyStarted = true;
      return true;
    },
    async document(id, _claim, documentId) { records.get(id).documentId = documentId; },
    async complete(id) { records.get(id).ready = true; },
  };
  const drive = {
    preflight: async () => {},
    generateFolderId: async () => `fixture-folder-${++folders}`,
    ensureFolder: async () => {},
    findDocument: async () => null,
    copyDocument: async () => `fixture-document-${++copies}`,
    validateDocument: async () => {},
    async shareFolder(folderId, email) { shared.push({ folderId, email }); },
  };
  return { records, shared, store, drive };
}
