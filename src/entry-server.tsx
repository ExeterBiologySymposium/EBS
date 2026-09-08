import { renderToString } from 'react-dom/server';
import { App } from './site';

export function render(page: string) {
  return renderToString(<App page={page} />);
}
