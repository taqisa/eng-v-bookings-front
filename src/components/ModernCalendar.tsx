import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Clock, User, UserCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL } from "@/lib/utils";

interface Provider {
  working_days: string[];
  working_hours_start: string;
  working_hours_end: string;
  slot_duration: number;
  google_calendar_connected?: boolean;
  active_google_account_id?: string | null;
}

interface ModernCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  clientType: 'new' | 'existing' | null;
  onClientTypeSelect: (type: 'new' | 'existing') => void;
  duration: number;
  onDurationSelect: (duration: number) => void;
  providerId: string;
}

const ModernCalendar: React.FC<ModernCalendarProps> = ({
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  clientType,
  onClientTypeSelect,
  duration,
  onDurationSelect,
  providerId
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [provider, setProvider] = useState<Provider | null>(null);

  const allTimeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  // Load provider data on mount
  useEffect(() => {
    const fetchProvider = async () => {
      console.log(`🔧 [CALENDAR] Fetching provider data for ID: ${providerId}`);
      try {
        const { data, error } = await supabase
          .from("providers")
          .select("working_days, working_hours_start, working_hours_end, slot_duration, google_calendar_connected, active_google_account_id")
          .eq("id", providerId)
          .single();

        if (error) {
          console.error("🔧 [CALENDAR] Error fetching provider:", error);
          return;
        }
        console.log(`🔧 [CALENDAR] Provider data loaded:`, {
          id: providerId,
          working_days: data.working_days,
          working_hours_start: data.working_hours_start,
          working_hours_end: data.working_hours_end,
          slot_duration: data.slot_duration,
          google_calendar_connected: data.google_calendar_connected,
          active_google_account_id: data.active_google_account_id,
        });
        setProvider(data);
      } catch (error) {
        console.error("🔧 [CALENDAR] Exception fetching provider:", error);
      }
    };

    fetchProvider();
  }, [providerId]);

  // Memoize provider to prevent unnecessary re-renders
  const memoizedProvider = useMemo(() => provider, [provider]);

  // Load available time slots when date or duration changes
  useEffect(() => {
    if (selectedDate && memoizedProvider) {
      console.log(`🔧 [CALENDAR] Triggering loadAvailableSlots:`, {
        selectedDate,
        duration,
        providerId,
        google_calendar_connected: memoizedProvider.google_calendar_connected,
        active_google_account_id: memoizedProvider.active_google_account_id,
      });
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate, duration, memoizedProvider]);

  const loadAvailableSlots = async (date: string) => {
    setLoadingSlots(true);
    try {
      console.log(`🔧 [CALENDAR] Loading available slots for date: ${date}, provider: ${providerId}, duration: ${duration}`);

      // Check if Google Calendar is connected
      if (memoizedProvider?.google_calendar_connected && memoizedProvider?.active_google_account_id) {
        console.log(`🔧 [CALENDAR] Google Calendar is connected for provider ${providerId}`);
        try {
          const response = await fetch(`${API_BASE_URL}/providers/${providerId}/available-slots?date=${date}`);
          if (!response.ok) {
            const errorData = await response.json();
            console.error(`🔧 [CALENDAR] Backend fetch error:`, errorData);
            throw new Error(errorData.error || 'Failed to fetch slots from backend');
          }
          const data = await response.json();
          const slots = data.availableSlots || [];
          console.log(`🔧 [CALENDAR] Available slots loaded from backend:`, slots);

          setAvailableSlots(slots);

          // Clear selected time if it's no longer available
          if (selectedTime && !slots.includes(selectedTime)) {
            console.log(`🔧 [CALENDAR] Clearing selected time ${selectedTime} as it's no longer available`);
            onTimeSelect('');
          }
        } catch (error) {
          console.error(`🔧 [CALENDAR] Error fetching slots from backend:`, error);
          // Fallback to local bookings
          await loadLocalBookings(date);
        }
      } else {
        console.warn(`🔧 [CALENDAR] Google Calendar not connected for provider ${providerId}`, {
          google_calendar_connected: memoizedProvider?.google_calendar_connected,
          active_google_account_id: memoizedProvider?.active_google_account_id,
        });
        // Fallback to local bookings
        await loadLocalBookings(date);
      }
    } catch (error) {
      console.error(`🔧 [CALENDAR] Error loading availability:`, error);
      // Fallback to local bookings
      await loadLocalBookings(date);
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadLocalBookings = async (date: string) => {
    try {
      console.log(`🔧 [CALENDAR] Falling back to local bookings for date: ${date}, provider: ${providerId}`);
      const { data: localBookings, error } = await supabase
        .from("bookings" as any)
        .select("time, duration_minutes")
        .eq("provider_id", providerId)
        .eq("date", date)
        .neq("status", "cancelled");

      if (error) {
        console.error(`🔧 [CALENDAR] Error fetching local bookings:`, error);
        setAvailableSlots(allTimeSlots); // Ultimate fallback
        return;
      }

      console.log(`🔧 [CALENDAR] Retrieved ${localBookings?.length || 0} local bookings`, localBookings);

      // Convert local bookings to busy slots
      const busySlots: { start: string; end: string }[] = localBookings.map(booking => {
        const [hours, minutes] = booking.time.split(':').map(Number);
        const start = new Date(`${date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
        const end = new Date(start.getTime() + (booking.duration_minutes || 30) * 60000);
        return {
          start: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
          end: `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
        };
      });

      console.log(`🔧 [CALENDAR] Local busy slots:`, busySlots);

      // Filter out busy slots from allTimeSlots
      const availableSlots = allTimeSlots.filter(slot => {
        const [slotHours, slotMinutes] = slot.split(':').map(Number);
        const slotStart = new Date(`${date}T${slotHours.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}:00`);
        const slotEnd = new Date(slotStart.getTime() + (duration || 30) * 60000);

        const isBooked = busySlots.some(busy => {
          const busyStart = new Date(`${date}T${busy.start}:00`);
          const busyEnd = new Date(`${date}T${busy.end}:00`);
          const overlaps = slotStart < busyEnd && slotEnd > busyStart;
          if (overlaps) {
            console.log(`🔧 [CALENDAR] Slot ${slot} is busy due to overlap with:`, {
              busyStart: busy.start,
              busyEnd: busy.end,
            });
          }
          return overlaps;
        });

        return !isBooked;
      });

      console.log(`🔧 [CALENDAR] Final available slots from local bookings:`, availableSlots);
      setAvailableSlots(availableSlots);
    } catch (error) {
      console.error(`🔧 [CALENDAR] Error loading local bookings:`, error);
      setAvailableSlots(allTimeSlots); // Ultimate fallback
    }
  };

  const durationOptions = [
    { value: 30, label: "30 min" },
    { value: 60, label: "hr" },
    { value: 90, label: "hr ونصف" },
    { value: 120, label: "ساعتان" },
    { value: 150, label: "ساعتان ونصف" },
    { value: 180, label: "3 ساعات" },
    { value: 210, label: "3 ساعات ونصف" },
    { value: 240, label: "4 ساعات" }
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  return (
    <div className="space-y-6">
      {/* Client Type Selection */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">نوع الClient</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={clientType === 'new' ? 'default' : 'outline'}
            onClick={() => onClientTypeSelect('new')}
            className={`h-16 text-lg font-medium transition-all duration-300 ${clientType === 'new'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
              : 'hover:shadow-md hover:scale-102'
              }`}
          >
            <User className="w-5 h-5 ml-2" />
            Client جديد
          </Button>
          <Button
            variant={clientType === 'existing' ? 'default' : 'outline'}
            onClick={() => onClientTypeSelect('existing')}
            className={`h-16 text-lg font-medium transition-all duration-300 ${clientType === 'existing'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
              : 'hover:shadow-md hover:scale-102'
              }`}
          >
            <UserCheck className="w-5 h-5 ml-2" />
            Client قديم
          </Button>
        </div>
      </Card>

      {/* Duration Selection for Existing Clients */}
      {clientType === 'existing' && (
        <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-0 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">مدة الجلسة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {durationOptions.map((option) => (
              <Button
                key={option.value}
                variant={duration === option.value ? 'default' : 'outline'}
                onClick={() => onDurationSelect(option.value)}
                className={`h-12 text-sm font-medium transition-all duration-300 ${duration === option.value
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg scale-105'
                  : 'hover:shadow-md hover:scale-102'
                  }`}
              >
                <Clock className="w-4 h-4 ml-1" />
                {option.label}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Calendar */}
      <Card className="p-6 bg-white border-0 shadow-xl rounded-2xl">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
          <h3 className="text-xl font-bold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <Button
            variant="ghost"
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(currentMonth).map((date, index) => (
            <div key={index} className="aspect-square">
              {date && (
                <Button
                  variant="ghost"
                  onClick={() => onDateSelect(formatDate(date))}
                  disabled={isPastDate(date)}
                  className={`w-full h-full rounded-xl transition-all duration-300 ${selectedDate === formatDate(date)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-110'
                    : isToday(date)
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-200 hover:scale-105'
                      : isPastDate(date)
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'hover:bg-gray-100 hover:scale-105'
                    }`}
                >
                  {date.getDate()}
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Time Slots */}
      {selectedDate && clientType && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-0 shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Select a time المتاح</h3>
            {loadingSlots && (
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-purple-600" />
            )}
          </div>

          {loadingSlots ? (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <p className="text-gray-500">جارٍ تحميل الأوقات المتاحة...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableSlots.length > 0 ? (
                availableSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    onClick={() => onTimeSelect(time)}
                    className={`h-12 text-sm font-medium transition-all duration-300 ${selectedTime === time
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                      : 'hover:shadow-md hover:scale-102'
                      }`}
                  >
                    {time}
                  </Button>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">لا توجد أوقات متاحة في هذا Date</p>
                  <p className="text-sm text-gray-400 mt-2">يرجى اختيار تاريخ آخر</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ModernCalendar;