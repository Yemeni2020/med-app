export const COUNTRY_CODE_OPTIONS = [
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+971', country: 'UAE' },
  { code: '+965', country: 'Kuwait' },
  { code: '+973', country: 'Bahrain' },
  { code: '+974', country: 'Qatar' },
  { code: '+968', country: 'Oman' },
  { code: '+20', country: 'Egypt' },
  { code: '+962', country: 'Jordan' },
  { code: '+961', country: 'Lebanon' },
  { code: '+1', country: 'United States' },
  { code: '+44', country: 'United Kingdom' },
];

const DEFAULT_COUNTRY_CODE = '+966';

export function parsePhoneValue(phone) {
  if (!phone) {
    return {
      countryCode: DEFAULT_COUNTRY_CODE,
      phoneNumber: '',
    };
  }

  const normalized = String(phone).trim();
  const match = COUNTRY_CODE_OPTIONS.find((option) => normalized.startsWith(option.code));

  if (!match) {
    return {
      countryCode: DEFAULT_COUNTRY_CODE,
      phoneNumber: normalized,
    };
  }

  return {
    countryCode: match.code,
    phoneNumber: normalized.slice(match.code.length).trim(),
  };
}

export function buildPhoneValue(countryCode, phoneNumber) {
  const trimmedNumber = String(phoneNumber || '').trim();
  if (!trimmedNumber) {
    return '';
  }

  return `${countryCode} ${trimmedNumber}`.trim();
}
