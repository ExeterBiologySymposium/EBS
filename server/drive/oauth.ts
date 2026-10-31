import { OAuth2Client } from 'google-auth-library';

export interface OwnerOAuthConfig { clientId: string; clientSecret: string; refreshToken: string; ownerEmail: string; }
export type DriveRequest = <T>(path: string, method?: string, body?: unknown) => Promise<T>;
export class DriveError extends Error {
  constructor(readonly status: number) { super('Google Drive request failed'); }
}
export function createOwnerOAuthClient(config: OwnerOAuthConfig): OAuth2Client {
  const client = new OAuth2Client({ clientId: config.clientId, clientSecret: config.clientSecret, transporterOptions: { timeout: 15_000 } });
  client.setCredentials({ refresh_token: config.refreshToken });
  return client;
}
export function createOAuthDriveRequest(client: Pick<OAuth2Client, 'getAccessToken'>, fetcher: typeof fetch = fetch): DriveRequest {
  return async <T>(path: string, method = 'GET', body?: unknown): Promise<T> => {
    let token: string | null | undefined;
    try { token = (await client.getAccessToken()).token; }
    catch { throw new Error('Google owner authorization unavailable'); }
    if (!token) throw new Error('Google owner authorization unavailable');
    const response = await fetcher(`https://www.googleapis.com/drive/v3/${path}`, {
      method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(15_000), redirect: 'error',
    });
    // OAuth token refresh is handled by the library. Drive mutations deliberately
    // use fetch without automatic retries: a timed-out Docs copy may have succeeded.
    if (!response.ok) throw new DriveError(response.status);
    return await response.json() as T;
  };
}
