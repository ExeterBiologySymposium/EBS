import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-rstudio">
<section className={"page-heading"}>
<div className={"shell"}>
<h1>{"RStudio for Biology Data Analysis"}</h1>
<p className={"lead"}>{"This page teaches the RStudio workflow directly: build a project, read a data frame, summarize groups, run tests, make plots, and write a defensible result."}</p>
</div>
</section>
<section className={"section"}>
<div className={"shell"}>
<div className={"article-layout"}>
<aside className={"contents"}><details open={true}><summary>{"On this page"}</summary>
<nav aria-label={"RStudio lesson sections"} className={"contents-nav"}>
<a href={"#mental-model"}>{"Mental Model"}</a>
<a href={"#dataset"}>{"Dataset"}</a>
<a href={"#dataframes"}>{"Data Frames"}</a>
<a href={"#summaries"}>{"Summaries"}</a>
<a href={"#tests"}>{"Tests"}</a>
<a href={"#practice"}>{"Practice"}</a>
<a href={"#answers"}>{"Answer Key"}</a>
</nav>
<div className={"reading-note"}>
<h3>{"What you need"}</h3>
<ul>
<li>{"A place to run R code"}</li>
<li>{"The dataset printed on this page"}</li>
<li>{"No outside R tutorial"}</li>
</ul>
</div>
</details></aside>
<div>
<section className={"lesson"} id={"mental-model"}>
<h2>{"The RStudio Mental Model"}</h2>
<p>{"RStudio helps you keep a research project organized. Think in four parts: a script where your instructions live, a console where code runs, an environment where objects appear, and files/plots where outputs are stored."}</p>
<div className={"lesson-panel"}>
<h3>{"R Objects"}</h3>
<p>{"In R, you usually create an object and then ask questions about it. The assignment operator is "}<code>{"<-"}</code>{". Read it as \"gets.\""}</p>
<CodeBlock text={"activity <- c(11.2, 10.8, 11.5)\nmean(activity)"} />
<p className={"teacher-note"}><strong>{"Teacher note:"}</strong>{" A script is better than typing everything into the console because the script becomes your methods record. If a judge asks what you did, your script should answer."}</p>
</div>
</section>
<section className={"lesson"} id={"dataset"}>
<a className="dataset-download" href="/enzyme_activity.csv" download>Download practice dataset (CSV)</a>
<h2>{"Practice Dataset: Enzyme Activity"}</h2>
<p>{"This is the same dataset used in the Python track. The research question is: does the treatment condition increase enzyme activity compared with control?"}</p>
<div aria-label={"Scrollable data table"} className={"dataset-wrap"} role={"region"} tabIndex={0}>
<table className={"dataset-table"}>
<thead>
<tr><th>{"sample_id"}</th><th>{"condition"}</th><th>{"temperature_c"}</th><th>{"ph"}</th><th>{"enzyme_activity"}</th><th>{"cell_viability"}</th></tr>
</thead>
<tbody>
<tr><td>{"E01"}</td><td>{"control"}</td><td>{"37"}</td><td>{"7.2"}</td><td>{"11.2"}</td><td>{"96"}</td></tr>
<tr><td>{"E02"}</td><td>{"control"}</td><td>{"37"}</td><td>{"7.2"}</td><td>{"10.8"}</td><td>{"95"}</td></tr>
<tr><td>{"E03"}</td><td>{"control"}</td><td>{"37"}</td><td>{"7.1"}</td><td>{"11.5"}</td><td>{"94"}</td></tr>
<tr><td>{"E04"}</td><td>{"control"}</td><td>{"37"}</td><td>{"7.3"}</td><td>{"10.9"}</td><td>{"97"}</td></tr>
<tr><td>{"E05"}</td><td>{"control"}</td><td>{"37"}</td><td>{"7.2"}</td><td>{"11.0"}</td><td>{"96"}</td></tr>
<tr><td>{"E06"}</td><td>{"control"}</td><td>{"37"}</td><td>{"7.1"}</td><td>{"11.3"}</td><td>{"95"}</td></tr>
<tr><td>{"E07"}</td><td>{"treatment"}</td><td>{"39"}</td><td>{"7.2"}</td><td>{"14.1"}</td><td>{"93"}</td></tr>
<tr><td>{"E08"}</td><td>{"treatment"}</td><td>{"39"}</td><td>{"7.2"}</td><td>{"13.7"}</td><td>{"92"}</td></tr>
<tr><td>{"E09"}</td><td>{"treatment"}</td><td>{"39"}</td><td>{"7.1"}</td><td>{"14.5"}</td><td>{"91"}</td></tr>
<tr><td>{"E10"}</td><td>{"treatment"}</td><td>{"39"}</td><td>{"7.3"}</td><td>{"15.0"}</td><td>{"90"}</td></tr>
<tr><td>{"E11"}</td><td>{"treatment"}</td><td>{"39"}</td><td>{"7.2"}</td><td>{"13.9"}</td><td>{"92"}</td></tr>
<tr><td>{"E12"}</td><td>{"treatment"}</td><td>{"39"}</td><td>{"7.1"}</td><td>{"14.3"}</td><td>{"93"}</td></tr>
</tbody>
</table>
</div>
<CodeBlock text={"sample_id,condition,temperature_c,ph,enzyme_activity,cell_viability\nE01,control,37,7.2,11.2,96\nE02,control,37,7.2,10.8,95\nE03,control,37,7.1,11.5,94\nE04,control,37,7.3,10.9,97\nE05,control,37,7.2,11.0,96\nE06,control,37,7.1,11.3,95\nE07,treatment,39,7.2,14.1,93\nE08,treatment,39,7.2,13.7,92\nE09,treatment,39,7.1,14.5,91\nE10,treatment,39,7.3,15.0,90\nE11,treatment,39,7.2,13.9,92\nE12,treatment,39,7.1,14.3,93"} />
</section>
<section className={"lesson"} id={"dataframes"}>
<h2>{"Data Frames: Tables in R"}</h2>
<p>{"An R data frame is a table. Each row is one sample. Each column is one variable. Your first job is always to inspect the data before analyzing it."}</p>
<div className={"lesson-panel"}>
<h3>{"Read and Inspect"}</h3>
<CodeBlock text={"df <- read.csv(\"enzyme_activity.csv\")\n\nhead(df)\ndim(df)\nnames(df)\ntable(df$condition)\n\nclean <- subset(df, !is.na(condition) & !is.na(enzyme_activity))"} />
<p>{"The dollar sign selects one column from a data frame. For example, "}<code>{"df$condition"}</code>{" means \"the condition column inside df.\""}</p>
</div>
</section>
<section className={"lesson"} id={"summaries"}>
<h2>{"Grouped Summaries"}</h2>
<p>{"A grouped summary compares each condition. Here the key comparison is mean enzyme activity in control samples versus treatment samples."}</p>
<div className={"lesson-panel"}>
<h3>{"Base R Summary"}</h3>
<CodeBlock text={"aggregate(enzyme_activity ~ condition, clean, function(x) {\n  c(n = length(x), mean = mean(x), sd = sd(x))\n})\n\ncontrol <- subset(clean, condition == \"control\")$enzyme_activity\ntreatment <- subset(clean, condition == \"treatment\")$enzyme_activity\n\nmean(treatment) - mean(control)"} />
<p>{"The formula "}<code>{"enzyme_activity ~ condition"}</code>{" means: summarize enzyme activity separately for each condition."}</p>
</div>
</section>
<section className={"lesson"} id={"tests"}>
<h2>{"Statistical Tests and Plots"}</h2>
<p>{"R can run a Welch t-test directly from a formula. The test asks whether the group means are different relative to the variation within groups."}</p>
<div className={"lesson-panel"}>
<h3>{"Welch t-Test"}</h3>
<CodeBlock text={"result <- t.test(enzyme_activity ~ condition, data = clean)\nresult\nresult$p.value"} />
<h3>{"Simple Plot"}</h3>
<CodeBlock text={"boxplot(enzyme_activity ~ condition,\n        data = clean,\n        xlab = \"Condition\",\n        ylab = \"Enzyme activity\",\n        main = \"Treatment samples show higher enzyme activity\")"} />
<span className={"formula"}>{"Interpretation template: Treatment samples had a higher mean enzyme activity than controls. A Welch t-test gave p = Y. Because treatment samples also had lower viability, the poster should mention possible stress or toxicity as a limitation."}</span>
</div>
</section>
<section className={"lesson"} id={"practice"}>
<h2>{"Exercises"}</h2>
<div className={"practice-grid"}>
<div className={"practice-card"}>
<h3>{"Skill Check A"}</h3>
<ol>
<li>{"What does "}<code>{"enzyme_activity ~ condition"}</code>{" mean in plain English?"}</li>
<li>{"What is the mean enzyme activity for each condition?"}</li>
<li>{"What is the treatment minus control difference?"}</li>
</ol>
</div>
<div className={"practice-card"}>
<h3>{"Skill Check B"}</h3>
<ol>
<li>{"Run a grouped summary for "}<code>{"cell_viability"}</code>{"."}</li>
<li>{"Why is cell viability a possible limitation?"}</li>
<li>{"Write a one-sentence result for a poster."}</li>
</ol>
</div>
</div>
</section>
<section className={"lesson"} id={"answers"}>
<h2>{"Check Your Work"}</h2>
<details className={"answer"}>
<summary>{"Skill Check A Answers"}</summary>
<div>
<p><code>{"enzyme_activity ~ condition"}</code>{" means \"compare enzyme activity across condition groups.\" The control mean enzyme activity is about 11.12. The treatment mean is 14.25. The treatment group is higher by about 3.13 activity units."}</p>
</div>
</details>
<details className={"answer"}>
<summary>{"t-Test Answer"}</summary>
<div>
<p>{"R's default two-sample "}<code>{"t.test"}</code>{" uses Welch's method. The p-value is about 5.79e-07 for this dataset, which is strong evidence that the treatment and control groups differ in enzyme activity. The test does not prove the treatment is the only cause of the difference."}</p>
</div>
</details>
<details className={"answer"}>
<summary>{"Skill Check B Answers"}</summary>
<div>
<p>{"Mean cell viability is 95.5 for control and 91.83 for treatment. That is a limitation because the treatment condition may be changing both enzyme activity and cell health. A good poster sentence would be: \"Treatment samples showed higher enzyme activity than controls, but lower treatment viability suggests the effect should be interpreted alongside possible cell stress.\""}</p>
</div>
</details>
<div className={"actions"}>
<a className={"button secondary"} href={"datascience.html"}>{"Back to Curriculum"}</a>
<a className={"button primary"} href={"python.html"}>{"Compare Python Track"}</a>
</div>
</section>
</div>
</div>
</div>
</section>
</div>; }
