export const contentPageGroups = {
  Symposium: ['index', 'about', 'team', 'schedule', 'faq', 'contact'],
  Participation: ['register', 'student-signup', 'schools', 'judges', 'researchers', 'projects'],
  'Member resources': ['events', 'resources', 'datascience', 'python', 'rstudio', 'opensource', 'datasets'],
  'Account and policies': ['account', 'accept-invitation', 'admin', 'terms', 'privacy'],
} as const;

export const editorialPages = {
  index: { label: 'Home', route: '/', audience: 'public', template: 'fields' },
  about: { label: 'About', route: 'about.html', audience: 'public', template: 'fields' },
  team: { label: 'Team', route: 'team.html', audience: 'public', template: 'fields' },
  schedule: { label: 'Schedule', route: 'schedule.html', audience: 'public', template: 'fields' },
  faq: { label: 'FAQ', route: 'faq.html', audience: 'public', template: 'fields' },
  contact: { label: 'Contact', route: 'contact.html', audience: 'public', template: 'fields' },
  register: { label: 'Register', route: 'register.html', audience: 'public', template: 'fields' },
  'student-signup': { label: 'Student registration', route: 'student-signup.html', audience: 'public', template: 'fields' },
  schools: { label: 'Schools', route: 'schools.html', audience: 'public', template: 'fields' },
  judges: { label: 'Judges', route: 'judges.html', audience: 'public', template: 'fields' },
  projects: { label: 'Research projects', route: 'projects.html', audience: 'public', template: 'fields' },
  events: { label: 'Events', route: 'events.html', audience: 'accepted', template: 'fields' },
  opensource: { label: 'Open Source', route: 'opensource.html', audience: 'accepted', template: 'fields' },
  datasets: { label: 'Dataset library', route: 'datasets.html', audience: 'accepted', template: 'fields' },
  account: { label: 'Account', route: 'account.html', audience: 'account', template: 'fields' },
  'accept-invitation': { label: 'Accept invitation', route: 'accept-invitation.html', audience: 'public', template: 'fields' },
  admin: { label: 'EBS administration', route: 'admin.html', audience: 'team', template: 'fields' },
  terms: { label: 'Terms', route: 'terms.html', audience: 'public', template: 'fields' },
  privacy: { label: 'Privacy', route: 'privacy.html', audience: 'public', template: 'fields' },
} as const;
export type EditorialPage = keyof typeof editorialPages;
