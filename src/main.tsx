import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { App } from './site';
import './styles.css';

const page = document.body.dataset.reactPage ?? 'index.html';
const root = document.getElementById('root')!;
const app = <StrictMode><App page={page} /><SpeedInsights /></StrictMode>;
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
