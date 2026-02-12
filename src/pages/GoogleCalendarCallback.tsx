import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/utils';

const GoogleCalendarCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is the provider_id

    if (!code || !state) {
      setStatus('error');
      setErrorMessage('بيانات الربط مفقودة من Google. يرجى المحاولة مرة أخرى.');
      toast.error('بيانات الربط مفقودة.');
      return;
    }

    // ---  الكود الجديد والمهم يبدأ هنا ---
    // استدعاء الخادم الخلفي لإكمال عملية الربط

    // تأكد من وجود ملف .env في المجلد الرئيسي يحتوي على هذا المتغير
    const apiUrl = API_BASE_URL;

    console.log(`🚀 Sending request to backend: ${apiUrl}/auth/google/callback`);

    fetch(`${apiUrl}/auth/google/callback?code=${code}&state=${state}`)
      .then(response => {
        // الخادم الخلفي الناجح سيقوم بإعادة التوجيه (status 302).
        // إذا وصلتنا هنا استجابة غير 302، فهذا يعني وجود خطأ.
        if (response.ok && response.redirected) {
          // المتصفح سيقوم بإعادة التوجيه تلقائيًا إلى الرابط
          // الذي حدده الخادم الخلفي (FRONTEND_URL/booking/state)
          // يمكننا إظهار رسالة نجاح قبل أن تتم إعادة التوجيه
          setStatus('success');
          toast.success('تم ربط تقويم Google بنجاح!');
          // لا نحتاج إلى navigate() يدويًا، لأن الخادم الخلفي يتحكم في ذلك.
        } else {
          // إذا لم تكن الاستجابة ناجحة، حوّلها إلى JSON لقراءة الخطأ
          return response.json().then(err => {
            throw new Error(err.details || err.error || 'Unknown error from server');
          });
        }
      })
      .catch(error => {
        console.error("🔴 Callback Error:", error);
        setStatus('error');
        setErrorMessage(`فشل الاتصال بالخادم: ${error.message}`);
        toast.error(`حدث خطأ: ${error.message}`);
      });

  }, [searchParams, navigate]);

  // --- العرض المرئي (UI) يبدأ هنا ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {status === 'processing' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <h1 className="text-2xl font-bold text-gray-900">جارٍ ربط تقويم Google...</h1>
              <p className="text-gray-600">نتواصل مع الخادم لإتمام المصادقة، يرجى الانتظار.</p>
            </div>
          )}
          {status === 'success' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h1 className="text-2xl font-bold text-green-900">تم ربط التقويم بنجاح!</h1>
              <p className="text-green-700">سيتم إعادة توجيهك الآن...</p>
            </div>
          )}
          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <h1 className="text-2xl font-bold text-red-900">حدث خطأ في الربط</h1>
              <p className="text-red-700 font-mono bg-red-50 p-4 rounded">{errorMessage}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GoogleCalendarCallback;