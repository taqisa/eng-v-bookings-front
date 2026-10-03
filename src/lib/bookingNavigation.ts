/** Only local booking routes are valid destinations after customer sign-in. */
export function safeBookingRedirect(value: string | null): string {
  if (!value || (value.includes('\\') || [...value].some(char => char.charCodeAt(0) <= 32))) return '/';
  try {
    const url = new URL(value, 'https://bookings.invalid');
    if (url.origin !== 'https://bookings.invalid' || !value.startsWith('/')) return '/';
    if (!/^\/(?:book|booking|booking-confirmation)\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)) return '/';
    return url.pathname + url.search;
  } catch { return '/'; }
}
