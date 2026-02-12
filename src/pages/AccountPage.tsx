import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, Mail, Phone, Calendar, Edit, Save, X } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";
import { format, subHours, isAfter, addDays } from "date-fns";
import { ar } from "date-fns/locale";
import { API_BASE_URL } from "@/lib/utils";

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

interface CancelBookingDialogProps {
  booking: Booking;
  onConfirm: () => void;
}

const CancelBookingDialog = ({ booking, onConfirm }: CancelBookingDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-300 border-red-300 hover:bg-red-500/20"
        >
          <X className="w-4 h-4 ml-1" />
          إلغاء
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 text-white border-golden">
        <DialogHeader>
          <DialogTitle>تأكيد إلغاء الحجز</DialogTitle>
          <DialogDescription className="text-gray-400">
            هل أنت متأكد من أنك تريد إلغاء الحجز مع {booking.provider_name} في{' '}
            {format(new Date(booking.date), 'dd MMMM yyyy', { locale: ar })} - {booking.time}؟
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" className="text-white" onClick={() => { }}>
            إلغاء
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            تأكيد الإلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Memoized fetchUserData to prevent redefinition on each render
  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        toast.error('حدث خطأ في تحميل البيانات');
        return;
      }

      setUserData(data);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Memoized fetchBookings to prevent redefinition on each render
  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    try {
      console.log('Fetching bookings for user:', user.id);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const { data, error } = await supabase
        .from('bookings')
        .select('id, date, time, provider_id, provider_name, status, created_at, google_event_id, duration_minutes')
        .eq('user_id', user.id)
        .order('date', { ascending: false }) as { data: Booking[] | null; error: any };

      if (error) {
        console.error('Error fetching bookings:', error);
        toast.error('حدث خطأ في جلب الحجوزات');
        return;
      }

      console.log('Fetched bookings:', data);

      const validBookings = data?.filter(booking => {
        const bookingDate = new Date(booking.date);
        const cutoffDate = addDays(bookingDate, 1);
        return isAfter(cutoffDate, today);
      }) || [];

      const expiredBookings = data?.filter(booking => {
        const bookingDate = new Date(booking.date);
        const cutoffDate = addDays(bookingDate, 1);
        return !isAfter(cutoffDate, today);
      }) || [];

      if (expiredBookings.length > 0) {
        const expiredBookingIds = expiredBookings.map(booking => booking.id);
        const { error: deleteError } = await supabase
          .from('bookings')
          .delete()
          .in('id', expiredBookingIds);

        if (deleteError) {
          console.error('Error deleting expired bookings:', deleteError);
          toast.error('حدث خطأ في حذف الحجوزات المنتهية');
        } else {
          console.log('Deleted expired bookings:', expiredBookingIds);
        }
      }

      setBookings(validBookings);
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ في جلب الحجوزات');
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('🔴 [AUTH] No user, redirecting to auth page');
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/auth?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, navigate]);

  // Effect to fetch data only when user.id changes
  useEffect(() => {
    if (user?.id) {
      console.log('User logged in:', user.id);
      setLoading(true);
      Promise.all([fetchUserData(), fetchBookings()])
        .finally(() => setLoading(false));
    }

    // Cleanup to prevent memory leaks
    return () => {
      setLoading(false);
    };
  }, [user?.id, fetchUserData, fetchBookings]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        })
        .eq('id', user?.id);

      if (error) {
        console.error('Error updating user:', error);
        toast.error('حدث خطأ في تحديث البيانات');
        return;
      }

      setUserData(prev => prev ? { ...prev, ...formData } : null);
      setEditing(false);
      toast.success('تم تحديث البيانات بنجاح');
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ في تحديث البيانات');
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone
      });
    }
    setEditing(false);
  };

  const cancelBooking = async (booking: Booking) => {
    try {
      console.log(`[CANCEL-BOOKING] Sending cancel request for booking ID: ${booking.id}`);
      const response = await fetch(`${API_BASE_URL}/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[CANCEL-BOOKING] Backend reported an error:', errorData);
        throw new Error(errorData.error || 'Failed to cancel booking');
      }

      // تحديث الحالة في الواجهة الأمامية عند النجاح
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      toast.success('تم إلغاء الحجز بنجاح');
    } catch (error: any) {
      console.error('[CANCEL-BOOKING] Error cancelling booking:', error);
      toast.error(`حدث خطأ أثناء إلغاء الحجز: ${error.message}`);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-golden"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="pt-20 text-center">
          <h1 className="text-2xl font-bold text-red-400">حدث خطأ في تحميل البيانات</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-golden mb-2">حسابي</h1>
            <p className="text-gray-400">إدارة معلوماتك الشخصية وحجوزاتك</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <Card className="p-6 bg-black/40 border border-golden rounded-3xl">
                <h3 className="text-lg font-bold text-white mb-4">إحصائيات</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">إجمالي الحجوزات</span>
                    <span className="font-semibold text-gray-200">{bookings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">الحجوزات المؤكدة</span>
                    <span className="font-semibold text-green-300">
                      {bookings.filter(b => b.status === 'confirmed').length}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="p-8 bg-black/40 border border-golden rounded-3xl mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">الحجوزات الأخيرة</h2>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => {
                      const canCancel = booking.status !== 'cancelled';

                      return (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                          <div>
                            <div className="font-semibold text-white">{booking.provider_name}</div>
                            <div className="text-sm text-gray-400">
                              {format(new Date(booking.date), 'dd MMMM yyyy', { locale: ar })} - {booking.time}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-[150px]">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'confirmed'
                              ? 'bg-green-500/20 text-green-300'
                              : booking.status === 'cancelled'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-yellow-500/20 text-yellow-300'
                              }`}>
                              {booking.status === 'confirmed' ? 'مؤكد' : booking.status === 'cancelled' ? 'ملغي' : 'معلق'}
                            </div>
                            {canCancel && (
                              <CancelBookingDialog booking={booking} onConfirm={() => cancelBooking(booking)} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">لا توجد حجوزات بعد</p>
                  </div>
                )}
              </Card>

              <Card className="p-8 bg-black/40 border border-golden rounded-3xl mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">المعلومات الشخصية</h2>
                  {!editing ? (
                    <Button
                      onClick={() => setEditing(true)}
                      variant="outline"
                      className="flex items-center text-golden border-golden"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                  ) : (
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        onClick={handleCancel}
                        variant="destructive"
                        size="sm"
                      >
                        <X className="w-4 h-4 ml-1" />
                        إلغاء
                      </Button>
                      <Button
                        onClick={handleSave}
                        size="sm"
                        className="bg-green-500/20 text-green-300"
                      >
                        <Save className="w-4 h-4 ml-1" />
                        حفظ
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-right text-gray-400">الاسم</Label>
                    {editing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="text-right bg-gray-800 border-gray-600 text-white"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-800 rounded-xl mt-2">
                        <User className="w-5 h-5 ml-3 text-golden" />
                        <span className="text-gray-200">{userData.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-right text-gray-400">البريد الإلكتروني</Label>
                    {editing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="text-right bg-gray-800 border-gray-600 text-white"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-800 rounded-xl mt-2">
                        <Mail className="w-5 h-5 ml-3 text-golden" />
                        <span className="text-gray-200">{userData.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-right text-gray-400">رقم الهاتف</Label>
                    {editing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="text-right bg-gray-800 border-gray-600 text-white"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-800 rounded-xl mt-2">
                        <Phone className="w-5 h-5 ml-3 text-golden" />
                        <span className="text-gray-200">{userData.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center p-3 bg-gray-800 rounded-xl">
                    <Calendar className="w-5 h-5 ml-3 text-golden" />
                    <span className="text-gray-400">تاريخ التسجيل: {format(new Date(userData.created_at), 'dd MMMM yyyy', { locale: ar })}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-black/40 border border-golden rounded-3xl">
                <h3 className="text-lg font-bold text-white mb-4">إجراءات الحساب</h3>
                <div className="space-y-4">
                  <DeleteAccountDialog />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AccountPage;
