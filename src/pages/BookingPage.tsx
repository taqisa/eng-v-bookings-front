// src/pages/BookingPage.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Star, MapPin, Phone, ArrowRight, AlertCircle, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleCalendarAuth from "@/components/GoogleCalendarAuth";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EnhancedModernCalendar from "@/components/EnhancedModernCalendar";
import BookingHeader from "@/components/BookingHeader";
import { Database } from "@/integrations/supabase/types";
import { API_BASE_URL } from "@/lib/utils";

const language = "en";


// Manually define types missing from the generated Database type
interface ServiceRow {
  id: string;
  name: string | null;
  name_ar: string | null;
  duration_minutes: number | null;
  provider_id: string;
  [key: string]: any;
}

interface ProviderTypeRow {
  client_label: string | null;
  [key: string]: any;
}

// Extend existing Provider type to include missing fields found in usage
type BaseProvider = Database['public']['Tables']['providers']['Row'];
interface Provider extends BaseProvider {
  provider_type_id?: string;
  [key: string]: any;
}

const convertArabicToWestern = (s: string) => {
  const arabicNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const westernNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return s.split('').map(char => westernNumerals[arabicNumerals.indexOf(char)] || char).join('');
};

const convertTo24Hour = (time12h: string): string => {
  const westernTime = convertArabicToWestern(time12h);
  const [time, modifier] = westernTime.split(' ');
  if (!time || !modifier) {
    console.error("🔴 [TIME CONVERT] Invalid time format:", westernTime);
    return "00:00:00";
  }
  let [hours, minutes] = time.split(':');
  if (!hours || !minutes) {
    console.error("🔴 [TIME CONVERT] Invalid time parts:", time);
    return "00:00:00";
  }
  if (hours === '12') {
    hours = modifier === 'PM' ? '12' : '00';
  } else {
    if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }
  }
  minutes = minutes.padEnd(2, '0').substring(0, 2);
  return `${hours.padStart(2, '0')}:${minutes}:00`;
};

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
  const { user, loading: authLoading } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [clientLabel, setClientLabel] = useState<string>('Client');
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
  const providerCache = useRef<Provider | null>(null);

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
      navigate('/');
      return;
    }

    if (providerCache.current) {
      console.log('🔴 [FETCH] Using cached provider data for:', providerId);
      setProvider(providerCache.current);
      setLoading(false);
      return;
    }

    try {
      console.log('🔵 [BOOKING] Fetching provider details for:', providerId);
      const { data: providerData, error: providerError } = await (supabase
        .from('providers' as any)
        .select(`
          id,
          name_ar,
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
          specialty_ar,
          rating,
          review_count,
          experience,
          location,
          phone,
          whatsapp,
          image_filename
        `)
        .eq('id', providerId)
        .single() as Promise<any>);

      if (providerError || !providerData) {
        console.error('🔴 [FETCH] Error fetching provider:', providerError?.message, providerError?.details);
        toast.error('Provider not found');
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirectTo');
        navigate(redirectTo || '/');
        return;
      }

      let clientLabelValue = 'Client';
      if (providerData?.provider_type_id) {
        const { data: typeData, error: typeError } = await (supabase
          .from('provider_types' as any)
          .select('client_label')
          .eq('id', providerData.provider_type_id)
          .single() as Promise<any>);
        if (typeError) {
          console.warn('🔴 [FETCH] Client label fetch error:', typeError.message, typeError.details);
        } else if (typeData?.client_label && typeData.client_label.trim() !== '') {
          clientLabelValue = typeData.client_label;
        }
      }
      setClientLabel(clientLabelValue);

      const { data: servicesData, error: servicesError } = await (supabase
        .from('services' as any)
        .select('id, name, name_ar, duration_minutes')
        .eq('provider_id', providerId) as Promise<any>);
      let sanitizedServices: ServiceRow[] = [];
      if (servicesError) {
        console.error('🔴 [FETCH] Error fetching services:', servicesError.message, servicesError.details);
        toast.error('Failed to fetch services');
      } else if (servicesData && servicesData.length > 0) {
        sanitizedServices = (servicesData as any[]).map(service => ({
          ...service,
          name: service.name && service.name.trim() !== '' ? service.name : 'Unnamed Service',
          name_ar: service.name_ar && service.name_ar.trim() !== '' ? service.name_ar : (service.name && service.name.trim() !== '' ? service.name : 'Unnamed Service'),
          duration_minutes: service.duration_minutes || 30
        }));
        console.log('🔴 [FETCH] Services fetched:', sanitizedServices);
      } else {
        console.warn('🔴 [FETCH] No services found for provider:', providerId);
        toast.warning('No services available for this provider');
      }
      setServices(sanitizedServices);

      console.log('🔴 [FETCH] Provider data loaded:', {
        id: providerData.id,
        name: providerData.name_ar,
        client_label: clientLabelValue,
        services_count: sanitizedServices.length
      });

      providerCache.current = providerData;
      setProvider(providerData);
    } catch (error) {
      console.error('🔴 [FETCH] Exception:', error);
      toast.error('Error loading data');
      setServices([]);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [providerId, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('🔴 [AUTH] No user, redirecting to auth page');
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/auth?redirectTo=${encodeURIComponent(currentPath)}`);
      return;
    }
    if (user && providerId) {
      fetchProvider();
    }
  }, [user, authLoading, providerId, navigate, fetchProvider]);

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
    console.log('🔴 [SUBMIT] Preliminary booking data:', bookingData);
    setShowConfirmation(true);
  };

  const handleFinalConfirmation = async () => {
    if (!user || !provider) return;
    setSubmitting(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, phone, email')
        .eq('id', user.id)
        .single();
      if (userError) {
        console.error('🔴 [BOOKING] Error fetching user data:', userError);
        toast.error('Error loading user data');
        return;
      }
      const timeIn24HourFormat = convertTo24Hour(bookingData.time);
      const selectedService = services.find(s => s.id === bookingData.serviceId);
      console.log('🔵 [BOOKING] Fetching services for provider type:', (provider as any).provider_type_id);
      const { data: servicesData, error: servicesError } = await (supabase
        .from('services' as any)
        .select('*')
        .eq('provider_type_id', (provider as any).provider_type_id) as any);
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            provider_id: provider.id,
            provider_name: provider.display_name || provider.name,
            date: bookingData.date,
            time: timeIn24HourFormat,
            notes: bookingData.notes,
            service_id: bookingData.serviceId,
            duration_minutes: bookingData.duration,
            status: 'confirmed',
            confirmed_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      if (bookingError) {
        console.error('🔴 [BOOKING] Error creating booking:', bookingError);
        toast.error('Error creating booking');
        return;
      }
      console.log('🔴 [BOOKING] Booking created:', booking);

      // ALWAYS call the backend to trigger notifications (WhatsApp/SMS) and Calendar Sync
      try {
        const res = await fetch(`${API_BASE_URL}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: booking.id }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log('🔵 [BACKEND] Response:', data);

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
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golden/5 to-golden/10">
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
      <div className="min-h-screen bg-gradient-to-br from-golden/5 to-golden/10">
        <Header />
        <div className="pt-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Provider not found</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-golden transition-all duration-300 hover:scale-105"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              Back
            </button>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <div className="text-center mb-6">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-gradient-to-br from-golden/20 to-golden/30 p-1">
                  <img
                    src={provider.image_filename || `https://majskvkyvflifttonwgr.supabase.co/storage/v1/object/public/pic/${provider.id}.jpg`}
                    alt={provider.display_name || provider.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name?.charAt(0) || 'P')}&background=D4AF37&color=fff&size=128`;
                    }}
                  />
                </div>
                {provider.display_name && (
                  <h1 className="text-xl font-medium text-gray-600 mb-2">{provider.display_name}</h1>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
                <p className="text-golden font-medium mb-4 text-lg">{provider.specialty}</p>
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(provider.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="mr-3 text-gray-600">
                    {provider.rating || 0} ({provider.review_count || 0} reviews)
                  </span>
                </div>
              </div>
              <div className="space-y-3 text-gray-600 mb-6">
                {provider.experience && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-shrink-0 w-8 h-8 bg-golden/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-golden rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 leading-snug">{formatExperience(provider.experience)}</span>
                  </div>
                )}
                {provider.location && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-golden/10 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <MapPin className="w-4 h-4 text-golden group-hover:text-blue-600 transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors leading-snug">{provider.location}</span>
                  </a>
                )}
                {provider.phone && (
                  <a href={`tel:${provider.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                    <div className="flex-shrink-0 w-8 h-8 bg-golden/10 rounded-full flex items-center justify-center group-hover:bg-golden/20 transition-colors">
                      <Phone className="w-4 h-4 text-golden" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{provider.phone}</span>
                  </a>
                )}
                {provider.whatsapp && (
                  <a
                    href={`https://wa.me/${provider.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-green-700">Contact via WhatsApp</span>
                  </a>
                )}
              </div>
              {!provider.google_calendar_connected && (
                <GoogleCalendarAuth
                  providerId={provider.id}
                  isConnected={provider.google_calendar_connected}
                  onConnectionUpdate={fetchProvider}
                />
              )}
            </Card>
            <div className="space-y-7">
              {!showConfirmation ? (
                <Card ref={confirmationSectionRef} className="p-0 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-xl">
                  <BookingHeader 
                      isDateTimeSelected={!!bookingData.date && !!bookingData.time} 
                    />
                  <form onSubmit={handlePreliminarySubmit} className="space-y-6">
                    <EnhancedModernCalendar
                      selectedDate={bookingData.date}
                      onDateSelect={(date) => setBookingData(prev => ({ ...prev, date }))}
                      selectedTime={bookingData.time}
                      onTimeSelect={(time) => setBookingData(prev => ({ ...prev, time }))}
                      clientLabel={clientLabel}
                      services={services}
                      serviceId={bookingData.serviceId}
                      onServiceSelect={(serviceId, duration) => setBookingData(prev => ({ ...prev, serviceId, duration }))}
                      duration={bookingData.duration}
                      providerId={provider.id}
                      providerData={provider}
                      onFoundSlotConfirmed={() => setShowConfirmation(true)}
                    />

                  </form>
                </Card>
              ) : (
                <Card ref={confirmationSectionRef} className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                    Confirm Booking
                  </h2>
                  <div className="space-y-6 mb-8">
                    <div className="bg-golden/10 p-4 rounded-xl">
                      <h3 className="font-semibold text-golden mb-3">Appointment Details:</h3>
                      <div className="space-y-2 text-gray-800">
                        <p><span className="font-medium">Date:</span> {bookingData.date}</p>
                        <p><span className="font-medium">Time:</span> {bookingData.time}</p>
                        <p><span className="font-medium">{clientLabel}:</span> <span className="text-golden font-semibold">{
                          services.find(s => s.id === bookingData.serviceId)?.['name'] || 'Unknown Service'
                        }</span></p>
                        <p><span className="font-medium">Duration:</span> {bookingData.duration} min</p>
                        {bookingData.notes && (
                          <p><span className="font-medium">Notes:</span> {bookingData.notes}</p>
                        )}
                      </div>
                    </div>
                    <Card className="p-4 bg-gradient-to-r from-gray-50 to-golden/5 border-0">
                      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                        Notes (Optional)
                      </label>
                      <Textarea
                        value={bookingData.notes}
                        onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any notes or special requests..."
                        rows={3}
                        className="text-left border-0 bg-white/80 focus:ring-2 focus:ring-golden rounded-xl"
                      />
                    </Card>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <div className="flex items-center space-x-2 ">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <p className="text-amber-800 font-medium">
                          After confirmation, your appointment will be booked. You can manage it from your My Bookings list.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-4 ">
                    <Button
                      onClick={() => setShowConfirmation(false)}
                      variant="outline"
                      className="flex-1 py-3"
                    >
                      Edit Details
                    </Button>
                    <Button
                      onClick={handleFinalConfirmation}
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3"
                    >
                      {submitting ? 'Confirming...' : 'Confirm Booking'}
                    </Button>
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
