import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const home=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
const about=await readFile(new URL('../dist/about.html',import.meta.url),'utf8');
const hero=home.match(/<section class="home-hero">[\s\S]*?<\/section>/)?.[0]??'';
assert.match(hero,/class="hero-squaremark"[^>]+PEA_Squaremark_Outline_White\.png/);
assert.ok(hero.indexOf('class="hero-squaremark"')<hero.indexOf('Participation'),'Squaremark precedes participation facts');
const people=home.slice(home.indexOf('class="people-grid"'),home.indexOf('class="home-faq"'));
const names=Array.from(people.matchAll(/<h3>([^<]+)<\/h3>/g),m=>m[1]);
assert.deepEqual(names,['Adrian Chan','Jaiden Kim','Reya Satam','Luke Wang']);
assert.match(people,/jaiden-kim\.jpg/);
assert.match(about,/class="about-exeter-mark"[^>]+PEA_ExeterMark_Red_Lg\.png/);
assert.match(about,/class="about-origin-seal"[^>]+PEA_Seal_LtGray_Lg\.png[^>]+aria-hidden="true"/);
assert.match(about,/class="section about-origin"/);
assert.match(about,/class="section about-register"/);
console.log('PASS: four homepage co-heads in last-name order and About brand assets/sections.');
