interface SitemapEntry {
  path: string;
  label: string;
}

interface SitemapDir {
  dirs: Map<string, SitemapDir>;
  entries: SitemapEntry[];
}

export function processComponents(root: HTMLElement): void {
  root.querySelectorAll('sitemap').forEach(renderSitemap);
}

function renderSitemap(sitemap: Element): void {
  const title = childText(sitemap);
  const tree = buildSitemapTree(collectSitemapEntries(sitemap));

  sitemap.classList.add('utml-sitemap');
  sitemap.textContent = '';

  if (title) {
    const h = document.createElement('h2');
    h.className = 'utml-sitemap-title';
    h.textContent = title;
    sitemap.appendChild(h);
  }

  if (tree.dirs.size > 0 || tree.entries.length > 0) {
    sitemap.appendChild(renderSitemapTree(tree));
  }
}

function collectSitemapEntries(sitemap: Element): SitemapEntry[] {
  const base = new URL('.', location.href).href;
  const entries: SitemapEntry[] = [];

  for (const a of sitemap.querySelectorAll('a')) {
    const href = a.getAttribute('href');
    if (!href) continue;

    let url: URL;
    try {
      url = new URL(href, base);
    } catch {
      continue;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;

    const path = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean).join('/');
    const label = a.textContent?.trim() || labelFromPath(path);
    entries.push({ path, label });
  }

  return entries;
}

function buildSitemapTree(entries: SitemapEntry[]): SitemapDir {
  const tree: SitemapDir = { dirs: new Map(), entries: [] };

  for (const entry of entries) {
    const segments = entry.path.split('/').filter(Boolean);
    const file = segments.pop();
    if (!file) continue;

    let node = tree;
    for (const segment of segments) {
      let child = node.dirs.get(segment);
      if (!child) {
        child = { dirs: new Map(), entries: [] };
        node.dirs.set(segment, child);
      }
      node = child;
    }
    node.entries.push(entry);
  }

  return tree;
}

function renderSitemapTree(tree: SitemapDir): HTMLElement {
  const ul = document.createElement('ul');
  ul.className = 'utml-sitemap-list';

  const dirs = [...tree.dirs.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [name, dir] of dirs) {
    const li = document.createElement('li');
    li.className = 'utml-sitemap-dir';

    const dirname = document.createElement('span');
    dirname.className = 'utml-sitemap-dirname';
    dirname.textContent = name;
    li.appendChild(dirname);

    li.appendChild(renderSitemapTree(dir));
    ul.appendChild(li);
  }

  const entries = [...tree.entries].sort((a, b) => a.label.localeCompare(b.label));
  for (const entry of entries) {
    const li = document.createElement('li');
    li.className = 'utml-sitemap-link';

    const a = document.createElement('a');
    a.href = entry.path;
    a.textContent = entry.label;
    li.appendChild(a);

    ul.appendChild(li);
  }

  return ul;
}

function labelFromPath(path: string): string {
  const file = path.slice(path.lastIndexOf('/') + 1).replace(/\.[^.]*$/, '');
  const words = file.replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function childText(element: Element): string {
  let text = '';
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
  }
  return text.trim();
}
