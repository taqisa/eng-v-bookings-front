import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BookingPage from "./BookingPage";
import ProviderSelection from "./ProviderSelection";
import { BookingSiteHeader as Header, BookingSiteFooter as Footer } from "@/components/BookingSiteChrome";


export default function TenantRouter() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState<{
    type: 'provider' | 'organization';
    id: string; // The UUID of the provider or organization
    data?: any;
  } | null>(null);

  useEffect(() => {
    let active = true;
    async function resolveTenant() {
      if (!slug) return;
      setLoading(true);
      setTenantInfo(null);

      // 1. Try to find a provider with this slug
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .select('id, organization_id')
        .eq('slug', slug)
        .maybeSingle();

      if (!active) return;
      if (provider) {
        setTenantInfo({ type: 'provider', id: provider.id, data: provider });
        setLoading(false);
        return;
      }

      // 2. Try to find an organization with this slug
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('slug', slug)
        .maybeSingle();

      if (!active) return;
      if (organization) {
        // Find providers for this organization
        const { data: providers, error: providersError } = await supabase
          .from('providers')
          .select('id, name, display_name, specialty, slug, image_filename')
          .eq('organization_id', organization.id);

        if (!active) return;
        if (providers && providers.length === 1) {
          // If only one provider in organization, go straight to their booking page
          setTenantInfo({ type: 'provider', id: providers[0].id, data: providers[0] });
        } else {
          // Multiple providers (or zero) -> show selection screen
          setTenantInfo({ 
            type: 'organization', 
            id: organization.id, 
            data: { ...organization, providers: providers || [] } 
          });
        }
        setLoading(false);
        return;
      }

      // 3. Not found
      setTenantInfo(null);
      setLoading(false);
    }

    void resolveTenant().catch(() => { if (active) { setTenantInfo(null); setLoading(false); } });
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="booking-page min-h-screen">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!tenantInfo) {
    return (
      <div className="booking-page min-h-screen">
        <Header />
        <div className="pt-32 text-center min-h-screen">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">We could not find the provider or clinic you are looking for.</p>
          <p className="text-gray-400">Please ask your provider for their current booking link.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (tenantInfo.type === 'provider') {
    return <BookingPage key={tenantInfo.id} providerIdProp={tenantInfo.id} />;
  }

  if (tenantInfo.type === 'organization') {
    return <ProviderSelection organization={tenantInfo.data} providers={tenantInfo.data.providers} />;
  }

  return null;
}
