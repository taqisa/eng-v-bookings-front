// src/pages/BookingPage.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Star, MapPin, Phone, Award, ArrowUpRight, MessageCircle } from "lucide-react";
import { BookingSiteHeader as Header, BookingSiteFooter as Footer } from "@/components/BookingSiteChrome";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EnhancedModernCalendar from "@/components/EnhancedModernCalendar";
import { Database } from "@/integrations/supabase/types";
import { API_BASE_URL } from "@/lib/utils";

import { appointmentDate, appointmentTime } from '@/lib/appointmentCard';
import { saveBookingDraft, readBookingDraft, clearBookingDraft } from '@/lib/bookingDraft';
import { clockParts } from '@/lib/timeSlots';
import { requestAvailability } from '@/lib/availability-request';
import '@/components/Confirmation.css';
import '@/components/BookingTheme.css';


// Manually define types missing from the generated Database type
interface ServiceRow {
  id: string;
  name: string;
  duration_minutes: number;

}

// Extend existing Provider type to include missing fields found in usage
type BaseProvider = Database['public']['Tables']['providers']['Row'];
interface Provider extends BaseProvider {
  provider_type_id?: string;

}

// Fix experience strings that have the number at the end, e.g. "years of experience in Family Medicine 8"
const formatExperience = (exp: string): string => {
  const match = exp.match(/^(.+?)\s+(\d+)$/);
  if (match) {
    return `${match[2]} ${match[1]}`;
  }
  return exp;
};

interface BookingPageProps {
  providerIdProp?: string;
}

