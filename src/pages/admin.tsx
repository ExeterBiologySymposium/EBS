import { lazy, Suspense, useCallback, useContext, useEffect, useRef, useState, type FormEvent } from 'react';
import { AuthContext } from '../auth';
import { adminMessage, adminRequest, lostTeamAccess } from '../admin-api';
import type { Destination, Page, Result } from '../../server/orgs/types';

const TeamSettings = lazy(() => import('../team-organization-settings'));
type Participant = { userId: string; name: string; identifier: string; joinedAt: number; pending: boolean; accepted: boolean };
type Invitation = { id: string; email: string; destination: Destination; createdAt: number; expiresAt: number };
type Lookup = { mode: 'add'; userId: string; name: string; email: string } | { mode: 'invite'; email: string };
type Availability = Record<Destination, 'space-available' | 'will-create' | 'capacity-reached' | 'needs-review'>;
const label = (destination: Destination) => destination === 'pending' ? 'Pending' : 'Accepted';
const date = (timestamp: number) => new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/New_York' });
function resultMessage(result: Result): string {
  if (result.state === 'cleanup-needed') return 'Accepted — cleanup needed. Access is granted. Refresh Pending and use Retry cleanup.';
  if (result.state === 'already-invited') return `An invitation to ${label(result.destination)} already exists. No additional invitation was sent.`;
  if (result.state === 'already-accepted') return 'This participant is already Accepted. Their access has not been downgraded.';
  if (result.state === 'already-member') return `This participant already belongs to ${label(result.destination)}.`;
  return result.state === 'invited' ? `Invitation sent to ${label(result.destination)}. Membership begins when the invitation is accepted.` : `Added to ${label(result.destination)}${result.destination === 'accepted' ? '. EBS resource access is now granted.' : ' for review.'}`;
}
function Pagination({ page, busy, onChange }: { page: Page<unknown>; busy: boolean; onChange(cursor: string | null): void }) {
  return <div className="actions admin-pagination" aria-label="Pagination">
    <button className="button secondary" type="button" disabled={busy || !page.previousCursor} onClick={() => onChange(page.previousCursor)}>Previous page</button>
    <span>{page.totalCount ? `${page.offset + 1}–${Math.min(page.offset + 25, page.totalCount)} of ${page.totalCount}` : '0 results'}</span>
    <button className="button secondary" type="button" disabled={busy || !page.nextCursor} onClick={() => onChange(page.nextCursor)}>Next page</button>
  </div>;
}
function useMounted() {
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  return mounted;
}

function AddParticipant({ revision, onChanged, onDenied }: { revision: number; onChanged(): void; onDenied(): void }) {
  const [email, setEmail] = useState('');
  const [destination, setDestination] = useState<Destination>('pending');
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [capacityError, setCapacityError] = useState('');
  const [busy, setBusy] = useState<'lookup' | 'save' | null>(null);
  const busyRef = useRef(false);
  const [message, setMessage] = useState('');
  const mounted = useMounted();
  useEffect(() => {
    const controller = new AbortController();
    setAvailability(null); setCapacityError('');
    adminRequest<Availability>('action=availability', { signal: controller.signal }).then(value => { if (!controller.signal.aborted) setAvailability(value); }).catch(error => { if (!controller.signal.aborted) { if (lostTeamAccess(error)) onDenied(); else setCapacityError(adminMessage(error)); } });
    return () => controller.abort();
  }, [revision, onDenied]);
  const capacity = availability?.[destination];
  const open = capacity === 'space-available' || capacity === 'will-create';
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true; setBusy(lookup ? 'save' : 'lookup'); setMessage('');
    try {
      if (!lookup) {
        const value = await adminRequest<Lookup>('', { body: { action: 'lookup', email } });
        if (mounted.current) setLookup(value);
      } else {
        if (!open) return;
        const value = await adminRequest<Result>('', { body: lookup.mode === 'add' ? { action: 'add', userId: lookup.userId, email: lookup.email, destination } : { action: 'invite', email: lookup.email, destination } });
        if (!mounted.current) return;
        setMessage(resultMessage(value));
        if (value.state === 'added' || value.state === 'invited') { setEmail(''); setLookup(null); }
        onChanged();
      }
    } catch (error) { if (mounted.current) { if (lostTeamAccess(error)) onDenied(); else { setMessage(adminMessage(error)); setLookup(null); } } }
    finally { busyRef.current = false; if (mounted.current) setBusy(null); }
  }
  return <section className="section admin-add"><div className="shell">
    <h2>Add or invite participant</h2><p>Choose Pending for review or Accepted to grant resource access.</p>
    <form className="admin-invite" onSubmit={submit}>
      <label htmlFor="participant-email">Participant email</label>
      <input id="participant-email" type="email" required maxLength={254} value={email} onChange={event => { setEmail(event.target.value); setLookup(null); setMessage(''); }} disabled={!!busy} autoComplete="email" />
      <label htmlFor="participant-destination">Destination</label>
      <select id="participant-destination" value={destination} disabled={!!busy} onChange={event => setDestination(event.target.value as Destination)}><option value="pending">Pending</option><option value="accepted">Accepted</option></select>
      <p id="destination-capacity" role="status">{capacity === 'space-available' ? 'Space available' : capacity === 'will-create' ? 'A new list will be created' : capacity === 'capacity-reached' ? 'Capacity reached' : capacity === 'needs-review' ? 'Allocation needs owner review' : capacityError || 'Checking capacity…'}</p>
      {capacityError && <button className="button secondary" type="button" onClick={onChanged}>Retry capacity check</button>}
      {lookup && <div className="admin-lookup" role="status"><p>{lookup.mode === 'add' ? `Existing verified account: ${lookup.name ? lookup.name + ' · ' : ''}${lookup.email}` : `Send an email invitation to ${lookup.email}.`}</p><p>{lookup.mode === 'add' ? destination === 'accepted' ? 'Adding this account to Accepted grants access immediately.' : 'This account will enter Pending for review. Already Accepted accounts keep their access.' : `They will join ${label(destination)} when they accept the invitation${destination === 'accepted' ? ', granting access to EBS resources.' : ' and wait for review.'}`}</p></div>}
      <button className="button" type="submit" disabled={!!busy || !!lookup && !open} aria-describedby="destination-capacity">{busy === 'lookup' ? 'Looking up account…' : busy === 'save' ? 'Saving…' : !lookup ? 'Look up account' : lookup.mode === 'add' ? `Add to ${label(destination)}` : `Send ${label(destination)} invitation`}</button>
    </form>
    <p className="admin-result" role="status" aria-live="polite">{message}</p>
  </div></section>;
}

