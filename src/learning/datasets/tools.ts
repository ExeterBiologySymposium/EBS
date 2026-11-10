// Tool guides for the Dataset library. Menu and button names match each tool's
// current interface (esquisse 2.1, Galaxy's Activity Bar layout, iDEP 2.4,
// bibliometrix 5.5). Update them here when a tool changes its labels.
import type { GuideToolKey, ToolGuide, ToolKey } from './types';

export const toolLabels: Record<ToolKey, string> = {
  esquisse: 'esquisse',
  galaxy: 'Galaxy',
  idep: 'iDEP',
  biblioshiny: 'biblioshiny',
  code: 'R or Python',
};

/** "Which tool fits your data?" rows, in reading order. */
export const toolChoices: { tool: GuideToolKey; data: string; place: string; example: string }[] = [
  { tool: 'esquisse', data: 'A table or spreadsheet: measurements, survey answers, case counts, species records', place: 'RStudio, or online', example: 'Penguin body measurements; county health statistics' },
  { tool: 'galaxy', data: 'DNA or RNA sequences: sequencing reads, genomes, alignments or trees (FASTQ, FASTA, BAM, VCF)', place: 'Web browser', example: '16S gut-microbiome reads; virus genomes for a family tree' },
  { tool: 'idep', data: 'A gene expression table: genes in rows, samples in columns (RNA-seq counts, microarray, proteomics)', place: 'Web browser', example: 'Treated vs untreated cells from NCBI GEO' },
  { tool: 'biblioshiny', data: 'A list of publications exported from a literature database', place: 'RStudio (opens in your browser)', example: 'Every PubMed paper on CRISPR in agriculture' },
];

