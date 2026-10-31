import { InviteMembersButton, OrganizationProfile, Show, useClerk, useOrganization } from '@clerk/react';
import { useEffect, useState } from 'react';

export default function TeamOrganizationSettings({ teamOrganizationId }: { teamOrganizationId: string }) {
  const clerk = useClerk();
  const { organization, isLoaded } = useOrganization();
  const [state, setState] = useState<'activating' | 'ready' | 'error'>('activating');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setState('activating');
    clerk.setActive({ organization: teamOrganizationId }).then(() => { if (!cancelled) setState('ready'); }).catch(() => { if (!cancelled) setState('error'); });
    return () => { cancelled = true; };
  }, [clerk, teamOrganizationId, revision]);
  if (state === 'activating' || !isLoaded) return <p role="status">Selecting EBS Team…</p>;
  if (state === 'error' || organization?.id !== teamOrganizationId) return <div role="alert"><p>We could not open EBS Team settings. Your active organization may have changed.</p><button className="button secondary" type="button" onClick={() => setRevision(value => value + 1)}>Retry Team settings</button></div>;
  return <div className="admin-clerk-settings"><h2>Team organization settings</h2>
    <Show when={{ permission: 'org:sys_memberships:manage' }}><div className="admin-staff-invite"><p>Inviting someone to EBS Team grants them administration access. For participant invitations, return to the participant list.</p><InviteMembersButton><button className="button secondary" type="button">Invite team member</button></InviteMembersButton></div></Show>
    <OrganizationProfile routing="hash" afterLeaveOrganizationUrl="/account.html" fallback={<p role="status">Loading organization settings…</p>} />
  </div>;
}
