import { useContext, useEffect, useState, type ReactNode } from 'react';
import { AuthContext } from './auth';
import { usePageCopyState } from './content/page-copy';
import { readSubmission, saveSubmission, submissionKey } from './application-progress-store';

function SubmissionCheck({ userId }: { userId: string }) {
  const [checked, setChecked] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);

  useEffect(() => {
    function restore() {
      try {
        setChecked(readSubmission(window.localStorage, userId));
        setStorageFailed(false);
      } catch { setStorageFailed(true); }
      setReady(true);
    }
    restore();
    function sync(event: StorageEvent) {
      if (event.key === null || event.key === submissionKey(userId)) restore();
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [userId]);

  function toggle(value: boolean) {
    setChecked(value);
    try {
      saveSubmission(window.localStorage, userId, value);
      setStorageFailed(false);
    } catch { setStorageFailed(true); }
  }

  return <div className="application-check">
    <label><input type="checkbox" checked={checked} disabled={!ready} onChange={event => toggle(event.target.checked)} aria-describedby="application-check-hint" /> I submitted my form</label>
    <p id="application-check-hint" className="small">{storageFailed ? 'Self-reported' : 'Self-reported · saved on this device'}</p>
    {storageFailed && <p role="status">Your checkmark could not be saved on this device.</p>}
  </div>;
}

export function ApplicationProgress({ children, account = false, submissionNote, approvalNote }: {
  children: ReactNode;
  account?: boolean;
  submissionNote?: string;
  approvalNote?: string;
}) {
  const { status, access, userId, signIn, signUp } = useContext(AuthContext);
  const preview = usePageCopyState()?.preview;
  const signedIn = status === 'signed-in';
  const accepted = signedIn && access === 'accepted';
  return <section className="application-progress registration-focus" aria-labelledby="application-progress-title">
    <h2 id="application-progress-title">Your student application</h2>
    <ol>
      <li><strong>Sign in or create an account</strong>
        {signedIn && <p>Signed in</p>}
        {status === 'signed-out' && <div className="actions">
          <button className="button primary" type="button" onClick={signIn}>Sign in</button>
          <button className="button secondary" type="button" onClick={signUp}>Create an account</button>
        </div>}
        {status === 'loading' && <p role="status">Checking sign-in…</p>}
        {status === 'unavailable' && <p role="status">Sign-in is unavailable. Reload the page or <a href="contact.html">contact the EBS team</a>.</p>}
      </li>
      <li><strong>Submit the Google Form</strong>
        <p>{submissionNote ?? 'Use the same email address as your EBS account. Google Forms opens in a new tab.'}</p>
        {signedIn && children}
        {signedIn && !accepted && userId && !preview && <SubmissionCheck key={userId} userId={userId} />}
        {signedIn && !accepted && preview && <p className="small">I submitted my form · Self-reported</p>}
      </li>
      <li><strong>Check EBS approval</strong>
        {accepted ? <p>Accepted</p> : <p>{account ? 'Use Check approval status above after the EBS team reviews your application.' : <>After the EBS team reviews your application, check your approval status in <a href="account.html">Account</a>.</>}</p>}
        {approvalNote && <p>{approvalNote}</p>}
      </li>
    </ol>
  </section>;
}
