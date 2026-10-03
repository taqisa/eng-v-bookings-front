import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { BookingSiteHeader, BookingSiteFooter } from '@/components/BookingSiteChrome';
import AppointmentReceipt from '@/components/AppointmentReceipt';
import { AppointmentDetails } from '@/lib/appointmentCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { Database } from '@/integrations/supabase/types';

type BookingRow = Database['public']['Tables']['bookings']['Row'] & { service_id?: string; duration_minutes?: number };

export default function BookingConfirmation() {
  const { providerId } = useParams();
  const [params] = useSearchParams();
  const bookingId = params.get('bookingId');
  const { user, loading: authLoading } = useAuth();
  const [details, setDetails] = useState<AppointmentDetails | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const providerPath = `/booking/${encodeURIComponent(providerId || '')}`;

  useEffect(() => {
    let active = true;
    setLoading(true); setFailed(false); setDetails(null); setStatus(null);
    if (authLoading) return () => { active = false; };
    const load = async () => {
      if (!user || !bookingId || !providerId) { if (active) setLoading(false); return; }
      try {
        // These filters avoid loading unrelated customer/provider records. Database
        // RLS remains the authorization boundary; frontend filters do not replace it.
        const { data, error } = await supabase.from('bookings')
          .select('id,provider_id,user_id,provider_name,date,time,duration,duration_minutes,service_id,status')
          .eq('id', bookingId).eq('provider_id', providerId).eq('user_id', user.id).single();
        if (error || !data) throw new Error('Booking unavailable');
        const booking = data as unknown as BookingRow;
        const [providerResult, guestResult] = await Promise.all([
          supabase.from('providers').select('name,display_name,specialty,location').eq('id', providerId).maybeSingle(),
          supabase.from('users').select('name').eq('id', user.id).maybeSingle(),
        ]);
        const provider = providerResult.data;
        let service: string | undefined;
        if (booking.service_id) {
          // services is deployed but missing from this repository's generated types.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (supabase as any).from('services').select('name').eq('id', booking.service_id).eq('provider_id', providerId).maybeSingle();
          service = result.data?.name;
        }
        if (active) {
          setStatus(booking.status);
          setDetails({ id: booking.id, provider: provider?.display_name || provider?.name || booking.provider_name, specialty: provider?.specialty, service, date: booking.date, time: booking.time, duration: booking.duration_minutes || booking.duration, location: provider?.location, guest: guestResult.data?.name });
        }
      } catch { if (active) setFailed(true); }
      finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [bookingId, providerId, user, authLoading, attempt]);

  const confirmed = status === 'confirmed';
  const signInPath = `/auth?redirectTo=${encodeURIComponent(`${providerPath.replace('/booking/', '/booking-confirmation/')}?bookingId=${encodeURIComponent(bookingId || '')}`)}`;
  return <div className="confirmation-page" dir="ltr">
    <BookingSiteHeader />
    <main>
      {loading ? <div className="confirmation-empty" role="status"><Loader2 className="confirmation-spin mx-auto mb-5" /><p>Loading your appointment…</p></div>
      : !details ? <div className="confirmation-empty"><h1>{!user ? 'Sign in to view your appointment' : 'Appointment unavailable'}</h1><p>{failed ? 'Check your booking link or try again. Only your own appointments can be viewed here.' : 'Use your provider’s booking link to continue.'}</p><div className="confirmation-links justify-center">{failed && <button className="confirmation-secondary" onClick={() => setAttempt(v => v + 1)}>Try again</button>}{!user ? <Link to={signInPath}>Sign in</Link> : <Link to={providerPath}>Back to your provider</Link>}</div></div>
      : <div className="confirmation-layout">
        <div className="confirmation-intro">
          {confirmed && <div className="confirmation-emblem"><Check size={25} strokeWidth={1.5} /></div>}
          <div className="confirmation-eyebrow">{confirmed ? 'ALL SET' : 'APPOINTMENT STATUS'}</div>
          <h1>{confirmed ? <>Your appointment<br />is confirmed.</> : status === 'cancelled' ? 'This appointment is cancelled.' : 'Your booking details.'}</h1>
          <p>{confirmed ? 'Your time is reserved. Save your appointment card so the details are always close at hand.' : 'Contact your provider for questions about this appointment.'}</p>
          <div className="confirmation-links"><Link to={providerPath}>Back to your provider</Link></div>
        </div>
        <AppointmentReceipt details={details} confirmed={confirmed} />
      </div>}
    </main>
    <BookingSiteFooter />
  </div>;
}
