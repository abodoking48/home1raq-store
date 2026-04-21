export function buildSlugCandidates(rawSlug: string): string[] {
  const values = new Set<string>();
  const base = rawSlug.trim();
  if (base) values.add(base);

  try {
    const decoded = decodeURIComponent(base);
    if (decoded) values.add(decoded);
  } catch {
    // Keep original raw value only.
  }

  for (const value of Array.from(values)) {
    values.add(value.replace(/\+/g, "-"));
    values.add(value.replace(/\s+/g, "-"));
  }

  return Array.from(values).filter(Boolean);
}

