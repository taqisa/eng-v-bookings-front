import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { ArrowRight, Star } from "lucide-react";

interface ProviderSelectionProps {
  organization: { id: string; name: string };
  providers: any[];
}

export default function ProviderSelection({ organization, providers }: ProviderSelectionProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{organization.name}</h1>
          <p className="text-xl text-gray-600">Choose your provider to book an appointment</p>
        </div>

        {providers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No providers are currently available for this clinic.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {providers.map((provider) => (
              <Card 
                key={provider.id} 
                className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border-0 bg-white shadow-md flex flex-col group"
                onClick={() => navigate(`/book/${provider.slug || provider.id}`)}
              >
                <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-indigo-200 p-1 group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={provider.image_filename || `https://majskvkyvflifttonwgr.supabase.co/storage/v1/object/public/pic/${provider.id}.jpg`}
                      alt={provider.name || 'Provider'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const initial = provider.name?.charAt(0) || 'P';
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=4F46E5&color=fff&size=128`;
                      }}
                    />
                  </div>
                  
                  {provider.display_name && (
                    <h3 className="text-sm font-medium text-gray-500 mb-1">{provider.display_name}</h3>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{provider.name}</h2>
                  
                  <p className="text-indigo-600 font-medium mb-4">{provider.specialty || 'General'}</p>
                </div>
                
                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center group-hover:bg-indigo-50 transition-colors">
                  <span className="text-indigo-600 font-medium group-hover:text-indigo-700">Book Appointment</span>
                  <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
