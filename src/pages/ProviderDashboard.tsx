import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, CalendarDays, MapPin, Search, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { BookingSiteFooter, BookingSiteHeader } from "@/components/BookingSiteChrome";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import "@/components/ProviderDashboard.css";

const PAGE_SIZE = 24;

type Provider = Pick<
  Database["public"]["Tables"]["providers"]["Row"],
  "id" | "name" | "display_name" | "specialty" | "rating" | "review_count" | "experience" | "location" | "image_filename"
>;

function makeSearchFilter(value: string) {
  const term = value
    .trim()
    .replace(/[\\%_]/g, "\\$&")
    .replace(/[(),]/g, " ")
    .replace(/"/g, "\\\"")
    .trim();

  if (!term) return "";

  return ["name", "display_name", "specialty", "location"]
    .map((column) => `${column}.ilike.%${term}%`)
    .join(",");
}

function ProviderCard({ provider }: { provider: Provider }) {
  const displayName = provider.display_name?.trim() || provider.name;
  const image = provider.image_filename || `https://majskvkyvflifttonwgr.supabase.co/storage/v1/object/public/pic/${provider.id}.jpg`;

  return (
    <Link
      className="provider-directory-card"
      to={`/booking/${encodeURIComponent(provider.id)}`}
      aria-label={`View ${displayName}'s profile and book an appointment`}
    >
      <div className="provider-directory-photo">
        <img
          src={image}
          alt={displayName}
          loading="lazy"
          onError={(event) => {
            const target = event.currentTarget;
            target.onerror = null;
            target.src = "/provider-placeholder.svg";
          }}
        />
        {provider.rating != null && (
          <span className="provider-directory-rating">
            <Star size={14} aria-hidden="true" />
            {provider.rating.toFixed(1)}
            {provider.review_count ? <small>({provider.review_count})</small> : null}
          </span>
        )}
      </div>

      <div className="provider-directory-info">
        <p className="provider-directory-specialty">{provider.specialty || "Provider"}</p>
        <h2>{displayName}</h2>
        {provider.location && (
          <p className="provider-directory-location">
            <MapPin size={15} aria-hidden="true" />
            <span>{provider.location}</span>
          </p>
        )}
        <span className="provider-directory-cta">
          View profile &amp; book <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export default function ProviderDashboard() {
  const [search, setSearch] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const requestId = useRef(0);

  const loadProviders = useCallback(async (term: string, offset: number, append = false) => {
    const request = ++requestId.current;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(false);
    }

    try {
      let query = supabase
        .from("providers")
        .select("id, name, display_name, specialty, rating, review_count, experience, location, image_filename", { count: "exact" })
        .order("name", { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);

      const filter = makeSearchFilter(term);
      if (filter) query = query.or(filter);

      const { data, count, error: queryError } = await query;
      if (request !== requestId.current) return;
      if (queryError) throw queryError;

      const rows = (data || []) as Provider[];
      setProviders((current) => append ? [...current, ...rows] : rows);
      setTotal(count ?? offset + rows.length);
      setHasMore(offset + rows.length < (count ?? offset + rows.length));
    } catch (queryError) {
      if (request !== requestId.current) return;
      console.error("Error loading provider directory:", queryError);
      setError(true);
      if (!append) {
        setProviders([]);
        setTotal(0);
      }
    } finally {
      if (request === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProviders(search, 0);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [loadProviders, search]);

  const handleSearch = (value: string) => {
    requestId.current += 1;
    setSearch(value);
    setProviders([]);
    setTotal(0);
    setHasMore(false);
    setError(false);
    setLoading(true);
    setLoadingMore(false);
  };

  const retry = () => {
    setLoading(true);
    setError(false);
    void loadProviders(search, 0);
  };

  return (
    <div className="providers-dashboard">
      <BookingSiteHeader />
      <main className="providers-dashboard-main">
        <div className="providers-dashboard-content">
          <section className="providers-dashboard-intro" aria-labelledby="providers-dashboard-title">
            <div>
              <p className="providers-dashboard-eyebrow">BOOKINGS / PROVIDER DIRECTORY</p>
              <h1 id="providers-dashboard-title">Find your <span>provider.</span></h1>
              <p className="providers-dashboard-description">
                Search by provider, specialty, or location. Open a profile to see details and available appointments.
              </p>
            </div>
            <Link className="providers-account-link" to="/account">
              <CalendarDays size={18} aria-hidden="true" />
              <span>Manage my bookings</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </section>

          <form className="providers-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <Search size={20} aria-hidden="true" />
            <label className="sr-only" htmlFor="provider-search">Search providers</label>
            <input
              id="provider-search"
              type="search"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Name, specialty, or location"
              autoComplete="off"
            />
            <span className="providers-search-caption">Search directory</span>
          </form>

          <div className="providers-directory-heading" aria-live="polite">
            <div>
              <p>DIRECTORY</p>
              <h2>{search.trim() ? "Search results" : "Available providers"}</h2>
            </div>
            <span>{loading ? "Loading providers…" : `${total} ${total === 1 ? "provider" : "providers"}`}</span>
          </div>

          {error ? (
            <div className="providers-directory-message" role="alert">
              <h2>We couldn’t load providers.</h2>
              <p>Please check your connection and try again.</p>
              <button type="button" onClick={retry}>Try again</button>
            </div>
          ) : loading && providers.length === 0 ? (
            <div className="provider-directory-grid" aria-label="Loading providers">
              {Array.from({ length: 6 }, (_, index) => <div className="provider-directory-skeleton" key={index} />)}
            </div>
          ) : providers.length > 0 ? (
            <>
              <div className="provider-directory-grid">
                {providers.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
              </div>
              {hasMore && (
                <div className="providers-load-more-wrap">
                  <button
                    className="providers-load-more"
                    type="button"
                    disabled={loadingMore}
                    onClick={() => void loadProviders(search, providers.length, true)}
                  >
                    {loadingMore ? "Loading…" : "Load more providers"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="providers-directory-message">
              <h2>{search.trim() ? "No providers match your search." : "No providers are available yet."}</h2>
              <p>{search.trim() ? "Try another name, specialty, or location." : "Please check back later."}</p>
              {search.trim() && <button type="button" onClick={() => handleSearch("")}>Clear search</button>}
            </div>
          )}
        </div>
      </main>
      <BookingSiteFooter />
    </div>
  );
}
