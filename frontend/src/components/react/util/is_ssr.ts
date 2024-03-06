export default function isSSR() {
  return !globalThis.window;
}
