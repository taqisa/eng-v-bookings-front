import React from 'react';
import { parsePhoneNumber, isValidPhoneNumber, Country } from 'libphonenumber-js';

// Country config — single source of truth for all phone rules on this platform
export const COUNTRY_CONFIG: Record<string, {
  callingCode: string;
  flag: string;
  name: string;
  maxDigits: number; // national number digits (without leading 0 or country code)
}> = {
  PS: { callingCode: '+970', flag: '🇵🇸', name: 'Palestine',      maxDigits: 9  },
  US: { callingCode: '+1',   flag: '🇺🇸', name: 'United States',  maxDigits: 10 },
  CA: { callingCode: '+1',   flag: '🇨🇦', name: 'Canada',         maxDigits: 10 },
  GB: { callingCode: '+44',  flag: '🇬🇧', name: 'United Kingdom', maxDigits: 10 },
  IE: { callingCode: '+353', flag: '🇮🇪', name: 'Ireland',        maxDigits: 9  },
};

/**
 * Derive the Country code from a stored E.164 phone number.
 * Falls back to 'PS' if parsing fails.
 */
export const getCountryFromPhone = (e164Phone: string): string => {
  if (!e164Phone) return 'PS';
  try {
    const parsed = parsePhoneNumber(e164Phone);
    const country = parsed?.country as string;
    return country && COUNTRY_CONFIG[country] ? country : 'PS';
  } catch {
    return 'PS';
  }
};

/**
 * Extract the local (national) number digits from a stored E.164 number.
 * E.g. "+970591234567" → "591234567"
 */
export const getNationalDigits = (e164Phone: string, countryCode: string): string => {
  if (!e164Phone) return '';
  try {
    const parsed = parsePhoneNumber(e164Phone);
    // nationalNumber is the digits without the country code prefix
    return parsed?.nationalNumber || '';
  } catch {
    // Fallback: strip the calling code prefix manually
    const config = COUNTRY_CONFIG[countryCode];
    if (!config) return '';
    const stripped = e164Phone.replace(config.callingCode, '');
    return stripped.replace(/\D/g, '');
  }
};

/**
 * Convert country code + local digits → E.164 format.
 * E.g. "PS" + "591234567" → "+970591234567"
 */
export const toE164 = (countryCode: string, localDigits: string): string => {
  const config = COUNTRY_CONFIG[countryCode];
  if (!config) return '';
  return `${config.callingCode}${localDigits}`;
};

interface LockedPhoneInputProps {
  /** The stored E.164 phone number, e.g. "+970591234567" */
  e164Value: string;
  /** Called when the user changes digits. Passes the new E.164 value and whether it's valid. */
  onChange: (e164: string, isValid: boolean) => void;
  disabled?: boolean;
}

/**
 * A phone input for the Account/profile page.
 * - Shows the country flag + calling code as a locked, non-editable prefix.
 * - The user can only edit the local number digits.
 * - Enforces the correct max-digit limit for the user's country.
 * - Cannot be used to change the country.
 */
export const LockedPhoneInput: React.FC<LockedPhoneInputProps> = ({
  e164Value,
  onChange,
  disabled = false,
}) => {
  const countryCode = getCountryFromPhone(e164Value);
  const config = COUNTRY_CONFIG[countryCode];
  const localDigits = getNationalDigits(e164Value, countryCode);

  const handleDigitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digits and enforce max length
    const raw = e.target.value.replace(/\D/g, '');
    const capped = raw.slice(0, config.maxDigits);
    const newE164 = toE164(countryCode, capped);

    let valid = false;
    if (capped.length === config.maxDigits) {
      try {
        valid = isValidPhoneNumber(newE164, countryCode as Country);
      } catch {
        valid = false;
      }
    }
    onChange(newE164, valid);
  };

  if (!config) {
    return <p className="text-red-400 text-sm">Unknown country code</p>;
  }

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Locked country prefix pill */}
      <div
        className="flex items-center gap-2 px-3 h-12 rounded-xl bg-white/5 border border-white/15 text-white select-none flex-shrink-0"
        title={config.name}
        aria-label={`Country: ${config.name}`}
      >
        <span className="text-xl leading-none">{config.flag}</span>
        <span className="text-sm font-semibold text-gray-300 tabular-nums">{config.callingCode}</span>
      </div>

      {/* Editable digit-only input */}
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        value={localDigits}
        onChange={handleDigitChange}
        disabled={disabled}
        maxLength={config.maxDigits}
        placeholder={`${config.maxDigits} digits`}
        className={[
          'flex-1 h-12 px-4 rounded-xl border text-white text-sm font-medium outline-none transition-all duration-200',
          'bg-white/5 border-white/15 placeholder-white/30',
          'focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20',
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-white/25',
        ].join(' ')}
        aria-label={`Phone number digits for ${config.name}`}
      />
    </div>
  );
};
