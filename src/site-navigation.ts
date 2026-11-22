import type { MemberAccess } from './auth';

type SiteLink = { label: string; href: string };
type SiteGroup = { label: string; links: SiteLink[] };

export function registrationDestination(signedIn: boolean) {
  return signedIn ? 'account.html' : 'register.html';
}

export function siteNavigation(access: MemberAccess, signedIn: boolean): SiteGroup[] {
  const participation = [
    { label: 'For students', href: 'researchers.html' },
    { label: 'For schools', href: 'schools.html' },
    { label: 'For judges', href: 'judges.html' },
  ];
  if (!signedIn || access === 'pending') {
    participation.unshift({ label: 'Student registration', href: 'student-signup.html' });
  }
  const groups = [
    { label: 'About', links: [{ label: 'About EBS', href: 'about.html' }, { label: 'Team', href: 'team.html' }] },
    { label: 'Schedule', links: [{ label: 'Schedule', href: 'schedule.html' }] },
    { label: 'Participate', links: participation },
    { label: 'Help', links: [{ label: 'FAQ', href: 'faq.html' }, { label: 'Contact', href: 'contact.html' }] },
  ];
  if (access === 'accepted' && signedIn) {
    groups.push({ label: 'Member resources', links: [
      { label: 'Resources', href: 'resources.html' },
      { label: 'Coding', href: 'datascience.html' },
      { label: 'Events', href: 'events.html' },
      { label: 'Python', href: 'python.html' },
      { label: 'RStudio', href: 'rstudio.html' },
      { label: 'Open source', href: 'opensource.html' },
    ] });
  }
  return groups;
}
