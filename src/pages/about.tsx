import { usePageCopy, safeCopyUrl } from '../content/page-copy';
import { definition } from '../content/copy/about';

export default function PageContent() {
  const editorial = usePageCopy('about', definition); return <div className="page-layout layout-about">
<section className={"page-heading"}>
<div className={"shell"}>
<img className="about-exeter-mark" src={safeCopyUrl(editorial.pageHeading.srcExeter, "image")} alt={editorial.pageHeading.altExeter} width={2400} height={779} decoding="async" />
<p className="eyebrow">{editorial.pageHeading.aboutEbs}</p>
<h1>{editorial.pageHeading.title}<br/>{editorial.pageHeading.title2}</h1>
<p className={"lead"}>{editorial.pageHeading.freeBiologySymposiumDryLabResearch}</p>
</div>
</section>
<img className="about-cover" src={safeCopyUrl(editorial.page.srcStudentsFromGeneticsBiotechnologyClub, "image")} alt={editorial.page.altStudentsFromGeneticsBiotechnologyClub} />
<section className={"section about-origin"}>
<img className="about-origin-seal" src={safeCopyUrl(editorial.whyWeStartedEbs.srcPhillipsExeterAcademySelectedAssets, "image")} alt="" aria-hidden="true" loading="lazy" decoding="async" />
<div className={"shell reading"}>
<div>
<h2>{editorial.whyWeStartedEbs.whyWeStartedEbs}</h2>
<p>{editorial.whyWeStartedEbs.acrossNationTalentedHighSchoolMiddle + "\n"}</p>
<p>{editorial.whyWeStartedEbs.weSawTalentedCuriousPeersWho + "\n"}</p>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"grid columns-2"}>
<div>
<h2>{editorial.whatDryLabResearch.whatDryLabResearch}</h2>
<p>{editorial.whatDryLabResearch.dryLabResearchBiologyConductedWithout}</p>
<p>{editorial.whatDryLabResearch.ebsResearchProgramFocusesDryLab}</p>
<div className={"checklist"}>
<div className={"checklist__item"}>
<span><strong>{editorial.whatDryLabResearch.bioinformatics}</strong>{" " + editorial.whatDryLabResearch.analyzingGenomicProteomicOrEvolutionaryData}</span>
</div>
<div className={"checklist__item"}>
<span><strong>{editorial.whatDryLabResearch.computationalModeling}</strong>{" " + editorial.whatDryLabResearch.simulatingBiologicalSystemsOrDiseaseOutbreaks}</span>
</div>
<div className={"checklist__item"}>
<span><strong>{editorial.whatDryLabResearch.statisticalAnalysis}</strong>{" " + editorial.whatDryLabResearch.workingWithPublicHealthOrEcology}</span>
</div>
<div className={"checklist__item"}>
<span><strong>{editorial.whatDryLabResearch.systematicLiteratureReview}</strong>{" " + editorial.whatDryLabResearch.synthesizingAnalyzingPublishedResearch}</span>
</div>
<div className={"checklist__item"}>
<span><strong>{editorial.whatDryLabResearch.metaAnalysis}</strong>{" " + editorial.whatDryLabResearch.drawingQuantitativeConclusionsFromExistingStudies}</span>
</div>
</div>
</div>
<div>
<div className={"grid"}>
<div className={"text-block"}>
<h3>{editorial.whatDryLabResearch.noLabRequired}</h3>
<p>{editorial.whatDryLabResearch.allNeedComputerAnInternetConnection}</p>
</div>
<div className={"text-block"}>
<h3>{editorial.whatDryLabResearch.realScience}</h3>
<p>{editorial.whatDryLabResearch.dryLabResearchLeadsNewFindings}</p>
</div>
<div className={"text-block"}>
<h3>{editorial.whatDryLabResearch.ownQuestion}</h3>
<p>{editorial.whatDryLabResearch.studentsChooseTheirOwnResearchQuestion}</p>
</div>
</div>
</div>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"section-header"}>
<h2>{editorial.twoPartsEbs.twoPartsEbs}</h2>
<p>{editorial.twoPartsEbs.ebsCombinesYearLongResearchProgram}</p>
</div>
<div className={"grid columns-2"}>
<div className={"steps"}>
<div className={"step"}>
<div className={"step__num"}>{"1"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{editorial.twoPartsEbs.researchPreparationFall2026April25th}</p>
<p>{editorial.twoPartsEbs.researchProgramCentersDocumentWrittenBy}</p>
</div>
</div>
<div className={"step"}>
<div className={"step__num"}>{"2"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{editorial.twoPartsEbs.threeCheckpointsDecember2026April2027}</p>
<p>{editorial.twoPartsEbs.submitProjectIdeaPlanDecember18}</p>
</div>
</div>
<div className={"step"}>
<div className={"step__num"}>{"3"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{editorial.twoPartsEbs.symposiumDayApril25th2027}</p>
<p>{editorial.twoPartsEbs.researchProgramCulminatesPosterPresentedAt + " "}<a href={safeCopyUrl(editorial.twoPartsEbs.hrefFullSchedule)}>{editorial.twoPartsEbs.fullSchedule}</a>.</p>
</div>
</div>
<div className={"step"}>
<div className={"step__num"}>{"4"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{editorial.twoPartsEbs.awards}</p>
<p>{editorial.twoPartsEbs.dayConcludesWithAnAwardsCeremony}</p>
</div>
</div>
</div>
<div>
<h3>{editorial.twoPartsEbs.presentationFormats}</h3>
<div>
<div className={"text-block"}>
<h3>{"\n\n                " + editorial.twoPartsEbs.posterPresentation + "\n              "}</h3>
<p>{editorial.twoPartsEbs.studentsPresentPhysicalPosterAtExeter}</p>
</div>
</div>
</div>
</div>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"section-header"}>
<h2>{editorial.ourApproach.ourApproach}</h2>
</div>
<div className={"grid columns-3"}>
<div className={"text-block"}>
<h3>{editorial.ourApproach.accessibility}</h3>
<p>{editorial.ourApproach.researchShouldBeOpenEveryoneWe}</p>
</div>
<div className={"text-block"}>
<h3>{editorial.ourApproach.rigor}</h3>
<p>{editorial.ourApproach.weAimEveryResearcherLeaveEbs}</p>
</div>
<div className={"text-block"}>
<h3>{editorial.ourApproach.community}</h3>
<p>{editorial.ourApproach.ebsHasReachedOutMiddleHigh}</p>
</div>
</div>
</div>
</section>
<section className={"section about-register"}>
<div className={"shell"}>
<div className={"next-step"}>
<h2>{editorial.takePartApril25th2027.takePartApril25th2027}</h2>
<p>{editorial.takePartApril25th2027.whetherReReadyStartResearchJourney}</p>
<div className={"actions"}>
<a className={"button primary"} href={safeCopyUrl(editorial.takePartApril25th2027.hrefRegisterInterest)}>{editorial.takePartApril25th2027.registerInterest}</a>
<a className={"button secondary"} href={safeCopyUrl(editorial.takePartApril25th2027.hrefMeetTeam)}>{editorial.takePartApril25th2027.meetTeam}</a>
</div>
</div>
</div>
</section>
</div>; }
