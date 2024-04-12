export default function wrapIndex(i: number, l: number): number {
  const m = i % l;
  return m < 0 ? m + l : m;
}
