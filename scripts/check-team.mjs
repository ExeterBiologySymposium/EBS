import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const built=process.argv.includes('--built');
const file=built?'../dist/team.html':'../src/pages/team.tsx';
const team=(await readFile(new URL(file,import.meta.url),'utf8')).replace(/<!--[\s\S]*?-->/g,'');
const styles=await readFile(new URL('../src/styles.css',import.meta.url),'utf8');
const members=[['Esther Kim','Outreach and Research Associate','2029'],['Derek Geng','Outreach Associate','2030'],['Margaux Morgan','Outreach and Media Associate','2029'],['Scarlett Reddy','Research Associate','2029'],['Dowan Kim','Research Associate','2029'],['Avni Murarka','Research Associate','2028'],['Olivia Wang','Social Media Associate','2029']];
members.push(['Cici Chen','Research Associate','2028'],['Oliver Choi','Research Associate','2029']);
members.push(['Adaeze Acholonu','Outreach and Media Associate','2029']);
members.push(['Elaine Fan','Research Associate','2029'],['Jessica Fan','Research Associate','2029']);
const photographedMembers=['Cici Chen','Derek Geng','Elaine Fan','Esther Kim','Olivia Wang'];
const byLastName=(a,b)=>a.split(' ').at(-1).localeCompare(b.split(' ').at(-1))||a.localeCompare(b);
for(const [name] of members)assert.ok(team.includes(name),`Missing organizing-team member: ${name}`);
for(const name of photographedMembers)assert.ok(team.includes(`images/team/${name.toLowerCase().replaceAll(' ','-')}.jpg`),`Missing photo for ${name}`);
assert.ok(team.includes('images/team/jaiden-kim.jpg'),'Use Jaiden Kim\'s supplied JPG portrait');
assert.match(styles,/\.layout-team \.columns-4 \.portrait,\.organizing-team-grid \.portrait\{aspect-ratio:2\/3\}/,'Use the same 2:3 frame for co-head and associate portraits');
assert.match(styles,/\.layout-team \.columns-4 \.portrait img,\.organizing-team-grid \.portrait img\{object-fit:contain/,'Show full co-head and associate photos without cropping');
const leadership=team.indexOf('Leadership');
const organizing=team.indexOf('Organizing Team');
const faculty=team.indexOf('Faculty Advisors');
const photos=team.indexOf('group-photo');
assert.ok(leadership>=0&&leadership<faculty&&faculty<organizing&&organizing<photos,'Order must be Leadership, Faculty Advisors, Organizing Team, club photos');
assert.doesNotMatch(team,/Executive Committee|Associate Members/);
assert.ok(team.indexOf('Dr. Summer Morrill')<photos,'Dr. Morrill must precede club photos');
for(const credential of ['Biology Instructor','Alfred H. Hayes ’25 and Jean M. Hayes Teaching Chair in Science','MIT Ph.D. Biology ’20'])assert.ok(team.includes(credential),`Missing faculty credential: ${credential}`);
assert.doesNotMatch(team,/Photo not provided|Team member names and headshots will be added/);
assert.doesNotMatch(team,/EGBC 3\.jpg|research lunch|with Exeter alumni/,'Remove the alumni photo and caption');
assert.equal((team.match(/class(?:Name)?=(?:\{)?"group-photo"/g)||[]).length,2,'Keep the Broad and Koch Institute club photographs');
assert.ok(team.includes('organizing-team-grid'),'Use a dedicated organizing-team grid');
if(built){
  const roster=team.slice(organizing,photos);
  assert.equal((roster.match(/class="person text-block"/g)||[]).length,members.length,'Every organizing-team member must use the Leadership card style');
  assert.equal((roster.match(/<img alt="[^"]+"/g)||[]).length,photographedMembers.length,'Show every supplied associate photo');
  assert.equal((roster.match(/portrait--initials/g)||[]).length,members.length-photographedMembers.length,'Use decorative initials only where photos are unavailable');
  for(const [name,role,year] of members)assert.ok(roster.includes(`<h3>${name}</h3><p class="role">${role}</p><p class="grade">Class of ${year}</p>`),`Incorrect profile for ${name}`);
  for(const [label,section] of [['Leadership',team.slice(leadership,faculty)],['Organizing Team',roster]]){
    const names=Array.from(section.matchAll(/<h3>([^<]+)<\/h3>/g),match=>match[1]);
    assert.deepEqual(names,[...names].sort(byLastName),`${label} must be alphabetical by last name, then first name`);
  }
}
console.log(`PASS: ${built?'built':'source'} team headings/order, ${members.length} profiles, faculty credentials, and two club photos.`);
