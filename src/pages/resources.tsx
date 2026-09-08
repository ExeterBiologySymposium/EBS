import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-resources">
<section className={"page-heading"}>
<div className={"shell"}>
<h1>{"Research guides"}</h1>
<p className={"lead"}>{"Everything you need to go from zero to a compelling research presentation — curated guides, databases, tools, and templates, all free and beginner-friendly."}</p>
</div>
</section>
<div className={"shell article-layout"}><aside className={"contents"}><details open={true}><summary>{"On this page"}</summary><nav aria-label={"Research guide contents"} className={"contents-nav"}><a href={"#drylab"}>{"Introduction to Dry-Lab Research"}</a><a href={"#literature"}>{"Reading & Citing Papers"}</a><a href={"#tools"}>{"Free Tools & Databases"}</a><a href={"#presenting"}>{"Presenting Your Research"}</a><a href={"#templates"}>{"Templates & Guides"}</a></nav></details></aside><div className={"article-body"}><section className={"section"}>
<div>
<span>{"Jump to:"}</span>
<a className={"button secondary"} href={"#drylab"}>{"Dry-Lab Intro"}</a>
<a className={"button secondary"} href={"#literature"}>{"Scientific Literature"}</a>
<a className={"button secondary"} href={"#tools"}>{"Research Tools"}</a>
<a className={"button secondary"} href={"#presenting"}>{"Presenting Research"}</a>
<a className={"button secondary"} href={"#templates"}>{"Templates"}</a>
<a className={"button secondary"} href={"datascience.html"}>{"Data Science"}</a>
</div>
</section><section className={"section resource-anchor"} id={"drylab"}>
<div className={"section-header"}>
<h2>{"Introduction to Dry-Lab Research"}</h2>
<p>{"You don't need a pipette to do biology. Dry-lab research uses computational and analytical methods to explore biological questions — and it's how many of the most important discoveries in modern biology are made."}</p>
</div>
<div className={"grid columns-2"}>
<div>
<h3>{"The 5-Step Research Process"}</h3>
<div className={"steps"}>
<div className={"step"}>
<div className={"step__num"}>{"1"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{"Choose a Research Question"}</p>
<p>{"Start with something you genuinely want to know. Good questions in dry-lab biology are specific, answerable with publicly available data, and grounded in existing literature. Example: \"Is there a correlation between BRCA1 mutation rates and breast cancer incidence across ethnic populations?\""}</p>
</div>
</div>
<div className={"step"}>
<div className={"step__num"}>{"2"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{"Review the Literature"}</p>
<p>{"Search PubMed, Google Scholar, or Semantic Scholar to understand what's already known. Read at least 5–10 papers on your topic before designing your study. Your research should build on existing knowledge, not repeat it."}</p>
</div>
</div>
<div className={"step"}>
<div className={"step__num"}>{"3"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{"Find and Prepare Your Data"}</p>
<p>{"Identify public datasets relevant to your question. Sources include NCBI, UCSC Genome Browser, TCGA, KEGG, UniProt, and the CDC. Download, clean, and organize your data before any analysis."}</p>
</div>
</div>
<div className={"step"}>
<div className={"step__num"}>{"4"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{"Analyze & Interpret"}</p>
<p>{"Apply appropriate analytical methods — statistical tests, bioinformatics pipelines, or qualitative synthesis. Tools like RStudio, Python (Biopython, pandas), and Galaxy are beginner-friendly. Focus on what your results actually show, not what you hoped they'd show."}</p>
</div>
</div>
<div className={"step"}>
<div className={"step__num"}>{"5"}</div>
<div className={"step__body"}>
<p className={"step__title"}>{"Communicate Your Findings"}</p>
<p>{"Write an abstract, build a poster or slides, and practice explaining your work clearly to both experts and non-experts. This is the core skill EBS helps you develop."}</p>
</div>
</div>
</div>
</div>
<div>
<div className={"callout"}>
<p><strong>{"Not sure where to start?"}</strong>{" Choose a topic you're curious about — genetics, ecology, epidemiology, neuroscience — and ask: \"What question about this topic could I answer using data that already exists?\" Start broad, then narrow."}</p>
</div>
<h3>{"Common Project Types"}</h3>
<div>
<div className={"text-block"}>
<h5>{"Genomic / Bioinformatics Analysis"}</h5>
<p>{"Analyze publicly available genomic sequences, compare species, or investigate gene expression data from the NCBI or UCSC databases."}</p>
</div>
<div className={"text-block"}>
<h5>{"Epidemiological Data Study"}</h5>
<p>{"Use CDC, WHO, or NIH datasets to explore disease patterns, risk factors, or the effectiveness of public health interventions."}</p>
</div>
<div className={"text-block"}>
<h5>{"Systematic Literature Review"}</h5>
<p>{"Synthesize findings across multiple published studies to answer a broader biological question. Rigorous and highly publishable."}</p>
</div>
<div className={"text-block"}>
<h5>{"Computational Modeling"}</h5>
<p>{"Build a simple mathematical or agent-based model to simulate a biological process — protein folding, disease spread, population dynamics."}</p>
</div>
</div>
</div>
</div>
</section><section className={"section resource-anchor"} id={"literature"}>
<div className={"section-header"}>
<h2>{"Reading & Citing Papers"}</h2>
<p>{"The ability to find, read, and properly cite scientific literature is foundational to any research project."}</p>
</div>
<div className={"grid columns-2"}>
<div>
<h3>{"How to Read a Scientific Paper"}</h3>
<p>{"Don't read a paper front-to-back on your first pass. Try this proven approach:"}</p>
<ol>
<li>{"Read the "}<strong>{"Title and Abstract"}</strong>{" — understand the core claim"}</li>
<li>{"Skip to the "}<strong>{"Figures and Tables"}</strong>{" — visualize the data"}</li>
<li>{"Read the "}<strong>{"Introduction"}</strong>{" — understand context and motivation"}</li>
<li>{"Read the "}<strong>{"Results"}</strong>{" — understand what they found"}</li>
<li>{"Read the "}<strong>{"Discussion"}</strong>{" — understand what it means"}</li>
<li>{"Skim the "}<strong>{"Methods"}</strong>{" — understand how they did it"}</li>
<li>{"Note the "}<strong>{"References"}</strong>{" — follow citations for deeper reading"}</li>
</ol>
</div>
<div>
<h3>{"Citation Formats"}</h3>
<p>{"EBS accepts APA, MLA, or Vancouver citation formats. Use a reference manager to stay organized:"}</p>
<div>
<div className={"text-block"}>
<h5>{"Zotero "}<span>{"(Free, recommended)"}</span></h5>
<p>{"Browser-based citation manager. One-click save from PubMed or Google Scholar. Auto-generates citations."}</p>
</div>
<div className={"text-block"}>
<h5>{"Mendeley"}</h5>
<p>{"Free citation manager by Elsevier. Includes PDF annotation and collaboration features."}</p>
</div>
<div className={"text-block"}>
<h5>{"Google Scholar"}</h5>
<p>{"Quick \"Cite\" button under each result generates APA, MLA, and Chicago formats instantly."}</p>
</div>
</div>
</div>
</div>
</section><section className={"section resource-anchor"} id={"tools"}>
<div className={"section-header"}>
<h2>{"Free Tools & Databases"}</h2>
<p>{"Every tool listed here is free, publicly accessible, and used by professional researchers. No institutional login required for most resources."}</p>
</div>
<div>
<h3>{"Literature Databases"}</h3>
<div className={"tool-list"}>
<a className={"tool-entry"} href={"https://pubmed.ncbi.nlm.nih.gov"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"PubMed / MEDLINE"}</span>
<span className={"tool-link__desc"}>{"NLM's database of biomedical literature. 35M+ articles. Best for clinical and life sciences."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://scholar.google.com"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"Google Scholar"}</span>
<span className={"tool-link__desc"}>{"Broad academic search across all disciplines. Best starting point for any topic."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://www.semanticscholar.org"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"Semantic Scholar"}</span>
<span className={"tool-link__desc"}>{"AI-powered search with citation graphs and paper summaries."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://www.biorxiv.org"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"bioRxiv / medRxiv"}</span>
<span className={"tool-link__desc"}>{"Biology and medicine preprint servers. Free, open access, cutting-edge research."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://www.ncbi.nlm.nih.gov/pmc/"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"PubMed Central (PMC)"}</span>
<span className={"tool-link__desc"}>{"Free full-text archive of biomedical and life sciences journals."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://www.connectedpapers.com"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"Connected Papers"}</span>
<span className={"tool-link__desc"}>{"Visual map of papers related to one article. Great for exploring a field."}</span>
</div>
</a>
</div>
</div>
<div>
<h3>{"Biological Databases"}</h3>
<div className={"tool-list"}>
<a className={"tool-entry"} href={"https://www.ncbi.nlm.nih.gov"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"NCBI"}</span>
<span className={"tool-link__desc"}>{"National Center for Biotechnology Information. Gateway to GenBank, RefSeq, dbSNP, and more."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://genome.ucsc.edu"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"UCSC Genome Browser"}</span>
<span className={"tool-link__desc"}>{"Interactive visualization of vertebrate genome sequences and annotations."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://www.uniprot.org"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"UniProt"}</span>
<span className={"tool-link__desc"}>{"Comprehensive protein sequence and functional information database."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://www.kegg.jp"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"KEGG"}</span>
<span className={"tool-link__desc"}>{"Biological pathways, diseases, and chemical compounds database."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://portal.gdc.cancer.gov"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"GDC (TCGA)"}</span>
<span className={"tool-link__desc"}>{"Cancer Genome Atlas — genomic, clinical, and imaging data for 33 cancer types."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://www.cdc.gov/nchs"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"CDC / NCHS Data"}</span>
<span className={"tool-link__desc"}>{"US public health surveillance data. NHANES, mortality records, disease registries."}</span>
</div>
</a>
</div>
</div>
<div>
<h3>{"Analysis Tools"}</h3>
<div className={"tool-list"}>
<a className={"tool-entry"} href={"https://usegalaxy.org"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"Galaxy Platform"}</span>
<span className={"tool-link__desc"}>{"Browser-based bioinformatics. No coding required for many analyses. Great for beginners."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://posit.co/products/open-source/rstudio"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"RStudio"}</span>
<span className={"tool-link__desc"}>{"The standard R interface for statistical analysis in biology. Use it with the EBS RStudio track."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://colab.research.google.com"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"Google Colab (Python)"}</span>
<span className={"tool-link__desc"}>{"Free cloud-based Python notebooks. Use with the EBS Python track for pandas, NumPy, and SciPy."}</span>
</div>
</a>
<a className={"tool-entry"} href={"python.html"}>
<div>
<span className={"tool-link__name"}>{"EBS Python Track"}</span>
<span className={"tool-link__desc"}>{"On-site lessons for pandas, NumPy, SciPy, practice data, exercises, and answer checks."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://blast.ncbi.nlm.nih.gov"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"BLAST"}</span>
<span className={"tool-link__desc"}>{"Basic Local Alignment Search Tool. Align nucleotide or protein sequences against reference databases."}</span>
</div>
</a>
<a className={"tool-entry"} href={"https://www.ebi.ac.uk/Tools/msa/"} rel={"noopener noreferrer"} target={"_blank"}>
<div>
<span className={"tool-link__name"}>{"EBI Clustal Omega"}</span>
<span className={"tool-link__desc"}>{"Multiple sequence alignment tool. Compare protein or DNA sequences across species."}</span>
</div>
</a>
<a className={"tool-entry"} href={"rstudio.html"}>
<div>
<span className={"tool-link__name"}>{"EBS RStudio Track"}</span>
<span className={"tool-link__desc"}>{"On-site RStudio lessons for data frames, grouped summaries, t-tests, plots, and answer checks."}</span>
</div>
</a>
</div>
</div>
</section><section className={"section resource-anchor"} id={"presenting"}>
<div className={"section-header"}>
<h2>{"Presenting Your Research"}</h2>
<p>{"Science that isn't communicated doesn't count. Learn how to craft a poster and abstract that clearly conveys your work."}</p>
</div>
<div className={"grid columns-2"}>
<div>
<h3>{"Writing an Abstract"}</h3>
<p>{"Your abstract (150–250 words) is the first thing judges and attendees read. It must cover:"}</p>
<div className={"checklist"}>
<div className={"checklist__item"}>
<span><strong>{"Background:"}</strong>{" Why does this question matter? What's already known?"}</span>
</div>
<div className={"checklist__item"}>
<span><strong>{"Objective:"}</strong>{" What specific question are you answering?"}</span>
</div>
<div className={"checklist__item"}>
<span><strong>{"Methods:"}</strong>{" What data did you use and how did you analyze it?"}</span>
</div>
<div className={"checklist__item"}>
<span><strong>{"Results:"}</strong>{" What did you find? Include key numbers if possible."}</span>
</div>
<div className={"checklist__item"}>
<span><strong>{"Conclusion:"}</strong>{" What does this mean and what are the limitations?"}</span>
</div>
</div>
<div className={"callout"}>
<p><strong>{"Tip:"}</strong>{" Write your abstract last. It's much easier once you know what you've actually found. Every sentence should earn its place — cut anything a reader doesn't need to understand your work."}</p>
</div>
</div>
<div>
<h3>{"Poster Design Principles"}</h3>
<div>
<div className={"resource-link"}>
<div>
<h3>{"Flow & Structure"}</h3>
<p>{"Readers should move top-to-bottom or left-to-right without confusion. Use clear section headers and a logical narrative arc."}</p>
</div>
</div>
<div className={"resource-link"}>
<div>
<h3>{"Visualize Your Data"}</h3>
<p>{"A clear figure beats a paragraph of text. Label all axes, include units, and write a descriptive caption. Avoid 3D charts."}</p>
</div>
</div>
<div className={"resource-link"}>
<div>
<h3>{"The 90-Second Rule"}</h3>
<p>{"A judge should understand your key finding within 90 seconds of looking at your poster. Cut text ruthlessly. Use bullet points over paragraphs."}</p>
</div>
</div>
<div className={"resource-link"}>
<div>
<h3>{"Practice Your Pitch"}</h3>
<p>{"Prepare a 2-minute verbal overview. Practice with a friend who knows nothing about your topic — if they understand it, you're ready."}</p>
</div>
</div>
</div>
</div>
</div>
</section><section className={"section resource-anchor"} id={"templates"}>
<div className={"section-header"}>
<h2>{"Templates & Guides"}</h2>
<p>{"Official EBS templates will be released when registration opens in Fall 2026. Register your interest to be notified first."}</p>
</div>
<div className={"grid columns-3"}>
<div className={"text-block"}>
<h3>{"Poster Template"}</h3>
<p>{"PowerPoint and Google Slides template with EBS formatting guidelines and section structure."}</p>
<span className={"badge badge--primary"}>{"Available Fall 2026"}</span>
</div>
<div className={"text-block"}>
<h3>{"Abstract Template"}</h3>
<p>{"Formatted abstract template with word count guidance, section prompts, and example abstract."}</p>
<span className={"badge badge--primary"}>{"Available Fall 2026"}</span>
</div>
<div className={"text-block"}>
<h3>{"Research Planner"}</h3>
<p>{"Week-by-week research timeline template to keep your project on track from September to May."}</p>
<span className={"badge badge--primary"}>{"Available Fall 2026"}</span>
</div>
</div>
<div>
<a className={"button primary"} href={"register.html"}>{"\n          Register to Get Notified\n\n"}</a>
</div>
</section></div></div></div>; }
