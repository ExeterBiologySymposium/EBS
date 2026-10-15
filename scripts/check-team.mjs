import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const built=process.argv.includes('--built');
const file=built?'../dist/team.html':'../src/pages/team.tsx';
const team=await readFile(new URL(file,import.meta.url),'utf8');
for(const name of ['Esther Kim ’29','Derek Geng ’30','Margaux Morgan ’29','Scarlett Reddy ’29','Dowan Kim ’29','Avni Murarka ’28','Olivia Wang ’29'])assert.ok(team.includes(name),`Missing associate: ${name}`);
const associates=team.indexOf('Associate Members');
const faculty=team.indexOf('Faculty Advisors');
const photos=team.indexOf('group-photo');
assert.ok(associates>=0&&associates<faculty&&faculty<photos,'Associate members and faculty must precede club photos');
assert.ok(team.indexOf('Dr. Summer Morrill')<photos,'Dr. Morrill must precede club photos');
assert.doesNotMatch(team,/Photo not provided|Team member names and headshots will be added/);
assert.equal((team.match(/class(?:Name)?=(?:\{)?"group-photo"/g)||[]).length,3,'Keep all three club photographs');
console.log(`PASS: ${built?'built':'source'} team roster includes all seven associates, correct section order, and three club photos.`);
