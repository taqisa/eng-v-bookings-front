// Five seconds is a performance target, not a failure deadline. Allow a cold
// backend to finish; retain a safety limit for genuinely stalled requests.
export const AVAILABILITY_TIMEOUT_MS = 60000;

export class AvailabilityTimeoutError extends Error {
  constructor() {
    super('Availability request timed out');
    this.name = 'AvailabilityTimeoutError';
  }
}

export async function requestAvailability<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = AVAILABILITY_TIMEOUT_MS,
): Promise<{ status: number; ok: boolean; data: T }> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const signal = init.signal;
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', abort, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const data = await response.json() as T;
    return { status: response.status, ok: response.ok, data };
  } catch (error) {
    if (timedOut) throw new AvailabilityTimeoutError();
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
