import { Button } from "@/components/ui/button";
import { Stethoscope, Scissors, Scale, Sparkles } from "lucide-react";

const ServicesSection = () => {
  const services = [{
    id: "doctors",
    title: "الأطباء",
    icon: Stethoscope,
    gradient: "from-blue-500/20 to-cyan-500/20"
  }, {
    id: "salons",
    title: "صالونات التجميل",
    icon: Scissors,
    gradient: "from-pink-500/20 to-rose-500/20"
  }, {
    id: "lawyers",
    title: "المحامين",
    icon: Scale,
    gradient: "from-green-500/20 to-emerald-500/20"
  }, {
    id: "massage",
    title: "العلاج الطبيعي",
    icon: Sparkles,
    gradient: "from-purple-500/20 to-violet-500/20"
  }];

  return (
    <section id="services" className="py-8 sm:py-10 relative overflow-hidden">
      {/* Subtle Background Lighting */}
      <div className="absolute inset-0 bg-gradient-radial from-golden/5 via-transparent to-transparent opacity-20"></div>
      <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title - Compact Luxury Typography */}
        {/* Section Title - Compact Luxury Typography with Fixed Clipping */}
        <div className="text-center mb-8 sm:mb-12 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 drop-shadow-2xl leading-normal pb-4 px-4 pt-2">
            خدماتنا المتنوعة
          </h2>
          <div className="w-32 sm:w-40 h-[2px] bg-gradient-to-r from-transparent via-golden/50 to-transparent mx-auto"></div>
        </div>

        {/* Services Grid - Compact Premium Glass Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-golden/30 p-4 text-center rounded-xl hover:scale-105 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,170,0,0.15)] animate-fade-in will-change-transform"
              style={{ animationDelay: `${index * 100}ms`, transform: 'translateZ(0)' }}
            >
              {/* Subtle Texture/Scratch Overlay */}
              <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.05)_49%,rgba(255,255,255,0.05)_51%,transparent_52%)] bg-[length:3px_3px]"></div>
                <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-white/10 to-transparent rotate-12 blur-[0.5px]"></div>
              </div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

              {/* Service Icon - Compact Glass Container */}
              <div className="relative w-12 h-12 mx-auto mb-3 rounded-lg bg-golden/10 border border-golden/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-golden/20 transition-all duration-300 backdrop-blur-sm">
                <service.icon className="w-6 h-6 text-golden relative z-10" />
                <div className="absolute inset-0 bg-golden/5 blur-md rounded-lg"></div>
              </div>

              {/* Service Title */}
              <h3 className="text-sm sm:text-base font-bold text-white relative z-10">{service.title}</h3>

              {/* Decorative Corner */}
              <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-golden/20"></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-golden/20"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;