import React, { useState, useEffect, useRef } from 'react';
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber, Country } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/utils';

// The 5 allowed countries for this platform
const ALLOWED_COUNTRIES: Country[] = ['US', 'CA', 'GB', 'IE', 'PS'];

// Cache IP detection result at module level so it's only fetched ONCE per page load
let cachedCountry: Country | null = null;
let countryFetchPromise: Promise<Country> | null = null;

const detectCountry = (): Promise<Country> => {
  if (cachedCountry) return Promise.resolve(cachedCountry);
  if (countryFetchPromise) return countryFetchPromise;

  countryFetchPromise = fetch('https://ipapi.co/json/')
    .then((res) => res.json())
    .then((data) => {
      const detected = data?.country_code as Country;
      const country = ALLOWED_COUNTRIES.includes(detected) ? detected : 'PS';
      cachedCountry = country;
      return country;
    })
    .catch(() => {
      cachedCountry = 'PS';
      return 'PS' as Country;
    });

  return countryFetchPromise;
};

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string | undefined, isValid: boolean) => void;
  className?: string;
  disabled?: boolean;
  /**
   * When provided, the country selector is hidden and locked to this country.
   * Used on the Account page where the user's signup country is fixed.
   */
  lockedCountry?: Country;
  /**
   * When true, the field is rendered as read-only display (no editing allowed).
   */
  readOnly?: boolean;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  className,
  disabled = false,
  lockedCountry,
  readOnly = false,
}) => {
  const [defaultCountry, setDefaultCountry] = useState<Country>(lockedCountry || 'PS');
  const [loadingCountry, setLoadingCountry] = useState(!lockedCountry);

  useEffect(() => {
    // If country is locked, no detection needed
    if (lockedCountry) {
      setDefaultCountry(lockedCountry);
      setLoadingCountry(false);
      return;
    }

    detectCountry().then((country) => {
      setDefaultCountry(country);
      setLoadingCountry(false);
    });
  }, [lockedCountry]);

  const handleChange = (newVal?: string) => {
    if (!newVal) {
      onChange(undefined, false);
      return;
    }

    let isValid = false;
    try {
      isValid = isValidPhoneNumber(newVal);
    } catch {
      isValid = false;
    }

    onChange(newVal, isValid);
  };

  if (loadingCountry) {
    return (
      <div className={cn('flex items-center space-x-2 animate-pulse', className)}>
        <div className="w-16 h-12 bg-gray-200/20 rounded-xl" />
        <div className="flex-1 h-12 bg-gray-200/20 rounded-xl" />
      </div>
    );
  }

  return (
    <div className={cn('phone-input-container', className)}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .phone-input-container .PhoneInput {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .phone-input-container .PhoneInputCountry {
          margin-right: 0.75rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 0.75rem;
          height: 3rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: white;
        }
        .phone-input-container .PhoneInputCountryIcon {
          width: 24px;
          height: 18px;
        }
        .phone-input-container .PhoneInputCountrySelect {
          background: transparent;
          color: white;
          border: none;
          outline: none;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0 2px;
        }
        .phone-input-container .PhoneInputCountrySelectArrow {
          border-color: rgba(255,255,255,0.5);
        }
        .phone-input-container .PhoneInputInput {
          flex: 1;
          height: 3rem;
          padding: 0 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: white;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .phone-input-container .PhoneInputInput::placeholder {
          color: rgba(255,255,255,0.3);
        }
        .phone-input-container .PhoneInputInput:focus {
          border-color: rgba(59,130,246,0.6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .phone-input-container .PhoneInputInput:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `
      }} />
      <PhoneInput
        international
        defaultCountry={defaultCountry}
        countries={ALLOWED_COUNTRIES}
        limitMaxLength
        value={value && value !== '0' ? value : undefined}
        onChange={lockedCountry ? (val) => {
          // When country is locked, force the country to stay
          handleChange(val);
        } : handleChange}
        disabled={disabled || readOnly}
        className="w-full"
        // When country is locked, hide the dropdown arrow so it's visually clear
        countrySelectProps={lockedCountry ? { disabled: true, style: { pointerEvents: 'none', opacity: 0.7 } } : undefined}
      />
    </div>
  );
};

/**
 * Derive the Country code from a stored E.164 phone number (e.g., "+970..." → "PS")
 * Falls back to 'PS' if parsing fails.
 */
export const getCountryFromPhone = (e164Phone: string): Country => {
  if (!e164Phone) return 'PS';
  try {
    const parsed = parsePhoneNumber(e164Phone);
    const country = parsed?.country as Country;
    return ALLOWED_COUNTRIES.includes(country) ? country : 'PS';
  } catch {
    return 'PS';
  }
};
