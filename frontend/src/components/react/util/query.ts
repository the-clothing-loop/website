export default function getQuery(...keys: string[]): string[] {
  if (!globalThis.window) return keys.map(() => "");
  const s = new URLSearchParams(window.location.search);
  return keys.map((k) => s.get(k)) as string[];
}
