import { usePageCopy, safeCopyUrl } from './content/page-copy';
import { EditorialPageCopy } from './content/page-copy';
import { editorialPages, type EditorialPage } from './content/pages';
import { definition } from './content/copy/index';
import { useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import { ArrowDownRight, Search, X } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { pageComponents } from './page-routes';
import { AccountControls, AuthContext, LearningLink } from './auth';
import { isMemberPage, isProtectedPath } from './access-policy';
import { ProtectedPage } from './protected-pages';
import searchPages from './search-data.json';
import { registrationDestination, siteNavigation } from './site-navigation';

function ArrowLink({href,children,className='',current=false}:{href?:string;children:ReactNode;className?:string;current?:boolean}) {
  const {access,status}=useContext(AuthContext);
  if(status==='signed-in'&&['register.html','student-signup.html'].includes(href ?? '')){href='account.html';children='Account';}
  if(href && isProtectedPath(href)&&access!=='accepted'){href=status==='signed-in'?'account.html':'register.html';children=status==='signed-in'?'Account':'Request resource access';}
  return <a className={`button ${className}`} href={href} aria-current={current?'page':undefined}><span>{children}</span><ArrowDownRight size={18} aria-hidden="true"/></a>;
}
const primaryNavOrder = ['about.html', 'team.html', 'schedule.html', 'resources.html', 'datascience.html', 'events.html', 'faq.html', 'contact.html'];

function Header({page}:{page:string}) {
  const {access,status}=useContext(AuthContext);
  const signedIn=status==='signed-in';
  const groups=siteNavigation(access,signedIn);
  const isHome=page==='index.html';
  const navLinks=groups.flatMap(group=>group.links).map(link=>link.href==='about.html'?{...link,label:'About'}:link);
  const primaryLinks=primaryNavOrder.flatMap(href=>navLinks.filter(link=>link.href===href));
  const moreLinks=navLinks.filter(link=>!primaryNavOrder.includes(link.href));
  const header=useRef<HTMLElement>(null);
  const search=useRef<HTMLDialogElement>(null);
  const searchInput=useRef<HTMLInputElement>(null);
  const searchTrigger=useRef<HTMLElement>(null);
  const [query,setQuery]=useState('');
  const [scrolled,setScrolled]=useState(false);

  useEffect(()=>{
    if (!isHome) return;
    const update=()=>setScrolled(window.scrollY>40);
    update();
    window.addEventListener('scroll',update,{passive:true});
    return()=>window.removeEventListener('scroll',update);
  },[isHome]);

  useEffect(()=>{
    if (header.current) for (const disclosure of header.current.querySelectorAll('details')) disclosure.open=false;
  },[page]);

  useEffect(()=>{
    document.documentElement.dataset.theme='light';
    const closeOutside=(event:PointerEvent)=>{
      if (!(event.target instanceof Node)) return;
      for (const disclosure of header.current?.querySelectorAll<HTMLDetailsElement>('details[open]') ?? []) {
        if (!disclosure.contains(event.target)) disclosure.open=false;
      }
    };
    document.addEventListener('pointerdown',closeOutside);
    return()=>document.removeEventListener('pointerdown',closeOutside);
  },[]);

  function openSearch(trigger:HTMLElement) {
    searchTrigger.current=trigger;
    search.current?.showModal();
    searchInput.current?.focus();
  }

  function links(items: typeof navLinks) {
    return items.map(({label,href})=><a href={href} key={href} aria-current={page===href?'page':undefined}>{label}</a>);
  }
  const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results=searchPages.filter(({url})=>(access==='accepted'||!isProtectedPath(url))&&(!signedIn||!['register.html','student-signup.html'].includes(url))&&(signedIn||url!=='account.html')).map(({title,url,description})=>({title,url,score:terms.reduce((sum,term)=>sum+(title.toLowerCase()===term?12:title.toLowerCase().includes(term)?7:(url+' '+description).toLowerCase().includes(term)?3:0),0)})).filter(row=>!terms.length||row.score>0).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)).slice(0,8);
  return <>
    <header ref={header} className={`site-header site-header--shared${isHome ? ' site-header--home' : ''}${isHome && !scrolled ? ' on-media' : ''}`} onKeyDown={event=>{
      if (event.key!=='Escape') return;
      const open=header.current?.querySelector<HTMLDetailsElement>('details[open]');
      if (open) { event.preventDefault(); open.open=false; open.querySelector('summary')?.focus(); }
    }}>
      <a className="skip" href="#main">Skip to content</a>
      <a className="wordmark" href="/" aria-label="Exeter Biology Symposium home"><img className="wordmark-red" src="/images/brand/ebs-logo-red.png" alt="" width={1536} height={1024}/>
        {isHome&&<img className="wordmark-white" src="/images/brand/ebs-logo-white.png" alt="" width={1536} height={1024}/>}</a>
      <nav className="desktop-nav" aria-label="Main navigation">
        {links(primaryLinks)}
      </nav>
      <div className="header-right">
        <button className="nav-search" type="button" aria-label="Search EBS" aria-haspopup="dialog" onClick={event=>openSearch(event.currentTarget)}><Search size={18}/></button>
        <AccountControls/>
        <ArrowLink href={registrationDestination(signedIn)} current={page===registrationDestination(signedIn)}>{signedIn?'Account':'Register'}</ArrowLink>
      </div>
      <details className="site-menu" onBlur={event=>{
        const next=event.relatedTarget;
        if (next instanceof Node && !event.currentTarget.contains(next) && !search.current?.contains(next)) event.currentTarget.open=false;
      }}>
        <summary>Menu <span aria-hidden="true">☰</span></summary>
        <div className="menu-panel">
          <div className="menu-tools">
            <ArrowLink href={registrationDestination(signedIn)} current={page===registrationDestination(signedIn)}>{signedIn?'Account':'Register'}</ArrowLink>
            <button type="button" aria-haspopup="dialog" onClick={event=>openSearch(event.currentTarget)}>Search EBS <Search size={17}/></button>
          </div>
          <nav aria-label="Main navigation">
            {links([...primaryLinks,...moreLinks])}
          </nav>
          <div className="menu-account"><AccountControls/></div>
        </div>
      </details>
    </header>
    <dialog ref={search} className="search-dialog" aria-labelledby="search-title" onKeyDown={event=>{
      if (event.key==='Escape') { event.preventDefault(); search.current?.close(); }
    }} onClose={()=>{
      const trigger=searchTrigger.current;
      if (trigger?.getClientRects().length) trigger.focus();
    }}>
      <form method="dialog"><button aria-label="Close search"><X size={22}/></button></form>
      <h2 id="search-title">Search EBS</h2><label htmlFor="search-input">Page or topic</label>
      <input ref={searchInput} id="search-input" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Python, schools, registration…"/>
      <p role="status">{results.length} matching pages</p>
      <div className="search-results">{results.map(row=><a href={row.url} key={row.url}>{row.title}<ArrowDownRight size={17}/></a>)}</div>
    </dialog>
  </>;
}
function Footer(){const {access,status}=useContext(AuthContext);const signedIn=status==='signed-in';const groups=siteNavigation(access,signedIn);const visibleNav=groups.filter(group=>group.label!=='Participate').flatMap(group=>group.links);const visibleMore=groups.find(group=>group.label==='Participate')?.links ?? [];return <footer id="footer" className="site-footer"><div className="footer-top"><div><img className="exeter-footer-mark" src="/Phillips Exeter Academy-selected-assets/PEA_ExeterMark_White_Lg.png" alt="Exeter" width={2400} height={779} loading="lazy" decoding="async"/></div><div><p>Explore</p>{visibleNav.map(({label,href})=><a href={href} key={href}>{label}</a>)}</div><div><p>Take part</p><a href={registrationDestination(signedIn)}>{signedIn?'Account':'Register'}</a>{visibleMore.map(({label,href})=><a href={href} key={href}>{label}</a>)}</div><div><p>Get in touch</p><a href="mailto:exeterbiosymposium@gmail.com">exeterbiosymposium@gmail.com</a><a href="https://www.instagram.com/ebs_2027/" target="_blank" rel="noopener noreferrer">Instagram<span className="sr-only"> (opens in a new tab)</span></a><a href="https://www.linkedin.com/company/exeter-biology-symposium/" target="_blank" rel="noopener noreferrer">LinkedIn<span className="sr-only"> (opens in a new tab)</span></a><p>April 25th, 2027</p></div></div><div className="footer-wordmark" aria-hidden="true"><img src="/images/brand/ebs-logo-white.png" alt="" width={1536} height={1024} loading="lazy" decoding="async"/></div><div className="footer-bottom"><span>© 2026 Exeter Biology Symposium</span><span>Organized by the Exeter Genetics and Biotechnology Club.</span><a href="terms.html">Terms of Use</a><a href="privacy.html">Privacy Notice</a><a href="#main">Back to top ↑</a></div></footer>;}
function Hero(){
  const {hero}=usePageCopy('index',definition);
  const {status}=useContext(AuthContext);
  const heroImage=hero.srcEbsStudentsVisitingBroadInstitute;
  const facts=hero.facts;
  const [selection,setSelection]=useState(0);
  const [paused,setPaused]=useState(false);
  const reducedMotion=useReducedMotion();
  const active=facts.length?selection%facts.length:0;
  const fact=facts[active];

  useEffect(()=>{
    if (paused || reducedMotion || facts.length<2) return;
    const timer=window.setInterval(()=>setSelection(value=>(value+1)%facts.length),8000);
    return()=>window.clearInterval(timer);
  },[paused,reducedMotion,facts.length]);

  return <section className="home-hero">
    <picture className="hero-picture">
      <img className="hero-image" src={safeCopyUrl(heroImage,'image')} srcSet={heroImage===definition.fields.hero.fields.srcEbsStudentsVisitingBroadInstitute.initial ? "/images/team/ebs-team-broad-institute-480.jpg 480w, /images/team/ebs-team-broad-institute-960.jpg 960w, /images/team/ebs-team-broad-institute-1440.jpg 1440w, /images/team/ebs-team-broad-institute-1920.jpg 1920w" : undefined} sizes="100vw" alt={hero.altEbsStudentsVisitingBroadInstitute} fetchPriority="high"/>
    </picture>
    <div className="hero-shade" aria-hidden="true"/>
    {fact&&<div className="hero-facts" onMouseEnter={()=>setPaused(true)} onFocusCapture={()=>setPaused(true)}>
      <span>{fact.label}</span>
      <strong><span className={fact.label==='Where'?'hero-facts__location':undefined}>{fact.value}</span></strong>
      {facts.length>1&&<div className="fact-controls">
        {facts.map(({label},index)=><button type="button" key={index} aria-label={`Show ${label}`} aria-pressed={index===active} onClick={()=>{setSelection(index);setPaused(true);}}><span/></button>)}
        {!reducedMotion&&<button className="autoplay-control" type="button" onClick={()=>setPaused(value=>!value)}>{paused?'Play':'Pause'}</button>}
      </div>}
    </div>}
    <div className="hero-bottom">
      <div className="hero-copy">
        <h1>{hero.title}</h1>
        <p className="hero-intro">{hero.biologyResearch}<br/>{hero.ledByStudents}<br/>{hero.openEveryone}</p>
        <p>{hero.entry100FreeAllMiddleHighSchool}<br/>{hero.learnInvestigatePresentPersonOrOnline}</p>
        <a className="school-link" href={status==='signed-in'?'account.html':safeCopyUrl(hero.schoolPage)}>{status==='signed-in'?'Your account ↗':hero.schoolLink}</a>
      </div>
      <div className="hero-registration">
        <img className="hero-squaremark" src={safeCopyUrl(hero.srcPhillipsExeterAcademy,'image')} alt={hero.altPhillipsExeterAcademy} width={361} height={361}/>
        <ArrowLink href={safeCopyUrl(hero.hrefRegisterAsStudent)} className="media-button">{hero.registerAsStudent}</ArrowLink>
      </div>
    </div>
  </section>;
}

