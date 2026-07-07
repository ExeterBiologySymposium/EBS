// Loads the symposium schedule and session-info cards from Appwrite.
// Falls back to the static HTML already in the page if the fetch fails.

(function () {
  const APPWRITE = {
    endpoint: 'https://nyc.cloud.appwrite.io/v1',
    projectId: '6a4ae6460030ea485984',
    databaseId: 'ebs'
  };

  const escapeHTML = (window.EBS && window.EBS.escapeHTML) || (value => String(value));

  async function fetchCollection(collectionId) {
    const query = encodeURIComponent(JSON.stringify({ method: 'orderAsc', attribute: 'order', values: [] }));
    const url = `${APPWRITE.endpoint}/databases/${APPWRITE.databaseId}/collections/${collectionId}/documents?queries[]=${query}&limit=100`;
    const res = await fetch(url, {
      headers: { 'X-Appwrite-Project': APPWRITE.projectId }
    });
    if (!res.ok) throw new Error(`Appwrite fetch failed: ${res.status}`);
    const data = await res.json();
    return data.documents || [];
  }

  function renderSchedule(rows) {
    const tbody = document.getElementById('schedule-body');
    if (!tbody || !rows.length) return;
    tbody.innerHTML = rows.map(row => `
      <tr>
        <td>${escapeHTML(row.time)}</td>
        <td>${escapeHTML(row.event)}</td>
        <td>${escapeHTML(row.location)}</td>
      </tr>
    `).join('');
  }

  function renderSessionInfo(cards) {
    const grid = document.getElementById('session-info-grid');
    if (!grid || !cards.length) return;
    grid.innerHTML = cards.map((card, i) => `
      <div class="card card--bordered-top reveal visible reveal--d${(i % 4) + 1}">
        <div class="card__icon"><svg width="24" height="24" aria-hidden="true"><use href="#${escapeHTML(card.icon)}"/></svg></div>
        <h4>${escapeHTML(card.title)}</h4>
        <p>${escapeHTML(card.description)}</p>
      </div>
    `).join('');
  }

  async function init() {
    try {
      const [scheduleRows, sessionCards] = await Promise.all([
        fetchCollection('schedule_items'),
        fetchCollection('session_info')
      ]);
      renderSchedule(scheduleRows);
      renderSessionInfo(sessionCards);
    } catch (err) {
      console.warn('Appwrite content load failed, keeping static fallback content.', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
