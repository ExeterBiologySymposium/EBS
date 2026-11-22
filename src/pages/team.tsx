import { usePageCopy, safeCopyUrl } from '../content/page-copy';
import { definition } from '../content/copy/team';
export default function PageContent() {
  const editorial = usePageCopy('team', definition); return <div className="page-layout layout-team">
<section className={"page-heading"}>
<div className={"shell"}>
<h1>{editorial.pageHeading.title}</h1>
<p className={"lead"}>{editorial.pageHeading.ebsBuiltRunEntirelyByStudents}</p>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<h2 className={"team-section-title"}>{editorial.leadership.leadership}</h2>
<div className={"grid columns-4"}>
<div className={"person text-block"}>
<div className={"portrait"}><img alt={editorial.leadership.altAdrianChanWorkingLaboratory} decoding={"async"} height={"4032"} loading={"lazy"} src={safeCopyUrl(editorial.leadership.srcAdrianChanWorkingLaboratory, "image")} width={"2688"} /></div>
<h3>{editorial.leadership.adrianChan}</h3>
<p className={"role"}>{editorial.leadership.coHead}</p>
<p className={"grade"}>{editorial.leadership.class2028}</p>
<details className={"team-card__details"}>
<summary>{editorial.viewProfile.viewProfile}</summary>
<ul className={"team-card__profile"}>
<li><strong>{editorial.viewProfile.medicalScientificInternHongKongGenome}</strong><br />{editorial.viewProfile.contributedWholeGenomeSequencingWorkflowsWith}</li>
<li><strong>{editorial.viewProfile.sstp2026ResearchInternUniversityIowa}</strong><br />{editorial.viewProfile.analyzedSetdb1UsingOrienTcgaDatasets}</li>
</ul>
</details>
</div>
<div className={"person text-block"}>
<div className={"portrait"}><img alt={editorial.leadership.altJaidenKim} decoding={"async"} height={"4397"} loading={"lazy"} src={safeCopyUrl(editorial.leadership.srcJaidenKim, "image")} width={"2931"} /></div>
<h3>{editorial.leadership.jaidenKim}</h3>
<p className={"role"}>{editorial.leadership.coHead2}</p>
<p className={"grade"}>{editorial.leadership.class20282}</p>
<details className={"team-card__details"}>
<summary>{editorial.viewProfile.viewProfile2}</summary>
<ul className={"team-card__profile"}>
<li><strong>{editorial.viewProfile.summer2026ResearchInternRiceUniversity}</strong><br /><em>{editorial.viewProfile.elucidatingSerotoninIndependentPathwaysUnderlyingSertraline}</em></li>
</ul>
</details>
</div>
<div className={"person text-block"}>
<div className={"portrait"}><img alt={editorial.leadership.altReyaSatam} decoding={"async"} height={"4032"} loading={"lazy"} src={safeCopyUrl(editorial.leadership.srcReyaSatam, "image")} width={"2688"} /></div>
<h3>{editorial.leadership.reyaSatam}</h3>
<p className={"role"}>{editorial.leadership.coHead3}</p>
<p className={"grade"}>{editorial.leadership.class20283}</p>
<details className={"team-card__details"}>
<summary>{editorial.viewProfile.viewProfile3}</summary>
<ul className={"team-card__profile"}>
<li><strong>{editorial.viewProfile.presenterMaxPlanckFloridaInstituteNeuroscience}</strong><br />{editorial.viewProfile.presentedResearchGeneticArchitectureMultipleSclerosis}</li>
<li><strong>{editorial.viewProfile.researchInternUmassChanMedicalSchool}</strong><br />{editorial.viewProfile.investigatesHowLocalizedTraumaticBrainInjury + " "}<em>{editorial.viewProfile.drosophila}</em>{"."}</li>
<li><strong>{editorial.viewProfile.neurogeneticsResearcher}</strong><br />{editorial.viewProfile.completedMetaAnalysisGeneticRegulatoryArchitecture}</li>
</ul>
</details>
</div>
<div className={"person text-block"}>
<div aria-label={"Photo of Luke Wang"} className={"portrait"} role={"img"}><img alt={editorial.leadership.altLukeWang} decoding={"async"} height={"4014"} loading={"lazy"} src={safeCopyUrl(editorial.leadership.srcLukeWang, "image")} width={"4804"} /></div>
<h3>{editorial.leadership.lukeWang}</h3>
<p className={"role"}>{editorial.leadership.coHead4}</p>
<p className={"grade"}>{editorial.leadership.class2027}</p>
<details className={"team-card__details"}>
<summary>{editorial.viewProfile.viewProfile4}</summary>
<ul className={"team-card__profile"}>
<li><strong>{editorial.viewProfile.sspBiochemistry2026ResearchProject}</strong><br /><em>{editorial.viewProfile.characterizationSetosphaeriaTurcicaCdc14PhosphataseActivity}</em></li>
</ul>
</details>
</div>
</div>
<h2 className={"team-section-title"}>{editorial.leadership.facultyAdvisors}</h2>
<p>{editorial.leadership.ebsSupportedByDedicatedFacultyAt}</p>
<div className={"grid columns-2"}>
<div className={"faculty faculty--morrill text-block"}>
<div className={"portrait"}><img alt={editorial.leadership.altDrSummerMorrillTeachingBiology} decoding={"async"} height={"683"} loading={"lazy"} src={safeCopyUrl(editorial.leadership.srcDrSummerMorrillTeachingBiology, "image")} width={"1024"} /></div>
<div>
<h3>{editorial.leadership.drSummerMorrill}</h3>
<p className={"role"}>{editorial.leadership.biologyInstructor}</p>
<p className={"faculty-card__dept"}>{editorial.leadership.alfredHHayes25JeanM}</p>
<p className={"faculty-card__dept"}>{editorial.leadership.mitPhDBiology20}</p>
<p className={"faculty-card__dept"}>{editorial.leadership.phillipsExeterAcademy}</p>
</div>
</div>
</div>
<h2 className={"team-section-title"}>{editorial.leadership.organizingTeam}</h2>
<p>{editorial.leadership.organizingTeamSupportsResearchCurriculumOutreach}</p>
<div className={"grid organizing-team-grid"}>
{editorial.organizingTeamMembers.map(member=><div className="person text-block" key={member.name}>
<div className={`portrait${member.photo ? '' : ' portrait--initials'}`} aria-hidden={!member.photo}>{member.photo ? <img alt={member.name} decoding="async" height="4032" loading="lazy" src={safeCopyUrl(member.photo, "image")} width="2688" /> : <span>{member.initials}</span>}</div>
<h3>{member.name}</h3>
<p className="role">{member.role}</p>
<p className="grade">{editorial.leadership.class + " "}{member.year}</p>
</div>)}
</div>
<figure className={"group-photo"}>
<img alt={editorial.leadership.altEgbcClubMembersVisitingBroad} decoding={"async"} height={"2752"} loading={"lazy"} src={safeCopyUrl(editorial.leadership.srcEgbcClubMembersVisitingBroad, "image")} width={"4128"} />
<figcaption>{editorial.leadership.egbcClubMembersAtBroadInstitute}</figcaption>
</figure>
<figure className={"group-photo"}>
<img alt={editorial.leadership.altEgbcStudentsAtKochInstitute} decoding={"async"} height={"4032"} loading={"lazy"} src={safeCopyUrl(editorial.leadership.srcEgbcStudentsAtKochInstitute, "image")} width={"6048"} />
<figcaption>{editorial.leadership.egbcStudentsAtKochInstituteIntegrative}</figcaption>
</figure>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"next-step"}>
<h2>{editorial.geneticsBiotechnologyClub.geneticsBiotechnologyClub}</h2>
<p>{editorial.geneticsBiotechnologyClub.haveQuestionOrWantConnectWith}</p>
<div className={"actions"}>
<a className={"button primary"} href={safeCopyUrl(editorial.geneticsBiotechnologyClub.hrefContactTeam)}>{editorial.geneticsBiotechnologyClub.contactTeam}</a>
<a className={"button secondary"} href={safeCopyUrl(editorial.geneticsBiotechnologyClub.hrefOurMission)}>{editorial.geneticsBiotechnologyClub.ourMission}</a>
</div>
</div>
</div>
</section>
</div>; }
