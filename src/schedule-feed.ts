import { ensureKeynote, scheduleLocation, symposiumVenue, type ScheduleRow } from './schedule-details.js';

type Session = { title: string; description: string };
type Feed = { rows: ScheduleRow[]; sessions: Session[] };
type RemoteRow = Record<string, string>;

async function collection(name: string, fields: string[], signal: AbortSignal): Promise<RemoteRow[]> {
  const query = new URLSearchParams();
  query.append('queries[]', JSON.stringify({ method: 'orderAsc', attribute: 'order', values: [] }));
  query.append('queries[]', JSON.stringify({ method: 'limit', values: [100] }));
  const response = await fetch(`https://nyc.cloud.appwrite.io/v1/databases/ebs/collections/${name}/documents?${query}`, {
    headers: { 'X-Appwrite-Project': '6a4ae6460030ea485984' }, signal,
  });
  if (!response.ok) throw new Error('Schedule feed unavailable.');
  const { documents, total } = await response.json();
  if (!Array.isArray(documents) || !documents.length || total !== documents.length || documents.length > 100 ||
      !documents.every(row => row && fields.every(field => typeof row[field] === 'string' && row[field].trim()))) {
    throw new Error('Invalid schedule feed.');
  }
  return documents;
}

export async function fetchScheduleFeed(signal: AbortSignal): Promise<Partial<Feed>> {
  const [schedule, sessionInfo] = await Promise.allSettled([
    collection('schedule_items', ['time', 'event', 'location'], signal),
    collection('session_info', ['title', 'description'], signal),
  ]);
  const rows = schedule.status === 'fulfilled' ? ensureKeynote(schedule.value.map(({ time, event, location }) =>
    ({ time, event, location: scheduleLocation(location) }))) : undefined;
  const sessions = sessionInfo.status === 'fulfilled' ? sessionInfo.value
    .filter(row => row.title.trim().toLowerCase() !== 'date')
    .map(({ title, description }) => ({ title, description: title.trim().toLowerCase() === 'venue' ? symposiumVenue : description })) : undefined;
  return { ...(rows?.length ? { rows } : {}), ...(sessions?.length ? { sessions } : {}) };
}
