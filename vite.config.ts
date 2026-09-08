import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { basename, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

const routes = [
  'about.html', 'datascience.html', 'faq.html', 'index.html', 'judges.html',
  'opensource.html', 'python.html', 'register.html', 'researchers.html',
  'resources.html', 'rstudio.html', 'schedule.html', 'schools.html',
  'student-signup.html', 'team.html', 'volunteer-signup.html'
];

function reactShell() {
  return {
    name: 'ebs-react-shell',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html: string, ctx: { filename: string }) {
      const page = basename(ctx.filename);
      if (!routes.includes(page)) return html;
      const body = html.match(/<body([^>]*)>[\s\S]*?<\/body>/i);
      if (!body) return html;
      const shell = `<body${body[1]} data-react-page="${page}"><div id="root"></div></body>`;
      return html
        .replace(/<script\b[^>]*\bsrc=["'][^"']*js\/(?:main|appwrite-content)\.js[^"']*["'][^>]*><\/script>/gi, '')
        .replace(/<link\b[^>]*\bhref=["'][^"']*css\/(?:tailwind|style)\.css[^"']*["'][^>]*>/gi, '')
        .replace(/<link\b[^>]*\bhref=["']https:\/\/fonts\.(?:googleapis|gstatic)\.com[^"']*["'][^>]*>/gi, '')
        .replace(body[0], shell)
        .replace('</head>', '<script type="module" src="/src/main.tsx"></script></head>');
      }
    }
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [react(), tailwindcss(), reactShell()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(routes.map((route) => [route, resolve(root, route)]))
    },
    outDir: 'dist',
    emptyOutDir: true
  }
});
