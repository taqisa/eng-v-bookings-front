import { CalendarDays } from 'lucide-react';
import './BookingTheme.css';

// Provider booking links are self-contained: no marketplace/account navigation.
export function BookingSiteHeader() {
  return <header className="booking-site-header"><div><span className="booking-brand"><CalendarDays size={24} aria-hidden="true" />Bookings</span><span className="booking-site-caption">A little time, just for you.</span></div></header>;
}

export function BookingSiteFooter() {
  return <footer className="booking-site-footer">© {new Date().getFullYear()} Bookings <span>Appointments made simple.</span></footer>;
}
