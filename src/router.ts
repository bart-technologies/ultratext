export function initRouter(loadFn: (url: string, replace?: boolean) => Promise<void>): void {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    if (a.hasAttribute('download') || a.target === '_blank') return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    if (!isSameOrigin(href)) return;

    e.preventDefault();
    const replace = a.hasAttribute('replace');
    loadFn(new URL(href, location.href).href, replace);
  });

  window.addEventListener('popstate', () => {
    loadFn(location.href, true);
  });
}

function isSameOrigin(url: string): boolean {
  try {
    return new URL(url, location.href).origin === location.origin;
  } catch {
    return false;
  }
}
