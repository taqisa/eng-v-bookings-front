export interface BookingDraft {
  date: string;
  time: string;
  notes: string;
  serviceId: string;
  duration: number;
}
const key = (providerId: string) => `bookings:booking-draft:${providerId}`;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Keep customer notes in this tab only, never in URLs or persistent localStorage.
export function saveBookingDraft(providerId: string, draft: BookingDraft) {
  sessionStorage.setItem(key(providerId), JSON.stringify({ draft, savedAt: Date.now() }));
}

export function clearBookingDraft(providerId: string) {
  try { sessionStorage.removeItem(key(providerId)); } catch { /* Storage may be disabled. */ }
}

export function readBookingDraft(providerId: string): BookingDraft | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(key(providerId)) || 'null');
    const draft = value?.draft;
    const age = Date.now() - value?.savedAt;
    if (!Number.isFinite(value?.savedAt) || age < 0 || age > MAX_AGE_MS || !draft ||
      typeof draft.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(draft.date) ||
      typeof draft.time !== 'string' || !draft.time || draft.time.length > 40 ||
      typeof draft.notes !== 'string' || draft.notes.length > 2000 ||
      typeof draft.serviceId !== 'string' || !draft.serviceId || draft.serviceId.length > 200 ||
      !Number.isFinite(draft.duration) || draft.duration <= 0) {
      clearBookingDraft(providerId);
      return null;
    }
    return { date: draft.date, time: draft.time, notes: draft.notes, serviceId: draft.serviceId, duration: draft.duration };
  } catch { clearBookingDraft(providerId); return null; }
}
