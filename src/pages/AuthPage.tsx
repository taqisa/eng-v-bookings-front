import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';

// أيقونات SVG مخصصة (كما في الكود الأصلي)
const EyeIcon = () => (
  <svg className="w-5 h-5 text-gray-300 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5 text-gray-300 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
// مكون النجوم والشهب
const StarsAndMeteors = React.memo(() => {
  // إنشاء 70 نجمة عشوائية
  const stars = Array.from({ length: 188 }).map((_, index) => ({
    id: index,
    left: `${Math.random() * 100}vw`, // موقع عشوائي أفقيًا
    top: `${Math.random() * 100}vh`, // موقع عشوائي رأسيًا
    size: `${Math.random() * 2 + 1}px`, // حجم عشوائي بين 1 و3 بكسل
  }));

  const meteors = Array.from({ length: 2 }).map((_, index) => ({
    id: index,
    delay: index * 7.5, // تأخير 7.5 ثوانٍ لكل شهاب لضمان ظهور شهابين كل 15 ثانية
    initialEndX: Math.random() * 90, // نقطة نهاية عشوائية بين 0 و90vw لضمان مسافة أكبر من 10vw
  }));

  return (
    <>
      {/* النجوم */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute bg-white rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: 0.7,
            zIndex: 1, // النجوم في الخلفية
          }}
          animate={{
            x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100], // حركة أفقية ناعمة
            y: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100], // حركة رأسية ناعمة
            opacity: [0.5, 1, 0.5], // تأثير التلألؤ
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 20 + 10, // مدة بطيئة بين 10 و30 ثانية
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* الشهب */}
      {meteors.map((meteor) => (
        <motion.div
          key={`meteor-${meteor.id}`}
          className="absolute"
          style={{
            left: '100vw', // البداية دائمًا من الزاوية العلوية اليمنى
            top: '0vh',
            zIndex: 5, // الشهب في المقدمة
          }}
          animate={{
            x: ['0vw', `-${100 - meteor.initialEndX}vw`], // حركة أفقية إلى نقطة عشوائية (المسافة دائمًا أكبر من 10vw)
            y: ['0vh', '100vh'], // حركة إلى الأسفل
            opacity: [0, 1, 0], // تلاشي
          }}
          transition={{
            duration: 1, // سرعة الشهاب (سريع جدًا)
            delay: meteor.delay, // تأخير 7.5 ثوانٍ
            repeat: Infinity,
            repeatDelay: 15, // تأخير 15 ثانية بين كل تكرار
            ease: 'linear',
          }}
          // تحديث نقطة النهاية للتناوب في كل تكرار
          onAnimationComplete={() => {
            meteor.initialEndX = Math.random() * 90; // نقطة نهاية عشوائية جديدة
          }}
        >
          {/* رأس الشهاب (يشبه النجمة) */}
          <motion.div
            className="absolute bg-white rounded-full"
            style={{
              width: '4px',
              height: '4px',
              boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.8)', // توهج الرأس
            }}
            animate={{
              scale: [1, 1.5, 1], // تأثير وميض للرأس
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* ذيل الشهاب */}
          <div
            className="absolute h-px w-48" // ذيل طويل نسبيًا
            style={{
              background: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0))', // تدرج الذيل من اليمين
              transform: 'rotate(-45deg)', // زاوية قطرية
              transformOrigin: 'left', // الدوران من الرأس
              left: '4px', // محاذاة الذيل مع الرأس
              boxShadow: '0 0 6px 1px rgba(255, 255, 255, 0.4)', // توهج خفيف للذيل
            }}
          />
        </motion.div>
      ))}
    </>
  );
});
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '0',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirectTo');
      navigate(redirectTo || '/');
    }
  }, [user, navigate]);

  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const regex = /^05[0-9]{7,8}$/;
    return regex.test(cleanPhone);
  };

  const formatPhoneNumber = (input) => {
    let cleanPhone = input.replace(/\D/g, '');
    if (!cleanPhone.startsWith('0')) {
      cleanPhone = '0' + cleanPhone;
    }
    if (validatePhoneNumber(cleanPhone)) {
      setPhoneError('');
      return {
        display: `+972 ${cleanPhone}`,
        save: cleanPhone,
      };
    } else {
      setPhoneError('رقم الهاتف يجب أن يبدأ بـ 05 ويحتوي على 8 أو 9 أرقام إجمالاً');
      return null;
    }
  };

  const handlePhoneInputChange = (e) => {
    let enteredValue = e.target.value.replace(/\D/g, '');
    if (enteredValue === '') {
      setFormData({ ...formData, phone: '0' });
      setPhoneError('');
      return;
    }
    if (enteredValue.startsWith('0') && enteredValue.length > 1) {
      enteredValue = enteredValue.slice(1);
    }
    if (enteredValue.startsWith('5') && enteredValue.length <= 9) {
      const formattedPhone = formatPhoneNumber('0' + enteredValue);
      if (formattedPhone) {
        setFormData({ ...formData, phone: formattedPhone.save });
      } else {
        setFormData({ ...formData, phone: '0' + enteredValue });
      }
    } else {
      setPhoneError('رقم الهاتف يجب أن يبدأ بـ 05');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedPhone = formatPhoneNumber(formData.phone);
    if (!formattedPhone) {
      toast.error('رقم الهاتف يجب أن يبدأ بـ 05 ويحتوي على 8 أو 9 أرقام إجمالاً', {
        style: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '12px',
        },
      });
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(formattedPhone.save, formData.password);
        if (error) {
          toast.error(
            error.message?.includes('Invalid login credentials')
              ? 'بيانات الدخول غير صحيحة'
              : error.message || 'خطأ في تسجيل الدخول',
            {
              style: {
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px',
              },
            }
          );
        } else {
          toast.success('تم تسجيل الدخول بنجاح', {
            style: {
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '12px',
            },
          });
          const params = new URLSearchParams(window.location.search);
          const redirectTo = params.get('redirectTo');
          navigate(redirectTo || '/');
        }
      } else {
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
          toast.error('يرجى ملء جميع الحقول', {
            style: {
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '12px',
            },
          });
          setLoading(false);
          return;
        }
        const nameWords = formData.name.trim().split(/\s+/);
        if (nameWords.length < 3 || nameWords.length > 4) {
          toast.error('يجب أن يكون الاسم ثلاثيًا أو رباعيًا', {
            style: {
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '12px',
            },
          });
          setLoading(false);
          return;
        }
        const { error } = await signUp(formData.name, formData.email, formattedPhone.save, formData.password);
        if (error) {
          toast.error(
            error.message?.includes('already registered')
              ? 'البريد الإلكتروني أو الهاتف مسجل مسبقاً'
              : error.message || 'حدث خطأ في إنشاء الحساب',
            {
              style: {
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px',
              },
            }
          );
        } else {
          toast.success('تم إنشاء الحساب بنجاح!', {
            style: {
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '12px',
            },
          });
          const params = new URLSearchParams(window.location.search);
          const redirectTo = params.get('redirectTo');
          navigate(redirectTo || '/');
        }
      }
    } catch (error) {
      toast.error('حدث خطأ، يرجى المحاولة مرة أخرى', {
        style: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '12px',
        },
      });
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', phone: '0', password: '' });
    setPhoneError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-black to-gray-800 flex items-center justify-center px-4 font-inter relative overflow-hidden">
      {/* إضافة النجوم والشهب */}
      <StarsAndMeteors />

      {/* تأثيرات الخلفية الأصلية */}
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

      <Header />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 }}
        className="pt-24 w-full max-w-md z-10"
      >
        <Card className="bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl p-10 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
          <div className="relative text-center mb-10">
            <motion.h1
              className="text-4xl font-extrabold text-white tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </motion.h1>
            <motion.p
              className="text-gray-200 text-sm mt-3 font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {isLogin ? 'مرحبًا بك مجددًا، سجّل للمتابعة' : 'انضم إلى تجربتنا الفاخرة اليوم'}
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
            <AnimatePresence>
              {!isLogin && (
                <>
                  <motion.div
                    initial={{ height: 0, opacity: 0, y: 20 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative group"
                  >
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder=" "
                      required
                      className="peer text-right w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-transparent focus:ring-2 focus:ring-blue-400/50 transition-all duration-500 focus:bg-white/10"
                    />
                    <label className="absolute top-1/2 transform -translate-y-1/2 text-gray-300 text-sm font-medium transition-all duration-500 
                                     peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-placeholder-shown:text-center 
                                     peer-[&:not(:placeholder-shown)]:left-4 peer-[&:not(:placeholder-shown)]:-top-3 
                                     peer-focus:-top-4 peer-focus:left-14 peer-focus:text-sm peer-focus:text-blue-300 
                                     group-hover:text-blue-300">
                      الاسم الثلاثي أو الرباعي
                    </label>
                    <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-blue-400/20 transition-all duration-500 pointer-events-none" />
                  </motion.div>
                  <motion.div
                    initial={{ height: 0, opacity: 0, y: 20 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                    className="relative group"
                  >
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder=" "
                      required
                      className="peer text-right w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-transparent focus:ring-2 focus:ring-blue-400/50 transition-all duration-500 focus:bg-white/10"
                    />
                    <label className="absolute top-1/2 transform -translate-y-1/2 text-gray-300 text-sm font-medium transition-all duration-500 
                                     peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-placeholder-shown:text-center 
                                     peer-[&:not(:placeholder-shown)]:left-4 peer-[&:not(:placeholder-shown)]:-top-3 
                                     peer-focus:-top-4 peer-focus:left-14 peer-focus:text-sm peer-focus:text-blue-300 
                                     group-hover:text-blue-300">
                      البريد الإلكتروني
                    </label>
                    <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-blue-400/20 transition-all duration-500 pointer-events-none" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className="relative group" style={{ direction: 'ltr', textAlign: 'left' }}>
              <div className="flex items-center w-full rounded-xl bg-white/5 border border-white/10 focus-within:ring-2 focus-within:ring-blue-400/50 transition-all duration-500">
                <span className="px-4 py-3 text-sm font-medium text-gray-200 bg-white/10 border-r border-white/10">
                  +972
                </span>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneInputChange}
                  placeholder="0"
                  required
                  autoComplete="off"
                  className="peer border-0 shadow-none focus:ring-0 text-left w-full bg-transparent text-white placeholder-transparent"
                />
                <label className="absolute right-9 transform -translate-y-1\2 text-gray-300 text-sm font-medium transition-all duration-500 
                                 peer-placeholder-shown:left-1\2 peer-placeholder-shown:-translate-x-1/2 peer-placeholder-shown:text-center 
                                 peer-focus:left-2 peer-focus:-top-7 peer-focus:text-sm peer-focus:text-blue-300 
                                 group-hover:text-blue-300">
                  رقم الهاتف
                </label>
              </div>
              {phoneError && (
                <p className="text-red-400 text-sm mt-2 text-left">{phoneError}</p>
              )}
              <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-blue-400/20 transition-all duration-500 pointer-events-none" />
            </div>

            <div className="relative group" style={{ direction: 'ltr', textAlign: 'left' }}>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder=" "
                required
                autoComplete="new-password"
                className="peer text-left w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-transparent focus:ring-2 focus:ring-blue-400/50 transition-all duration-500 focus:bg-white/10 pl-12"
              />
              <label
                className="absolute top-1/2 transform -translate-y-1/2 text-gray-300 text-sm font-medium 
                           transition-[top,left,transform] duration-1\2 ease-in-out
                           peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-placeholder-shown:text-center 
                           peer-[&:not(:placeholder-shown)]:left-4 peer-[&:not(:placeholder-shown)]:-top-3 
                           peer-focus:-top-4 peer-focus:left-14 peer-focus:text-sm peer-focus:text-blue-300 
                           group-hover:text-blue-300"
              >
                كلمة المرور
              </label>
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-0 transform -translate-y-2"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </motion.button>
              <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-blue-400/20 transition-all duration-500 pointer-events-none" />
            </div>

            <motion.div
              whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(0, 0, 255, 0.2)' }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-4 font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-500 flex items-center justify-center gap-3 shadow-lg relative overflow-hidden"
                disabled={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {loading ? (
                  <motion.svg
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </motion.svg>
                ) : (
                  <>
                    {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
                    <motion.div whileHover={{ x: 8, rotate: 5 }}>
                      <ArrowRightIcon />
                    </motion.div>
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <button
              onClick={toggleMode}
              className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-500 relative group"
            >
              {isLogin ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب؟ تسجيل الدخول'}
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-300 group-hover:w-full transition-all duration-500" />
            </button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;
