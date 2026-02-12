import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Phone,
  Clock,
  ArrowLeft,
  CalendarSearch,
  Filter,
  Stethoscope,
  Scale,
  Scissors,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ==========================================
// CONFIGURATION
// ==========================================
const INDUSTRIES = [
  { name: "الكل", id: "all", icon: LayoutGrid },
  { name: "أطباء", id: "1", icon: Stethoscope },
  { name: "محامون", id: "2", icon: Scale },
  { name: "تجميل", id: "3", icon: Scissors },
  { name: "علاج طبيعي", id: "5", icon: Sparkles },
];

interface Provider {
  id: string;
  name: string;
  name_ar: string;
  display_name: string | null;
  specialty: string;
  specialty_ar: string;
  image_filename: string | null;
  city_id: string;
  phone: string | null;
  location: string | null;
  rating: number | null;
  review_count: number | null;
  experience: string | null;
}

// ==========================================
// COMPONENT: PROVIDER CARD (Glassmorphism)
// ==========================================
const ProviderCard = ({ provider }: { provider: Provider }) => (
  <div className="group relative w-full max-w-[300px]">
    {/* 3D Hover Glow Effect */}
    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-500"></div>

    <div className="relative h-full bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

      {/* Avatar with Ring */}
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-amber-300 to-amber-600 shadow-inner">
          <img
            src={
              provider.image_filename ||
              `https://majskvkyvflifttonwgr.supabase.co/storage/v1/object/public/pic/${provider.id}.jpg`
            }
            alt={provider.display_name || provider.name_ar}
            className="w-full h-full object-cover rounded-full bg-white"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/96/D4AF37/FFFFFF?text=" + encodeURIComponent(provider.name_ar?.charAt(0) || "P");
            }}
          />
        </div>
        {/* Rating Badge */}
        {provider.rating && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded-full shadow-md flex items-center space-x-1 rtl:space-x-reverse border border-amber-100">
            <Star className="w-3 h-3 text-amber-500 fill-current" />
            <span className="text-xs font-bold text-gray-700">{provider.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="flex-grow w-full">
        <h2 className="text-lg font-bold text-gray-900 leading-tight">
          {provider.display_name || provider.name_ar}
        </h2>
        <p className="text-amber-600 font-medium text-sm mt-1 mb-4">
          {provider.specialty_ar}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-y-2 text-xs text-slate-600 w-full bg-slate-50/50 rounded-lg p-3 border border-slate-100 mb-4">
          {provider.experience && (
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{provider.experience}</span>
            </div>
          )}
          {provider.location && (
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span className="truncate max-w-[180px]">{provider.location}</span>
            </div>
          )}
        </div>
      </div>

      <Link to={`/booking/${provider.id}`} className="w-full">
        <Button className="w-full bg-gray-900 hover:bg-amber-600 text-white font-medium py-2 rounded-xl shadow-lg shadow-amber-900/10 transition-all duration-300 transform group-hover:scale-105">
          حجز موعد
        </Button>
      </Link>
    </div>
  </div>
);

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
const CityPage = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const industrySectionRef = useRef<HTMLDivElement>(null);

  const getCityDisplayName = (id: string): string => {
    const cityNames: { [key: string]: string } = {
      salfit: "سلفيت", "سلفيت": "سلفيت",
      ramallah: "رام الله", nablus: "نابلس",
      hebron: "الخليل", bethlehem: "بيت لحم",
      jenin: "جنين", qalqilya: "قلقيلية",
      tulkarm: "طولكرم", jericho: "أريحا",
      gaza: "غزة"
    };
    return cityNames[id.toLowerCase()] || id;
  };

  const cityName = cityId ? getCityDisplayName(cityId) : "";

  useEffect(() => {
    const fetchProviders = async () => {
      if (!cityId) return;
      setLoading(true);
      try {
        const cityDisplayName = getCityDisplayName(cityId);
        const { data, error } = await supabase
          .from("providers")
          .select(`id, name, name_ar, display_name, specialty, specialty_ar, image_filename, city_id, phone, location, rating, review_count, experience`)
          .or(`city_id.eq.${cityId},city_id.eq.${cityDisplayName}`);

        if (error) throw error;
        setProviders(data || []);
      } catch (error) {
        console.error("Error:", error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [cityId]);

  const filteredProviders = selectedIndustry && selectedIndustry !== 'all'
    ? providers.filter((provider) => provider.specialty === selectedIndustry)
    : providers;

  // Render Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute top-0 w-16 h-16 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  // Render Empty State
  if (!providers.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 bg-white/60 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white/40">
            <CalendarSearch className="w-20 h-20 text-slate-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-slate-800 mb-2">عفواً، لا توجد نتائج</h1>
            <p className="text-slate-500 mb-8">لم يتم العثور على مقدمي خدمات في {cityName} حتى الآن.</p>
            <Link to="/">
              <Button className="bg-slate-900 text-white hover:bg-amber-600 px-8 rounded-full">
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* 
        ==================================================
        BACKGROUND "3D" AMBIENCE
        ==================================================
      */}
      <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-200/30 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] mix-blend-multiply opacity-70"></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-amber-100/20 rounded-full blur-[80px]"></div>
      </div>

      <Header />

      <main className="relative z-10 pt-28 pb-20">

        {/* 
          ==================================================
          COMPACT & MODERN HEADER
          ==================================================
        */}
        <section className="text-center mb-10 px-4">
          <div className="inline-block animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
              {cityName}
            </h1>
            <div className="h-1.5 w-24 bg-gradient-to-r from-amber-400 to-transparent mx-auto rounded-full"></div>
            <p className="mt-3 text-slate-500 font-medium text-sm md:text-base">
              نخبة مقدمي الخدمات المحترفين في مدينتك
            </p>
          </div>
        </section>

        {/* 
          ==================================================
          SYMBOLIST FILTER DOCK (Floating Glass)
          ==================================================
        */}
        <div className="sticky top-24 z-30 px-4 mb-12 flex justify-center">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50 rounded-full p-2 flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full scrollbar-hide ring-1 ring-slate-100">
            {INDUSTRIES.map((ind) => {
              const isActive = (selectedIndustry === ind.id) || (selectedIndustry === null && ind.id === 'all');
              return (
                <button
                  key={ind.id}
                  onClick={() => setSelectedIndustry(ind.id === 'all' ? null : ind.id)}
                  className={`
                    relative group flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all duration-300 whitespace-nowrap outline-none
                    ${isActive
                      ? "bg-slate-900 text-white shadow-md transform scale-105"
                      : "text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                    }
                  `}
                >
                  <ind.icon className={`w-5 h-5 sm:w-4 sm:h-4 ${isActive ? "text-amber-400" : "text-current"}`} />
                  <span className="text-[10px] sm:text-sm font-bold leading-none sm:leading-normal mt-0.5 sm:mt-0">{ind.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 
          ==================================================
          PROVIDERS GRID
          ==================================================
        */}
        <section
          ref={industrySectionRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[50vh]"
        >
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {filteredProviders.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-8">
                {filteredProviders.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            ) : (
              // Empty Search State
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 mx-auto max-w-lg">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <Filter className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">لا توجد نتائج في هذا القسم</h3>
                <p className="text-slate-500 text-sm mt-1">حاول اختيار قسم آخر أو تصفح الكل.</p>
                <button
                  onClick={() => setSelectedIndustry(null)}
                  className="mt-4 text-amber-600 font-bold text-sm hover:underline"
                >
                  عرض جميع الخدمات
                </button>
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default CityPage;