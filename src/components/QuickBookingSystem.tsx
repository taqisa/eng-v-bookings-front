
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Calendar, Search, Filter, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface Provider {
  id: string;
  name: string;
  name: string;
  display_name: string | null;
  specialty: string;
  image_filename: string | null;
  city_id: string;
}

interface QuickBookingSystemProps {
  onStateChange?: (state: { city: string; category: string; date: boolean; hasResults: boolean }) => void;
}

const QuickBookingSystem = ({ onStateChange }: QuickBookingSystemProps) => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateSelected, setDateSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('id, name, name, display_name, specialty, image_filename, city_id');

      if (error) {
        console.error('Error fetching providers:', error);
        return;
      }

      console.log('Fetched providers:', data);
      setProviders(data || []);

      const uniqueCities = Array.from(new Set(data?.map(p => p.city_id) || []));
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCityDisplayName = (cityId: string) => {
    const cityNames: { [key: string]: string } = {
      'salfit': 'سلفيت',
      'سلفيت': 'سلفيت',
      'ramallah': 'رام الله',
      'nablus': 'نابلس',
      'hebron': 'الخليل',
      'bethlehem': 'بيت لحم',
      'jenin': 'جنين'
    };
    return cityNames[cityId] || cityId;
  };

  const handleBooking = (providerId: string) => {
    navigate(`/booking/${providerId}`);
  };

  // Filter providers by city, category, and search
  const filteredProviders = providers.filter(p => {
    const cityMatch = p.city_id === selectedCity || p.city_id === getCityDisplayName(selectedCity);
    const categoryMatch = selectedCategory === 'all' || p.specialty.includes(selectedCategory);
    const searchMatch = searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.display_name && p.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.specialty.toLowerCase().includes(searchQuery.toLowerCase());

    return cityMatch && categoryMatch && searchMatch;
  });

  // Notify parent of state changes for "Invisible UI"
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        city: selectedCity,
        category: selectedCategory,
        date: dateSelected,
        hasResults: filteredProviders.length > 0 && selectedCity !== ''
      });
    }
  }, [selectedCity, selectedCategory, dateSelected, filteredProviders.length, onStateChange]);

  if (loading) {
    return (
      <Card className="relative p-6 sm:p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl max-w-md mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="animate-pulse space-y-6 relative z-10">
          <div className="h-6 bg-white/10 rounded-lg w-2/3 mx-auto"></div>
          <div className="h-12 bg-white/5 rounded-xl"></div>
          <div className="h-24 bg-white/5 rounded-xl"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative w-full p-8 sm:p-10 bg-[#121212]/80 backdrop-blur-2xl border border-white/10 text-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_70px_rgba(251,191,36,0.1)] group/card">
      {/* Subtle Corner Glow/Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-golden/5 rounded-full blur-[80px] pointer-events-none group-hover/card:bg-golden/10 transition-colors duration-700"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full justify-between min-h-[420px]">

        {/* Header */}
        <div className="mb-8 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-golden/10 border border-golden/20 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-golden animate-pulse"></div>
            <span className="text-[11px] font-bold text-golden tracking-widest uppercase">حجز فوري وسريع</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-2">
            احجز موعدك <span className="text-golden">الآن</span>
          </h2>
          <p className="text-gray-400 text-sm font-medium">أقرب موعد مع أفضل الأطباء والمختصين</p>
        </div>

        <div className="space-y-5 flex-1">
          {/* City Selection */}
          <div className="group/input relative transition-all duration-300">
            <label className="block text-xs font-bold text-gray-400 mb-2 flex items-center justify-end gap-1.5 uppercase tracking-wide">
              <span>المدينة</span>
              <MapPin className="w-3.5 h-3.5 text-golden" />
            </label>
            <Select value={selectedCity} onValueChange={(value) => { setSelectedCity(value); setSelectedCategory('all'); setSearchQuery(''); setCurrentIndex(0); setDateSelected(false); }}>
              <SelectTrigger id="city-select-trigger" className="w-full text-right bg-white/5 border border-white/10 text-white hover:bg-white/10 focus:ring-2 focus:ring-golden/50 focus:border-golden/50 transition-all rounded-2xl h-14 px-5 text-lg font-semibold">
                <SelectValue placeholder="اختر مدينتك" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-2">
                {cities.map((cityId) => (
                  <SelectItem
                    key={cityId}
                    value={cityId}
                    className="text-right hover:bg-white/10 focus:bg-white/10 text-white font-medium cursor-pointer rounded-lg py-3 my-1"
                  >
                    {getCityDisplayName(cityId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service & Date Row */}
          <div className="flex gap-4">
            {/* Service Category */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 mb-2 flex items-center justify-end gap-1.5 uppercase tracking-wide">
                <span>الخدمة</span>
                <Filter className="w-3.5 h-3.5 text-golden" />
              </label>
              <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); setCurrentIndex(0); setDateSelected(false); }}>
                <SelectTrigger className="w-full text-right bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all rounded-2xl h-14 px-5 text-base font-semibold">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-2">
                  <SelectItem value="all" className="text-right hover:bg-white/10 text-white rounded-lg py-2">الكل</SelectItem>
                  <SelectItem value="طبيب" className="text-right hover:bg-white/10 text-white rounded-lg py-2">أطباء</SelectItem>
                  <SelectItem value="صالون" className="text-right hover:bg-white/10 text-white rounded-lg py-2">صالونات</SelectItem>
                  <SelectItem value="محامي" className="text-right hover:bg-white/10 text-white rounded-lg py-2">محاميين</SelectItem>
                  <SelectItem value="physiotherapy" className="text-right hover:bg-white/10 text-white rounded-lg py-2">Physiotherapy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dummy Date Selector (Visual) */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 mb-2 flex items-center justify-end gap-1.5 uppercase tracking-wide">
                <span>Date</span>
                <Calendar className="w-3.5 h-3.5 text-golden" />
              </label>
              <button
                onClick={() => setDateSelected(!dateSelected)}
                className={`w-full flex items-center justify-between border transition-all rounded-2xl h-14 px-4 text-sm font-medium ${dateSelected
                  ? 'bg-golden/10 border-golden text-golden shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <span className="text-xs opacity-50"><ChevronLeft className="w-4 h-4" /></span>
                <span>{dateSelected ? 'Selected' : 'Today'}</span>
              </button>
            </div>
          </div>

          {/* Results Area (Provider Preview or CTA) */}
          <div className="pt-4">
            {selectedCity && filteredProviders.length > 0 ? (
              <div className="relative">
                {/* Single Active Provider Card Preview */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={filteredProviders[currentIndex].id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-golden/30 transition-colors cursor-pointer group/provider"
                    onClick={() => handleBooking(filteredProviders[currentIndex].id)}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={filteredProviders[currentIndex].image_filename || 'https://tinyurl.com/3kp7r9rj'}
                        alt={filteredProviders[currentIndex].name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover/provider:border-golden/50 transition-colors"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#121212] rounded-full"></span>
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <h4 className="text-white font-bold truncate">{filteredProviders[currentIndex].name}</h4>
                      <p className="text-golden text-xs truncate">{filteredProviders[currentIndex].specialty}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-golden text-black flex items-center justify-center transform group-hover/provider:scale-110 transition-transform">
                      <ChevronLeft className="w-5 h-5" />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Pagination/Navigation for Providers */}
                {filteredProviders.length > 1 && (
                  <div className="flex justify-center gap-3 mt-4">
                    <button
                      onClick={() => setCurrentIndex((prev) => (prev - 1 + filteredProviders.length) % filteredProviders.length)}
                      className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-500 font-mono py-2">{currentIndex + 1} / {filteredProviders.length}</span>
                    <button
                      onClick={() => setCurrentIndex((prev) => (prev + 1) % filteredProviders.length)}
                      className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-24 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-gray-500 text-sm">
                {selectedCity ? 'No results' : 'Select your city to start'}
              </div>
            )}
          </div>
        </div>

      </div>
    </Card>
  );
};

export default QuickBookingSystem;
