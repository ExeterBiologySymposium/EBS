import { symposiumVenue } from '../../schedule-details.js';
import { copy, entries, group, url } from '../fields.js';

export const definition = group("schedule", {
  pageHeading: group("Page heading", {
    title: copy("Page title", "Symposium schedule"),
    april25th2027PhillipsExeterAcademy: copy("Text · April 25th, 2027 · Phillips Exeter Academy and online. All times…", "April 25th, 2027 · Phillips Exeter Academy and online. All times below are Eastern Time; sessions and locations are provisional."),
  }),
  page: group("Page", {
    timeEasternTime: copy("Label · Time (Eastern Time)", "Time (Eastern Time)"),
    event: copy("Label · Event", "Event"),
    location: copy("Label · Location", "Location"),
    scheduleProvisionalMayShiftSlightlyAs: copy("Text · Schedule is provisional and may shift slightly as final…", "Schedule is provisional and may shift slightly as final logistics are confirmed. Registered participants will receive the finalized schedule by email."),
  }),
  registerUpdates: group("Register for updates", {
    registerUpdates: copy("Heading · Register for updates", "Register for updates"),
    whetherRePresentingJudgingOrVisiting: copy("Text · Whether you're presenting, judging, or visiting with your…", "Whether you're presenting, judging, or visiting with your school, register your interest to receive schedule updates."),
    hrefRegisterInterest: url("Link destination · Register Your Interest", "register.html", "link"),
    registerInterest: copy("Link text · Register Your Interest", "Register Your Interest"),
    hrefReadFaq: url("Link destination · Read the FAQ", "faq.html", "link"),
    readFaq: copy("Link text · Read the FAQ", "Read the FAQ"),
  }),
  rows: entries('Schedule rows', group('Schedule row', {
    time: copy('Time (Eastern Time)'), event: copy('Event'), location: copy('Location'),
  }), [
    {"time": "8:00 – 9:00 AM", "event": "Registration", "location": "Phelps Lobby"},
    {"time": "9:00 – 9:10 AM", "event": "Symposium Orientation & Logistics", "location": "Grainger"},
    {"time": "9:10 – 9:15 AM", "event": "Faculty Welcome Address", "location": "Grainger"},
    {"time": "9:15 – 10:15 AM", "event": "Opening Keynote Presentation", "location": "Grainger"},
    {"time": "10:15 AM – 12:15 PM", "event": "Morning Poster Session", "location": "Grainger"},
    {"time": "12:15 – 1:15 PM", "event": "Lunch", "location": "Grainger"},
    {"time": "1:15 – 2:45 PM", "event": "Afternoon Poster Session", "location": "Grainger"},
    {"time": "2:45 – 3:15 PM", "event": "Cleanup / Judging Deliberation", "location": "Grainger"},
    {"time": "3:15 – 3:45 PM", "event": "Closing Ceremony", "location": "Grainger"},
  ], { min: 1, max: 110, titleKey: 'event' }),
  sessions: entries('Session information', group('Session', {
    title: copy('Session heading'), description: copy('Description', '', { multiline: true }),
  }), [
    { title: 'Venue', description: symposiumVenue },
    { title: 'Online Option', description: "Can't make it to campus? Join the livestreamed virtual track running alongside the in-person schedule throughout the day." },
    { title: 'Who Should Attend', description: 'Presenting students, judges, guest speakers, and visiting school groups are all welcome, in-person or online.' },
  ], { min: 1, max: 100, titleKey: 'title' }),
});
