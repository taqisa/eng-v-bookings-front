// src/pages/BookingConfirmation.tsx
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, User, Phone, Home, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BookingConfirmation = () => {
  const { providerId } = useParams();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  
  const [booking, setBooking] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBookingData();
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingData = async () => {
    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      console.log('🔴 [CONFIRMATION] Booking data:', bookingData);
      setBooking(bookingData);

      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', bookingData.provider_id)
        .single();

      if (providerError) throw providerError;

      setProvider(providerData);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', bookingData.user_id)
        .single();

      if (userError) throw userError;

      setUser(userData);

    } catch (error) {
      console.error('🔴 [CONFIRMATION] Error fetching booking data:', error);
      toast.error('حدث خطأ في تحميل بيانات الحجز');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (!booking || !provider || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golden/5 to-golden/10">
        <Header />
        <div className="pt-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">لم يتم العثور على بيانات الحجز</h1>
          <Link to="/" className="text-golden hover:underline mt-4 inline-block">
            العودة للرئيسية
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-golden/5 via-white to-golden/10">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              تم تأكيد حجزك بنجاح!
            </h1>
            <p className="text-xl text-gray-600">
              سنرسل لك تذكيراً قبل الموعد
            </p>
          </div>

          <Card className="mb-8 shadow-xl rounded-3xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">تفاصيل الموعد</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">مقدم الخدمة</h3>
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <img 
                      src={
                        provider.image_filename ||
                        `https://majskvkyvflifttonwgr.supabase.co/storage/v1/object/public/pic/${provider.id}.jpg`
                      }
                      alt={provider.display_name || provider.name_ar}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/128/4F46E5/FFFFFF?text=' + encodeURIComponent(provider.name_ar?.charAt(0) || 'د');
                      }}
                    />
                    <div>
                      {provider.display_name && (
                        <p className="text-sm text-gray-600">{provider.display_name}</p>
                      )}
                      <p className="font-bold text-gray-900">{provider.name_ar}</p>
                      <p className="text-golden">{provider.specialty_ar}</p>
                      {provider.location && (
                        <div className="flex items-center mt-1">
                          <MapPin className="w-4 h-4 text-gray-400 ml-1" />
                          <span className="text-sm text-gray-600">{provider.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الموعد</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 ml-3" />
                      <span className="text-gray-800">{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <Clock className="w-4 h-4 text-gray-400 ml-2" />
                      <span className="font-[Inter] text-[29px] text-black">{formatTime(booking.time)}</span>
                      {booking.duration_minutes && (
                        <span className="text-gray-500 ml-2 font-[Inter]">
                          ({booking.duration_minutes} دقيقة)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 ml-3" />
                      <span className="text-gray-800">{user.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 ml-3" />
                      <span className="text-gray-800">{user.phone}</span>
                    </div>
                    {booking.notes && (
                      <div className="mt-4 p-3 bg-golden/10 rounded-lg">
                        <p className="text-sm text-gray-600"><strong>الملاحظات:</strong></p>
                        <p className="text-gray-800">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="bg-golden/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">عن الحجز</h4>
                  <p className="text-lg font-mono text-golden">يمكنك الغاء الحجز من خلال الإعدادات</p>
                  <p className="text-sm text-gray-600 mt-2">
                      يمكن إلغاء الموعد من خلال الإعدادات في أي وقت .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 shadow-xl rounded-3xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات مهمة</h3>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-golden rounded-full mt-2 ml-3 flex-shrink-0"></span>
                  <p>يرجى الحضور قبل 15 دقيقة من موعدك</p>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-golden rounded-full mt-2 ml-3 flex-shrink-0"></span>
                  <p>في حالة عدم القدرة على الحضور، يرجى إلغاء الموعد </p>
                </div>
                {provider.phone && (
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-golden rounded-full mt-2 ml-3 flex-shrink-0"></span>
                    <p>للاستفسارات، يمكنك التواصل على {provider.phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-golden to-yellow-600 hover:from-yellow-600 hover:to-amber-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Home className="w-4 h-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
            <Link to={`/city/${provider.city_id}`}>
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 rounded-2xl border-2 hover:shadow-md transition-all duration-300 hover:scale-105">
                احجز موعداً آخر
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingConfirmation;