# Project: Exeter Biology Symposium (EBS)

## About
Student-run research symposium website for middle and high school students. 100% free. Event: April 24th, 2027. Organized by the Genetics and Biotech Club. Website is a multi-page marketing/registration site with static generation.

## Tech Stack
- **Frontend**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS 4 + CSS modules (styles.css)
- **Icons**: lucide-react
- **Animation**: motion/react
- **Architecture**: Multi-Page App (MPA) with SSG (prerender.mjs)
- **Deployment**: Static site (GitHub Pages via `npm run build`)
- **Package manager**: npm

## Architecture

### Vite Config
- Custom `reactShell` plugin transforms HTML files into React pages
- `appType: 'mpa'` for multi-page setup
- Prerender script generates static HTML at build time
- Entry points: 15 pages (about, datascience, faq, index, judges, opensource, python, register, researchers, resources, rstudio, schedule, schools, student-signup, team, volunteer-signup)

### File Structure
```
src/
  ├── pages/          → Individual React page components (.tsx)
  ├── site.tsx        → App shell (Header, Footer, routing logic)
  ├── page-routes.tsx → Route definitions
  ├── page-controls.tsx → Reusable controls (theme toggle, search)
  ├── main.tsx        → Entry point
  ├── entry-server.tsx → SSR entry
  ├── styles.css      → Global styles + Tailwind
  ├── search-data.json → Search index for site search
  └── vite-env.d.ts   → Type definitions
public/
  ├── images/         → Hero, team, resource photos
  └── ...
```

### Pages (15 total)
- **Index**: Hero section with carousel, guidance carousel, story sequence, mission, people grid, FAQ
- **About**: About the symposium
- **Team**: Team members (3 co-heads)
- **Schedule**: Event schedule
- **Resources**: Learning resources
- **Datascience**: Coding/data science track
- **FAQ**: Frequently asked questions
- **Python, RStudio**: Language-specific resources
- **Judges, Researchers, Schools**: Participant guides
- **Register**: Registration page
- **Student-signup, Volunteer-signup**: Forms (Google Forms links)
- **Open source**: Open source policy page

## Key Features

### Interactivity
- **Theme toggle**: Dark/light mode with localStorage persistence
- **Search dialog**: Client-side search across all pages (search-data.json)
- **Carousel/carousels**: Hero facts carousel, guidance carousel (with keyboard + mouse controls)
- **Story scroll**: Scroll-driven animation tracking (steps: Ask → Find → Analyze → Share)
- **Accessible navigation**: Skip to content, ARIA labels, details/summary dropdowns
- **Responsive images**: srcSet for hero images (480, 960, 1440, 1920px)

### Static Generation
- `prerender.mjs` script generates static HTML for all 15 pages at build time
- Each page becomes a standalone .html file
- No server needed—pure static hosting

### Accessibility
- Semantic HTML (details/summary, nav landmarks)
- ARIA labels and live regions
- Focus management (Escape closes dialogs)
- Respects `prefers-reduced-motion` (animations disabled for users)
- Keyboard navigation throughout

## Domain Model
- **Pages**: Static content + interactive components
- **Users**: Visitors (students, teachers, judges, volunteers)
- **Data**: Mostly static HTML/React content + search index
- **Forms**: Google Forms embedded (register, student-signup, volunteer-signup)

## External Integrations
- **Google Forms**: Used for registration (register.html, student-signup.html, volunteer-signup.html)
- **Images**: Stored in public/images/ (team photos, resource photos, event images)
- **SEO**: seo.config.json for meta tags, robots.txt, sitemap.xml

## Specific Rules

### Build & Dev
- Run `npm run dev` to start Vite dev server (port 5173)
- Run `npm run build` to typecheck, bundle, and prerender static HTML
- Run `npm run preview` to preview built output locally
- TypeScript: `npm run typecheck` for type checking

### Code Style
- **React**: Functional components only
- **Styling**: Tailwind CSS utility classes + global styles.css for custom components
- **State**: React hooks (useState, useEffect, useRef, useReducer)
- **Accessibility**: Always include ARIA labels, semantic HTML, keyboard support
- **Images**: Use responsive <picture> with srcSet for hero/large images
- **Type safety**: Full TypeScript, no `any` types

### Pages & Routing
- Each page in `src/pages/` becomes a route (e.g., about.tsx → about.html)
- Page component exported as default
- Route defined in `page-routes.tsx` (maps page name to component)
- Search index (`search-data.json`) must be updated when adding/removing pages

### Performance
- All images optimized (srcSet, lazy loading where appropriate)
- Prerender to static HTML (no runtime rendering overhead)
- Motion respects `prefers-reduced-motion` (no forced animations)
- CSS-in-JS avoided (Tailwind only)

### Search
- Client-side search (search-data.json contains title, url, description)
- Search results ranked by: exact title match (12pts) > title contains (7pts) > URL/description match (3pts)
- Update search-data.json when adding/modifying pages

### Theme & Personalization
- Dark/light mode toggle
- Stored in localStorage under `ebs-theme` key
- Defaults to OS preference (prefers-color-scheme)
- Gracefully degrades if localStorage unavailable

### SEO
- `seo.config.json`: Meta tag config for each page
- `sitemap.xml`: Auto-generated for search engines
- `robots.txt`: Search engine crawl rules
- Social media meta tags (OG image, etc.) in HTML templates

## External Resources
- **Images**: All stored in public/images/ (team, data analysis, posters, planning)
- **Google Forms**: Student registration, volunteer registration, school registration (embedded in pages)
- **Email**: exeterbiologysymposium@gmail.com (in footer)

## Current Focus
- **Site**: Live marketing + registration for April 24, 2027 event
- **Next**: Monitor registrations, add more resources/team bios as event approaches

## Deployment
- **Command**: `npm run build`
- **Output**: Static HTML files in dist/
- **Hosting**: GitHub Pages (or any static host)
- **CI**: Presumably GitHub Actions (check .github/workflows/)

## Testing
- No test files detected (unit/E2E testing not currently set up)
- Manual testing via `npm run dev` + browser
- Type checking via `npm run typecheck`

## Notes
- No backend API—100% static/client-side
- No database—content is static HTML/React
- No authentication—site is public
- Mobile-first responsive design
- High accessibility standards (WCAG compliant)

---

**Generated**: 2026-09-10 by Claude Code  
**Last updated**: —

