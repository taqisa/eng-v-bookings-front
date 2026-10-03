// src/components/EnhancedModernCalendar.tsx
import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { format, addDays, startOfWeek, parseISO, parse, addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { API_BASE_URL } from "@/lib/utils";
import TimeSlotPicker from './TimeSlotPicker';
import { requestAvailability, AvailabilityTimeoutError } from '@/lib/availability-request';

type Provider = Database['public']['Tables']['providers']['Row'];
type ServiceRow = { id: string; name: string; duration_minutes: number; };

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
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slotsRetry, setSlotsRetry] = useState(0);
  const nextSearchController = useRef<AbortController | null>(null);
  const selectionRef = useRef({ selectedTime, onTimeSelect });
  selectionRef.current = { selectedTime, onTimeSelect };
  const [expanded, setExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const showArrow = services.length > 4;
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
    const controller = new AbortController();
    setAvailableSlots([]);
    setSlotsError(null);
    setIsLoadingSlots(false);
    if (selectedDate && memoizedProvider && serviceId) {
      void fetchAvailableSlots(selectedDate, serviceId, duration, controller.signal);
    }
    return () => controller.abort();
  }, [selectedDate, serviceId, duration, memoizedProvider, providerId, slotsRetry]);

  // Discard in-flight quick searches when their provider/service changes.
  useEffect(() => {
    nextSearchController.current?.abort();
    setIsSearchingNextAvailable(false);
    setNextAvailableSearch(null);
    setFoundSlot(null);
    setSearchFromDate(new Date().toISOString());
    return () => nextSearchController.current?.abort();
  }, [providerId, serviceId, duration]);

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
        toast.error("Could not load the provider schedule");
        return;
      }
      setProvider(data as Provider);
    } catch (error) {
      console.error("🔧 [CALENDAR] Exception fetching provider:", error);
      toast.error("Could not load provider details");
    }
  };

  const fetchAvailableSlots = async (date: string, serviceId: string, duration: number, signal: AbortSignal) => {
    if (!memoizedProvider) return;
    const dayOfWeek = format(parseISO(date), "EEEE").toLowerCase();
    if (!memoizedProvider.working_days?.includes(dayOfWeek)) return;
    setIsLoadingSlots(true);
    try {
      const response = await requestAvailability<{ availableSlots: { start: string }[] }>(
        `${API_BASE_URL}/providers/${providerId}/available-slots?date=${date}&serviceId=${serviceId}&duration=${duration}`,
        { signal },
      );
      if (signal.aborted) return;
      if (!response.ok) throw new Error('Unable to load availability');
      const slots = (response.data.availableSlots || []).map(slot => slot.start);
      setAvailableSlots(slots);
      const selection = selectionRef.current;
      if (selection.selectedTime && !slots.includes(selection.selectedTime)) selection.onTimeSelect("");
    } catch (error) {
      if (signal.aborted) return;
      setSlotsError(error instanceof AvailabilityTimeoutError
        ? "The server is taking longer than usual. Please try again."
        : "Could not load available times. Please try again.");
      setAvailableSlots([]);
    } finally {
      if (!signal.aborted) setIsLoadingSlots(false);
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
      toast.warning(`Please select a service before choosing a date.`);
      return;
    }
    const isAvailable = isDateAvailable(date);
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    if (!isAvailable || isPast) {
      toast.error("This date is not available");
      return;
    }
    const dateString = format(date, "yyyy-MM-dd");
    onDateSelect(dateString);
    onTimeSelect("");
  };

  const handleTimeSelect = (time: string) => {
    onTimeSelect(time);
    onFoundSlotConfirmed();
  };

  const handleServiceSelect = (selectedServiceId: string) => {
    const service = services.find(s => s.id === selectedServiceId);
    if (service) {
      console.log("🔧 [CALENDAR] Service selected:", service.name, "Duration:", service.duration_minutes);
      onTimeSelect("");
      onDateSelect("");
      onServiceSelect(selectedServiceId, service.duration_minutes || 30);
    } else {
      console.warn("🔧 [CALENDAR] Service not found, using fallback duration");
      return;
    }
  };

  const handleFindNextAvailable = async (isFirstSearch = false) => {
    if (!serviceId || !duration) return;

    nextSearchController.current?.abort();
    const controller = new AbortController();
    nextSearchController.current = controller;
    setIsSearchingNextAvailable(true);
    setFoundSlot(null); // Clear previous found slot
    const fromDate = isFirstSearch ? new Date().toISOString() : searchFromDate;

    try {
      const response = await requestAvailability<{ available_slot?: { start: string; end: string; start_iso: string } }>(`${API_BASE_URL}/providers/${providerId}/next-available-slot`, {
        signal: controller.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration,
          start_after: fromDate,
        }),
      });

      if (controller.signal.aborted) return;
      if (!response.ok) {
        if (response.status !== 404) throw new Error('Availability server error');
        toast.error('No available appointments found.');
        setNextAvailableSearch(null);
        return;
      }

      const data = response.data;
      if (data.available_slot) {
        const { start_iso } = data.available_slot;
        const startDate = parseISO(start_iso);
        const endDate = addMinutes(startDate, duration);
        const end_iso = endDate.toISOString();

        setFoundSlot(data.available_slot);
        setNextAvailableSearch(data.available_slot);
        setSearchFromDate(end_iso);

        toast.success(`Appointment found: ${formatFoundSlotDate(start_iso)}`);
      } else {
        toast.info('No more appointments available.');
        setNextAvailableSearch(null);
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      toast.error(error instanceof AvailabilityTimeoutError
        ? 'The server is taking longer than usual. Please search again shortly.'
        : 'Could not search for an appointment. Please try again.');
    } finally {
      if (!controller.signal.aborted) setIsSearchingNextAvailable(false);
    }
  };

  const handleConfirmFoundSlot = () => {
    if (!foundSlot) return;
    const { start: startTime12hr, start_iso } = foundSlot;
    const startDate = parseISO(start_iso);

    onDateSelect(formatInTimeZone(startDate, timezone, 'yyyy-MM-dd'));
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
    return format(date, "EEEE", {});
  };

  const formatFoundSlotDate = (isoString: string) => {
    const date = parseISO(isoString);
    return formatInTimeZone(date, timezone, 'EEEE, MMMM d, yyyy, h:mm a');
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
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Choose a service</h3>
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
                    aria-pressed={isSelected}
                    onClick={() => handleServiceSelect(service.id)}
                    className={`relative p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-101 transform perspective-1000 hover:rotate-x-2 hover:rotate-y-2 ${isSelected
                      ? 'border-4 border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.7),0_0_20px_rgba(212,175,55,0.4)] animate-connect-disconnect'
                      : 'border-2 border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                      } ${isAvailable ? 'opacity-100' : 'opacity-50'} ${boxHeight}`}
                    style={visibleServices.length === 5 ? { gridArea: index === 4 ? 'center' : index < 2 ? `top${index + 1}` : undefined } : {}}
                    aria-label={`Select ${service.name}`}
                  >
                    <div className="flex flex-col items-center relative">
                      <span className={`font-semibold text-center ${textSize} font-sans text-gray-900`}>
                        {service.name}
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
              <button type="button"
                onClick={toggleExpanded}
                className="w-12 h-12 mx-auto mt-4 flex items-center justify-center bg-white border-2 border-[#D4AF37] text-[#D4AF37] rounded-full hover:bg-[#D4AF37]/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)] transition-all duration-300 ease-in-out"
                aria-label="Show more services"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            )}
            {expanded && (
              <button type="button"
                onClick={toggleExpanded}
                className="w-12 h-12 mx-auto mt-4 flex items-center justify-center bg-white border-2 border-[#D4AF37] text-[#D4AF37] rounded-full hover:bg-[#D4AF37]/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)] transition-all duration-300 ease-in-out"
                aria-label="Show fewer services"
              >
                <ChevronUp className="w-6 h-6" />
              </button>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-6 space-x-2">
                <Button type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)]"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button type="button"
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className={`border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)] ${currentPage === page ? 'bg-[#D4AF37] text-white' : ''}`}
                  >
                    {page}
                  </Button>
                ))}
                <Button type="button"
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
            Find an appointment
          </h3>
          <div className="flex flex-col items-center space-y-4">
            <Button type="button"
              onClick={() => handleFindNextAvailable(true)}
              disabled={isSearchingNextAvailable || !!foundSlot}
              className="w-full"
            >
              {isSearchingNextAvailable ? 'Searching…' : 'Find the nearest appointment'}
            </Button>

            {foundSlot && (
              <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg w-full">
                <p className="text-amber-800 font-semibold">
                  Next available appointment: {formatFoundSlotDate(foundSlot.start_iso)}
                </p>
                <div className="flex space-x-2 rtl:space-x-reverse mt-3 justify-center">
                  <Button type="button"
                    onClick={handleConfirmFoundSlot}
                    size="sm"
                    className="bg-[#D4AF37] hover:bg-[#c8a432]"
                  >
                    Review this appointment
                  </Button>
                  <Button type="button"
                    onClick={() => handleFindNextAvailable(false)}
                    disabled={isSearchingNextAvailable}
                    variant="outline"
                    size="sm"
                  >
                    {isSearchingNextAvailable ? 'Searching…' : 'Find the next appointment'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-white rounded-xl">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Or choose a date</h3>
        <div className="flex items-center justify-between mb-6">
          <button type="button"
            aria-label="Previous week" onClick={() => navigateWeek("prev")}
            className={`rounded-full w-10 h-10 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out ${weekStart <= today ? "opacity-50 cursor-not-allowed" : "hover:bg-[#D4AF37]/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)]"
              }`}
            disabled={weekStart <= today}
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {format(weekStart, "M / yyyy", {})}
          </h3>
          <button type="button"
            aria-label="Next week" onClick={() => navigateWeek("next")}
            className="rounded-full w-10 h-10 flex items-center justify-center bg-white shadow-sm hover:shadow-md hover:bg-[#D4AF37]/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)] transition-all duration-300 ease-in-out"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
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
                type="button"
                aria-pressed={isSelected}
                disabled={!serviceId || !isAvailable || isPast}
                onClick={() => handleDateSelect(day)}
                className={`booking-date-cell ${!isAvailable || isPast ? 'booking-date-unavailable' : ''} relative flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300 ease-in-out ${isSelected
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
            <Clock className="w-5 h-5 ml-2 text-[#D4AF37]" />
            Available times
          </h3>
          {!serviceId ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{`Please select a service first`}</p>
            </div>
          ) : !selectedDate ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Please choose a date first</p>
            </div>
          ) : isLoadingSlots ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#D4AF37] mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading available times…</p>
            </div>
          ) : slotsError ? (
            <div className="text-center py-8" role="alert">
              <p className="text-gray-500 mb-3">{slotsError}</p>
              <Button type="button" variant="outline" onClick={() => setSlotsRetry(value => value + 1)}>Try again</Button>
            </div>
          ) : availableSlots.length > 0 ? (
            <TimeSlotPicker slots={availableSlots} selected={selectedTime} onSelect={handleTimeSelect} disabled={!isTimeSelectionEnabled} duration={duration} />
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {memoizedProvider?.working_days?.includes(format(parseISO(selectedDate), "EEEE").toLowerCase())
                  ? "No appointments available on this date"
                  : "The provider does not work on this day"}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
