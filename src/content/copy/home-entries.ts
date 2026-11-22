import { copy, entries, group, url } from '../fields.js';

const words = (label: string) => copy(label, '', { multiline: true });
export const facts = entries('Event facts', group('Fact', { label: copy('Label'), value: copy('Value') }), [
  { label: 'Participation', value: '100% free' },
  { label: 'Who can join', value: 'All middle & high school students' },
  { label: 'When', value: 'April 25th, 2027' },
  { label: 'Where', value: 'Exeter, NH + online' },
], { min: 1, titleKey: 'label' });

export const guidance = entries('Guidance topics', group('Topic', {
  title: copy('Heading'), text: words('Description'), href: url('Learn more destination'), image: url('Image URL', '', 'image'), alt: copy('Image description'),
}), [
  {title:'Begin with curiosity.',text:'No prior research experience is required. Start with a biological question, then use the resources to make it specific and workable.',href:'resources.html#drylab',image:'/images/Planning/Screenshot 2026-09-10 at 6.03.22 PM.png',alt:'Student reading a research paper in a laboratory'},
  {title:'Learn at your own pace.',text:'Lectures and materials are asynchronous. Most students spend 1–2 hours per week throughout the year.',href:'schools.html',image:'/images/Data Analysis/R Studio.png',alt:'Student using R Studio for data analysis'},
  {title:'Make the evidence clear.',text:'Document your methods, explain your results, and distinguish your findings from the questions still open.',href:'resources.html#presenting',image:'/images/Poster/Luke Poster.jpeg',alt:'Student research poster about fungal enzyme inhibitors'},
], { min: 1, titleKey: 'title' });

export const steps = entries('Research steps', copy('Step'), ['Ask a question.', 'Find the evidence.', 'Make an analysis.', 'Share what it shows.'], { fixed: true });

export const questions = entries('Questions', group('Question', {
  question: copy('Question'), answer: words('Answer'), linkText: copy('Link text', '', { optional: true }),
  link: url('Link destination', '', 'link', true), afterLink: copy('Text after the link', '', { optional: true }),
}), [
  { question: 'Who can participate?', answer: 'All middle and high school students are welcome. No prior research experience is required.', linkText: '', link: '', afterLink: '' },
  { question: 'Do I need to know how to code?', answer: 'No. Six ready-made research projects use free point-and-click platforms instead of code.', linkText: 'Find your project', link: 'projects.html', afterLink: 'in about a minute.' },
  { question: 'What does it cost?', answer: 'Participation is 100% free. Students cover their own travel costs; online presentation is available.', linkText: '', link: '', afterLink: '' },
  { question: 'How much time will I need?', answer: 'Most students spend 1–2 hours per week throughout the year. Lectures and materials can be completed asynchronously.', linkText: '', link: '', afterLink: '' },
  { question: 'How do I register?', answer: 'Sign in, then submit the Google Form on Student registration. Each researcher applies individually; creating an account does not submit an application. See the FAQ for school and judge signup routes.', linkText: '', link: '', afterLink: '' },
], { titleKey: 'question' });

export const people = entries('Featured team members', group('Person', { name: copy('Name'), photo: url('Photo URL', '', 'image') }), [
  { photo: '/images/team/adrian-chan.jpg', name: 'Adrian Chan' }, { photo: '/images/team/jaiden-kim.jpg', name: 'Jaiden Kim' },
  { photo: '/images/team/reya-satam.jpg', name: 'Reya Satam' }, { photo: '/images/team/luke-wang.jpg', name: 'Luke Wang' },
], { titleKey: 'name' });
