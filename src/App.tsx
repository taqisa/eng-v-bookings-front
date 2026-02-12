
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import CityPage from "./pages/CityPage";
import BookingPage from "./pages/BookingPage";
import BookingConfirmation from "./pages/BookingConfirmation";
import GoogleCalendarCallback from "./pages/GoogleCalendarCallback";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import AccountPage from "./pages/AccountPage";
import AboutPage from "./pages/AboutPage";
import CategoryPage from "./pages/CategoryPage";
import { useEffect } from "react"; // Added useEffect import

import { API_BASE_URL } from "@/lib/utils";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Warm up the backend immediately
    const pingBackend = async () => {
      try {
        await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
        console.log('Backend Awake');
      } catch (e) {
        // Ignore errors, just trying to wake it up
      }
    };
    pingBackend();

    // Keep alive interval (every 5 minutes)
    const interval = setInterval(pingBackend, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/city/:cityId" element={<CityPage />} />
              <Route path="/booking/:providerId" element={<BookingPage />} />
              <Route path="/booking-confirmation/:providerId" element={<BookingConfirmation />} />
              <Route path="/google-calendar-callback" element={<GoogleCalendarCallback />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
