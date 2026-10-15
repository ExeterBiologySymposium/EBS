import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-team">
<section className={"page-heading"}>
<div className={"shell"}>
<h1>{"Our team"}</h1>
<p className={"lead"}>{"EBS is built and run entirely by students in the Genetics and Biotech Club at Phillips Exeter Academy (PEA). We are grateful for the support of our faculty advisors and the broader Exeter community."}</p>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<h2 className={"team-section-title"}>{"Executive Committee"}</h2>
<div className={"grid columns-4"}>
<div className={"person text-block"}>
<div className={"portrait"}><img alt={"Jaiden Kim"} decoding={"async"} height={"668"} loading={"lazy"} src={"/images/team/jaiden-kim.png"} width={"514"} /></div>
<h3>{"Jaiden Kim"}</h3>
<p className={"role"}>{"Co-Head"}</p>
<p className={"grade"}>{"Class of 2028"}</p>
<details className={"team-card__details"}>
<summary>{"View profile"}</summary>
<ul className={"team-card__profile"}>
<li><strong>{"USABO 2026 Semifinalist"}</strong></li>
<li><strong>{"Summer 2026 Research Intern, Rice University Department of Biosciences"}</strong><br /><em>{"Elucidating Serotonin-Independent Pathways Underlying Sertraline-Mediated Lipid Loss and Protestasis"}</em></li>
</ul>
</details>
</div>
<div className={"person text-block"}>
<div className={"portrait"}><img alt={"Adrian Chan working in a laboratory"} decoding={"async"} height={"5120"} loading={"lazy"} src={"images/team/adrian-chan.jpeg"} width={"3840"} /></div>
<h3>{"Adrian Chan"}</h3>
<p className={"role"}>{"Co-Head"}</p>
<p className={"grade"}>{"Class of 2028"}</p>
<details className={"team-card__details"}>
<summary>{"View profile"}</summary>
<ul className={"team-card__profile"}>
<li><strong>{"Team UK IBO Selection Candidate, 2024"}</strong></li>
<li><strong>{"Medical & Scientific Intern, Hong Kong Genome Institute"}</strong><br />{"Contributed to whole-genome sequencing workflows with HKGI and Hong Kong Children’s Hospital, plus genomic literacy and policy work."}</li>
<li><strong>{"SSTP 2026 Research Intern, University of Iowa Department of Pathology — Yang Lab"}</strong><br />{"Analyzed SETDB1 using ORIEN and TCGA datasets; assessed dFF-ChIP and total RNA-sequencing results; developed a CRISPR/Cas9-degron system in UCEC cell lines."}</li>
</ul>
</details>
</div>
<div className={"person text-block"}>
<div className={"portrait"}><img alt={"Reya Satam"} decoding={"async"} height={"1255"} loading={"lazy"} src={"images/team/reya-satam.jpeg"} width={"979"} /></div>
<h3>{"Reya Satam"}</h3>
<p className={"role"}>{"Co-Head"}</p>
<p className={"grade"}>{"Class of 2028"}</p>
<details className={"team-card__details"}>
<summary>{"View profile"}</summary>
<ul className={"team-card__profile"}>
<li><strong>{"Presenter, Max Planck Florida Institute for Neuroscience Sunposium"}</strong><br />{"Presented research on genetic architecture of multiple sclerosis."}</li>
<li><strong>{"Research Intern, UMass Chan Medical School"}</strong><br />{"Investigates how localized traumatic brain injury changes circadian rhythms in "}<em>{"Drosophila"}</em>{"."}</li>
<li><strong>{"Neurogenetics researcher"}</strong><br />{"Completed a meta-analysis on genetic regulatory architecture of multiple sclerosis with University of Notre Dame faculty."}</li>
</ul>
</details>
</div>
<div className={"person text-block"}>
<div aria-label={"Photo of Luke Wang"} className={"portrait"} role={"img"}><img alt={"Luke Wang"} decoding={"async"} height={"4032"} loading={"lazy"} src={"images/team/luke-wang.jpg"} width={"6048"} /></div>
<h3>{"Luke Wang"}</h3>
<p className={"role"}>{"Co-Head"}</p>
<p className={"grade"}>{"Class of 2027"}</p>
<details className={"team-card__details"}>
<summary>{"View profile"}</summary>
<ul className={"team-card__profile"}>
<li><strong>{"USABO 2025 & 2026 Semifinalist"}</strong></li>
<li><strong>{"SSP Biochemistry, 2026 — Research Project"}</strong><br /><em>{"Characterization of Setosphaeria turcica Cdc14 Phosphatase Activity and Development of Potential Inhibitors for Northern Corn Leaf Blight"}</em></li>
</ul>
</details>
</div>
</div>
<h2 className={"team-section-title"}>{"Associate Members"}</h2>
<div className={"grid columns-3"}>
<section className={"text-block"}>
<h3>{"Outreach Associates"}</h3>
<ul>
<li>{"Esther Kim ’29"}</li>
<li>{"Derek Geng ’30"}</li>
<li>{"Margaux Morgan ’29"}</li>
</ul>
</section>
<section className={"text-block"}>
<h3>{"Research Associates"}</h3>
<ul>
<li>{"Scarlett Reddy ’29"}</li>
<li>{"Dowan Kim ’29"}</li>
<li>{"Avni Murarka ’28"}</li>
</ul>
</section>
<section className={"text-block"}>
<h3>{"Social Media Associate"}</h3>
<ul>
<li>{"Olivia Wang ’29"}</li>
</ul>
</section>
</div>
<h2 className={"team-section-title"}>{"Faculty Advisors"}</h2>
<p>{"EBS is supported by dedicated faculty at Phillips Exeter Academy who believe in student-led scientific inquiry and provide guidance, oversight, and institutional support."}</p>
<div className={"grid columns-2"}>
<div className={"faculty faculty--morrill text-block"}>
<div className={"portrait"}><img alt={"Dr. Summer Morrill teaching biology students"} decoding={"async"} height={"683"} loading={"lazy"} src={"images/team/Dr. Morrill.jpg"} width={"1024"} /></div>
<div>
<h3>{"Dr. Summer Morrill"}</h3>
<p className={"role"}>{"Biology Department"}</p>
<p className={"faculty-card__dept"}>{"Phillips Exeter Academy"}</p>
</div>
</div>
</div>
<figure className={"group-photo"}>
<img alt={"EGBC club members visiting Broad Institute"} decoding={"async"} height={"2752"} loading={"lazy"} src={"/images/team/ebs-team-broad-institute.jpg"} width={"4128"} />
<figcaption>{"EGBC club members at Broad Institute."}</figcaption>
</figure>
<figure className={"group-photo"}>
<img alt={"EGBC students with Exeter alumni during a research lunch in Boston"} decoding={"async"} height={"4032"} loading={"lazy"} src={"/images/Genetics Club Photos/EGBC 3.jpg"} width={"6048"} />
<figcaption>{"EGBC students with Exeter alumni during a research lunch in Boston."}</figcaption>
</figure>
<figure className={"group-photo"}>
<img alt={"EGBC students at the Koch Institute during the 2026 Cambridge Science Festival"} decoding={"async"} height={"4032"} loading={"lazy"} src={"/images/Genetics Club Photos/EGBC 4.jpg"} width={"6048"} />
<figcaption>{"EGBC students at the Koch Institute for Integrative Cancer Research during the 2026 Cambridge Science Festival."}</figcaption>
</figure>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"next-step"}>
<h2>{"The Genetics and Biotech Club"}</h2>
<p>{"Have a question or want to connect with the team? We'd love to hear from you."}</p>
<div className={"actions"}>
<a className={"button primary"} href={"faq.html#contact"}>{"Contact the Team"}</a>
<a className={"button secondary"} href={"about.html"}>{"Our Mission"}</a>
</div>
</div>
</div>
</section>
</div>; }