export const toolGuides: ToolGuide[] = [
  {
    key: 'esquisse',
    name: 'esquisse',
    tagline: 'Make charts by dragging and dropping, then copy the R code that draws them.',
    summary: 'esquisse is a free R package from dreamRs that opens a point-and-click chart builder. Drag columns onto the x-axis, y-axis, color or facets, and esquisse draws the chart with ggplot2, the most widely used plotting package in R. It writes the code for every chart, so your figures are reproducible.',
    bestFor: 'Exploring any table: measurements, survey answers, case counts, species records and spreadsheets.',
    accepts: 'CSV, TXT and Excel files, SPSS (.sav) and SAS (.sas7bdat) files, data frames already in R, pasted cells, or a link to a Google Sheet or CSV file.',
    runsIn: 'R and RStudio on your computer, or the free online version in a web browser.',
    account: 'None needed.',
    steps: [
      { title: 'Install it once', detail: 'Install R and RStudio (see the EBS R / RStudio lessons), then run this in the RStudio console. To try esquisse without installing anything, use the online version instead.', code: { language: 'R', text: 'install.packages("esquisse")' } },
      { title: 'Open the chart builder', detail: 'In RStudio, choose Addins → ‘ggplot2’ builder, or run esquisser() in the console. To start with a data frame, pass it in, for example esquisser(my_data).', code: { language: 'R', text: 'library(esquisse)\nesquisser()' } },
      { title: 'Import your data', detail: 'If you did not pass in a data frame, the Import data window opens. Choose Environment (data already in R, including datasets from packages), External file, Copy / Paste, Googlesheets or URL. Check the preview before you import.' },
      { title: 'Drag variables onto the chart', detail: 'Drag column names into the X, Y, fill, color, size, group and facet boxes. esquisse picks a suitable chart type from your data; choose another one, such as a boxplot or scatter plot, under Geometries.' },
      { title: 'Polish the chart', detail: 'Use the menus under the chart: Labels & Title for clear titles and units, Axes for limits and log scales, Theme for colors and fonts, Options for settings such as smoothing lines, and Data to filter rows (for example, one species or year).' },
      { title: 'Save the chart and its code', detail: 'Open Code to copy the ggplot2 code, including your filters, or insert it into your script. Export saves the chart as PNG, PDF, SVG, JPEG or PowerPoint. Paste the code into your research document.' },
    ],
    tips: [
      'Use tidy data: one row per observation and one column per variable. A table with one column per year is easier to chart after reshaping it in R with tidyr::pivot_longer().',
      'esquisse reads .csv and .txt files with commas, tabs or semicolons. Rename .tsv files to .txt, and unzip .gz or .zip downloads before importing.',
      'Check column types with Update variables: numbers stored as text will not plot on a continuous axis, and a number such as a dose can be changed to a category.',
      'The online version runs on a shared server: do not upload private or personal data, and download your chart and code before closing the tab.',
      'A chart shows a pattern, not proof. Follow up with a statistical test in R before you draw conclusions.',
    ],
    links: [
      { label: 'Open esquisse online', url: 'https://dreamrs.shinyapps.io/esquisse/' },
      { label: 'esquisse documentation', url: 'https://dreamrs.github.io/esquisse/' },
      { label: 'Get started with esquisse', url: 'https://dreamrs.github.io/esquisse/articles/get-started.html' },
      { label: 'EBS R / RStudio lessons', url: 'rstudio.html' },
    ],
  },
  {
    key: 'galaxy',
    name: 'Galaxy',
    tagline: 'Run professional bioinformatics tools in your browser, with no coding or installation.',
    summary: 'Galaxy is a free, open-source web platform that runs thousands of research tools on powerful remote servers. Every step is recorded in a history, so you can share, repeat and turn your analysis into a workflow. The Galaxy Training Network has hundreds of step-by-step tutorials, each with ready-to-use data.',
    bestFor: 'Sequencing reads, genomes, sequence alignments and phylogenetic trees, and tables too large for a spreadsheet.',
    accepts: 'FASTQ, FASTA, BAM, VCF, BED, tabular text and many other formats, uploaded from your computer, a web link or public archives such as NCBI SRA.',
    runsIn: 'Your web browser; the computing happens on Galaxy’s servers.',
    account: 'A free account, so your histories are saved.',
    steps: [
      { title: 'Create a free account', detail: 'Open Galaxy, select Register at the top, and confirm the email Galaxy sends you. Log in each time so your work is saved.' },
      { title: 'Learn the layout', detail: 'The Activity Bar on the left opens Tools, Workflows and Histories. The center panel shows tool forms and results. Your current History, with every file and result, is on the right.' },
      { title: 'Name your history', detail: 'Select the pencil icon next to “Unnamed history” and type your project name. Start a new history for each analysis.' },
      { title: 'Upload data', detail: 'Select Upload in the Activity Bar. Choose local files, or select Paste/Fetch data and paste a web link (for example, a Zenodo link from a tutorial). Select Start, then Close. Each file becomes a dataset in your history: gray is queued, yellow is running, green is ready and red is an error.' },
      { title: 'Check each file’s type', detail: 'Galaxy guesses each file’s format. If it is wrong, select the dataset’s pencil icon, open Datatypes, choose the correct type (most sequencing reads are fastqsanger) and select Save.' },
      { title: 'Find and run a tool', detail: 'Search the Tools panel (for example FastQC, MAFFT or Datamash), fill in the form and select Run Tool. Results appear at the top of your history; select the eye icon to view one.' },
      { title: 'Share and reuse', detail: 'Open History options and choose Share or Publish to create a link for the EBS team, or Extract workflow to rerun every step on new data.' },
    ],
    tips: [
      'Start with a Galaxy Training Network tutorial in your field: each lists its data and the exact tool settings, so you learn the method before using your own data.',
      'Tutorials list the Galaxy servers that have their tools. If a tool is missing from usegalaxy.org, use another public server the tutorial names, such as usegalaxy.eu.',
      'Fetch reads straight from NCBI SRA with the tool Faster Download and Extract Reads in FASTQ, using run accessions that start with SRR, ERR or DRR.',
      'Delete and purge datasets you no longer need so you stay within your storage limit.',
      'Galaxy records every setting. Share your history link at each EBS checkpoint so the team can review your methods.',
    ],
    links: [
      { label: 'Open Galaxy', url: 'https://galaxy-main.usegalaxy.org/' },
      { label: 'A short introduction to Galaxy', url: 'https://training.galaxyproject.org/training-material/topics/introduction/tutorials/galaxy-intro-short/tutorial.html' },
      { label: 'Galaxy Training Network', url: 'https://training.galaxyproject.org/' },
      { label: 'Galaxy Help forum', url: 'https://help.galaxyproject.org/' },
    ],
  },
  {
    key: 'idep',
    name: 'iDEP',
    tagline: 'Find the genes and pathways that change between conditions, without writing code.',
    summary: 'iDEP (integrated Differential Expression and Pathway analysis) is a free web app from South Dakota State University for gene expression data from RNA-seq, microarrays or proteomics. Upload a table of genes by samples and it guides you through quality checks, clustering, differential expression with DESeq2 or limma, and pathway analysis, with downloadable plots.',
    bestFor: 'Comparing gene activity between conditions, such as treated vs control cells or tumor vs normal tissue.',
    accepts: 'CSV, tab-delimited text or Excel files up to 100 MB, with genes in rows and samples in columns, plus an optional experimental design file.',
    runsIn: 'Your web browser.',
    account: 'None needed. Free for non-commercial use.',
    steps: [
      { title: 'Prepare your table', detail: 'Put gene IDs in the first column (Ensembl IDs, gene symbols and many other ID types work) and one column per sample. For RNA-seq, use raw read counts, not normalized values. Name samples group_replicate, for example Control_1, Control_2, Treated_1, Treated_2, and avoid hyphens and dots.' },
      { title: 'Choose species and data type', detail: 'On the Data tab, select your species, then a data type: Read counts data, Normalized expression data (TPM, FPKM, microarray or proteomics), Fold changes & adjusted p-values, or Fold changes only.' },
      { title: 'Upload, or practise with a demo', detail: 'Upload your expression file, or select Demo Data to practise first. If sample names cannot describe your design (for example paired samples or two factors), upload an experimental design file or use + Create design.' },
      { title: 'Check quality', detail: 'On Prep, review the filtering and transformation settings and plots. On Cluster and PCA, check that replicates group together; a sample far from its group may be an outlier worth investigating.' },
      { title: 'Compare conditions', detail: 'On Stats, choose your comparisons (for example Treated vs Control) and run DESeq2 for read counts, or limma. Then open DEG to explore the gene list, Volcano Plot and MA Plot.' },
      { title: 'Interpret pathways', detail: 'On Pathway, run gene-set analysis (for example GO or KEGG) to see which biological processes change. Download plots and tables; Stats → R Code shows the code behind the analysis.' },
    ],
    tips: [
      'Have at least three replicates per group if you can; with fewer, statistics are unreliable.',
      'For public RNA-seq studies, use raw counts. On NCBI GEO, many human and mouse series offer NCBI-generated RNA-seq counts on their download page.',
      'Gene IDs are converted automatically. If many fail to match, check that you chose the right species.',
      'Record every setting you change (filters, transformations and thresholds) in your research log.',
      'iDEP is updated often: note the version shown in the app when you cite it.',
    ],
    links: [
      { label: 'Open iDEP', url: 'https://bioinformatics.sdstate.edu/idep/' },
      { label: 'iDEP documentation', url: 'https://idepsite.wordpress.com/' },
      { label: 'iDEP paper (BMC Bioinformatics, 2018)', url: 'https://bmcbioinformatics.biomedcentral.com/articles/10.1186/s12859-018-2486-6' },
    ],
  },
  {
    key: 'biblioshiny',
    name: 'biblioshiny',
    tagline: 'Map a research field from a list of publications: trends, leading authors, themes and citations.',
    summary: 'biblioshiny is the point-and-click interface of bibliometrix, a free R package for science mapping. Load the records you export from a literature database, and it shows how a field has grown, who publishes most, which papers are cited most, and how topics and collaborations connect.',
    bestFor: 'Bibliometric studies and literature reviews built from the results of a database search.',
    accepts: 'Exports from PubMed, OpenAlex, Lens.org, Dimensions, the Cochrane Library, Scopus and Web of Science; it can also fetch records from OpenAlex and PubMed directly.',
    runsIn: 'R and RStudio on your computer; the app opens in your web browser.',
    account: 'None for biblioshiny. Some databases need a free account to export.',
    steps: [
      { title: 'Install and launch', detail: 'Run these lines in the RStudio console. biblioshiny opens in your web browser.', code: { language: 'R', text: 'install.packages("bibliometrix")\nlibrary(bibliometrix)\nbiblioshiny()' } },
      { title: 'Search a database', detail: 'Write a focused search: use quotation marks for exact phrases and filters for years and article types. Record the exact query, database, date and number of results.' },
      { title: 'Export your records', detail: 'Export in a supported format, for example PubMed’s Save → Format: PubMed (a .txt file), an OpenAlex CSV, or a Lens.org CSV.' },
      { title: 'Load the file', detail: 'Open Data → Import or Load, choose Import raw file(s), select the database your file came from and upload it. To practise first, choose Use a sample collection. Data → API can fetch records straight from OpenAlex or PubMed.' },
      { title: 'Refine the collection', detail: 'Use Filters to limit years, document types or sources. Merge Collections combines exports from different databases, and PRISMA Diagram documents how you selected records.' },
      { title: 'Explore and export', detail: 'Start with Overview → Main Information and Annual Scientific Production. Then explore Sources, Authors and Documents (including Most Frequent Words and Trend Topics), and the Conceptual, Intellectual and Social Structure maps. Download plots and tables, and use Report to collect results in one Excel file.' },
    ],
    tips: [
      'PubMed records do not include cited references or citation counts, so citation analyses will be empty. Fetch from OpenAlex with Data → API for full records, including references.',
      'CSV exports from the OpenAlex website also lack cited references; the API route includes them.',
      'To load several export files from the same database (for example Web of Science batches), put them in one .zip file and import that.',
      'A focused question with a few hundred to a few thousand records is easier to interpret than a huge collection.',
      'Citation counts measure attention, not quality: a paper can be cited often because others disagree with it.',
    ],
    links: [
      { label: 'biblioshiny', url: 'https://www.bibliometrix.org/biblioshiny/' },
      { label: 'bibliometrix website', url: 'https://www.bibliometrix.org/' },
      { label: 'bibliometrix on CRAN', url: 'https://cran.r-project.org/package=bibliometrix' },
    ],
  },
];
