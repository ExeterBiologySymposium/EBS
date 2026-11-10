import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthContext, initialAuth, type AuthState } from '../src/auth';
import { NavigationApp } from '../src/navigation-app';
import '../src/styles.css';

// Localhost QA only: the browser-side identity mirrors the fixture server's fake identity.
function Fixture() {
  const [state, setState] = useState<AuthState>({ ...initialAuth, status: 'signed-in', access: 'accepted', teamAccess: 'allowed', teamOrganizationId: 'org_team' });
  const [message, setMessage] = useState('Fake providers only');
  const qa = async (value: object) => { const response = await fetch('/__content-qa', { method: 'POST', body: JSON.stringify(value) }); setMessage(await response.text()); };
  return <>
    <details style={{ position: 'fixed', bottom: 0, left: 0, zIndex: 99999, background: '#fff', border: '1px solid #777', padding: 8, maxWidth: '100%', fontSize: 14 }}>
      <summary>QA controls</summary>
      <button type="button" onClick={() => void qa({ failNextWrite: true })}>Lose the next write response</button>
      <button type="button" onClick={() => void qa({ external: 'researchers' })}>Another editor saves Student research</button>
      <button type="button" onClick={() => void qa({ team: false })}>Revoke backend Team access</button>
      <button type="button" onClick={() => { void qa({ team: true, accepted: false }); setState(previous => ({ ...previous, access: 'pending' })); }}>Team member who is not Accepted</button>
      <button type="button" onClick={() => { void qa({ actor: null }); setState({ ...initialAuth, status: 'signed-out' }); }}>Signed-out visitor</button>
      <p role="status">{message}</p>
    </details>
    <AuthContext.Provider value={state}><NavigationApp initialPage={document.body.dataset.reactPage!} /></AuthContext.Provider>
  </>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
