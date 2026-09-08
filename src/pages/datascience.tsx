import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-datascience">
<section className={"page-heading"}>
<div className={"shell"}>
<h1>{"RStudio and Python for Biology Research"}</h1>
<p className={"lead"}>{"A full beginner curriculum for dry-lab biology projects: clean messy datasets, analyze them in RStudio or Python, and produce reproducible figures for an EBS poster."}</p>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"article-layout"}>
<aside className={"contents"}><details open={true}><summary>{"On this page"}</summary>
<nav aria-label={"Data science curriculum sections"} className={"contents-nav"}>
<a href={"#outcomes"}>{"Outcomes"}</a>
<a href={"#setup"}>{"Setup"}</a>
<a href={"#modules"}>{"Curriculum"}</a>
<a href={"#tracks"}>{"Track Pages"}</a>
<a href={"#capstone"}>{"Capstone"}</a>
</nav>
<div className={"reading-note"}>
<h3>{"Recommended pace"}</h3>
<p>{"10 modules across 8-10 weeks. Each module is designed for 60-90 minutes of practice plus one short research task."}</p>
</div>
<div className={"reading-note"}>
<h3>{"Course design"}</h3>
<ul className={"curriculum-list"}>
<li>{"Core concepts live on this page"}</li>
<li>{"Python lessons live on the Python track page"}</li>
<li>{"R lessons live on the RStudio track page"}</li>
<li>{"No outside tutorials are required"}</li>
</ul>
</div>
</details></aside>
<div>
<section className={"curriculum-section"} id={"outcomes"}>
<h2>{"Learning Outcomes"}</h2>
<p>{"By the end of this curriculum, students should be able to move from a biological question to a defensible, reproducible analysis."}</p>
<div className={"grid columns-2"}>
<div className={"text-block"}>
<h3>{"Analyze Real Data"}</h3>
<p>{"Import CSV files, inspect variables, handle missing values, summarize groups, and choose appropriate statistical tests."}</p>
</div>
<div className={"text-block"}>
<h3>{"Use Two Toolchains"}</h3>
<p>{"Work in RStudio for R-based statistics and in Python notebooks for pandas, NumPy, and SciPy workflows."}</p>
</div>
<div className={"text-block"}>
<h3>{"Document Decisions"}</h3>
<p>{"Keep an analysis log that explains cleaning decisions, assumptions, test selection, and limitations."}</p>
</div>
<div className={"text-block"}>
<h3>{"Make Poster-Ready Figures"}</h3>
<p>{"Create clear, labeled visualizations and export them with captions that state the result and interpretation."}</p>
</div>
</div>
</section>
<section className={"curriculum-section"} id={"setup"}>
<h2>{"Setup and Starter Dataset"}</h2>
<p>{"Students can choose either track first. The website teaches both workflows directly; the only outside step is opening the tool you want to use for running code."}</p>
<div className={"track-grid"}>
<div className={"track-card"}>
<span className={"track-card__label"}>{"RStudio Track"}</span>
<h3>{"R in RStudio"}</h3>
<p>{"Use RStudio when your project is centered on statistical tests, group summaries, and clean publication-style plots."}</p>
<a className={"button secondary"} href={"rstudio.html"}>{"Start RStudio Track"}</a>
</div>
<div className={"track-card"}>
<span className={"track-card__label"}>{"Python Track"}</span>
<h3>{"Python with pandas, NumPy, and SciPy"}</h3>
<p>{"Use Python when your project needs programmable data cleaning, custom calculations, or notebook-based analysis."}</p>
<a className={"button secondary"} href={"python.html"}>{"Start Python Track"}</a>
</div>
</div>
</section>
<section className={"curriculum-section"} id={"modules"}>
<h2>{"Full Curriculum"}</h2>
<p>{"The sequence below works for an EBS research team, club workshop, or independent student. Each module includes a concept, a hands-on lab, and a checkpoint deliverable."}</p>
<div className={"module-list"}>
<article className={"module"}>
<div className={"module__num"}>{"1"}</div>
<div>
<h3>{"Research Questions and Data Types"}</h3>
<div className={"module__meta"}><span>{"Week 1"}</span><span>{"No code required"}</span></div>
<p>{"Turn a biology interest into an analyzable question and identify whether the data are categorical, numeric, time-series, sequence-based, or text/literature-based."}</p>
<div className={"module__grid"}>
<div className={"module__block"}><h3>{"Concept"}</h3><p>{"Variables, observations, population, sample, outcome, predictor, and confounder."}</p></div>
<div className={"module__block"}><h3>{"Lab"}</h3><p>{"Rewrite three broad biology topics as testable data questions."}</p></div>
<div className={"module__block"}><h3>{"Checkpoint"}</h3><p>{"Submit one research question plus the public dataset you plan to use."}</p></div>
</div>
</div>
</article>
<article className={"module"}>
<div className={"module__num"}>{"2"}</div>
<div>
<h3>{"Spreadsheets, CSV Files, and Reproducibility"}</h3>
<div className={"module__meta"}><span>{"Week 1"}</span><span>{"RStudio or Python"}</span></div>
<p>{"Learn why analysis should happen in code instead of manual spreadsheet edits. Set up a folder structure for data, scripts, outputs, and notes."}</p>
<div className={"module__grid"}>
<div className={"module__block"}><h3>{"Concept"}</h3><p>{"Tidy data, raw versus cleaned files, relative paths, and analysis logs."}</p></div>
<div className={"module__block"}><h3>{"Lab"}</h3><p>{"Import a CSV, inspect column names, preview rows, and save a cleaned copy."}</p></div>
<div className={"module__block"}><h3>{"Checkpoint"}</h3><p>{"Create a project folder with a README explaining the dataset source."}</p></div>
</div>
</div>
</article>
<article className={"module"}>
<div className={"module__num"}>{"3"}</div>
<div>
<h3>{"Data Cleaning and Quality Checks"}</h3>
<div className={"module__meta"}><span>{"Week 2"}</span><span>{"pandas / R data frames"}</span></div>
<p>{"Identify missing values, duplicated rows, impossible values, inconsistent units, and mixed data types before running statistics."}</p>
<div className={"module__grid"}>
<div className={"module__block"}><h3>{"Concept"}</h3><p>{"Missingness, outliers, data dictionaries, unit standardization, and audit trails."}</p></div>
<div className={"module__block"}><h3>{"Lab"}</h3><p>{"Clean a messy biological dataset and record every transformation."}</p></div>
<div className={"module__block"}><h3>{"Checkpoint"}</h3><p>{"Submit before/after row counts and a three-sentence cleaning rationale."}</p></div>
</div>
</div>
</article>
<article className={"module"}>
<div className={"module__num"}>{"4"}</div>
<div>
<h3>{"Descriptive Statistics"}</h3>
<div className={"module__meta"}><span>{"Week 3"}</span><span>{"NumPy / summary functions"}</span></div>
<p>{"Summarize distributions with counts, proportions, mean, median, standard deviation, interquartile range, and grouped summaries."}</p>
<div className={"module__grid"}>
<div className={"module__block"}><h3>{"Concept"}</h3><p>{"Central tendency, spread, skew, sample size, and biological interpretation."}</p></div>
<div className={"module__block"}><h3>{"Lab"}</h3><p>{"Build a grouped summary table comparing two biological conditions."}</p></div>
<div className={"module__block"}><h3>{"Checkpoint"}</h3><p>{"Write one paragraph explaining the most important summary result."}</p></div>
</div>
</div>
</article>
<article className={"module"}>
<div className={"module__num"}>{"5"}</div>
<div>
<h3>{"Visualization for Biology"}</h3>
<div className={"module__meta"}><span>{"Week 4"}</span><span>{"ggplot / matplotlib"}</span></div>
<p>{"Choose figure types that fit the question: bar charts for counts, scatter plots for relationships, box plots for distributions, and line charts for time."}</p>
<div className={"module__grid"}>
<div className={"module__block"}><h3>{"Concept"}</h3><p>{"Axes, labels, units, color, uncertainty, figure captions, and avoiding misleading scales."}</p></div>
<div className={"module__block"}><h3>{"Lab"}</h3><p>{"Create three figure drafts from the same dataset and choose the clearest one."}</p></div>
<div className={"module__block"}><h3>{"Checkpoint"}</h3><p>{"Export one poster-ready figure with a caption."}</p></div>
</div>
</div>
</article>
<article className={"module"}>
<div className={"module__num"}>{"6"}</div>
<div>
<h3>{"Statistical Testing with SciPy and RStudio"}</h3>
<div className={"module__meta"}><span>{"Week 5"}</span><span>{"SciPy / R tests"}</span></div>
<p>{"Select and run basic tests: chi-square, t-test, Mann-Whitney U, correlation, and simple linear regression."}</p>
<div className={"module__grid"}>
<div className={"module__block"}><h3>{"Concept"}</h3><p>{"Null hypothesis, p-values, effect size, confidence intervals, and assumptions."}</p></div>
<div className={"module__block"}><h3>{"Lab"}</h3><p>{"Run two candidate tests and justify which one fits the data better."}</p></div>
<div className={"module__block"}><h3>{"Checkpoint"}</h3><p>{"Submit a test-selection note with assumptions and limitations."}</p></div>
</div>
</div>
</article>
<article className={"module"}>
<div className={"module__num"}>{"7"}</div>
<div>
<h3>{"Public Biological Datasets"}</h3>
<div className={"module__meta"}><span>{"Week 6"}</span><span>{"NCBI / CDC / UniProt"}</span></div>
<p>{"Find data from public repositories and evaluate whether the metadata are complete enough for analysis."}</p>
<div className={"module__grid"}>
<div className={"module__block"}><h3>{"Concept"}</h3><p>{"Repository metadata, accession numbers, licensing, citation, and reproducibility."}</p></div>
<div className={"module__block"}><h3>{"Lab"}</h3><p>{"Locate one dataset and write a short data provenance statement."}</p></div>
<div className={"module__block"}><h3>{"Checkpoint"}</h3><p>{"Add formal dataset citations to your analysis README."}</p></div>
</div>
</div>
</article>
<article className={"module"}>
<div className={"module__num"}>{"8"}</div>
<div>
<h3>{"Modeling and Prediction"}</h3>
<div className={"module__meta"}><span>{"Week 7"}</span><span>{"Optional extension"}</span></div>
<p>{"Use simple models carefully: regression for relationships, classification for categories, and simulation for biological systems."}</p>
<div className={"module__grid"}>
<div className={"module__block"}><h3>{"Concept"}</h3><p>{"Training data, overfitting, validation, prediction versus explanation, and model limits."}</p></div>
<div className={"module__block"}><h3>{"Lab"}</h3><p>{"Fit a simple regression model and compare predictions to observed values."}</p></div>
<div className={"module__block"}><h3>{"Checkpoint"}</h3><p>{"Explain whether your model supports a biological claim or only describes a pattern."}</p></div>
</div>
</div>
</article>
<article className={"module"}>
<div className={"module__num"}>{"9"}</div>
<div>
<h3>{"Interpretation, Bias, and Limitations"}</h3>
<div className={"module__meta"}><span>{"Week 8"}</span><span>{"Research writing"}</span></div>
<p>{"Connect results back to the biological question without overstating conclusions. Identify sampling bias, measurement limits, and alternative explanations."}</p>
<div className={"module__grid"}>
<div className={"module__block"}><h3>{"Concept"}</h3><p>{"Correlation versus causation, confounding, multiple comparisons, and scope of inference."}</p></div>
<div className={"module__block"}><h3>{"Lab"}</h3><p>{"Write a limitations section for a published or sample analysis."}</p></div>
<div className={"module__block"}><h3>{"Checkpoint"}</h3><p>{"Submit three limitations and one next experiment or next analysis."}</p></div>
</div>
</div>
</article>
<article className={"module"}>
<div className={"module__num"}>{"10"}</div>
<div>
<h3>{"Reproducible Research Package"}</h3>
<div className={"module__meta"}><span>{"Week 9-10"}</span><span>{"Final assembly"}</span></div>
<p>{"Organize the final project so another student can rerun the analysis and understand the result."}</p>
<div className={"module__grid"}>
<div className={"module__block"}><h3>{"Concept"}</h3><p>{"README files, commented code, output folders, citations, and figure exports."}</p></div>
<div className={"module__block"}><h3>{"Lab"}</h3><p>{"Clean your project directory and rerun the notebook or script from start to finish."}</p></div>
<div className={"module__block"}><h3>{"Checkpoint"}</h3><p>{"Submit a reproducibility checklist with your abstract and poster draft."}</p></div>
</div>
</div>
</article>
</div>
</section>
<section className={"curriculum-section"} id={"tracks"}>
<h2>{"Choose How You Want to Analyze"}</h2>
<p>{"The two tool tracks are now separate pages so each one can teach from first principles without crowding the course map."}</p>
<div className={"track-grid"}>
<div className={"track-card"}>
<span className={"track-card__label"}>{"Notebook workflow"}</span>
<h3>{"Python Track"}</h3>
<p>{"Learn pandas for tables, NumPy for numeric arrays, and SciPy for statistical tests using an on-page biology dataset and guided exercises."}</p>
<a className={"button primary"} href={"python.html"}>{"Open Python Track"}</a>
</div>
<div className={"track-card"}>
<span className={"track-card__label"}>{"RStudio workflow"}</span>
<h3>{"RStudio Track"}</h3>
<p>{"Learn R data frames, formulas, grouped summaries, t-tests, and base plotting using the same built-in dataset and answer checks."}</p>
<a className={"button primary"} href={"rstudio.html"}>{"Open RStudio Track"}</a>
</div>
</div>
</section>
<section className={"curriculum-section"} id={"capstone"}>
<h2>{"Capstone Deliverables"}</h2>
<p>{"The curriculum ends with a small research package that can become the methods/results backbone of an EBS poster."}</p>
<div aria-label={"Scrollable data table"} className={"table-wrap"} role={"region"} tabIndex={0}><table className={"deliverable-table"}>
<thead>
<tr>
<th>{"Deliverable"}</th>
<th>{"What It Must Include"}</th>
<th>{"Quality Bar"}</th>
</tr>
</thead>
<tbody>
<tr>
<td>{"Research question"}</td>
<td>{"One sentence naming the biological system, variables, population, and expected analysis."}</td>
<td>{"Specific enough that another student could identify the needed dataset."}</td>
</tr>
<tr>
<td>{"Clean dataset"}</td>
<td>{"Raw data source, cleaned file, and a note explaining exclusions or transformations."}</td>
<td>{"No hidden manual edits. Cleaning steps are reproducible in code."}</td>
</tr>
<tr>
<td>{"Analysis notebook or script"}</td>
<td>{"Readable RStudio script or Python notebook with imports, cleaning, summaries, tests, and plots."}</td>
<td>{"Runs from top to bottom and produces the same result each time."}</td>
</tr>
<tr>
<td>{"Figure and caption"}</td>
<td>{"One main result figure with labeled axes, units, legend if needed, and a caption."}</td>
<td>{"The caption states the pattern and avoids overstating causation."}</td>
</tr>
<tr>
<td>{"Interpretation paragraph"}</td>
<td>{"Result, biological meaning, limitation, and one next step."}</td>
<td>{"Clear enough for a judge outside the exact subfield to follow."}</td>
</tr>
</tbody>
</table></div>
</section>
<section className={"curriculum-section"} id={"assessment"}>
<h2>{"Before You Present"}</h2>
<p>{"Use this checklist before moving from analysis into poster design."}</p>
<div className={"checklist"}>
<div className={"checklist__item"}><span>{"The research question can be answered by the dataset you actually used."}</span></div>
<div className={"checklist__item"}><span>{"All cleaning decisions are written down and justified."}</span></div>
<div className={"checklist__item"}><span>{"The chosen statistical test matches the data type and research question."}</span></div>
<div className={"checklist__item"}><span>{"Figures are readable without needing the full paper draft."}</span></div>
<div className={"checklist__item"}><span>{"The limitations section names what the analysis cannot prove."}</span></div>
</div>
<div className={"actions"}>
<a className={"button secondary"} href={"resources.html"}>{"Back to Resources"}</a>
<a className={"button primary"} href={"register.html"}>{"Register Interest"}</a>
</div>
</section>
</div>
</div>
</div>
</section>
</div>; }
