export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

export function uniqueSlug(base: string, existing: Set<string>): string {
  let slug = slugify(base);
  let i = 1;
  let candidate = slug;
  while (existing.has(candidate)) {
    candidate = `${slug}-${i++}`;
  }
  return candidate;
}
