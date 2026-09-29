// src/components/EnhancedModernCalendar.tsx
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { format, addDays, startOfWeek, parseISO, parse, addMinutes } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { API_BASE_URL } from "@/lib/utils";

type Provider = Database['public']['Tables']['providers']['Row'];
type ServiceRow = Database['public']['Tables']['services']['Row'];

interface EnhancedModernCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  clientLabel: string;
  services: ServiceRow[];
  serviceId: string | null;
  onServiceSelect: (serviceId: string, duration: number) => void;
  duration: number;
  providerId: string;
  providerData?: Provider | null;
  onFoundSlotConfirmed: () => void;
}

const language = "en";
const timezone = "Asia/Jerusalem";

export default function EnhancedModernCalendar({
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  clientLabel,
  services = [],
  serviceId,
  onServiceSelect,
  duration,
  providerId,
  providerData,
  onFoundSlotConfirmed,
}: EnhancedModernCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [showArrow, setShowArrow] = useState(services.length > 4);
  const [nextAvailableSearch, setNextAvailableSearch] = useState(null);
  const [foundSlot, setFoundSlot] = useState(null);
  const [isSearchingNextAvailable, setIsSearchingNextAvailable] = useState(false);
  const [searchFromDate, setSearchFromDate] = useState(new Date().toISOString());
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 6 });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).filter(
    (day) => day >= today
  );

  const memoizedProviderData = useMemo(() => providerData, [providerData]);

  useEffect(() => {
    console.log("🔧 [CALENDAR] Loading for provider:", providerId);
    if (memoizedProviderData) {
      setProvider(memoizedProviderData);
    } else {
      fetchProviderSchedule();
    }
  }, [providerId, memoizedProviderData]);

  const memoizedProvider = useMemo(() => provider, [provider]);

  useEffect(() => {
    if (selectedDate && memoizedProvider && serviceId) {
      console.log("🔧 [CALENDAR] Fetching slots with duration:", duration);
      fetchAvailableSlots(selectedDate, serviceId, duration);
    }
  }, [selectedDate, serviceId, duration, memoizedProvider]);

  // Reset find next available search when service changes
  useEffect(() => {
    setNextAvailableSearch(null);
    setFoundSlot(null);
    setSearchFromDate(new Date().toISOString());
  }, [serviceId]);

  // Pagination logic
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = services.slice(startIndex, endIndex);
  const visibleServices = expanded ? paginatedServices : paginatedServices.slice(0, 4);

  // Dynamic grid layout based on number of services
  const getGridStyles = (serviceCount: number) => {
    if (serviceCount === 1) {
      return {
        grid: 'grid-cols-1',
        boxHeight: 'h-24',
        textSize: 'text-lg',
      };
    } else if (serviceCount <= 4) {
      return {
        grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2',
        boxHeight: 'h-20',
        textSize: 'text-base',
      };
    } else if (serviceCount === 5) {
      return {
        grid: 'grid grid-cols-3 grid-rows-2 gap-4',
        gridTemplateAreas: `
          "top1 top2 ."
          ". center ."
        `,
        boxHeight: 'h-16',
        textSize: 'text-base',
      };
    } else {
      return {
        grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        boxHeight: 'h-16',
        textSize: 'text-sm',
      };
    }
  };

  const { grid, gridTemplateAreas, boxHeight, textSize } = getGridStyles(visibleServices.length);





  const fetchProviderSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from("providers")
        .select("working_days, working_hours_start, working_hours_end, break_start, break_end, slot_duration, google_calendar_connected, active_google_account_id")
        .eq("id", providerId)
        .single();
      if (error) {
        console.error("🔧 [CALENDAR] Error fetching provider schedule:", error);
        toast.error("Failed to fetch provider schedule");
        return;
      }
      setProvider(data);
    } catch (error) {
      console.error("🔧 [CALENDAR] Exception fetching provider:", error);
      toast.error("Error fetching provider data");
    }
  };

  const fetchAvailableSlots = async (date: string, serviceId: string, duration: number) => {
    if (!memoizedProvider) {
      setAvailableSlots([]);
      return;
    }
    const dayOfWeek = format(parseISO(date), "EEEE").toLowerCase();
    if (!memoizedProvider.working_days.includes(dayOfWeek)) {
      setAvailableSlots([]);
      return;
    }
    setIsLoadingSlots(true);
    try {
      console.log("🔧 [CALENDAR] Fetching available slots with duration:", duration);
      const response = await fetch(`${API_BASE_URL}/providers/${providerId}/available-slots?date=${date}&serviceId=${serviceId}&duration=${duration}`);
      if (!response.ok) {
        console.error("🔧 [CALENDAR] Backend fetch error:", await response.json());
        toast.error("Failed to fetch available slots from server");
        setAvailableSlots([]);
        return;
      }
      const data = await response.json();
      const slots = (data.availableSlots || []).map((slot: any) => slot.start);
      setAvailableSlots(slots);
      if (selectedTime && !slots.includes(selectedTime)) {
        onTimeSelect("");
      }
    } catch (error) {
      console.error("🔧 [CALENDAR] Error fetching available slots:", error);
      toast.error("Error fetching available slots");
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const isDateAvailable = (date: Date) => {
    if (!memoizedProvider || !memoizedProvider.working_days) return false;
    const dayOfWeek = format(date, "EEEE").toLowerCase();
    const isWorkingDay = memoizedProvider.working_days.includes(dayOfWeek);
    const isNotPast = date >= new Date(new Date().setHours(0, 0, 0, 0));
    return isWorkingDay && isNotPast;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = addDays(currentWeek, direction === "next" ? 7 : -7);
    setCurrentWeek(newWeek);
  };

  const handleDateSelect = (date: Date) => {
    if (!serviceId) {
      toast.warning(`Please select a ${clientLabel} first to choose a date.`);
      return;
    }
    const isAvailable = isDateAvailable(date);
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    if (!isAvailable || isPast) {
      toast.error("This date is not available for booking");
      return;
    }
    const dateString = format(date, "yyyy-MM-dd");
    onDateSelect(dateString);
    onTimeSelect("");
  };

  const handleTimeSelect = (time: string) => {
    onTimeSelect(time);
  };

  const handleServiceSelect = (selectedServiceId: string) => {
    const service = services.find(s => s.id === selectedServiceId);
    if (service) {
      console.log("🔧 [CALENDAR] Service selected:", service.name, "Duration:", service.duration_minutes);
      onServiceSelect(selectedServiceId, service.duration_minutes);
    } else {
      console.warn("🔧 [CALENDAR] Service not found, using fallback duration");
      onServiceSelect('', 30); // Fallback duration
    }
  };

  const handleFindNextAvailable = async (isFirstSearch = false) => {
    if (!serviceId || !duration) return;

    setIsSearchingNextAvailable(true);
    setFoundSlot(null); // Clear previous found slot
    const fromDate = isFirstSearch ? new Date().toISOString() : searchFromDate;

    try {
      const response = await fetch(`${API_BASE_URL}/providers/${providerId}/next-available-slot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration,
          start_after: fromDate,
        }),
      });

      if (!response.ok) {
        toast.error('No available slots found.');
        setNextAvailableSearch(null);
        return;
      }

      const data = await response.json();
      console.log("Backend response:", data);
      if (data.available_slot) {
        const { start_iso } = data.available_slot;
        const startDate = parseISO(start_iso);
        const endDate = addMinutes(startDate, duration);
        const end_iso = endDate.toISOString();

        setFoundSlot(data.available_slot);
        setNextAvailableSearch(data.available_slot);
        setSearchFromDate(end_iso);

        toast.success(`Found slot: ${formatFoundSlotDate(start_iso)}`);
      } else {
        toast.info('No other slots available.');
        setNextAvailableSearch(null);
      }
    } catch (error) {
      console.error("Error fetching next available slot:", error);
      toast.error('Error searching for an appointment.');
    } finally {
      setIsSearchingNextAvailable(false);
    }
  };

  const handleConfirmFoundSlot = () => {
    if (!foundSlot) return;
    const { start: startTime12hr, start_iso } = foundSlot;
    const startDate = parseISO(start_iso);

    onDateSelect(format(startDate, 'yyyy-MM-dd'));
    onTimeSelect(startTime12hr);

    setFoundSlot(null);
    onFoundSlotConfirmed();
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setExpanded(false);
  };

  const isTimeSelectionEnabled = serviceId !== null && selectedDate !== "";

  const getRelativeDayName = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    if (format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")) {
      return "Today";
    }
    if (format(date, "yyyy-MM-dd") === format(addDays(new Date(), 1), "yyyy-MM-dd")) {
      return "Tomorrow";
    }
    if (format(date, "yyyy-MM-dd") === format(addDays(new Date(), 2), "yyyy-MM-dd")) {
      return "Day after tomorrow";
    }
    return format(date, "EEEE");
  };

  const formatFoundSlotDate = (isoString: string) => {
    const date = parseISO(isoString);
    const dayName = getRelativeDayName(date);
    const formattedDateTime = format(date, 'M/d/yyyy, h:mm a');
    return `${dayName}, ${formattedDateTime}`;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <style>
        {`
          @keyframes connect-disconnect {
            0% { border-color: #D4AF37; box-shadow: 0 0 12px rgba(212,175,55,0.7), 0 0 20px rgba(212,175,55,0.4); }
            50% { border-color: rgba(212,175,55,0.3); box-shadow: 0 0 6px rgba(212,175,55,0.3); }
            100% { border-color: #D4AF37; box-shadow: 0 0 12px rgba(212,175,55,0.7), 0 0 20px rgba(212,175,55,0.4); }
          }
          .animate-connect-disconnect {
            animation: connect-disconnect 1.2s ease-in-out infinite;
          }
        `}
      </style>
      <Card className="p-6 bg-white rounded-xl relative overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">{clientLabel}</h3>
        {services.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No services available for this provider
          </div>
        ) : (
          <div className="relative">
            <div
              className={`grid gap-4 ${grid} transition-all duration-300 ease-in-out`}
              style={gridTemplateAreas ? { gridTemplateAreas } : {}}
            >
              {visibleServices.map((service, index) => {
                const isSelected = serviceId === service.id;
                const isAvailable = true; // Placeholder: Add logic if services have availability status
                return (
                  <button
                    type="button"
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className={`relative p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-101 transform perspective-1000 hover:rotate-x-2 hover:rotate-y-2 ${isSelected
                      ? 'border-4 border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.7),0_0_20px_rgba(212,175,55,0.4)] animate-connect-disconnect'
                      : 'border-2 border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                      } ${isAvailable ? 'opacity-100' : 'opacity-50'} ${boxHeight}`}
                    style={visibleServices.length === 5 ? { gridArea: index === 4 ? 'center' : index < 2 ? `top${index + 1}` : undefined } : {}}
                    aria-label={`اختر ${language === 'ar' ? service.name : service.name}`}
                  >
                    <div className="flex flex-col items-center relative">
                      <span className={`font-semibold text-center ${textSize} font-arabic text-gray-900`}>
                        {language === 'ar' ? service.name : service.name}
                      </span>
                      {index < visibleServices.length - 1 && visibleServices.length !== 5 && (
                        <div className="w-3/4 h-px bg-[#D4AF37] mt-2 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      )}
                      {!isAvailable && (
                        <div className="absolute top-2 left-2 w-2 h-2 bg-red-400 rounded-full"></div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.2)_0%,transparent_70%)] opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                );
              })}
            </div>
            {showArrow && !expanded && visibleServices.length < paginatedServices.length && (
              <button
                onClick={toggleExpanded}
                className="w-12 h-12 mx-auto mt-4 flex items-center justify-center bg-white border-2 border-[#D4AF37] text-[#D4AF37] rounded-full hover:bg-[#D4AF37]/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)] transition-all duration-300 ease-in-out"
                aria-label="Show more"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            )}
            {expanded && (
              <button
                onClick={toggleExpanded}
                className="w-12 h-12 mx-auto mt-4 flex items-center justify-center bg-white border-2 border-[#D4AF37] text-[#D4AF37] rounded-full hover:bg-[#D4AF37]/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)] transition-all duration-300 ease-in-out"
                aria-label="Hide"
              >
                <ChevronUp className="w-6 h-6" />
              </button>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-6 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)]"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className={`border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)] ${currentPage === page ? 'bg-[#D4AF37] text-white' : ''}`}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)]"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {serviceId && (
        <Card className="p-6 bg-white rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Quick appointment search
          </h3>
          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={() => handleFindNextAvailable(true)}
              disabled={isSearchingNextAvailable || !!foundSlot}
              className="w-full"
            >
              {isSearchingNextAvailable ? 'Searching...' : 'Find the nearest appointment available'}
            </Button>

            {foundSlot && (
              <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg w-full">
                <p className="text-amber-800 font-semibold">
                  Next available slot: {formatFoundSlotDate(foundSlot.start_iso)}
                </p>
                <div className="flex space-x-2 mt-3 justify-center">
                  <Button
                    onClick={handleConfirmFoundSlot}
                    size="sm"
                    className="bg-[#D4AF37] hover:bg-[#c8a432]"
                  >
                    Confirm this slot
                  </Button>
                  <Button
                    onClick={() => handleFindNextAvailable(false)}
                    disabled={isSearchingNextAvailable}
                    variant="outline"
                    size="sm"
                  >
                    {isSearchingNextAvailable ? 'Searching...' : 'Search for next'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-white rounded-xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Or select a specific date</h3>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateWeek("prev")}
            className={`rounded-full w-10 h-10 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out ${weekStart <= today ? "opacity-50 cursor-not-allowed" : "hover:bg-[#D4AF37]/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)]"
              }`}
            disabled={weekStart <= today}
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {format(weekStart, "M / yyyy")}
          </h3>
          <button
            onClick={() => navigateWeek("next")}
            className="rounded-full w-10 h-10 flex items-center justify-center bg-white shadow-sm hover:shadow-md hover:bg-[#D4AF37]/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)] transition-all duration-300 ease-in-out"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {weekDays.map((day) => {
            const isSelected = selectedDate === format(day, "yyyy-MM-dd");
            const isAvailable = isDateAvailable(day);
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            const dayName = getRelativeDayName(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateSelect(day)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300 ease-in-out ${isSelected
                  ? "bg-white border-4 border-[#D4AF37] text-gray-900 shadow-[0_0_12px_rgba(212,175,55,0.7),0_0_20px_rgba(212,175,55,0.4)] animate-connect-disconnect"
                  : isToday && !isSelected
                    ? "bg-white text-gray-900 shadow-sm border-2 border-[#D4AF37]/20"
                    : isAvailable && !isPast
                      ? "bg-white text-gray-900 hover:bg-[#D4AF37]/10 hover:shadow-md border-2 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)]"
                      : "bg-gray-50 text-gray-300 cursor-not-allowed border-2 border-gray-100"
                  }`}
              >
                <div className={`text-xs font-medium mb-1 ${isSelected ? "text-[#D4AF37]" : isToday ? "text-[#D4AF37]" : "text-gray-500"
                  }`}>
                  {dayName}
                </div>
                <div className={`text-lg font-semibold ${isSelected ? "text-gray-900" : isToday ? "text-[#D4AF37]" : "text-gray-900"
                  }`}>
                  {format(day, "d")}
                </div>
                {isToday && !isSelected && (
                  <div className="absolute bottom-1 left-1 right-1 flex justify-center">
                    <div className="w-1/2 h-px bg-[#D4AF37]"></div>
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {!isAvailable && !isPast && (
                  <div className="absolute bottom-1 w-4 h-px bg-red-400 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </Card>
      {selectedDate && (
        <Card className={`p-6 bg-white border-0 shadow-sm rounded-xl ${!isTimeSelectionEnabled ? "opacity-70" : ""}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-[#D4AF37]" />
            Available Slots
          </h3>
          {!serviceId ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{`Please select a ${clientLabel} first`}</p>
            </div>
          ) : !selectedDate ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Please select a date first</p>
            </div>
          ) : isLoadingSlots ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#D4AF37] mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading slots...</p>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`p-3 text-base font-medium rounded-lg transition-all duration-300 ease-in-out ${isSelected
                      ? "bg-white border-4 border-[#D4AF37] text-gray-900 shadow-[0_0_12px_rgba(212,175,55,0.7),0_0_20px_rgba(212,175,55,0.4)] animate-connect-disconnect"
                      : "bg-white text-gray-900 hover:bg-[#D4AF37]/10 hover:shadow-md border-2 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)]"
                      }`}
                  >
                    <span className="font-arabic">{time}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {memoizedProvider?.working_days?.includes(format(parseISO(selectedDate), "EEEE").toLowerCase())
                  ? "No appointments available on this date"
                  : "The service provider does not work on this day"}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}