const BookingPage = ({ providerIdProp }: BookingPageProps) => {
  const { providerId: routeProviderId } = useParams<{ providerId: string }>();
  const providerId = providerIdProp || routeProviderId;
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const clientLabel = 'Service';
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    notes: "",
    serviceId: null as string | null,
    duration: 30
  });
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const confirmationSectionRef = useRef<HTMLDivElement>(null);
  const submissionLock = useRef(false);
  const providerRequest = useRef(0);

  useEffect(() => {
    if (showConfirmation) {
      confirmationSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showConfirmation]);

  const fetchProvider = useCallback(async () => {
    if (!providerId) {
      console.error('🔴 [FETCH] No providerId provided');
      toast.error('Provider ID not found');
      return;
    }

    const request = ++providerRequest.current;
    setLoading(true);
    setProvider(null);
    setServices([]);
    try {
      const { data: providerData, error: providerError } = await (supabase
        .from('providers')
        .select(`
          id,
          name,
          google_calendar_connected,
          active_google_account_id,
          working_days,
          working_hours_start,
          working_hours_end,
          break_start,
          break_end,
          slot_duration,
          provider_type_id,
          display_name,
          specialty,
          rating,
          review_count,
          experience,
          location,
          phone,
          whatsapp,
          image_filename
        `)
        .eq('id', providerId)
        .single() as unknown as PromiseLike<{ data: Provider | null; error: { message: string; details: string } | null }>);

      if (request !== providerRequest.current) return;
      if (providerError || !providerData) {
        console.error('🔴 [FETCH] Error fetching provider:', providerError?.message, providerError?.details);
        toast.error('Provider not found');

        return;
      }

      const { data: servicesData, error: servicesError } = await (
        // services exists in the deployed schema but not in generated types.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from('services')
        .select('id, name, duration_minutes')
        .eq('provider_id', providerId) as PromiseLike<{ data: ServiceRow[] | null; error: { message: string; details: string } | null }>);
      let sanitizedServices: ServiceRow[] = [];
      if (servicesError) {
        console.error('🔴 [FETCH] Error fetching services:', servicesError.message, servicesError.details);
        toast.error('Failed to fetch services');
      } else if (servicesData && servicesData.length > 0) {
        sanitizedServices = servicesData.map(service => ({
          ...service,
          name: service.name && service.name.trim() !== '' ? service.name : 'Unnamed Service',
          duration_minutes: service.duration_minutes || 30
        }));
      } else {
        console.warn('🔴 [FETCH] No services found for provider:', providerId);
        toast.warning('No services available for this provider');
      }
      if (request !== providerRequest.current) return;
      setServices(sanitizedServices);

      setProvider(providerData);
    } catch (error) {
      if (request !== providerRequest.current) return;
      console.error('🔴 [FETCH] Exception:', error);
      toast.error('Error loading data');
      setServices([]);
    } finally {
      if (request === providerRequest.current) setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    const draft = providerId && new URLSearchParams(location.search).get('resume') === '1'
      ? readBookingDraft(providerId) : null;
    setBookingData(draft || { date: '', time: '', notes: '', serviceId: null, duration: 30 });
    setShowConfirmation(!!draft);
    if (providerId) void fetchProvider();
    return () => { providerRequest.current += 1; };
  }, [providerId, fetchProvider, location.search]);

  const handlePreliminarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.serviceId) {
      toast.error('Please select a service');
      return;
    }
    if (!bookingData.date) {
      toast.error('Please select a date');
      return;
    }
    if (!bookingData.time) {
      toast.error('Please select a time');
      return;
    }
    setShowConfirmation(true);
  };

  const handleFinalConfirmation = async () => {
    if (!provider || authLoading || submissionLock.current) return;
    const selectedService = services.find(service => service.id === bookingData.serviceId);
    const time = clockParts(bookingData.time);
    if (!selectedService || !bookingData.date || !time) {
      toast.error('Please choose a service, date and valid appointment time.');
      setShowConfirmation(false);
      return;
    }
    if (selectedService.duration_minutes !== bookingData.duration) {
      toast.error('This service has changed. Please select it again.');
      setBookingData(prev => ({ ...prev, serviceId: null, date: '', time: '' }));
      setShowConfirmation(false);
      return;
    }
    if (!user) {
      try {
        saveBookingDraft(provider.id, { ...bookingData, serviceId: selectedService.id });
        const returnTo = `${location.pathname}?resume=1`;
        navigate(`/auth?redirectTo=${encodeURIComponent(returnTo)}`);
      } catch {
        toast.error('Your selections could not be saved. Allow browser storage and try again.');
      }
      return;
    }
    submissionLock.current = true;
    setSubmitting(true);
    try {
      // Recheck availability without changing the existing booking API contract.
      const query = new URLSearchParams({ date: bookingData.date, serviceId: selectedService.id, duration: String(selectedService.duration_minutes) });
      const availability = await requestAvailability<{ availableSlots?: { start: string }[] }>(`${API_BASE_URL}/providers/${provider.id}/available-slots?${query}`);
      if (!availability.ok) throw new Error('Availability check failed');
      if (!availability.data.availableSlots?.some(slot => clockParts(slot.start)?.minutes === time.minutes)) {
        toast.error('This appointment is no longer available. Please choose another time.');
        setBookingData(prev => ({ ...prev, time: '' }));
        setShowConfirmation(false);
        return;
      }
      const timeIn24HourFormat = `${String(Math.floor(time.minutes / 60)).padStart(2, '0')}:${String(time.minutes % 60).padStart(2, '0')}:00`;
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            provider_id: provider.id,
            provider_name: provider.display_name || provider.name,
            date: bookingData.date,
            time: timeIn24HourFormat,
            notes: bookingData.notes.trim().slice(0, 2000),
            service_id: bookingData.serviceId,
            duration_minutes: selectedService.duration_minutes,
            status: 'confirmed',
            confirmed_at: new Date().toISOString()
          } as Database['public']['Tables']['bookings']['Insert']
        ])
        .select()
        .single();
      if (bookingError) {
        console.error('🔴 [BOOKING] Error creating booking:', bookingError);
        toast.error('Error creating booking');
        return;
      }

      clearBookingDraft(provider.id);

      // ALWAYS call the backend to trigger notifications (WhatsApp/SMS) and Calendar Sync
      try {
        const res = await fetch(`${API_BASE_URL}/bookings`, {
          method: 'POST',
          signal: AbortSignal.timeout(15000),
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: booking.id }),
        });

        if (res.ok) {
          const data = await res.json();

          let successMessage = 'Booking confirmed successfully';

          if (data.whatsapp?.sent) {
            successMessage += ' and WhatsApp message sent.';
          }

          if (data.calendar_sync?.synced) {
            // Optional: Add calendar sync info if needed, or keep it simple as user requested focus on WhatsApp
            // successMessage += ' and synced to calendar.';
          }

          toast.success(successMessage);
        } else {
          console.error('🔵 [BACKEND] Error:', await res.json());
          // Even if backend fails (e.g. email error), booking is saved in DB.
          toast.success('Booking confirmed (notification error).');
        }
      } catch (err) {
        console.error('🔵 [BACKEND] Network error:', err);
        // Fallback success message
        toast.success('Booking confirmed! (Server connection failed for notifications)');
      }

      navigate(`/booking-confirmation/${provider.id}?bookingId=${booking.id}`);
    } catch (error) {
      console.error('🔴 [BOOKING] Error confirming booking:', error);
      toast.error('Error confirming booking');
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-page min-h-screen">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-golden"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="booking-page min-h-screen">
        <Header />
        <div className="pt-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Provider not found</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="booking-page min-h-screen">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="booking-panels grid lg:grid-cols-2 gap-8">
            <Card className="provider-panel p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <div className="text-center mb-6">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-gradient-to-br from-golden/20 to-golden/30 p-1">
                  <img
                    src={provider.image_filename || `https://majskvkyvflifttonwgr.supabase.co/storage/v1/object/public/pic/${provider.id}.jpg`}
                    alt={provider.display_name || provider.name}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/provider-placeholder.svg';
                    }}
                  />
                </div>
                {provider.display_name && (
                  <h1 className="text-xl font-medium text-gray-600 mb-2">{provider.display_name}</h1>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
                <p className="text-golden font-medium mb-4 text-lg">{provider.specialty}</p>
                <div className="provider-rating" aria-label={`${provider.rating || 0} out of 5, ${provider.review_count || 0} reviews`}>
                  <Star size={22} aria-hidden="true" /><strong>{provider.rating || 0}</strong><span>out of 5</span><span className="provider-rating-count">{provider.review_count || 0} reviews</span>
                </div>
              </div>
              <div className="provider-facts">
                {provider.experience && <div className="provider-fact"><Award className="provider-fact-icon" /><div><span className="provider-fact-label">Experience</span><p>{formatExperience(provider.experience)}</p></div></div>}
                {provider.location && <div className="provider-fact"><MapPin className="provider-fact-icon" /><div><span className="provider-fact-label">Location</span><p>{provider.location}</p></div></div>}
                {provider.phone && <a href={`tel:${provider.phone.replace(/[^+\d]/g, '')}`} className="provider-fact provider-contact"><Phone className="provider-fact-icon" /><div><span className="provider-fact-label">Call your provider</span><p>{provider.phone}</p></div><ArrowUpRight className="provider-contact-arrow" /></a>}
                {provider.whatsapp && <a href={`https://wa.me/${provider.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="provider-fact provider-contact"><MessageCircle className="provider-fact-icon" /><div><span className="provider-fact-label">Send a message</span><p>Contact via WhatsApp</p></div><ArrowUpRight className="provider-contact-arrow" /></a>}
              </div>
            </Card>
            <div className="booking-panel-column">
              {!showConfirmation ? (
                <Card ref={confirmationSectionRef} className="p-0 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-xl">
                  <div className="booking-heading"><div className="confirmation-eyebrow">YOUR APPOINTMENT</div><h2>Book your appointment</h2></div>
                  <form onSubmit={handlePreliminarySubmit} className="space-y-6">
                    <EnhancedModernCalendar
                      selectedDate={bookingData.date}
                      onDateSelect={(date) => setBookingData(prev => ({ ...prev, date }))}
                      selectedTime={bookingData.time}
                      onTimeSelect={(time) => setBookingData(prev => ({ ...prev, time }))}
                      clientLabel={clientLabel}
                      services={services}
                      serviceId={bookingData.serviceId}
                      onServiceSelect={(serviceId, duration) => setBookingData(prev => ({ ...prev, serviceId, duration, date: "", time: "" }))}
                      duration={bookingData.duration}
                      providerId={provider.id}
                      providerData={provider}
                      onFoundSlotConfirmed={() => setShowConfirmation(true)}
                    />

                  </form>
                </Card>
              ) : (
                <Card ref={confirmationSectionRef} className="booking-review" dir="ltr">
                  <div className="confirmation-eyebrow">FINAL STEP</div>
                  <h2>Review your appointment</h2>
                  <p className="booking-review-intro">Check the details, add a note if you need to, and confirm your booking.</p>
                  <dl>
                    <div className="review-wide"><dt>Date</dt><dd>{appointmentDate(bookingData.date)}</dd></div>
                    <div><dt>Time</dt><dd>{appointmentTime(bookingData.time)}</dd></div>
                    <div><dt>Duration</dt><dd>{bookingData.duration} minutes</dd></div>
                    <div className="review-wide"><dt>Service</dt><dd>{services.find(s => s.id === bookingData.serviceId)?.name}</dd></div>
                  </dl>
                  <label htmlFor="appointment-notes">Message to your provider <span>Optional</span></label>
                  <Textarea id="appointment-notes" value={bookingData.notes} onChange={e => setBookingData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Is there anything you would like your provider to know?" rows={3} maxLength={2000} />
                  <p className="booking-review-note">{user ? 'Your appointment is booked when you confirm. You can then save your appointment as an image.' : 'Sign in to finish booking. Your service, time and note will be saved while you sign in.'}</p>
                  <div className="booking-review-actions">
                    <button type="button" className="confirmation-secondary" disabled={submitting} onClick={() => setShowConfirmation(false)}>Edit appointment</button>
                    <button type="button" className="confirmation-primary" onClick={handleFinalConfirmation} disabled={submitting || authLoading}>{submitting ? 'Confirming…' : authLoading ? 'Please wait…' : user ? 'Confirm booking' : 'Sign in to confirm'}</button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;
