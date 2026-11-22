import { copy, group, url } from '../fields.js';

export const definition = group("opensource", {
  pageHeading: group("Page heading", {
    title: copy("Page title", "EBS Open Source"),
    openDatasetsCodeCurriculumMaterialsFrom: copy("Text · Open datasets, code, and curriculum materials from the Exeter…", "Open datasets, code, and curriculum materials from the Exeter Biology Symposium community."),
  }),
  page: group("Page", {
    hrefOpenEbsOpenSourceNew: url("Link destination · Open EBS Open Source in a new tab", "https://ebsopensource.vercel.app", "link"),
    openEbsOpenSourceNewTab: copy("Link text · Open EBS Open Source in a new tab", "Open EBS Open Source in a new tab"),
    titleEbsOpenSourceProjectTools: copy("Embed title", "EBS Open Source project tools"),
  }),
});
