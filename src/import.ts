const importRe = /<import\s+src="([^"]+)"\s*\/?>/gi;
const componentRe = /<component[^>]*>([\s\S]*)<\/component>/i;

function extractComponent(content: string): string {
  const m = content.match(componentRe);
  return m ? m[1].trim() : content;
}

export async function resolveImports(html: string, baseUrl: string): Promise<string> {
  importRe.lastIndex = 0;
  if (!importRe.test(html)) return html;

  const absBase = new URL(baseUrl, location.href).href;
  const cache = new Map<string, string>();

  async function resolve(str: string, base: string, resolving: Set<string>): Promise<string> {
    const absUrl = new URL(base, location.href).href;
    if (resolving.has(absUrl)) return str;
    resolving = new Set(resolving).add(absUrl);

    const matches: { full: string; src: string; index: number }[] = [];
    let m: RegExpExecArray | null;
    importRe.lastIndex = 0;
    while ((m = importRe.exec(str)) !== null) {
      matches.push({ full: m[0], src: m[1], index: m.index });
    }

    if (matches.length === 0) return str;

    let result = '';
    let lastIdx = 0;

    for (const match of matches) {
      result += str.slice(lastIdx, match.index);

      const importUrl = new URL(match.src, absUrl).href;
      let content: string;

      if (cache.has(importUrl)) {
        content = cache.get(importUrl)!;
      } else {
        try {
          const res = await fetch(importUrl);
          content = await res.text();
          cache.set(importUrl, content);
        } catch {
          result += match.full;
          lastIdx = match.index + match.full.length;
          continue;
        }
      }

      const compContent = extractComponent(content);
      result += await resolve(compContent, importUrl, resolving);
      lastIdx = match.index + match.full.length;
    }

    result += str.slice(lastIdx);
    return result;
  }

  return resolve(html, absBase, new Set());
}
