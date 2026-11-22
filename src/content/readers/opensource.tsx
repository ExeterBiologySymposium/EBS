import { useEditorialContent, safeCopyUrl, usePageCopyState } from '../page-copy';
import type { definition } from '../copy/opensource';
import type { Value } from '../fields';


export default function PageContent() {
  const preview = usePageCopyState()?.preview;
  const editorial = useEditorialContent<Value<typeof definition>>('opensource'); return <div className="page-layout layout-opensource">
<section className={"page-heading"}>
<div className={"shell"}>
<h1>{editorial.pageHeading.title}</h1>
<p className={"lead"}>{editorial.pageHeading.openDatasetsCodeCurriculumMaterialsFrom}</p>
</div>
</section>
<p className={"embed-link shell"}><a href={safeCopyUrl(editorial.page.hrefOpenEbsOpenSourceNew)} rel={"noopener noreferrer"} target={"_blank"}>{editorial.page.openEbsOpenSourceNewTab}</a></p>{!preview && <iframe className={"project-embed"} src={"https://ebsopensource.vercel.app"} title={editorial.page.titleEbsOpenSourceProjectTools} loading={"lazy"}></iframe>}
</div>; }
