
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/utils';

interface GoogleCalendarAuthProps {
  providerId: string;
  isConnected?: boolean;
  onConnectionUpdate?: () => void;
}

const GoogleCalendarAuth: React.FC<GoogleCalendarAuthProps> = ({
  providerId,
  isConnected = false,
  onConnectionUpdate
}) => {
  const [isConnecting, setIsConnecting] = useState(false);

  // Real Google Calendar API credentials - replace with your actual credentials
  const GOOGLE_CLIENT_ID = '874557022390-igieuijvfcpvibd7d4rpp26mbcer4335.apps.googleusercontent.com';
  const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly'
  ].join(' ');

  const handleGoogleAuth = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/init?provider_id=${providerId}`);
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error initiating Google OAuth:', error);
      toast.error('خطأ في ربط التقويم');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log(`[DISCONNECT] Sending request to backend for provider: ${providerId}`);
      const response = await fetch(`${API_BASE_URL}/providers/${providerId}/disconnect`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect');
      }

      toast.success('تم إلغاء ربط التقويم بنجاح');
      onConnectionUpdate?.(); // Refresh the parent component's state
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      toast.error(`خطأ في إلغاء ربط التقويم: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Hide the Google Calendar connection UI if already connected
  // Provider should only connect once, then tokens are stored permanently
  if (isConnected) {
    return null; // Don't show anything when already connected
  }

  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Calendar className="w-12 h-12 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-blue-900 mb-2">ربط تقويم Google</h3>
          <p className="text-sm text-blue-700 mb-4">
            اربط تقويم Google لمزامنة المواعيد تلقائياً
          </p>
        </div>
        <Button
          onClick={handleGoogleAuth}
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isConnecting ? 'جارٍ الربط...' : 'ربط تقويم Google'}
        </Button>
      </div>
    </Card>
  );
};

export default GoogleCalendarAuth;
