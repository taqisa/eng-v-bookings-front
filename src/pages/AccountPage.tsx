import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User, Mail, Phone, Calendar, Edit, Save, X,
  LayoutDashboard, LogOut, TrendingUp, AlertTriangle, Stethoscope, ChevronRight, Eye, EyeOff
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";
import Footer from "@/components/Footer";
import { format, addDays, isAfter } from "date-fns";
import { LockedPhoneInput, getCountryFromPhone, toE164, getNationalDigits } from "@/components/LockedPhoneInput";
import { API_BASE_URL } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
  name: string;
  email: string;
  phone: string;
  created_at: string;
}
interface Booking {
  id: string;
  date: string;
  time: string;
  provider_id: string;
  provider_name: string;
  status: string;
  created_at: string;
  google_event_id?: string;
  duration_minutes?: number;
}

const StarField = memo(() => {
  const stars = Array.from({ length: 188 }).map((_, index) => ({
    id: index,
    left: `${Math.random() * 100}vw`,
    top: `${Math.random() * 100}vh`,
    size: `${Math.random() * 2 + 1}px`,
  }));

  const meteors = Array.from({ length: 2 }).map((_, index) => ({
    id: index,
    delay: index * 7.5,
    initialEndX: Math.random() * 90,
  }));

  return (
    <>
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute bg-white rounded-full"
          style={{ left: star.left, top: star.top, width: star.size, height: star.size, opacity: 0.7, zIndex: 1 }}
          animate={{
            x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100],
            y: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100],
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: Math.random() * 20 + 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {meteors.map((meteor) => (
        <motion.div
          key={`meteor-${meteor.id}`}
          className="absolute"
          style={{ left: '100vw', top: '-10vh', zIndex: 5 }}
          animate={{ x: ['0vw', `-${100 - meteor.initialEndX}vw`], y: ['0vh', '100vh'], opacity: [0, 1, 0] }}
          transition={{ duration: 1, delay: meteor.delay, repeat: Infinity, repeatDelay: 15, ease: 'linear' }}
        >
          <motion.div
            className="absolute bg-white rounded-full"
            style={{ width: '4px', height: '4px', boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.8)' }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            className="absolute h-px w-48"
            style={{ background: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0))', transform: 'rotate(-45deg)', transformOrigin: 'left', left: '4px', boxShadow: '0 0 6px 1px rgba(255, 255, 255, 0.4)' }}
          />
        </motion.div>
      ))}
    </>
  );
});

const CancelBookingDialog = ({ booking, onConfirm }: { booking: Booking; onConfirm: () => void }) => (
  <Dialog>
    <DialogTrigger asChild>
      <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400" title="Cancel booking">
        <X className="w-4 h-4" />
      </button>
    </DialogTrigger>
    <DialogContent className="bg-white/5 backdrop-blur-3xl border border-white/10 text-white rounded-3xl p-8">
      <DialogHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-500/10 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
          <DialogTitle className="text-xl font-bold tracking-tight">Cancel Booking</DialogTitle>
        </div>
        <DialogDescription className="text-gray-300 text-sm leading-relaxed mt-2">
          Are you sure you want to cancel your appointment with <span className="text-white font-semibold">{booking.provider_name}</span> on{" "}
          <span className="text-white font-semibold">{format(new Date(booking.date), "dd MMMM yyyy")}</span> at{" "}
          <span className="text-white font-semibold">{booking.time}</span>?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="mt-6 gap-3 sm:gap-2">
        <DialogTrigger asChild>
          <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">Keep it</Button>
        </DialogTrigger>
        <Button onClick={onConfirm} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl transition-all">Yes, cancel</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<"dashboard" | "profile">("dashboard");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [phoneError, setPhoneError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single();
    if (error) { toast.error("Error loading profile"); return; }
    setUserData(data);
    setFormData({ name: data.name, email: data.email, phone: data.phone });
  }, [user?.id]);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    const today = new Date();
    const { data, error } = await supabase
      .from("bookings")
      .select("id, date, time, provider_id, provider_name, status, created_at, google_event_id, duration_minutes")
      .eq("user_id", user.id)
      .order("date", { ascending: false }) as { data: Booking[] | null; error: any };
    if (error) { toast.error("Error fetching bookings"); return; }
    const valid = data?.filter((b) => isAfter(addDays(new Date(b.date), 1), today)) || [];
    const expired = data?.filter((b) => !isAfter(addDays(new Date(b.date), 1), today)) || [];
    if (expired.length) await supabase.from("bookings").delete().in("id", expired.map((b) => b.id));
    setBookings(valid);
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !user) {
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/auth?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      Promise.all([fetchUserData(), fetchBookings()]).finally(() => setLoading(false));
    }
  }, [user?.id, fetchUserData, fetchBookings]);

  const handleSave = async () => {
    const words = formData.name.trim().split(/\s+/);
    if (words.length < 3 || words.length > 4) return toast.error("Name must be 3-4 words");
    if (!/^[\u0621-\u064A\sA-Za-z]+$/.test(formData.name)) return toast.error("Name can only contain letters");
    if (!isPhoneValid || !formData.phone) return toast.error("Please enter a valid phone number");
    try {
      if (userData && formData.phone !== userData.phone) {
        const { data: dup } = await supabase.from("users").select("id").eq("phone", formData.phone).maybeSingle();
        if (dup) return toast.error("Phone number already in use");
      }
      await supabase.auth.updateUser({ data: { name: formData.name, phone: formData.phone } });
      await supabase.from("users").update({ name: formData.name, email: formData.email, phone: formData.phone }).eq("id", user?.id);
      setUserData((p) => (p ? { ...p, ...formData } : null));
      setEditing(false);
      setPhoneError('');
      toast.success("Profile updated");
    } catch { toast.error("Error saving profile"); }
  };

  const cancelBooking = async (booking: Booking) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${booking.id}/cancel`, { method: "POST" });
    if (!res.ok) { toast.error("Failed to cancel"); return; }
    setBookings((p) => p.filter((b) => b.id !== booking.id));
    toast.success("Booking cancelled");
  };

  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status !== "confirmed" && b.status !== "cancelled").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const activityData = Array(7).fill(0);
  bookings.forEach((b) => { activityData[new Date(b.date).getDay()]++; });

  
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-black to-gray-800 flex items-center justify-center">
        <StarField />
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-gray-300 font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-black to-gray-800 flex items-center justify-center">
        <StarField />
        <div className="text-center z-10 bg-white/5 backdrop-blur-2xl p-10 rounded-3xl border border-white/10">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error loading data</h1>
          <Button onClick={() => navigate("/auth")} variant="ghost" className="text-blue-300 hover:text-blue-200 hover:bg-white/5">Go to sign in</Button>
        </div>
      </div>
    );
  }

  const initials = userData.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-bl from-black to-gray-800 flex flex-col pt-24 pb-12 px-4 relative overflow-hidden font-inter">
        <StarField />
        
        {/* Animated Background Blurs */}
        <motion.div
          className="absolute w-80 h-80 bg-gray-700/20 rounded-full blur-3xl top-20 left-10"
          animate={{ x: [0, 30, 0], y: [0, 20, 0], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute w-80 h-80 bg-blue-500/10 rounded-full blur-3xl top-0 left-0"
            animate={{ x: [0, 50, 0], y: [0, 30, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl bottom-0 right-0"
            animate={{ x: [0, -50, 0], y: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-64 h-64 bg-purple-500/10 rounded-full blur-3xl top-1/2 left-1/2"
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 }}
          className="w-full max-w-5xl mx-auto z-10 flex-1 flex flex-col"
        >
          <Card className="bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl border border-white/10 relative overflow-hidden flex-1 flex flex-col md:flex-row">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
            
            {/* Left Nav Menu */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30 text-white">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-white text-lg tracking-tight truncate">{userData.name.split(" ")[0]}</p>
                  <p className="text-xs text-gray-400 font-medium truncate">{userData.email}</p>
                </div>
              </div>

              <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex-shrink-0 ${activeSection === "dashboard" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button
                  onClick={() => setActiveSection("profile")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex-shrink-0 ${activeSection === "profile" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                >
                  <User className="w-4 h-4" /> Profile Details
                </button>
              </nav>

              <div className="mt-auto hidden md:block pt-6">
                <button
                  onClick={async () => { await signOut(); navigate("/"); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-10 relative z-10 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeSection === "dashboard" && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome back, {userData.name.split(" ")[0]}</h2>
                      <p className="text-gray-400 mt-2 font-medium">Manage your upcoming appointments and history.</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 shadow-lg">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white tracking-tight">Upcoming Appointments</h3>
                        <div className="p-2 bg-blue-500/10 rounded-lg"><Calendar className="w-5 h-5 text-blue-400" /></div>
                      </div>
                      
                      {bookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-white/5 rounded-xl border border-white/5">
                          <Calendar className="w-10 h-10 text-gray-500 mb-4" />
                          <p className="text-white font-semibold">No upcoming bookings</p>
                          <p className="text-gray-400 text-sm mt-2">Ready to schedule your next visit?</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {bookings.slice(0, 5).map((booking) => (
                            <div key={booking.id} className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                                  <Stethoscope className="w-5 h-5 text-blue-300" />
                                </div>
                                <div>
                                  <p className="font-bold text-white tracking-tight">{booking.provider_name}</p>
                                  <p className="text-sm text-gray-400 mt-0.5">{format(new Date(booking.date), "MMMM d, yyyy")} at {booking.time}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                                <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${booking.status === "confirmed" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : booking.status === "cancelled" ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                                  {booking.status}
                                </div>
                                {booking.status !== "cancelled" && <CancelBookingDialog booking={booking} onConfirm={() => cancelBooking(booking)} />}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-lg">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Platform Member</h3>
                        <p className="text-gray-400 mt-1">You've been with us since <span className="text-white font-semibold">{format(new Date(userData.created_at), "MMMM yyyy")}</span>.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8 max-w-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Profile Details</h2>
                        <p className="text-gray-400 mt-2 font-medium">View and update your personal information.</p>
                      </div>
                      {!editing ? (
                        <Button onClick={() => setEditing(true)} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-xl transition-all">
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button onClick={() => { setEditing(false); if (userData) setFormData({ name: userData.name, email: userData.email, phone: userData.phone }); }} variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl">
                            Cancel
                          </Button>
                          <Button onClick={handleSave} className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 rounded-xl transition-all">
                            <Save className="w-4 h-4 mr-2" /> Save
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 space-y-6 shadow-lg">
                      {/* Name Input */}
                      <div className="relative group">
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^A-Za-z\s]/g, '');
                            val = val.replace(/\s{2,}/g, ' ');
                            setFormData({ ...formData, name: val });
                          }}
                          disabled={!editing}
                          placeholder=" "
                          className="peer text-left w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-transparent focus:ring-2 focus:ring-blue-400/50 transition-all duration-500 focus:bg-white/10 disabled:opacity-70 disabled:cursor-not-allowed h-14 pt-4"
                        />
                        <label className="absolute top-4 left-4 text-gray-400 text-sm font-medium transition-all duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-300 peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs">
                          Full Name
                        </label>
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                       </div>

                       {/* Phone Input — country locked to signup country, only digits changeable */}
                       <div className="space-y-1">
                         <label className="text-xs font-medium text-gray-400 pl-1">Phone Number (country cannot be changed)</label>
                         <LockedPhoneInput
                           e164Value={formData.phone}
                           onChange={(e164, valid) => {
                             setFormData({ ...formData, phone: e164 });
                             setIsPhoneValid(valid);
                             setPhoneError(e164 && !valid ? 'Invalid phone number for your registered country.' : '');
                           }}
                           disabled={!editing}
                         />
                         {phoneError && <p className="text-red-400 text-xs pl-1">{phoneError}</p>}
                       </div>

                       {/* Email Input */}
                       <div className="relative group">
                         <Input
                           type="email"
                           value={formData.email}
                           disabled
                           placeholder=" "
                           className="peer text-left w-full rounded-xl bg-white/5 border border-white/10 text-gray-400 placeholder-transparent h-14 pt-4 cursor-not-allowed opacity-70"
                         />
                         <label className="absolute top-2 left-4 text-gray-500 text-xs font-medium">
                           Email Address (Cannot be changed)
                         </label>
                         <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                       </div>
                     </div>

                    <div className="mt-12 bg-red-500/5 backdrop-blur-md rounded-2xl border border-red-500/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-red-400">Danger Zone</h3>
                        <p className="text-gray-400 text-sm mt-1">Permanently remove your account and all associated data. This action cannot be undone.</p>
                      </div>
                      <DeleteAccountDialog />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default AccountPage;
