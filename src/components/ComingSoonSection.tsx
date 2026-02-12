import { CreditCard, FileText, Bell, Star } from "lucide-react";

const ComingSoonSection = () => {
  const upcomingFeatures = [
    {
      id: "payment",
      title: "الدفع الإلكتروني",
      titleEn: "Electronic Payment",
      description: "ادفع رسوم الخدمة بأمان عبر الإنترنت",
      icon: CreditCard,
      status: "قريباً",
      gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
      id: "records",
      title: "السجل الطبي",
      titleEn: "Medical Records",
      description: "احتفظ بسجلك الطبي وتاريخ زياراتك",
      icon: FileText,
      status: "قيد التطوير",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      id: "notifications",
      title: "التنبيهات الذكية",
      titleEn: "Smart Notifications",
      description: "تذكيرات عبر الرسائل النصية والبريد الإلكتروني",
      icon: Bell,
      status: "قريباً",
      gradient: "from-orange-500/20 to-yellow-500/20"
    },
    {
      id: "reviews",
      title: "نظام التقييمات",
      titleEn: "Review System",
      description: "قيّم تجربتك وساعد الآخرين في الاختيار",
      icon: Star,
      status: "قيد التطوير",
      gradient: "from-purple-500/20 to-pink-500/20"
    }
  ];

  return (
    <section className="py-8 sm:py-10 relative overflow-hidden">
      {/* Subtle Background Lighting */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent opacity-30"></div>
      <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title - Compact Luxury Typography */}
        <div className="text-center mb-6 sm:mb-8 space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-golden/5 border border-golden/20 backdrop-blur-sm shadow-[0_0_15px_rgba(255,170,0,0.08)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-golden opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-golden"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-black text-golden tracking-widest uppercase">المستقبل القريب</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 drop-shadow-2xl leading-normal pb-4 px-4 pt-2">
            ميزات قادمة
          </h2>
          <div className="w-32 sm:w-40 h-[2px] bg-gradient-to-r from-transparent via-golden/50 to-transparent mx-auto"></div>
        </div>

        {/* Features Grid - Compact Premium Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {upcomingFeatures.map((feature, index) => (
            <div
              key={feature.id}
              className="group relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-golden/30 p-4 rounded-xl hover:scale-[1.02] transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,170,0,0.15)] animate-fade-in will-change-transform"
              style={{ animationDelay: `${index * 100}ms`, transform: 'translateZ(0)' }}
            >
              {/* Subtle Texture/Scratch Overlay */}
              <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.05)_49%,rgba(255,255,255,0.05)_51%,transparent_52%)] bg-[length:3px_3px]"></div>
              </div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

              {/* Status Badge */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-golden/10 border border-golden/20 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-golden">{feature.status}</span>
              </div>

              {/* Feature Icon - Compact Glass Container */}
              <div className="relative w-12 h-12 mx-auto mb-3 mt-4 rounded-lg bg-golden/10 border border-golden/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-golden/20 transition-all duration-300 backdrop-blur-sm">
                <feature.icon className="w-6 h-6 text-golden relative z-10" />
                <div className="absolute inset-0 bg-golden/5 blur-md rounded-lg"></div>
              </div>

              {/* Feature Info */}
              <div className="text-center space-y-1 sm:space-y-2 relative z-10">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{feature.title}</h3>
                  <p className="text-[10px] text-golden/80 font-medium">{feature.titleEn}</p>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-300 leading-relaxed">{feature.description}</p>
              </div>

              {/* Decorative Corners */}
              <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-golden/20"></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-golden/20"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComingSoonSection;
