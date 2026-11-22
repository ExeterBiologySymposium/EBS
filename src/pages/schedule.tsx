import { usePageCopy, safeCopyUrl, usePageCopyState } from '../content/page-copy';
import { definition } from '../content/copy/schedule';
import { useEffect, useState } from 'react';
import { fetchScheduleFeed } from '../schedule-feed';

export default function PageContent() {
  const editorial = usePageCopy('schedule', definition);
  const published = usePageCopyState()?.published;
  const [feed, setFeed] = useState<Awaited<ReturnType<typeof fetchScheduleFeed>>>({});
  useEffect(() => {
    if (published) return;
    const controller = new AbortController();
    void fetchScheduleFeed(AbortSignal.any([controller.signal, AbortSignal.timeout(15000)])).then(value => {
      if (!controller.signal.aborted) setFeed(value);
    });
    return () => controller.abort();
  }, [published]);
  const rows = published ? editorial.rows : feed.rows ?? editorial.rows;
  const sessions = published ? editorial.sessions : feed.sessions ?? editorial.sessions;
  return <div className="page-layout layout-schedule">
<section className={"page-heading"}>
<div className={"shell"}>
<h1>{editorial.pageHeading.title}</h1>
<p className={"lead"}>{editorial.pageHeading.april25th2027PhillipsExeterAcademy}</p>
</div>
</section>
<section className={"section"}>
<div className={"shell reading"}>
<div>
<div aria-label={"Scrollable symposium schedule"} className={"table-wrap"} role={"region"} tabIndex={0}>
<table aria-label={"Symposium day schedule with times, events, and locations"} className={"sched-table"}>
<thead>
<tr>
<th scope={"col"}>{editorial.page.timeEasternTime}</th>
<th scope={"col"}>{editorial.page.event}</th>
<th scope={"col"}>{editorial.page.location}</th>
</tr>
</thead>
<tbody id="schedule-body">{rows.map(({ time, event, location }, index) =>
  <tr key={index}><td>{time}</td><td>{event}</td><td>{location}</td></tr>)}</tbody>
</table>
</div>
<p className={"form-hint"}>{editorial.page.scheduleProvisionalMayShiftSlightlyAs}</p>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={!published && feed.sessions ? 'session-grid' : 'grid columns-4'} id="session-info-grid">
  {sessions.map(({ title, description }, index) => !published && feed.sessions
    ? <section key={index}><h3>{title}</h3><p>{description}</p></section>
    : <div className="session-item" key={index}><h3>{title}</h3><p>{description}</p></div>)}
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"next-step"}>
<h2>{editorial.registerUpdates.registerUpdates}</h2>
<p>{editorial.registerUpdates.whetherRePresentingJudgingOrVisiting}</p>
<div className={"actions"}>
<a className={"button primary"} href={safeCopyUrl(editorial.registerUpdates.hrefRegisterInterest)}>{editorial.registerUpdates.registerInterest}</a>
<a className={"button secondary"} href={safeCopyUrl(editorial.registerUpdates.hrefReadFaq)}>{editorial.registerUpdates.readFaq}</a>
</div>
</div>
</div>
</section>
</div>; }
