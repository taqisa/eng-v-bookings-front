import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, MapPin, ChevronLeft, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "@/integrations/supabase/client";

// Refined Hologram Display - Luxury Minimalist
const HologramDisplay = ({ cityName }: { cityName: string }) => {
  return (
    <div className="relative aspect-video rounded-xl my-4 overflow-hidden bg-white/5 backdrop-blur-md border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-golden/5 via-transparent to-golden/5">
        <motion.div className="absolute top-4 left-4 w-6 h-6 border border-golden/20 rotate-45" animate={{ y: [0, -8, 0], rotateZ: [45, 135, 45] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-6 right-8 w-4 h-4 bg-golden/10 rounded-full" animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative transform-gpu animate-hologram-float">
          <div className="relative bg-black/30 backdrop-blur-sm border border-golden/20 rounded-lg px-6 py-3">
            <div className="text-center">
              <div className="text-xs text-golden/60 font-medium mb-1 tracking-wider">مدينة</div>
              <div className="text-lg font-bold text-white">{cityName}</div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes hologram-float {
          0%, 100% { transform: rotateX(3deg) rotateY(2deg) translateY(0px); }
          50% { transform: rotateX(-3deg) rotateY(-2deg) translateY(-5px); }
        }
        .animate-hologram-float {
          animation: hologram-float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const CitiesSection = () => {
  const [cityProviderCounts, setCityProviderCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const allCities = [
    { id: 'salfit', name: 'سلفيت', nameEn: 'Salfit', region: 'الضفة الغربية', description: 'احجز موعدك الآن', coords: '86,000', tags: ['صالونات', 'محاميين', 'أطباء'] },
    { id: 'ramallah', name: 'رام الله', nameEn: 'Ramallah', region: 'الضفة الغربية', description: 'احجز موعدك الآن', coords: '370,000', tags: ['صالونات', 'محاميين', 'أطباء'] },
    { id: 'nablus', name: 'نابلس', nameEn: 'Nablus', region: 'الضفة الغربية', description: 'احجز موعدك الآن', coords: '431,000', tags: ['صالونات', 'محاميين', 'أطباء'] },
    { id: 'hebron', name: 'الخليل', nameEn: 'Hebron', region: 'الضفة الغربية', description: 'احجز موعدك الآن', coords: '762,500', tags: ['صالونات', 'محاميين', 'أطباء'] },
    { id: 'bethlehem', name: 'بيت لحم', nameEn: 'Bethlehem', region: 'الضفة الغربية', description: 'احجز موعدك الآن', coords: '244,700', tags: ['صالونات', 'محاميين', 'أطباء'] },
    { id: 'jenin', name: 'جنين', nameEn: 'Jenin', region: 'الضفة الغربية', description: 'احجز موعدك الآن', coords: '352,900', tags: ['صالونات', 'محاميين', 'أطباء'] },
  ];

  const displayedCities = showAll ? allCities : allCities.slice(0, 3);

  useEffect(() => { fetchProviderCounts(); }, []);
  const fetchProviderCounts = async () => {
    try {
      const { data, error } = await supabase.from('providers').select('city_id');
      if (error) { console.error('Error fetching provider counts:', error); return; }
      const counts: { [key: string]: number } = {};
      data?.forEach(provider => {
        const cityId = provider.city_id.toLowerCase();
        counts[cityId] = (counts[cityId] || 0) + 1;
        if (provider.city_id === 'سلفيت') { counts['salfit'] = (counts['salfit'] || 0) + 1; }
      });
      setCityProviderCounts(counts);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <section id="cities" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">المدن المتاحة</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="animate-pulse"><div className="h-[480px] bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"></div></div>))}
          </div>
        </div>
      </section>
    );
  }

  const CityCard = ({ city, providerCount, hasProviders }: any) => (
    <div className={`relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-golden/30 text-white shadow-lg transition-all duration-500 [transform-style:preserve-3d] [transform:rotateY(-10deg)] hover:[transform:rotateY(0deg)_scale(1.05)] hover:shadow-[0_0_30px_rgba(255,170,0,0.15)] will-change-transform ${!hasProviders ? 'opacity-50' : ''}`} style={{ transform: 'translateZ(0)' }}>
      {/* Subtle Texture/Scratch Overlay - Premium Used Look with MORE scratches */}
      <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none overflow-hidden rounded-2xl" style={{ transform: 'translateZ(0)' }}>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.03)_49%,rgba(255,255,255,0.03)_51%,transparent_52%)] bg-[length:4px_4px]"></div>
        {/* Randomized Scratches to fill empty space */}
        <div className="absolute top-0 right-0 w-48 h-px bg-white/10 rotate-[15deg] blur-[0.5px]"></div>
        <div className="absolute top-1/4 left-0 w-32 h-px bg-white/5 -rotate-[25deg]"></div>
        <div className="absolute top-2/3 right-10 w-24 h-px bg-white/10 rotate-[45deg]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-px bg-white/5 rotate-[110deg]"></div>
        <div className="absolute top-10 left-1/3 w-16 h-px bg-white/8 -rotate-[35deg]"></div>
        <div className="absolute bottom-10 right-1/4 w-20 h-px bg-white/6 rotate-[75deg]"></div>
        <div className="absolute top-1/2 left-0 w-64 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-[2deg]"></div>
      </div>
      <div className="p-4 sm:p-5 relative z-10 text-right space-y-2 sm:space-y-3 md:space-y-4">
        <div className="flex justify-between items-start">
          <div className="w-6 h-6 border border-golden/20 rotate-45"></div>
          <div className="bg-golden/10 border border-golden/20 text-golden px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm">{city.region}</div>
        </div>
        <HologramDisplay cityName={city.name} />
        <div className="space-y-2 sm:space-y-3">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">{city.name}</h3>
            <p className="text-golden/80 font-medium text-xs sm:text-sm">{city.nameEn}</p>
          </div>
          <p className="text-gray-300 text-xs sm:text-sm">{city.description}</p>
          <div className="flex justify-end items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{providerCount}</span>
              <Users className="w-4 h-4 text-golden" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{city.coords}</span>
              <MapPin className="w-4 h-4 text-golden" />
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {city.tags.map((tag: string) => (<span key={tag} className="bg-golden/5 border border-golden/20 text-golden px-3 py-1 text-xs font-semibold rounded-full">{tag}</span>))}
          </div>
        </div>
        <div className="pt-4 border-t border-white/10">
          <div className="group/btn relative overflow-hidden bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.05)] flex justify-between items-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
            <ChevronLeft className="w-5 h-5 relative z-10" />
            <span className="relative z-10 font-bold">استكشف الخدمات</span>
            <MapPin className="w-5 h-5 relative z-10 text-golden" />
          </div>
        </div>
      </div>
      {!hasProviders && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center overflow-hidden z-20 bg-black/40 backdrop-blur-sm">
          <div className="transform -rotate-45 bg-red-500/90 text-white font-bold tracking-widest text-xl px-20 py-3 border-2 border-red-400 shadow-lg">
            قريباً
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section id="cities" className="py-8 sm:py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-golden/5 via-transparent to-transparent opacity-30"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-golden/10 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-golden/5 border border-golden/20 backdrop-blur-sm shadow-[0_0_15px_rgba(255,170,0,0.08)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-golden opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-golden"></span>
            </span>
            <span className="text-xs sm:text-sm font-black text-golden tracking-widest uppercase">اكتشف المدن</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 drop-shadow-2xl leading-normal pb-4 px-4">
            جميع المدن الفلسطينية
          </h2>
          <div className="w-32 sm:w-40 h-[2px] bg-gradient-to-r from-transparent via-golden/50 to-transparent mx-auto"></div>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {displayedCities.map((city, index) => {
              const providerCount = cityProviderCounts[city.id] || 0;
              const hasProviders = providerCount >= 1;

              return (
                <motion.div
                  key={city.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                  className="group [perspective:1200px]"
                >
                  {hasProviders ? (
                    <Link to={`/city/${city.id}`} className="block h-full">
                      <CityCard city={city} providerCount={providerCount} hasProviders={hasProviders} />
                    </Link>
                  ) : (
                    <div className="block h-full">
                      <CityCard city={city} providerCount={providerCount} hasProviders={hasProviders} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Apple-style "View More" Button with Blur & Glow */}
        {allCities.length > 3 && (
          <div className="mt-12 text-center relative z-20">
            <button
              onClick={() => setShowAll(!showAll)}
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-3.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-500 overflow-hidden hover:scale-105 active:scale-95"
            >
              {/* Button Inner Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-golden/10 via-transparent to-golden/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              {/* Icon & Text */}
              <span className="relative z-10 flex items-center gap-2 text-sm font-bold text-gray-200 group-hover:text-white transition-colors duration-300">
                {showAll ? 'عرض أقل' : 'عرض المزيد'}
                <span className={`bg-white/10 rounded-full p-1 transition-transform duration-500 ${showAll ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronDown className="w-4 h-4 text-golden" />
                </span>
              </span>

              {/* Ring Bloom */}
              <div className="absolute -inset-1 rounded-full border border-white/5 group-hover:border-golden/20 transition-colors duration-700"></div>
            </button>
          </div>
        )}
      </div>

      {/* Golden Separator Line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-golden/40 to-transparent"></div>
    </section>
  );
};

export default CitiesSection;