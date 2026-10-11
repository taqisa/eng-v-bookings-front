import { ArrowUpRight, CalendarCheck, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import bookingGlobe from '@/assets/earth_3d.png';
import { BookingSiteFooter, BookingSiteHeader } from '@/components/BookingSiteChrome';
import '@/components/BookingHome.css';

export default function BookingWelcome() {
  return (
    <div className="booking-home">
      <BookingSiteHeader />
      <main>
        <section className="booking-home-hero" aria-labelledby="booking-home-title">
          <div className="booking-home-copy">
            <p className="booking-home-eyebrow">BOOKINGS · YOUR TIME, YOUR WAY</p>
            <h1 id="booking-home-title">Make space for <span>what matters.</span></h1>
            <p className="booking-home-description">
              Book with your provider, then keep your appointments and account details together in one place.
            </p>
            <Link className="booking-home-action" to="/account">
              <CalendarCheck size={18} aria-hidden="true" />
              <span>Manage my bookings</span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <p className="booking-home-hint">
              <Clock3 size={15} aria-hidden="true" />
              To book an appointment, use the booking link from your provider.
            </p>
          </div>

          <div className="booking-home-visual">
            <img src={bookingGlobe} alt="A glowing digital globe on a dark background" />
            <div className="booking-home-visual-shade" aria-hidden="true" />
            <div className="booking-home-card" role="group" aria-label="Bookings account features">
              <span className="booking-home-card-kicker">YOUR BOOKINGS</span>
              <div className="booking-home-card-row">
                <span className="booking-home-card-icon"><CalendarCheck size={18} aria-hidden="true" /></span>
                <span><strong>All in one place</strong><small>View upcoming appointments</small></span>
                <span className="booking-home-card-status" aria-hidden="true">✓</span>
              </div>
              <div className="booking-home-card-rule" />
              <p>Update your details or cancel a booking whenever plans change.</p>
            </div>
            <span className="booking-home-image-index" aria-hidden="true">BOOKINGS / 01</span>
          </div>
        </section>
      </main>
      <BookingSiteFooter />
    </div>
  );
}
