export const symposiumVenue = 'Phillips Exeter Academy — Phelps Lobby and Grainger.';

export function scheduleLocation(location: string) {
  return location.replace(/\b(?:Forum|New Dining Hall)\b/gi, 'Grainger');
}
