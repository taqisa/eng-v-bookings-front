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
      setErrorMessage('Missing connection data from Google. Please try again.');
      toast.error('Missing connection data from Google.');
      return;
    }

    console.log(`🚀 Sending request to backend: ${API_BASE_URL}/auth/google/callback`);

    fetch(`${API_BASE_URL}/auth/google/callback?code=${code}&state=${state}`)
      .then(async response => {
        if (response.redirected || response.ok) {
          // Tokens are now saved in the database (google_accounts table)
          // Provider is marked as google_calendar_connected = true
          setStatus('success');
          toast.success('Google Calendar connected successfully!');
          // Redirect back to the provider booking page after 2 seconds
          setTimeout(() => navigate(`/booking/${state}`), 2000);
        } else {
          const err = await response.json().catch(() => ({ error: 'Unknown server error' }));
          throw new Error(err.details || err.error || 'Unknown error from server');
        }
      })
      .catch(error => {
        console.error('🔴 Callback Error:', error);
        setStatus('error');
        setErrorMessage(error.message);
        toast.error(`Connection failed: ${error.message}`);
      });

  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {status === 'processing' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <h1 className="text-2xl font-bold text-gray-900">Connecting Google Calendar...</h1>
              <p className="text-gray-600">Saving your calendar access. Please wait.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-green-900">Google Calendar Connected!</h1>
              <p className="text-green-700">Your calendar access has been saved. Redirecting you back...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-red-900">Connection Failed</h1>
              <p className="text-red-700 font-mono bg-red-50 p-4 rounded">{errorMessage}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Go Back & Try Again
              </button>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GoogleCalendarCallback;