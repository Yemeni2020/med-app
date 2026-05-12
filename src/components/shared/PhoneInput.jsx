import React from 'react';
import { Phone } from 'lucide-react';
import { COUNTRY_CODE_OPTIONS } from '@/lib/phone';

export default function PhoneInput({
  inputId = 'phone',
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  placeholder = '',
}) {
  return (
    <div className="flex h-10 w-full items-center rounded-xl border border-input bg-muted/40 focus-within:ring-2 focus-within:ring-primary/30">
      <div className="flex items-center gap-2 border-r border-border px-3">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <select
          value={countryCode}
          onChange={(event) => onCountryCodeChange(event.target.value)}
          className="h-8 bg-transparent text-sm outline-none"
          aria-label="Country code"
        >
          {COUNTRY_CODE_OPTIONS.map((option) => (
            <option key={option.countryCode} value={option.countryCode}>
              {`${option.displayCode} (${option.countryCode})`}
            </option>
          ))}
        </select>
      </div>
      <input
        id={inputId}
        type="text"
        value={phoneNumber}
        onChange={(event) => onPhoneNumberChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full bg-transparent px-3 text-sm outline-none"
      />
    </div>
  );
}
