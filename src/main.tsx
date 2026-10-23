import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { NavigationApp } from './navigation-app';
import { AuthProvider } from './clerk-provider';
import './styles.css';

const page = document.body.dataset.reactPage ?? 'index.html';
const root = document.getElementById('root')!;
const app = <StrictMode><AuthProvider><NavigationApp initialPage={page} /></AuthProvider><SpeedInsights /></StrictMode>;
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
