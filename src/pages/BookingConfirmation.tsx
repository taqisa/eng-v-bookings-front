import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BookingConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Confirmed!</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Your appointment has been successfully scheduled. We've sent the details to your phone.
          </p>
        </div>

        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white" 
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
