const messages: Record<string, string> = {
  capacity: 'Capacity reached. No open list is available within the organization limit. Contact the EBS account owner.',
  configuration: 'Administration setup is incomplete. Contact the EBS account owner.',
  processing: 'Another update is in progress. Wait a few seconds, then retry.',
  'needs-review': 'An earlier request has an uncertain outcome. The account owner must review it before it can be repeated.',
  'rate-limited': 'Too many requests. Wait before trying again.',
  'lookup-changed': 'The account changed or already exists. Look up the email again before continuing.',
  'ambiguous-account': 'More than one verified account matches this email. Ask the account owner to review it.',
  'not-pending': 'This account is no longer in Pending. Refresh the list.',
  'invalid-request': 'Check the information entered and try again.',
};
export class AdminRequestError extends Error {
  constructor(public readonly status: number, public readonly state: string) { super(messages[state] || 'The request could not be completed. Try again.'); }
}
export async function adminRequest<T>(query: string, options: { signal?: AbortSignal; body?: object } = {}): Promise<T> {
  const response = await fetch('/api/team-admin' + (query ? '?' + query : ''), {
    credentials: 'same-origin', cache: 'no-store', signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(55000)]) : AbortSignal.timeout(55000),
    ...(options.body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(options.body) } : {}),
  });
  const value = await response.json();
  if (!response.ok || response.status === 202) throw new AdminRequestError(response.status, value.state);
  return value as T;
}
export function lostTeamAccess(error: unknown): boolean { return error instanceof AdminRequestError && [401, 403].includes(error.status); }
export function adminMessage(error: unknown): string { return error instanceof AdminRequestError ? error.message : 'The request could not be completed. Check your connection and try again.'; }
