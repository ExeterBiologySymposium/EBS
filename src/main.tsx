import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './site';
import './styles.css';

const page = document.body.dataset.reactPage ?? 'index.html';
const root = document.getElementById('root')!;
const app = <StrictMode><App page={page} /></StrictMode>;
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
