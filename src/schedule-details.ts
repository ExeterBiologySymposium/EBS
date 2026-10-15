export const symposiumVenue = 'Phillips Exeter Academy — Phelps Lobby and Grainger.';

export type ScheduleRow = { time: string; event: string; location: string };

export function ensureKeynote(rows: ScheduleRow[]): ScheduleRow[] {
  if (rows.some(row => row.event.trim().toLowerCase().includes('keynote'))) return rows;
  const alignOpeningTimes = (schedule: ScheduleRow[]) => schedule.map(row => {
    const event = row.event.trim().toLowerCase();
    if (event.includes('morning poster')) return { ...row, time: '10:15 AM – 12:15 PM' };
    if (event === 'lunch') return { ...row, time: '12:15 – 1:15 PM' };
    if (event.includes('afternoon poster')) return { ...row, time: '1:15 – 2:45 PM' };
    if (event.includes('cleanup')) return { ...row, time: '2:45 – 3:15 PM' };
    if (event.includes('closing')) return { ...row, time: '3:15 – 3:45 PM' };
    return row;
  });
  const openingIndex = rows.findIndex(row => row.event.trim().toLowerCase().includes('opening'));
  if (openingIndex >= 0) {
    return alignOpeningTimes([
      ...rows.slice(0, openingIndex),
      { time: '9:00 – 9:10 AM', event: 'Symposium Orientation & Logistics', location: 'Grainger' },
      { time: '9:10 – 9:15 AM', event: 'Faculty Welcome Address', location: 'Grainger' },
      { time: '9:15 – 10:15 AM', event: 'Opening Keynote Presentation', location: 'Grainger' },
      ...rows.slice(openingIndex + 1)
    ]);
  }
  return alignOpeningTimes([
    { time: '9:00 – 9:10 AM', event: 'Symposium Orientation & Logistics', location: 'Grainger' },
    { time: '9:10 – 9:15 AM', event: 'Faculty Welcome Address', location: 'Grainger' },
    { time: '9:15 – 10:15 AM', event: 'Opening Keynote Presentation', location: 'Grainger' },
    ...rows
  ]);
}

export function scheduleLocation(location: string) {
  return location.replace(/\b(?:Forum|New Dining Hall)\b/gi, 'Grainger');
}