function Guidance(){
  const {researchGuidance}=usePageCopy('index',definition);
  return <section className="home-guidance">
    <h2>{researchGuidance.whatMakesStudentResearchPossible}</h2>
    <div className="home-guidance-list">{researchGuidance.guidance.map((item,index)=><article key={index}>
      <img src={safeCopyUrl(item.image,'image')} alt={item.alt} loading="lazy"/>
      <h3>{item.title}</h3><p>{item.text}</p>
      <ArrowLink href={safeCopyUrl(item.href)} className="secondary">{researchGuidance.learnMore}<span className="sr-only"> about {item.title}</span></ArrowLink>
    </article>)}</div>
  </section>;
}
function Story(){
  const {researchSteps}=usePageCopy('index',definition);
  return <section className="home-research-steps">
    <h2>From question to poster</h2>
    <ol>{researchSteps.steps.map((step,index)=><li key={index}>{step}</li>)}</ol>
    <LearningLink href={safeCopyUrl(researchSteps.hrefExploreResources)}>{researchSteps.exploreResources} <ArrowDownRight size={18} aria-hidden="true"/></LearningLink>
  </section>;
}
function HomeFaq(){
  const editorial = usePageCopy('index', definition);
return <section className="home-faq"><div className="section-introduction"><h2>{editorial.questionsAnswers.beforeBegin}</h2><a href={safeCopyUrl(editorial.questionsAnswers.hrefAllQuestions)}>{editorial.questionsAnswers.allQuestions + " "}<ArrowDownRight size={18}/></a></div><div className="home-faq-list">{editorial.questionsAnswers.questions.map(({ question, answer, linkText, link, afterLink }, index) => <details key={index}><summary>{question}</summary><p>{answer}{linkText && <> <a href={safeCopyUrl(link)}>{linkText}</a></>}{afterLink && " " + afterLink}</p></details>)}</div></section>;}
function Closing(){
  const editorial = usePageCopy('index', definition);
return <section className="closing-scene"><img src={safeCopyUrl(editorial.closingInvitation.srcStudentsExploringScienceExhibits, "image")} alt={editorial.closingInvitation.altStudentsExploringScienceExhibits} loading="lazy"/><div><p className="eyebrow">{editorial.closingInvitation.april25th2027}</p><h2>{editorial.closingInvitation.question}<br/>{editorial.closingInvitation.research}<br/>{editorial.closingInvitation.placeHere}</h2><ArrowLink href={safeCopyUrl(editorial.closingInvitation.hrefTakePartEbs)} className="media-button">{editorial.closingInvitation.takePartEbs}</ArrowLink></div></section>;}
export function Home(){
  const editorial = usePageCopy('index', definition);
return <div className="home-page"><Hero/><Guidance/><Story/><section className="mission-split"><img className="seal" src={safeCopyUrl(editorial.homeFeatures.srcPhillipsExeterAcademySelectedAssets, "image")} alt="" aria-hidden="true" loading="lazy" decoding="async"/><h2 className="mission-label">{editorial.homeFeatures.whyEbsExists}</h2><div><h2>{editorial.homeFeatures.researchBelongsHandsStudents}</h2><p>{editorial.homeFeatures.ebsHelpsStudentsDevelopOriginalDry}</p><ArrowLink href={safeCopyUrl(editorial.homeFeatures.hrefAboutSymposium)}>{editorial.homeFeatures.aboutSymposium}</ArrowLink></div></section><section className="people-section"><div className="section-introduction"><h2>{editorial.homeFeatures.studentsBehind}<br/>{editorial.homeFeatures.symposium}</h2><a href={safeCopyUrl(editorial.homeFeatures.hrefMeetEveryone)}>{editorial.homeFeatures.meetEveryone + " "}<ArrowDownRight size={18}/></a></div><div className="people-grid">{editorial.homeFeatures.people.map(({ photo, name }, index) => <a href={safeCopyUrl(editorial.homeFeatures.hrefCoHead)} key={index}><img src={safeCopyUrl(photo, 'image')} alt={name} loading="lazy"/><span>{editorial.homeFeatures.coHead}</span><h3>{name}</h3></a>)}</div></section><HomeFaq/><Closing/></div>;}
export function App({page}:{page:string}){
  const protectedPage=isMemberPage(page);
  const Content=pageComponents[page as keyof typeof pageComponents];
  useEffect(()=>{const reveal=()=>{let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}if(!id)return;const target=document.getElementById(id);if(!target)return;let parent=target.closest('details');while(parent){parent.open=true;parent=parent.parentElement?.closest('details')??null;}requestAnimationFrame(()=>{target.scrollIntoView();if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});});};reveal();window.addEventListener('hashchange',reveal);return()=>window.removeEventListener('hashchange',reveal);},[page]);
  const key = page.replace(/\.html$/, '') as EditorialPage;
  const body = page === 'index.html' ? <Home /> : protectedPage ? <ProtectedPage page={page} /> :
    Content ? <Content /> : <section className="page-heading"><h1>Page not found</h1><a href="/">Return home</a></section>;
  return <><Header page={page}/><main id="main" tabIndex={-1}>{Object.hasOwn(editorialPages, key) && !protectedPage
    ? <EditorialPageCopy key={key} page={key}>{body}</EditorialPageCopy> : body}</main><Footer/><Analytics /></>;
}
