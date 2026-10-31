import { useContext, useEffect } from 'react';
import { AuthContext } from '../auth';
import { safeReturnTo } from '../access-policy';
import AccountPage from './account';
import { AccessNotice } from '../auth';

export default function PageContent() {
  const {status}=useContext(AuthContext);
  useEffect(()=>{
    if(status!=='signed-in') return;
    const returnTo=safeReturnTo(new URLSearchParams(window.location.search).get('returnTo'));
    window.location.replace('/account.html'+(returnTo?'?'+new URLSearchParams({returnTo}):''));
  },[status]);
  if(status==='signed-in') return <AccountPage/>;
  if(status!=='signed-out') return <div className="page-layout shell"><section className="page-heading"><h1>{status==='loading'?'Checking your account…':'Sign-in unavailable'}</h1><p role="status">{status==='loading'?'Please wait while we check your account.':'Try again later, or contact the EBS team.'}</p><p><a href="contact.html">Contact the EBS team</a></p></section></div>;
  return <div className="page-layout layout-register">
<div className={"shell"}>
<section className={"page-heading"}><h1>{"Register for EBS"}</h1><p className={"lead"}>{"Choose one route. Sign in or create an account to open your application in Google Forms."}</p><p>{"April 25th, 2027. In-person and online participation are planned."}</p></section>
<AccessNotice/>
<div className={"registration-options registration-routes"}>
<section><p className={"route-kicker"}>{"01"}</p><h2>{"Students"}</h2><p>{"For middle and high school students presenting original dry-lab biological research."}</p><div className={"actions"}><a className={"button"} href={"student-signup.html"}>{"Student registration"}</a></div></section>
<section><p className={"route-kicker"}>{"02"}</p><h2>{"Schools and educators"}</h2><p>{"For educators, counselors, and administrators sharing EBS with students or registering school interest."}</p><div className={"actions"}><a className={"button"} href={"schools.html"}>{"School registration"}</a></div></section>
<section><p className={"route-kicker"}>{"03"}</p><h2>{"Judges"}</h2><p>{"For researchers and professionals who want to evaluate student posters and presentations."}</p><div className={"actions"}><a className={"button"} href={"judges.html"}>{"Judge recruitment"}</a></div></section>
</div>
<section className={"content-section reading"} id={"form"}><h2>{"Help choosing an application"}</h2><p>{"The signup pages link to the application forms. If you are unsure which fits, "}<a href={"faq.html#contact"}>{"contact the EBS team"}</a>{" or email "}<a href={"mailto:exeterbiologysymposium@gmail.com"}>{"exeterbiologysymposium@gmail.com"}</a>{"."}</p><p><a href={"faq.html"}>{"Read participation, eligibility, and timeline FAQs"}</a></p></section>
</div>
</div>; }
