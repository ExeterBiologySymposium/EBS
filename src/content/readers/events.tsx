import { useEditorialContent, safeCopyUrl, usePageCopyState } from '../page-copy';
import type { definition } from '../copy/events';
import { eventPosterPath } from '../../access-policy';
import type { Value } from '../fields';
export default function EventsPage() {
  const editorial = useEditorialContent<Value<typeof definition>>('events');
  const preview = usePageCopyState()?.preview;
  const poster = editorial.spudcellsWithDrKateAdamala.srcEbsSpeakerSeriesSpudcellsWith;
  const posterSrc = safeCopyUrl(preview && poster === eventPosterPath ? poster + '?preview=1' : poster, 'image');

  return <div className="page-layout layout-events">
    <section className="page-heading"><div className="shell"><p className="eyebrow">{editorial.pageHeading.acceptedEbsMembers}</p><h1>{editorial.pageHeading.title}</h1><p className="lead">{editorial.pageHeading.hearDirectlyFromResearchersExploreNew}</p></div></section>
    <section className="section"><article className="shell" aria-labelledby="spudcells-title">
      <div className="event-layout"><div className="event-copy"><p className="eyebrow">{editorial.spudcellsWithDrKateAdamala.ebsSpeakerSeriesFirstGuestSpeaker}</p><h2 id="spudcells-title">{editorial.spudcellsWithDrKateAdamala.spudcellsWithDrKateAdamala}</h2>
        <p className="event-speaker">{editorial.spudcellsWithDrKateAdamala.associateProfessorGeneticsCellBiologyDevelopment}<br />{editorial.spudcellsWithDrKateAdamala.universityMinnesota}</p>
        <dl className="event-details"><div><dt>{editorial.spudcellsWithDrKateAdamala.when}</dt><dd><time dateTime={editorial.spudcellsWithDrKateAdamala.datetime20261029t183000}>{editorial.spudcellsWithDrKateAdamala.thursdayOctober292026630}</time></dd></div><div><dt>{editorial.spudcellsWithDrKateAdamala.localGathering}</dt><dd>{editorial.spudcellsWithDrKateAdamala.phelpsScienceCenterRoom307}<br />{editorial.spudcellsWithDrKateAdamala.phillipsExeterAcademy}</dd></div><div><dt>{editorial.spudcellsWithDrKateAdamala.speakerFormat}</dt><dd>{editorial.spudcellsWithDrKateAdamala.drAdamalaJoinsUsVirtually}</dd></div></dl>
        <p>{editorial.spudcellsWithDrKateAdamala.weAreExcitedWelcomeOurFirst}</p><p>{editorial.spudcellsWithDrKateAdamala.joinUsHearDirectlyFromResearcher}</p>
        <p className="small">{editorial.spudcellsWithDrKateAdamala.questionsAboutAttending + " "}<a href={safeCopyUrl(editorial.spudcellsWithDrKateAdamala.hrefContactEbsTeam)}>{editorial.spudcellsWithDrKateAdamala.contactEbsTeam}</a>.</p>
      </div><figure className="event-poster"><a href={safeCopyUrl(editorial.spudcellsWithDrKateAdamala.hrefProtectedAssetsEventsKateAdamala)} target="_blank" rel="noopener noreferrer" aria-label="View the Kate Adamala event poster in a new tab"><img src={posterSrc} alt={editorial.spudcellsWithDrKateAdamala.altEbsSpeakerSeriesSpudcellsWith} width={1080} height={1350} /></a><figcaption>{editorial.spudcellsWithDrKateAdamala.eventPoster + " "}<a href={safeCopyUrl(editorial.spudcellsWithDrKateAdamala.hrefViewFullSizePosterOpens)} target="_blank" rel="noopener noreferrer">{editorial.spudcellsWithDrKateAdamala.viewFullSizePoster}<span className="sr-only"> (opens in a new tab)</span></a></figcaption></figure></div>
      <div className="event-followup"><section aria-labelledby="speaker-about"><h3 id="speaker-about">{editorial.spudcellsWithDrKateAdamala.aboutKateAdamala}</h3><p>{editorial.spudcellsWithDrKateAdamala.asPostdoctoralFellowEdBoydenS}</p></section><section aria-labelledby="event-reading"><h3 id="event-reading">{editorial.spudcellsWithDrKateAdamala.readBeforeTalk}</h3><p>{editorial.spudcellsWithDrKateAdamala.exploreScienceNewsCoverageLinkedResearch}</p><div className="actions"><a className="button secondary" href={safeCopyUrl(editorial.spudcellsWithDrKateAdamala.hrefScienceNewsArticleOpensNew)} target="_blank" rel="noopener noreferrer">{editorial.spudcellsWithDrKateAdamala.scienceNewsArticle}<span className="sr-only"> (opens in a new tab)</span></a><a className="button secondary" href={safeCopyUrl(editorial.spudcellsWithDrKateAdamala.hrefBiorxivPreprintVersion1Opens)} target="_blank" rel="noopener noreferrer">{editorial.spudcellsWithDrKateAdamala.biorxivPreprintVersion1}<span className="sr-only"> (opens in a new tab)</span></a></div></section></div>
    </article></section>
  </div>;
}
