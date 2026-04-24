/**
 * Build OR-clause values for matching `Product.slug` against the URL segment.
 * Handles URL encoding, `+` vs space, hyphenated links vs DB slugs with spaces, etc.
 */
const SLUG_TRANSFORMS: readonly ((s: string) => string)[] = [
  (s) => s.replace(/\+/g, " "),
  (s) => s.replace(/\+/g, "-"),
  (s) => s.replace(/\s+/g, "-"),
  (s) => s.replace(/-/g, " "),
  (s) => s.replace(/_/g, " "),
  (s) => s.replace(/-/g, " ").replace(/\s+/g, " ").trim(),
  (s) => s.replace(/\s+/g, " ").trim(),
];

export function buildSlugCandidates(rawSlug: string): string[] {
  const set = new Set<string>();
  const base = rawSlug.trim();
  if (base) set.add(base);

  try {
    const decoded = decodeURIComponent(base);
    const d = decoded.trim();
    if (d) set.add(d);
  } catch {
    // Malformed escape sequences: keep trimmed raw only.
  }

  let prevSize = -1;
  let guard = 0;
  while (set.size !== prevSize && guard < 8) {
    prevSize = set.size;
    guard += 1;
    const snapshot = Array.from(set);
    for (const value of snapshot) {
      for (const transform of SLUG_TRANSFORMS) {
        const next = transform(value);
        if (next) set.add(next);
      }
    }
  }

  return Array.from(set).filter(Boolean);
}
