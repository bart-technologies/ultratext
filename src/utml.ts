import { isUtml, extractTitle, extractBody } from './dom.js';
import { resolveImports } from './import.js';
import { initRouter } from './router.js';

async function loadUtml(url: string): Promise<void> {
  try {
    const res = await fetch(url);
    const html = await res.text();

    if (!isUtml(html)) {
      window.location.href = url;
      return;
    }

    const resolved = await resolveImports(html, url);
    const title = extractTitle(resolved);
    const body = extractBody(resolved);

    if (title) document.title = title;
    document.body.innerHTML = body;
  } catch {
    window.location.href = url;
  }
}

initRouter(loadUtml);
