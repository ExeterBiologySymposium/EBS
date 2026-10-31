import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthContext, initialAuth } from '../src/auth';
import { NavigationApp } from '../src/navigation-app';
import { enableTeamInvitation } from './org-clerk-fixture';
import '../src/styles.css';

function Fixture() {
  const [state, setState] = useState({ ...initialAuth, status: 'signed-in' as const, access: 'pending' as const, teamAccess: 'allowed' as const, teamOrganizationId: 'org_team' });
  const [flags, setFlags] = useState('Fake providers only');
  const toggle = async (value: object) => { const response = await fetch('/__org-qa', { method: 'POST', body: JSON.stringify(value) }); setFlags(await response.text()); };
  return <><details style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 99999, background: '#fff', border: '1px solid #777', padding: 8, maxWidth: '100%', fontSize: 14 }} aria-label="QA controls"><summary>QA controls</summary>
    <button onClick={() => void toggle({ cleanupFails: true })}>Simulate cleanup failure</button>
    <button onClick={() => void toggle({ cleanupFails: false })}>Restore cleanup</button>
    <button onClick={() => void toggle({ ceiling: true })}>Simulate full capacity</button>
    <button onClick={() => void toggle({ ceiling: false })}>Restore capacity</button>
    <button onClick={() => void toggle({ revoke: true })}>Revoke backend Team access</button>
    <button onClick={() => setState(previous => ({ ...previous, teamAccess: 'denied' as any }))}>Simulate participant view</button>
    <button onClick={() => { enableTeamInvitation(); setState(previous => ({ ...previous })); }}>Enable staff invitation permission</button>
    <p role="status">{flags}</p>
  </details><AuthContext.Provider value={state}><NavigationApp initialPage={document.body.dataset.reactPage!} /></AuthContext.Provider></>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