function ParticipantList({ group, revision, onChanged, onDenied }: { group: Destination; revision: number; onChanged(): void; onDenied(): void }) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [page, setPage] = useState<Page<Participant> | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const busyRef = useRef(false);
  const [message, setMessage] = useState('');
  const announcement = useRef<HTMLParagraphElement>(null);
  const mounted = useMounted();
  useEffect(() => {
    const controller = new AbortController(); setPage(null); setError('');
    adminRequest<Page<Participant>>(`action=members&group=${group}` + (cursor ? '&cursor=' + encodeURIComponent(cursor) : ''), { signal: controller.signal }).then(value => { if (!controller.signal.aborted) setPage(value); }).catch(reason => { if (!controller.signal.aborted) { if (lostTeamAccess(reason)) onDenied(); else setError(adminMessage(reason)); } });
    return () => controller.abort();
  }, [group, cursor, revision, reload, onDenied]);
  async function accept(member: Participant) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(member.userId); setMessage('');
    try {
      const result = await adminRequest<Result>('', { body: { action: 'accept', userId: member.userId } });
      if (!mounted.current) return;
      setMessage(`${member.identifier}: ${resultMessage(result)}`); onChanged();
    } catch (reason) { if (mounted.current) { if (lostTeamAccess(reason)) onDenied(); else setMessage(`${member.identifier}: ${adminMessage(reason)}`); } }
    finally { busyRef.current = false; if (mounted.current) { setBusy(null); announcement.current?.focus(); } }
  }
  return <><h2>{label(group)} participants</h2>
    <p ref={announcement} className="admin-result" role="status" aria-live="polite" tabIndex={-1}>{message}</p>
    {error ? <div role="alert"><p>{error}</p><button className="button secondary" type="button" onClick={() => setReload(value => value + 1)}>Retry participant list</button></div> : !page ? <p role="status">Loading participants…</p> : <>
      {page.data.length ? <ul className="admin-members" aria-label={`${group} participants`}>{page.data.map(member => <li key={member.userId}>
        <div><h3>{member.name || member.identifier}</h3>{member.name && <p>{member.identifier}</p>}<p className="small">Joined {date(member.joinedAt)} · {member.accepted ? member.pending ? 'Accepted — cleanup needed' : 'Accepted' : 'Pending review'}</p></div>
        {member.pending && <button className="button secondary" type="button" disabled={!!busy} aria-label={`${member.accepted ? 'Retry cleanup for' : 'Accept participant'} ${member.identifier}`} onClick={() => void accept(member)}>{busy === member.userId ? 'Saving…' : member.accepted ? 'Retry cleanup' : 'Accept participant'}</button>}
      </li>)}</ul> : <p>No {group} participants.</p>}
      <Pagination page={page} busy={!!busy} onChange={setCursor} />
    </>}
    <button className="admin-refresh" type="button" disabled={!!busy} onClick={() => setReload(value => value + 1)}>Refresh participant list</button>
  </>;
}

