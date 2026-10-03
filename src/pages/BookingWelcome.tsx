import { BookingSiteHeader, BookingSiteFooter } from '@/components/BookingSiteChrome';
import '@/components/Confirmation.css';
export default function BookingWelcome() {
  return <div className="confirmation-page"><BookingSiteHeader /><main><div className="confirmation-empty"><div className="confirmation-eyebrow">WELCOME TO BOOKINGS</div><h1>Your next appointment starts here.</h1><p>Open the booking link shared by your provider to choose a service and find a time.</p></div></main><BookingSiteFooter /></div>;
}
