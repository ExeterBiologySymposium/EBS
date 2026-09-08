import { CodeBlock, ContactForm, RemoteSchedule, RemoteSessions } from '../page-controls';

export default function PageContent() { return <div className="page-layout layout-opensource">
<section className={"page-heading"}>
<div className={"shell"}>
<h1>{"EBS Open Source"}</h1>
<p className={"lead"}>{"Open datasets, code, and curriculum materials from the Exeter Biology Symposium community."}</p>
</div>
</section>
<p className={"embed-link shell"}><a href={"https://ebsopensource.vercel.app"} rel={"noopener noreferrer"} target={"_blank"}>{"Open EBS Open Source in a new tab"}</a></p><iframe className={"project-embed"} src={"https://ebsopensource.vercel.app"} title={"EBS Open Source project tools"} loading={"lazy"}></iframe>
</div>; }
