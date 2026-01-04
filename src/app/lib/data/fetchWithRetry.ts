type RetryFetchOptions = {
  retries?: number;          // сколько попыток всего
  timeoutMs?: number;        // таймаут на одну попытку
  baseDelayMs?: number;      // базовая задержка перед ретраем
  maxDelayMs?: number;       // потолок задержки
  retryOnStatuses?: number[];// какие статусы ретраим
  fetchInit?: RequestInit;   // headers, next, cache и т.д.
  debugLabel?: string;       // метка в логах
};

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function backoffDelay(attemptIndex: number, baseDelayMs: number, maxDelayMs: number) {
  // attemptIndex: 0 для первой ошибки, 1 для второй...
  const exp = baseDelayMs * Math.pow(2, attemptIndex);
  const jitter = Math.floor(Math.random() * 250); // 0..249ms
  return Math.min(exp + jitter, maxDelayMs);
}

function isRetryableStatus(status: number, list: number[]) {
  return list.includes(status);
}

function isAbortError(err: unknown) {
  return err instanceof Error && (err.name === "AbortError" || /aborted/i.test(err.message));
}

export async function retryFetch(
  url: string,
  {
    retries = 3,
    timeoutMs = 8000,
    baseDelayMs = 600,
    maxDelayMs = 6000,
    retryOnStatuses = [408, 429, 500, 502, 503, 504],
    fetchInit,
    debugLabel,
  }: RetryFetchOptions = {},
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...fetchInit,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) return res;

      const retryable = isRetryableStatus(res.status, retryOnStatuses);
      const msg = `[retryFetch${debugLabel ? `:${debugLabel}` : ""}] ${res.status} ${res.statusText} (${attempt + 1}/${retries})`;

      if (!retryable) {
        throw new Error(`${msg} — non-retryable`);
      }

      lastError = new Error(`${msg} — retryable`);
    } catch (err) {
      clearTimeout(timeoutId);


      lastError = err;

      const isLast = attempt === retries - 1;
      if (isLast) break;

      const label = debugLabel ? `:${debugLabel}` : "";
      const reason = isAbortError(err) ? "timeout" : "network/error";
      console.warn(`[retryFetch${label}] attempt ${attempt + 1}/${retries} failed (${reason})`, err);
    }

    if (attempt < retries - 1) {
      const wait = backoffDelay(attempt, baseDelayMs, maxDelayMs);
      const label = debugLabel ? `:${debugLabel}` : "";
      console.warn(`[retryFetch${label}] retrying in ${wait}ms... (${retries - attempt - 1} left)`);
      await sleep(wait);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All retries failed");
}
