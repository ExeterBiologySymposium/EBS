import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { basename, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clerkBuildDefines } from './scripts/clerk-config.js';

const root = dirname(fileURLToPath(import.meta.url));

const routes = [
  'admin.html', 'accept-invitation.html', 'account.html', 'contact.html', 'terms.html', 'privacy.html', 'events.html', 'about.html', 'datascience.html', 'faq.html', 'index.html', 'judges.html',
  'opensource.html', 'datasets.html', 'python.html', 'register.html', 'researchers.html',
  'resources.html', 'rstudio.html', 'schedule.html', 'schools.html',
  'student-signup.html', 'team.html'
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

function verifyLearningSeparation(): Plugin {
  return { name: 'verify-learning-separation', generateBundle(_options, bundle) {
    for (const chunk of Object.values(bundle)) {
      // src/learning/ holds member-only content modules (such as the dataset library catalog).
      if (chunk.type === 'chunk' && chunk.moduleIds.some(id => /src[\\/](?:(?:pages[\\/](resources|datascience|python|rstudio|opensource|datasets|events|accepted-account)|research-folder)\.tsx|learning[\\/].+\.tsx?)$/.test(id)) && !chunk.fileName.startsWith('protected-assets/')) {
        throw new Error('Protected learning content escaped its authenticated asset namespace.');
      }
      // Server modules hold member page content and storage code; they must never reach the browser.
      if (chunk.type === 'chunk' && chunk.moduleIds.some(id => /^(?:server|api)[\\/]/.test(relative(root, id)))) {
        throw new Error(`Server-only code was bundled into ${chunk.fileName}.`);
      }
    }
  } };
}

export default defineConfig({
  appType: 'mpa',
  define: clerkBuildDefines(process.env),
  plugins: [react(), tailwindcss(), reactShell(), verifyLearningSeparation()],
  build: {
    rolldownOptions: {
      output: {
        strictExecutionOrder: true,
        chunkFileNames: chunk => chunk.name.startsWith('learning') || ['resources', 'research-folder', 'events', 'accepted-account'].includes(chunk.name) ? 'protected-assets/[name]-[hash].js' : 'assets/[name]-[hash].js',
        codeSplitting: { groups: [
          // The dataset library is large, so it loads only on its own page; the name keeps it in protected-assets/.
          { name: 'learning-datasets', test: /src[\\/](?:pages[\\/]datasets\.tsx|learning[\\/]datasets[\\/][^\\/]+\.ts)$/, priority: 30, includeDependenciesRecursively: false },
          { name: 'learning', test: /src[\\/]pages[\\/](resources|datascience|python|rstudio|opensource|events|accepted-account)\.tsx$/, priority: 20, includeDependenciesRecursively: false },
        ] },
      },
      input: Object.fromEntries(routes.map((route) => [route, resolve(root, route)]))
    },
    outDir: 'dist',
    emptyOutDir: true
  }
});
