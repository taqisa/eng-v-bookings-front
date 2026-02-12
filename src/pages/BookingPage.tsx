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
import { Database } from "@/integrations/supabase/types";
import { API_BASE_URL } from "@/lib/utils";

const language = "ar";


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
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
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
    hours = modifier === 'م' ? '12' : '00';
  } else {
    if (modifier === 'م') {
      hours = String(parseInt(hours, 10) + 12);
    }
  }
  minutes = minutes.padEnd(2, '0').substring(0, 2);
  return `${hours.padStart(2, '0')}:${minutes}:00`;
};

const BookingPage = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [clientLabel, setClientLabel] = useState<string>(language === 'ar' ? 'عميل' : 'Client');
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
      toast.error('معرف مقدم الخدمة غير موجود');
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
        toast.error('لم يتم العثور على مقدم الخدمة');
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirectTo');
        navigate(redirectTo || '/');
        return;
      }

      let clientLabelValue = language === 'ar' ? 'عميل' : 'Client';
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
        toast.error('فشل في جلب الخدمات');
      } else if (servicesData && servicesData.length > 0) {
        sanitizedServices = (servicesData as any[]).map(service => ({
          ...service,
          name: service.name && service.name.trim() !== '' ? service.name : 'Unnamed Service',
          name_ar: service.name_ar && service.name_ar.trim() !== '' ? service.name_ar : (service.name && service.name.trim() !== '' ? service.name : 'خدمة غير مسماة'),
          duration_minutes: service.duration_minutes || 30
        }));
        console.log('🔴 [FETCH] Services fetched:', sanitizedServices);
      } else {
        console.warn('🔴 [FETCH] No services found for provider:', providerId);
        toast.warning('لا توجد خدمات متاحة لهذا المزود');
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
      toast.error('حدث خطأ في تحميل البيانات');
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
      toast.error('يرجى اختيار الخدمة');
      return;
    }
    if (!bookingData.date) {
      toast.error('يرجى اختيار التاريخ');
      return;
    }
    if (!bookingData.time) {
      toast.error('يرجى اختيار الوقت');
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
        toast.error('حدث خطأ في تحميل بيانات المستخدم');
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
            provider_name: provider.display_name || provider.name_ar,
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
        toast.error('حدث خطأ في إنشاء الحجز');
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

          let successMessage = 'تم تأكيد الحجز بنجاح';

          if (data.whatsapp?.sent) {
            successMessage += ' وتم إرسال رسالة واتساب.';
          }

          if (data.calendar_sync?.synced) {
            // Optional: Add calendar sync info if needed, or keep it simple as user requested focus on WhatsApp
            // successMessage += ' وتمت المزامنة مع التقويم.';
          }

          toast.success(successMessage);
        } else {
          console.error('🔵 [BACKEND] Error:', await res.json());
          // Even if backend fails (e.g. email error), booking is saved in DB.
          toast.success('تم تأكيد الحجز (ولكن قد يكون هناك خطأ في الإشعارات).');
        }
      } catch (err) {
        console.error('🔵 [BACKEND] Network error:', err);
        // Fallback success message
        toast.success('تم تأكيد الحجز بنجاح! (فشل الاتصال بالخادم للإشعارات)');
      }

      navigate(`/booking-confirmation/${provider.id}?bookingId=${booking.id}`);
    } catch (error) {
      console.error('🔴 [BOOKING] Error confirming booking:', error);
      toast.error('حدث خطأ في تأكيد الحجز');
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
          <h1 className="text-2xl font-bold text-gray-900">مقدم الخدمة غير موجود</h1>
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
              رجوع
            </button>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <div className="text-center mb-6">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-gradient-to-br from-golden/20 to-golden/30 p-1">
                  <img
                    src={provider.image_filename || `https://majskvkyvflifttonwgr.supabase.co/storage/v1/object/public/pic/${provider.id}.jpg` || 'https://via.placeholder.com/128/4F46E5/FFFFFF?text=' + encodeURIComponent(provider.name_ar?.charAt(0) || 'د')}
                    alt={provider.display_name || provider.name_ar}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/128/4F46E5/FFFFFF?text=' + encodeURIComponent(provider.name_ar?.charAt(0) || 'د');
                    }}
                  />
                </div>
                {provider.display_name && (
                  <h1 className="text-xl font-medium text-gray-600 mb-2">{provider.display_name}</h1>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name_ar}</h1>
                <p className="text-golden font-medium mb-4 text-lg">{provider.specialty_ar}</p>
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
                    {provider.rating || 0} ({provider.review_count || 0} تقييم)
                  </span>
                </div>
              </div>
              <div className="space-y-4 text-gray-600 mb-6">
                {provider.experience && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                    <div className="w-2 h-2 bg-golden rounded-full ml-3"></div>
                    {provider.experience}
                  </div>
                )}
                {provider.location && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 ml-3 text-golden" />
                    {provider.location}
                  </div>
                )}
                {provider.phone && (
                  <a href={`tel:${provider.phone}`} className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                    <div className="bg-white p-1.5 rounded-full shadow-sm ml-3 group-hover:shadow-md transition-shadow">
                      <Phone className="w-5 h-5 text-golden" />
                    </div>
                    <span className="font-semibold text-gray-800 text-lg">{provider.phone}</span>
                  </a>
                )}
                {provider.whatsapp && (
                  <a
                    href={`https://wa.me/${provider.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 ml-3 text-green-500" />
                    <span className="text-green-700">تواصل عبر واتساب</span>
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
                  <div className="relative flex justify-center items-center py-12 px-6">
                    <div className="absolute inset-0 flex justify-center items-center">
                      <div className="w-80 h-80 bg-gradient-to-r from-golden/80 via-golden to-golden/70 rounded-full filter blur-3xl opacity-30 animate-pulse-slow"></div>
                    </div>
                    <h2 className="text-5xl md:text-8xl font-extrabold text-center relative z-10 tracking-wide">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-golden via-gray-800 to-golden animate-gradient-move">
                        احجز موعدك
                      </span>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-56 h-1.5 bg-gradient-to-r from-transparent via-golden to-transparent rounded-full animate-glow-pulse"></div>
                    </h2>
                    <div className="absolute -top-6 -right-6 w-5 h-5 bg-golden/80 rounded-full animate-float opacity-80 shadow-lg shadow-golden/50"></div>
                    <div className="absolute -bottom-6 -left-6 w-4 h-4 bg-golden rounded-full animate-float-delay opacity-80 shadow-lg shadow-golden/50" style={{ animationDelay: '0.7s' }}></div>
                    <div className="absolute top-1/2 -left-10 w-3 h-3 bg-golden/70 rounded-full animate-float-delay opacity-80 shadow-lg shadow-golden/50" style={{ animationDelay: '1.4s' }}></div>
                  </div>
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
                    تأكيد الحجز
                  </h2>
                  <div className="space-y-6 mb-8">
                    <div className="bg-golden/10 p-4 rounded-xl">
                      <h3 className="font-semibold text-golden mb-3">تفاصيل الموعد:</h3>
                      <div className="space-y-2 text-gray-800">
                        <p><span className="font-medium">التاريخ:</span> {bookingData.date}</p>
                        <p><span className="font-medium">الوقت:</span> {bookingData.time}</p>
                        <p><span className="font-medium">{clientLabel}:</span> <span className="text-golden font-semibold">{
                          services.find(s => s.id === bookingData.serviceId)?.[language === 'ar' ? 'name_ar' : 'name'] || 'Unknown Service'
                        }</span></p>
                        <p><span className="font-medium">المدة:</span> {bookingData.duration} دقيقة</p>
                        {bookingData.notes && (
                          <p><span className="font-medium">الملاحظات:</span> {bookingData.notes}</p>
                        )}
                      </div>
                    </div>
                    <Card className="p-4 bg-gradient-to-r from-gray-50 to-golden/5 border-0">
                      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                        ملاحظات (اختياري)
                      </label>
                      <Textarea
                        value={bookingData.notes}
                        onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="أضف أي ملاحظات أو تفاصيل خاصة..."
                        rows={3}
                        className="text-right border-0 bg-white/80 focus:ring-2 focus:ring-golden rounded-xl"
                      />
                    </Card>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <p className="text-amber-800 font-medium">
                          بعد التأكيد، سيتم حجز الموعد ويمكن إلغاء الموعد من قائمة حجوزاتي
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-4 rtl:space-x-reverse">
                    <Button
                      onClick={() => setShowConfirmation(false)}
                      variant="outline"
                      className="flex-1 py-3"
                    >
                      تعديل
                    </Button>
                    <Button
                      onClick={handleFinalConfirmation}
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3"
                    >
                      {submitting ? 'جارٍ التأكيد...' : 'تأكيد الحجز'}
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
