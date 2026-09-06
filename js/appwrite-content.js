/* Remote collections replace static content only when complete and valid. */
(() => {
  const APPWRITE = {
    endpoint: 'https://nyc.cloud.appwrite.io/v1',
    projectId: '6a4ae6460030ea485984',
    databaseId: 'ebs'
  };
  const fields = { schedule_items: ['time', 'event', 'location'], session_info: ['title', 'description'] };

  function validCollection(data, required) {
    return Array.isArray(data?.documents) && data.documents.length > 0 && data.documents.length <= 100 &&
      data.total === data.documents.length && data.documents.every(row =>
        row && required.every(key => typeof row[key] === 'string' && row[key].trim().length > 0));
  }

  async function fetchCollection(collectionId, fetchImpl = fetch) {
    const query = new URLSearchParams();
    query.append('queries[]', JSON.stringify({ method: 'orderAsc', attribute: 'order', values: [] }));
    query.append('queries[]', JSON.stringify({ method: 'limit', values: [100] }));
    const response = await fetchImpl(`${APPWRITE.endpoint}/databases/${APPWRITE.databaseId}/collections/${collectionId}/documents?${query}`, {
      headers: { 'X-Appwrite-Project': APPWRITE.projectId }
    });
    if (!response.ok) throw new Error(`Appwrite fetch failed: ${response.status}`);
    const data = await response.json();
    if (!validCollection(data, fields[collectionId])) throw new Error('Incomplete or invalid Appwrite collection');
    return data.documents;
  }

  function renderSchedule(rows) {
    const tbody = document.getElementById('schedule-body');
    if (!tbody) return;
    tbody.replaceChildren(...rows.map(row => {
      const tr = document.createElement('tr');
      for (const key of fields.schedule_items) {
        const td = document.createElement('td');
        td.textContent = row[key];
        tr.append(td);
      }
      return tr;
    }));
  }

  function renderSessionInfo(cards) {
    const grid = document.getElementById('session-info-grid');
    if (!grid || !cards.length) return;
    grid.replaceChildren(...cards.map(card => {
      const item = document.createElement('div');
      item.className = 'session-item';
      const title = document.createElement('h3');
      title.textContent = card.title;
      const description = document.createElement('p');
      description.textContent = card.description;
      item.append(title, description);
      return item;
    }));
  }

  async function loadContent(fetcher = fetchCollection, schedule = renderSchedule, sessions = renderSessionInfo) {
    return Promise.allSettled([
      fetcher('schedule_items').then(schedule),
      fetcher('session_info').then(cards => {
        const safeCards = cards.filter(card => card.title.trim().toLowerCase() !== 'date');
        if (safeCards.length) sessions(safeCards);
      })
    ]);
  }

  if (typeof document !== 'undefined') {
    const init = () => loadContent();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
  if (typeof module !== 'undefined') module.exports = { validCollection, fetchCollection, loadContent };
})();
