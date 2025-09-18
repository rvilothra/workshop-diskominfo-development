/**
 * Normalize Indonesian phone number to E.164 format
 * @param {string} phone - Phone number to normalize
 * @returns {string} E.164 formatted phone number
 */
function normalizePhoneNumber(phone) {
  if (!phone) return null;

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, "");

  // If it starts with 62, it's already in international format
  if (cleaned.startsWith("62")) {
    return `+${cleaned}`;
  }

  // If it's 8 digits (Jakarta mobile), add 62
  if (cleaned.length === 8) {
    return `+628${cleaned}`;
  }

  // If it's 9 digits (mobile), add 62
  if (cleaned.length === 9) {
    return `+62${cleaned}`;
  }

  // If it's 10 digits (mobile), add 62
  if (cleaned.length === 10) {
    return `+62${cleaned}`;
  }

  // If it's 11 digits (mobile), add 62
  if (cleaned.length === 11) {
    return `+62${cleaned}`;
  }

  // If it's 12 digits (mobile), add 62
  if (cleaned.length === 12) {
    return `+62${cleaned}`;
  }

  // If it's 13 digits (mobile), add 62
  if (cleaned.length === 13) {
    return `+62${cleaned}`;
  }

  // If it's already 14 digits and starts with 62, add +
  if (cleaned.length === 14 && cleaned.startsWith("62")) {
    return `+${cleaned}`;
  }

  // If it's already 15 digits and starts with 62, add +
  if (cleaned.length === 15 && cleaned.startsWith("62")) {
    return `+${cleaned}`;
  }

  // Default: assume it's a mobile number and add 62
  return `+62${cleaned}`;
}

/**
 * Validate if phone number is a valid Indonesian mobile number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidIndonesianMobile(phone) {
  if (!phone) return false;

  const normalized = normalizePhoneNumber(phone);

  // Check if it's a valid Indonesian mobile number
  // Indonesian mobile numbers start with +628
  const mobileRegex = /^\+628[1-9][0-9]{6,11}$/;

  return mobileRegex.test(normalized);
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
function formatPhoneForDisplay(phone) {
  if (!phone) return "";

  const normalized = normalizePhoneNumber(phone);

  if (!normalized) return phone;

  // Format as +62 8xx xxxx xxxx
  const match = normalized.match(/^\+62(8\d{2})(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `+62 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }

  // Format as +62 8xx xxxx xxxx (shorter)
  const match2 = normalized.match(/^\+62(8\d{2})(\d{3})(\d{4})$/);
  if (match2) {
    return `+62 ${match2[1]} ${match2[2]} ${match2[3]}`;
  }

  return normalized;
}

module.exports = {
  normalizePhoneNumber,
  isValidIndonesianMobile,
  formatPhoneForDisplay,
};
