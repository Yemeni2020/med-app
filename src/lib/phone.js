import { countryDialCodes } from '@/data/countryDialCodes';

export const COUNTRY_CODE_OPTIONS = countryDialCodes.map((entry) => ({
  countryCode: entry.iso || entry.code,
  displayCode: extractPrimaryCode(/\d/.test(String(entry.code || '')) ? entry.code : entry.dial_code),
  dialCode: normalizeDialCode(/\d/.test(String(entry.code || '')) ? entry.code : entry.dial_code),
}));

const DEFAULT_COUNTRY_CODE = 'SA';

function normalizeDialCode(rawCode) {
  const firstCode = extractPrimaryCode(rawCode);
  const digitsOnly = firstCode.replace(/\D+/g, '');
  return digitsOnly ? `+${digitsOnly}` : '';
}

function extractPrimaryCode(rawCode) {
  return String(rawCode || '').split(',')[0].trim();
}

export function parsePhoneValue(phone) {
  if (!phone) {
    return {
      countryCode: DEFAULT_COUNTRY_CODE,
      phoneNumber: '',
    };
  }

  const normalized = String(phone).trim().replace(/\s+/g, '');
  const sorted = [...COUNTRY_CODE_OPTIONS].sort((a, b) => b.dialCode.length - a.dialCode.length);
  const match = sorted.find((option) => normalized.startsWith(option.dialCode));

  if (!match) {
    return {
      countryCode: DEFAULT_COUNTRY_CODE,
      phoneNumber: normalized.replace(/^\+/, ''),
    };
  }

  return {
    countryCode: match.countryCode,
    phoneNumber: normalized.slice(match.dialCode.length).trim(),
  };
}

export function buildPhoneValue(countryCode, phoneNumber) {
  const trimmedNumber = String(phoneNumber || '').replace(/\D+/g, '');
  if (!trimmedNumber) {
    return '';
  }

  const selected = COUNTRY_CODE_OPTIONS.find((option) => option.countryCode === countryCode);
  const dialCode = selected?.dialCode || '+966';

  return `${dialCode}${trimmedNumber}`;
}
