import { useEffect, useId, useRef, useState } from 'react';
import { adminMessage, AdminRequestError, adminRequest, lostTeamAccess } from './admin-api';

type Participant = { userId: string; identifier: string };
type FollowUp = Participant & { reason: string };

function followUpReason(error: unknown) {
  if (error instanceof AdminRequestError) {
    switch (error.state) {
      case 'link-google': return 'Ask the participant to link one verified Google account in EBS.';
      case 'identity-changed': return 'The linked Google account differs from the saved folder recipient. Review Drive access.';
      case 'needs-review': return 'Check whether the starter document was copied before retrying.';
      case 'unavailable': return 'Folder creation is unavailable. Check the Drive setup or try again later.';
    }
  }
  return adminMessage(error);
}

export function AdminDriveFolders({ onDenied }: { onDenied(): void }) {
  const hintId = useId();
  const active = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  useEffect(() => () => active.current?.abort(), []);

  async function createFolders() {
    if (active.current) return;
    const request = new AbortController();
    active.current = request;
    const { signal } = request;
    setBusy(true);
    setError('');
    setFollowUps([]);
    setStatus('Loading Accepted participants…');

    try {
      const { participants } = await adminRequest<{ participants: Participant[] }>('action=folder-roster', { signal });
      const total = participants.length;
      let ready = 0;
      let custom = 0;
      const issues: FollowUp[] = [];
      for (const [index, participant] of participants.entries()) {
        if (signal.aborted) return;
        setStatus(`Processing ${index + 1} of ${total} participants…`);
        try {
          const result = await adminRequest<{ state: 'ready' | 'custom' }>('', { signal, body: { action: 'create-folder', userId: participant.userId } });
          if (result.state === 'ready') ready++;
          else if (result.state === 'custom') custom++;
          else issues.push({ ...participant, reason: 'The folder status could not be confirmed. Run the action again.' });
        } catch (reason) {
          if (signal.aborted) return;
          if (lostTeamAccess(reason)) throw reason;
          issues.push({ ...participant, reason: followUpReason(reason) });
        }
      }
      if (signal.aborted) return;
      setFollowUps(issues);
      setStatus(total ? `Folders ready: ${ready}. Custom links kept: ${custom}. Need follow-up: ${issues.length}.` : 'There are no Accepted participants to process.');
    } catch (reason) {
      if (signal.aborted) return;
      setStatus('');
      if (lostTeamAccess(reason)) onDenied();
      else setError(adminMessage(reason));
    } finally {
      active.current = null;
      if (!signal.aborted) setBusy(false);
    }
  }

  return <>
    <p id={hintId} className="form-hint">Create folders and starter documents across all Accepted pages. Participants need one linked Google account. Keep this view open until the run finishes.</p>
    <div className="actions admin-drive-actions"><button className="button secondary" type="button" aria-disabled={busy} aria-describedby={hintId} onClick={() => void createFolders()}>
      Create Google Drive folders
    </button></div>
    <p className="admin-drive-status" role="status">{status}</p>
    {error && <p className="admin-result" role="alert">{error}</p>}
    {followUps.length > 0 && <details className="admin-folder-link">
      <summary>Participants needing follow-up ({followUps.length})</summary>
      <ul>{followUps.map(({ userId, identifier, reason }) => <li key={userId}><strong>{identifier || userId}</strong><br />{reason}</li>)}</ul>
    </details>}
  </>;
}
