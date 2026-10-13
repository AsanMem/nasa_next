/** Per-sequence loader. Rejected images can be retried; only decoded frames are committed. */
export function createFrameLoader(load: (url: string) => Promise<void>) {
  const cache = new Map<string, Promise<void>>();
  let revision = 0;
  const preload = (url: string) => {
    let pending = cache.get(url);
    if (!pending) {
      pending = load(url).catch(error => { cache.delete(url); throw error; });
      cache.set(url, pending);
    }
    return pending;
  };
  return {
    preload,
    cancel() { revision++; },
    async show(url: string, commit: () => void, fail: () => void) {
      const request = ++revision;
      try { await preload(url); if (request === revision) commit(); }
      catch { if (request === revision) fail(); }
    },
  };
}
export function decodeFrame(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => { image.decode().then(resolve, reject); };
    image.onerror = () => reject(new Error('Frame unavailable'));
    image.src = url;
  });
}
