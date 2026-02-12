
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, MapPin, Phone, Clock, Calendar } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { API_BASE_URL } from '@/lib/utils';

interface Provider {
  id: string;
  name: string;
  name_ar: string;
  specialty: string;
  specialty_ar: string;
  image_filename: string | null;
  city_id: string;
  phone: string;
  location: string;
  rating: number;
  review_count: number;
  experience: string;
}

interface BookingSystemProps {
  providerId: string;
}

const BookingSystem: React.FC<BookingSystemProps> = ({ providerId }) => {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sample available time slots (in real app, this would come from Google Calendar)
  const timeSlots = [
    { time: '١٠:٠٠ ص', available: true, day: 'الثلاثاء' },
    { time: '٢:٠٠ م', available: true, day: 'الثلاثاء' },
    { time: '٩:٠٠ ص', available: false, day: 'الأربعاء' },
  ];

  useEffect(() => {
    fetchProviderAndSlots();
  }, [providerId]);

  const fetchProviderAndSlots = async () => {
    try {
      // Fetch provider data
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single();

      if (providerError) throw providerError;
      setProvider(providerData);

      // Fetch available slots from backend
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 7); // Fetch slots for the next 7 days

      const response = await fetch(`${API_BASE_URL}/providers/${providerId}/available-slots?start=${start.toISOString()}&end=${end.toISOString()}`);
      const data = await response.json();
      // Here you would process the busy slots and generate available time slots
      // For now, we'll keep the static timeSlots
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (time: string) => {
    if (!user || !provider) {
      navigate('/auth');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: provider.id,
          userId: user.id,
          startTime: new Date().toISOString(), // Replace with actual start time
          endTime: new Date().toISOString(),   // Replace with actual end time
          summary: `Booking with ${provider.name_ar}`,
          description: `Booking for ${user.email} at ${time}`,
        }),
      });

      if (response.ok) {
        navigate(`/booking-confirmation/${provider.id}`);
      } else {
        // Handle error
      }
    } catch (error) {
      // Handle error
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!provider) {
    return null;
  }

  return (
    <Card className="p-6 hover:scale-105 transition-all duration-300 max-w-md mx-auto">
      {/* Provider Image */}
      <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden bg-gray-200">
        <img
          src={provider.image_filename || `https://majskvkyvflifttonwgr.supabase.co/storage/v1/object/public/pic/${provider.id}.jpg` || 'https://via.placeholder.com/96/4F46E5/FFFFFF?text=' + encodeURIComponent(provider.name_ar?.charAt(0) || 'د')}
          alt={provider.name_ar}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/96/4F46E5/FFFFFF?text=' + encodeURIComponent(provider.name_ar?.charAt(0) || 'د');
          }}
        />
      </div>

      {/* Provider Info */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{provider.name_ar}</h3>
        <p className="text-blue-600 font-medium mb-3">{provider.specialty_ar} - {provider.city_id}</p>

        {/* Rating */}
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(provider.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="mr-2 text-sm text-gray-600">
            {provider.rating}
          </span>
        </div>

        {/* Available Time Slots */}
        <div className="space-y-2 mb-6">
          {timeSlots.map((slot, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-700">{slot.day} {slot.time}</span>
              <span className={`font-medium ${slot.available ? 'text-green-600' : 'text-red-500'}`}>
                {slot.available ? 'متاح' : 'محجوز'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Book Button */}
      <Button onClick={() => handleBooking(timeSlots[0].time)} className="w-full apple-button">
        <Calendar className="w-4 h-4 ml-2" />
        احجز موعدك الآن
      </Button>

      {!user && (
        <p className="text-sm text-gray-500 text-center mt-2">
          يجب تسجيل الدخول أولاً للحجز
        </p>
      )}
    </Card>
  );
};

export default BookingSystem;
