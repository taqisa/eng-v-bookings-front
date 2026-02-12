
import { ArrowRight, Globe, Shield, Users, Calendar, CheckCircle2, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
            {/* Simple Background - Dark and Clean */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-20 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 pb-2">
                        عن منصة <span className="text-primary">HAJZK</span>
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                        منصة HAJZK هي وجهتك الأولى والموثوقة لحجز المواعيد مع أفضل مقدمي الخدمات في فلسطين.
                    </p>
                </div>

                {/* Vision & Mission - Cards with 3D Beige Design */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    <div className="bg-[#fffbeb] p-8 rounded-3xl border border-amber-100 shadow-[0_10px_20px_rgba(0,0,0,0.1),0_6px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_25px_rgba(0,0,0,0.15),0_10px_10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <Globe className="w-7 h-7 text-primary stroke-[2.5]" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-primary transition-colors">رؤيتنا</h3>
                            <p className="text-gray-700 leading-relaxed text-lg font-medium">
                                نسعى لرقمنة قطاع الخدمات في فلسطين وتسهيل حياة المواطنين من خلال توفير منصة موحدة وشاملة لحجز المواعيد في مختلف القطاعات، جاعلين التكنولوجيا في خدمة الإنسان.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#fffbeb] p-8 rounded-3xl border border-amber-100 shadow-[0_10px_20px_rgba(0,0,0,0.1),0_6px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_25px_rgba(0,0,0,0.15),0_10px_10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl -ml-16 -mt-16"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <Users className="w-7 h-7 text-blue-600 stroke-[2.5]" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">رسالتنا</h3>
                            <p className="text-gray-700 leading-relaxed text-lg font-medium">
                                بناء جسور الثقة بين مقدمي الخدمات والمواطنين، وتقديم تجربة حجز سلسة، سريعة، وموثوقة توفر الوقت والجهد للجميع، مع الحفاظ على أعلى معايير الجودة.
                            </p>
                        </div>
                    </div>
                </div>

                {/* How it Works - Simple 3 Steps */}
                <div id="how-it-works" className="mb-20 scroll-mt-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">كيف تعمل المنصة؟</h2>
                        <p className="text-gray-400">احجز موعدك في 3 خطوات بسيطة</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 right-1/6 left-1/6 h-0.5 bg-gradient-to-l from-primary/0 via-primary/30 to-primary/0 z-0"></div>

                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto bg-gray-900 rounded-full border-4 border-gray-800 flex items-center justify-center mb-6 shadow-xl relative">
                                <span className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-black border-4 border-gray-900">1</span>
                                <Globe className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">اختر المدينة والخدمة</h3>
                            <p className="text-gray-400 text-sm">حدد مدينتك ونوع الخدمة التي تبحث عنها</p>
                        </div>

                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto bg-gray-900 rounded-full border-4 border-gray-800 flex items-center justify-center mb-6 shadow-xl relative">
                                <span className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-black border-4 border-gray-900">2</span>
                                <Users className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">اختر مقدم الخدمة</h3>
                            <p className="text-gray-400 text-sm">تصفح قائمة المهنيين واختر الأنسب لك</p>
                        </div>

                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto bg-gray-900 rounded-full border-4 border-gray-800 flex items-center justify-center mb-6 shadow-xl relative">
                                <span className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-black border-4 border-gray-900">3</span>
                                <CheckCircle2 className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">اكد موعدك</h3>
                            <p className="text-gray-400 text-sm">اختر الوقت المناسب واكد الحجز فوراً</p>
                        </div>
                    </div>
                </div>

                {/* Privacy & Legal Section */}
                <div id="terms" className="bg-[#fffbeb] rounded-3xl p-8 md:p-12 border border-amber-100 shadow-[0_10px_20px_rgba(0,0,0,0.1),0_6px_6px_rgba(0,0,0,0.1)] mb-16 underline-offset-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-l from-primary via-primary/50 to-transparent"></div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-red-100/80 rounded-xl shadow-sm">
                            <Lock className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">السياسات والخصوصية</h2>
                    </div>

                    <div className="space-y-8 text-gray-700 leading-relaxed font-medium">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">التزامنا بالخصوصية</h3>
                            <p>
                                في منصة HAJZK، نأخذ خصوصية بياناتك على محمل الجد. جميع المعلومات الشخصية ومعلومات الحجز يتم تشفيرها وحمايتها وفقاً لأعلى المعايير الأمنية. لا نشارك بياناتك مع أي طرف ثالث غير مقدم الخدمة الذي قمت بالحجز لديه.
                            </p>
                        </div>

                        <div className="h-px bg-gray-200"></div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">جدية الحجوزات والمسؤولية القانونية</h3>
                            <p className="mb-4">
                                المنصة مخصصة للحجوزات الحقيقية والجدية فقط. عند إتمام عملية الحجز، فإنك تدخل في اتفاق مبدئي مع مقدم الخدمة.
                            </p>
                            <ul className="space-y-2 list-disc list-inside marker:text-red-500">
                                <li>يجب استخدام رقم هاتف حقيقي وفعال عند الحجز.</li>
                                <li>في حال التغيب عن الموعد دون إلغاء مسبق، يحق للمنصة ومقدم الخدمة اتخاذ الإجراءات اللازمة.</li>
                                <li>الحجوزات الوهمية تعرض صاحبها للمسائلة القانونية وحظر الحساب نهائياً.</li>
                                <li>نحتفظ بسجل لجميع عمليات الحجز لضمان حقوق جميع الأطراف.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* OTA */}
                <div className="text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-black font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/25 text-lg"
                    >
                        ابحث عن خدمة الآن
                        <ArrowRight className="w-6 h-6 rtl:rotate-180" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
