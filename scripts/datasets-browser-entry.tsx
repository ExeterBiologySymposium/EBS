import { createRoot } from 'react-dom/client';
import { AuthContext, initialAuth, type AuthState } from '../src/auth';
import { NavigationApp } from '../src/navigation-app';
import '../src/styles.css';

// Localhost QA only: select a fake reader state without contacting Clerk.
const params = new URLSearchParams(window.location.search);
const reader = params.get('reader');
const identity: Partial<AuthState> = reader === 'visitor' ? { status: 'signed-out' } :
  reader === 'unavailable' ? { status: 'unavailable' } :
  { status: 'signed-in', access: reader === 'pending' ? 'pending' : 'accepted', userId: params.get('student') ?? 'qa-student' };
createRoot(document.getElementById('root')!).render(
  <AuthContext.Provider value={{ ...initialAuth, ...identity }}>
    <NavigationApp initialPage={document.body.dataset.reactPage!} />
  </AuthContext.Provider>,
);
