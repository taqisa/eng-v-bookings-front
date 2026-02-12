
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Clock, ArrowLeft, ArrowRight, Activity, Scissors, Scale, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

const ProviderCard = ({ provider }: { provider: Provider }) => (
    <div
        key={provider.id}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl hover:shadow-amber-400/20 transition-all duration-300 ease-in-out flex flex-col transform hover:-translate-y-1 w-full max-w-xs border-2 border-transparent hover:border-amber-400"
    >
        <div className="p-6 flex flex-col items-center text-center h-full">
            <div className="relative mb-5">
                <img
                    src={
                        provider.image_filename ||
                        `https://majskvkyvflifttonwgr.supabase.co/storage/v1/object/public/pic/${provider.id}.jpg`
                    }
                    alt={provider.display_name || provider.name_ar}
                    className="w-24 h-24 object-cover rounded-full shadow-md"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                            "https://via.placeholder.com/96/D4AF37/FFFFFF?text=" +
                            encodeURIComponent(provider.name_ar?.charAt(0) || "P");
                    }}
                />
                <div className="absolute top-0 right-0 w-full h-full rounded-full ring-4 ring-amber-400/50 ring-offset-2 ring-offset-white"></div>
            </div>

            <div className="flex-grow">
                {provider.display_name && (
                    <h3 className="text-base font-medium text-slate-600">
                        {provider.display_name}
                    </h3>
                )}
                <h2 className="text-xl font-bold text-gray-800 mt-1">
                    {provider.name_ar}
                </h2>
                <p className="text-amber-600 font-semibold text-sm mt-1">
                    {provider.specialty_ar}
                </p>

                {provider.rating && (
                    <div className="flex items-center justify-center mt-3 space-x-2 rtl:space-x-reverse">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(provider.rating!)
                                            ? "text-amber-400 fill-current"
                                            : "text-slate-300"
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                            {provider.rating.toFixed(1)} ({provider.review_count || 0} تقييم)
                        </span>
                    </div>
                )}
            </div>

            <div className="w-full pt-5 mt-5 border-t border-slate-200 text-slate-600 space-y-2">
                {provider.experience && (
                    <div className="flex items-center justify-center text-xs">
                        <Clock className="w-4 h-4 ml-2 text-amber-500" />
                        <span>{provider.experience}</span>
                    </div>
                )}
                {provider.location && (
                    <div className="flex items-center justify-center text-xs">
                        <MapPin className="w-4 h-4 ml-2 text-amber-500" />
                        <span>{provider.location}</span>
                    </div>
                )}
            </div>

            <Link to={`/booking/${provider.id}`} className="w-full mt-5">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-px transition-all duration-300 ease-in-out text-sm">
                    احجز موعد الآن
                </Button>
            </Link>
        </div>
    </div>
);

const CategoryPage = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);

    const getCategoryInfo = (id: string | undefined) => {
        switch (id) {
            case 'doctors': return { title: 'الأطباء', titleEn: 'Doctors', icon: Activity, term: 'طبيب' };
            case 'salons': return { title: 'صالونات التجميل', titleEn: 'Beauty Salons', icon: Scissors, term: 'جمال' }; // Search term guess
            case 'lawyers': return { title: 'المحامين', titleEn: 'Lawyers', icon: Scale, term: 'محامي' };
            case 'therapy': return { title: 'العلاج الطبيعي', titleEn: 'Physical Therapy', icon: Sparkles, term: 'علاج' };
            default: return { title: 'الخدمات', titleEn: 'Services', icon: Activity, term: '' };
        }
    };

    const categoryInfo = getCategoryInfo(categoryId);
    const Icon = categoryInfo.icon;

    useEffect(() => {
        const fetchProviders = async () => {
            if (!categoryId) return;
            setLoading(true);
            try {
                let query = supabase.from("providers").select("*");

                // Loose matching for demo purposes since we don't know exact DB values
                if (categoryId === 'doctors') {
                    query = query.or(`specialty_ar.ilike.%طبيب%,specialty_ar.ilike.%دكتور%,specialty.ilike.%doctor%`);
                } else if (categoryId === 'salons') {
                    query = query.or(`specialty_ar.ilike.%تجميل%,specialty_ar.ilike.%صالون%,specialty.ilike.%salon%`);
                } else if (categoryId === 'lawyers') {
                    query = query.or(`specialty_ar.ilike.%محامي%,specialty.ilike.%lawyer%`);
                } else if (categoryId === 'therapy') {
                    query = query.or(`specialty_ar.ilike.%علاج%,specialty.ilike.%therapy%`);
                }

                const { data, error } = await query;

                if (error) {
                    console.error("Error fetching providers:", error);
                    setProviders([]);
                } else {
                    setProviders(data || []);
                }
            } catch (error) {
                console.error("An unexpected error occurred:", error);
                setProviders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
    }, [categoryId]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-grow pt-24 pb-16">
                {/* Header Section */}
                <div className="bg-gray-900 text-white py-12 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-primary/20">
                            <Icon className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold mb-2 text-white">{categoryInfo.title}</h1>
                        <p className="text-primary text-lg">{categoryInfo.titleEn}</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : providers.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-8">
                            {providers.map((provider) => (
                                <ProviderCard key={provider.id} provider={provider} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">لا يوجد مقدمي خدمات حالياً</h3>
                            <p className="text-gray-500 mb-8">نعمل على إضافة المزيد من {categoryInfo.title} قريباً</p>
                            <Link to="/">
                                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                                    العودة للرئيسية
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CategoryPage;
