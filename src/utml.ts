import { isUtml, extractTitle, extractBody, execScripts } from './dom.js';
import { processComponents } from './components.js';
import { resolveImports } from './import.js';
import { initRouter } from './router.js';

interface PageRecord {
  html: string;
  scrollY: number;
}

const cache = new Map<string, PageRecord>();

async function loadUtml(url: string, replace?: boolean): Promise<void> {
  const normalised = url.split('#')[0];

  try {
    const cached = cache.get(normalised);
    let html: string;

    if (cached) {
      html = cached.html;
    } else {
      document.documentElement.setAttribute('data-ultratext-loading', '');
      const res = await fetch(url);
      html = await res.text();

      if (!isUtml(html)) {
        window.location.href = url;
        return;
      }

      const resolved = await resolveImports(html, url);
      cache.set(normalised, { html: resolved, scrollY: 0 });
      html = resolved;
    }

    const title = extractTitle(html);
    const body = extractBody(html);

    if (replace) {
      history.replaceState({ url: normalised }, '', normalised);
    } else {
      history.pushState({ url: normalised }, '', normalised);
    }

    if (document.startViewTransition) {
      await document.startViewTransition(() => applyContent(title, body)).finished;
    } else {
      applyContent(title, body);
    }

    requestAnimationFrame(() => {
      const record = cache.get(normalised);
      if (record && record.scrollY > 0) {
        window.scrollTo(0, record.scrollY);
      } else {
        window.scrollTo(0, 0);
      }
    });

  } catch {
    window.location.href = url;
  } finally {
    document.documentElement.removeAttribute('data-ultratext-loading');
  }
}

function applyContent(title: string | null, body: string): void {
  if (title) document.title = title;
  document.body.innerHTML = body;
  processComponents(document.body);
  execScripts(document.body);
}

function saveScroll(): void {
  const url = location.href.split('#')[0];
  const record = cache.get(url);
  if (record) {
    record.scrollY = window.scrollY;
  }
}

window.addEventListener('beforeunload', saveScroll);

const origPushState = history.pushState.bind(history);
history.pushState = function (...args) {
  saveScroll();
  return origPushState(...args);
};

const origReplaceState = history.replaceState.bind(history);
history.replaceState = function (...args) {
  saveScroll();
  return origReplaceState(...args);
};

initRouter(loadUtml);
