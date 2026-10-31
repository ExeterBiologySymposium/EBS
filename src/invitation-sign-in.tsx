import { SignIn } from '@clerk/react';

// Clerk's prebuilt flow consumes the organization invitation ticket in this URL.
export default function InvitationSignIn() {
  return <SignIn routing="hash" forceRedirectUrl="/account.html" signUpForceRedirectUrl="/account.html" />;
}
