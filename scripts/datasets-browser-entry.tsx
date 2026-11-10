import { createRoot } from 'react-dom/client';
import { AuthContext, initialAuth } from '../src/auth';
import { NavigationApp } from '../src/navigation-app';
import '../src/styles.css';

// Localhost QA only: shows member pages as a fake Accepted member, without Clerk or the server.
createRoot(document.getElementById('root')!).render(
  <AuthContext.Provider value={{ ...initialAuth, status: 'signed-in', access: 'accepted' }}>
    <NavigationApp initialPage={document.body.dataset.reactPage!} />
  </AuthContext.Provider>,
);
