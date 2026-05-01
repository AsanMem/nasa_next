const HTML_ENTITY_MAP: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

export function sanitizePlainText(value?: string | null): string | undefined {
  if (!value) return undefined;

  const withoutBlocks = value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");

  const withoutTags = withoutBlocks.replace(/<[^>]+>/g, " ");

  const decoded = withoutTags.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code) => {
    const normalized = String(code).toLowerCase();

    if (normalized.startsWith("#x")) {
      const charCode = Number.parseInt(normalized.slice(2), 16);
      return Number.isFinite(charCode) ? String.fromCodePoint(charCode) : entity;
    }

    if (normalized.startsWith("#")) {
      const charCode = Number.parseInt(normalized.slice(1), 10);
      return Number.isFinite(charCode) ? String.fromCodePoint(charCode) : entity;
    }

    return HTML_ENTITY_MAP[normalized] ?? entity;
  });

  const clean = decoded.replace(/\s+/g, " ").trim();

  return clean.length > 0 ? clean : undefined;
}

export function truncatePlainText(value?: string | null, maxLength = 160): string | undefined {
  const clean = sanitizePlainText(value);

  if (!clean) return undefined;
  if (clean.length <= maxLength) return clean;

  return `${clean.slice(0, maxLength).trimEnd()}...`;
}
