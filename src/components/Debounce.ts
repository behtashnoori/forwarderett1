export function debounce<F extends (...args: unknown[]) => void>(fn: F, wait = 300) {
  let t: number | undefined;
  return (...args: Parameters<F>) => {
    if (t !== undefined) {
      window.clearTimeout(t);
    }
    t = window.setTimeout(() => fn(...args), wait);
  };
}
