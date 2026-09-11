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
<figure className={"group-photo"}>
<img alt={"EBS team members visiting Broad Institute"} decoding={"async"} height={"2752"} loading={"lazy"} src={"/images/team/ebs-team-broad-institute.jpg"} width={"4128"} />
<figcaption>{"EBS team members at Broad Institute."}</figcaption>
</figure>
<figure className={"group-photo"}>
<img alt={"Students from the Genetics and Biotech Club visiting the Broad Institute"} decoding={"async"} loading={"lazy"} src={"/images/Genetics Club Photos/EGBC 3.jpg"} />
</figure>
<h2 className={"team-section-title"}>{"Organizing Committee and School Partners"}</h2>
<div className={"grid columns-4"}>
<div className={"person text-block"}>
<div aria-label={"Photo not provided"} className={"portrait"} role={"img"}><span className={"portrait-placeholder"}></span></div>
<h3>{"Media Director"}</h3>
<p className={"role"}>{"Design & Social Media"}</p>
<p className={"grade"}>{"Class of 2028"}</p>
</div>
<div className={"person text-block"}>
<div aria-label={"Photo not provided"} className={"portrait"} role={"img"}><span className={"portrait-placeholder"}></span></div>
<h3>{"Abstract Reviewer"}</h3>
<p className={"role"}>{"Submissions & Review"}</p>
<p className={"grade"}>{"Class of 2028"}</p>
</div>
<div className={"person text-block"}>
<div aria-label={"Photo not provided"} className={"portrait"} role={"img"}><span className={"portrait-placeholder"}></span></div>
<h3>{"School Partner"}</h3>
<p className={"role"}>{"Phillips Academy"}</p>
<p className={"grade"}>{"Class of 2027"}</p>
</div>
</div>
<div className={"callout"}>
<p><strong>{"Note:"}</strong>{" Team member names and headshots will be added when the organizing committee is finalized in Fall 2026. If you are interested in joining the organizing team, see below."}</p>
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
<div className={"faculty text-block"}>
<div aria-label={"Photo not provided"} className={"portrait"} role={"img"}><span className={"portrait-placeholder"}></span></div>
<div>
<h3>{"Faculty Co-Advisor"}</h3>
<p className={"role"}>{"Science Department"}</p>
<p className={"faculty-card__dept"}>{"Phillips Exeter Academy"}</p>
</div>
</div>
</div>
<div className={"grid columns-2"}>
<div>
<h2>{"Join the Organizing Team"}</h2>
<p>{"The Genetics and Biotech Club is actively recruiting students to help organize EBS 2027. No prior event experience needed — just enthusiasm for biology, science communication, and making research accessible to your peers."}</p>
<p>{"We have roles in research curriculum development, outreach, design, logistics, and more. If you care about this mission, we want to hear from you."}</p>
<a className={"button primary"} href={"register.html"}>{"\n            Express Interest in Joining\n\n"}</a>
</div>
<div>
<div className={"text-block"}>
<h3>{"Open Roles"}</h3>
<div className={"checklist"}>
<div className={"checklist__item"}>
<span>{"Research curriculum developers"}</span>
</div>
<div className={"checklist__item"}>
<span>{"School and community outreach coordinators"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Graphic designers and social media managers"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Abstract review committee members"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Sponsorship and partnerships leads"}</span>
</div>
<div className={"checklist__item"}>
<span>{"Day-of logistics and volunteer coordinators"}</span>
</div>
</div>
</div>
</div>
</div>
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
