
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
                        About <span className="text-primary">us</span>
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                        your premier and trusted destination for booking appointments with the best service providers.
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
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-primary transition-colors">Our Vision</h3>
                            <p className="text-gray-700 leading-relaxed text-lg font-medium">
                                We aim to digitize the services sector and make life easier by providing a unified, comprehensive platform for booking appointments across multiple industries — putting technology in service of people.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#fffbeb] p-8 rounded-3xl border border-amber-100 shadow-[0_10px_20px_rgba(0,0,0,0.1),0_6px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_25px_rgba(0,0,0,0.15),0_10px_10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl -ml-16 -mt-16"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <Users className="w-7 h-7 text-blue-600 stroke-[2.5]" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">Our Mission</h3>
                            <p className="text-gray-700 leading-relaxed text-lg font-medium">
                                Building trust between service providers and clients, delivering a smooth, fast, and reliable booking experience that saves time and effort for everyone, while maintaining the highest quality standards.
                            </p>
                        </div>
                    </div>
                </div>

                {/* How it Works - Simple 3 Steps */}
                <div id="how-it-works" className="mb-20 scroll-mt-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">How does it work?</h2>
                        <p className="text-gray-400">Book your appointment in 3 simple steps</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 right-1/6 left-1/6 h-0.5 bg-gradient-to-l from-primary/0 via-primary/30 to-primary/0 z-0"></div>

                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto bg-gray-900 rounded-full border-4 border-gray-800 flex items-center justify-center mb-6 shadow-xl relative">
                                <span className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-black border-4 border-gray-900">1</span>
                                <Globe className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Choose your service</h3>
                            <p className="text-gray-400 text-sm">Pick the type of service you are looking for</p>
                        </div>

                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto bg-gray-900 rounded-full border-4 border-gray-800 flex items-center justify-center mb-6 shadow-xl relative">
                                <span className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-black border-4 border-gray-900">2</span>
                                <Users className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Select a date </h3>
                            <p className="text-gray-400 text-sm">Choose the desired date and time  or search for the nearest available slot</p>
                        </div>

                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto bg-gray-900 rounded-full border-4 border-gray-800 flex items-center justify-center mb-6 shadow-xl relative">
                                <span className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-black border-4 border-gray-900">3</span>
                                <CheckCircle2 className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Confirm your appointment</h3>
                            <p className="text-gray-400 text-sm">After picking your preferred time you will get a confirmation message</p>
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
                        <h2 className="text-3xl font-bold text-gray-900">Policies & Privacy</h2>
                    </div>

                    <div className="space-y-8 text-gray-700 leading-relaxed font-medium">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Privacy Commitment</h3>
                            <p>
                                We take your privacy seriously. All personal information and booking data is encrypted and protected to the highest security standards. We do not share your data with any third party other than the service provider you booked with.
                            </p>
                        </div>

                        <div className="h-px bg-gray-200"></div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Booking Seriousness & Legal Responsibility</h3>
                            <p className="mb-4">
                                The platform is for genuine and serious bookings only. By completing a booking, you enter into a preliminary agreement with the service provider.
                            </p>
                            <ul className="space-y-2 list-disc list-inside marker:text-red-500">
                                <li>You must use a real and active phone number when booking.</li>
                                <li>Failure to attend without prior cancellation may result in action by the platform and the provider.</li>
                                <li>Fake bookings may result in legal liability and permanent account suspension.</li>
                                <li>We maintain records of all bookings to protect the rights of all parties.</li>
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
                        Find a service now
                        <ArrowRight className="w-6 h-6 rtl:rotate-180" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