function InvitationList({ revision, onDenied }: { revision: number; onDenied(): void }) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [page, setPage] = useState<Page<Invitation> | null>(null);
  const [error, setError] = useState(''); const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setPage(null); setError('');
    adminRequest<Page<Invitation>>('action=invitations' + (cursor ? '&cursor=' + encodeURIComponent(cursor) : ''), { signal: controller.signal }).then(value => { if (!controller.signal.aborted) setPage(value); }).catch(reason => { if (!controller.signal.aborted) { if (lostTeamAccess(reason)) onDenied(); else setError(adminMessage(reason)); } });
    return () => controller.abort();
  }, [cursor, revision, reload, onDenied]);
  return <><h2>Outstanding invitations</h2>{error ? <div role="alert"><p>{error}</p><button className="button secondary" type="button" onClick={() => setReload(value => value + 1)}>Retry invitation list</button></div> : !page ? <p role="status">Loading invitations…</p> : <>
    {page.data.length ? <ul className="admin-members">{page.data.map(invite => <li key={invite.id}><div><h3>{invite.email}</h3><p>{label(invite.destination)} invitation · Sent {date(invite.createdAt)} · Expires {date(invite.expiresAt)}</p></div></li>)}</ul> : <p>No outstanding invitations.</p>}
    <Pagination page={page} busy={false} onChange={setCursor} />
  </>}<button className="admin-refresh" type="button" onClick={() => setReload(value => value + 1)}>Refresh invitations</button></>;
}

function AdminWorkspace({ teamOrganizationId }: { teamOrganizationId: string }) {
  const { refreshAccess } = useContext(AuthContext);
  const [revoked, setRevoked] = useState(false);
  const [revision, setRevision] = useState(0);
  const [view, setView] = useState<Destination | 'invitations'>('pending');
  const [settingsOpen, setSettingsOpen] = useState(() => typeof window !== 'undefined' && /^#(?:\/|team-settings)/.test(window.location.hash));
  const onDenied = useCallback(() => { setRevoked(true); refreshAccess(); }, [refreshAccess]);
  const onChanged = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => { const update = () => setSettingsOpen(/^#(?:\/|team-settings)/.test(window.location.hash)); window.addEventListener('hashchange', update); window.addEventListener('popstate', update); return () => { window.removeEventListener('hashchange', update); window.removeEventListener('popstate', update); }; }, []);
  if (revoked) return <section className="section"><div className="shell" role="alert"><p>Your team access has changed. Administrative data has been closed.</p><a href="account.html">Return to Account</a></div></section>;
  return <>
    <div className="shell actions admin-tools"><button className="button secondary" type="button" onClick={() => { const open = !settingsOpen; setSettingsOpen(open); history.pushState({ ...history.state }, '', location.pathname + location.search + (open ? '#team-settings' : '')); }}>{settingsOpen ? 'Back to participants' : 'Team organization settings'}</button>{!settingsOpen && <button className="button secondary" type="button" onClick={onChanged}>Refresh lists and capacity</button>}</div>
    {settingsOpen ? <section className="section"><div className="shell"><Suspense fallback={<p role="status">Loading Team settings…</p>}><TeamSettings teamOrganizationId={teamOrganizationId} /></Suspense></div></section> : <>
      <AddParticipant revision={revision} onChanged={onChanged} onDenied={onDenied} />
      <section className="section"><div className="shell">
        <div className="actions admin-views" aria-label="Participant views">{(['pending', 'accepted', 'invitations'] as const).map(value => <button key={value} type="button" className={`button ${view === value ? '' : 'secondary'}`} aria-pressed={view === value} onClick={() => setView(value)}>{value === 'invitations' ? 'Invitations' : label(value)}</button>)}</div>
        {view === 'invitations' ? <InvitationList revision={revision} onDenied={onDenied} /> : <ParticipantList key={view} group={view} revision={revision} onChanged={onChanged} onDenied={onDenied} />}
      </div></section>
    </>}
  </>;
}

export default function AdminPage() {
  const { status, teamAccess, teamOrganizationId, signIn, refreshAccess } = useContext(AuthContext);
  const allowed = status === 'signed-in' && teamAccess === 'allowed' && !!teamOrganizationId;
  return <div className="page-layout layout-admin"><section className="page-heading"><div className="shell"><p className="eyebrow">For the EBS team</p><h1>EBS administration</h1><p className="lead">Add participants, send invitations, and manage access to EBS research tools.</p><a href="account.html">Back to Account</a></div></section>
    {allowed ? <AdminWorkspace key={teamOrganizationId} teamOrganizationId={teamOrganizationId} /> : <section className="section"><div className="shell"><p role="status">{status === 'signed-out' ? 'Sign in with your EBS Team account to continue.' : status === 'loading' || teamAccess === 'checking' ? 'Checking team access…' : teamAccess === 'denied' ? 'This page is available to members of EBS Team.' : 'Team access is unavailable. Try again or contact the EBS account owner.'}</p>
      {status === 'signed-out' ? <button className="button" type="button" onClick={signIn}>Sign in</button> : status === 'signed-in' && <button className="button secondary" type="button" onClick={refreshAccess}>Check team access again</button>}
    </div></section>}
  </div>;
}
