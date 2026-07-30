export function isUtml(html: string): boolean {
  return /^\s*<!DOCTYPE\s+UTML\s*>/i.test(html);
}

export function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1] : '';
}

export function extractBody(html: string): string {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : html;
}

export function execScripts(root: HTMLElement): void {
  const scripts = root.querySelectorAll('script');
  for (const old of scripts) {
    const s = document.createElement('script');
    for (const attr of old.attributes) {
      s.setAttribute(attr.name, attr.value);
    }
    s.textContent = old.textContent;
    old.replaceWith(s);
  }
}
