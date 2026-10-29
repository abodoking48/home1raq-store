/** Arabic-Indic / Persian digits → ASCII. */
export function toAsciiDigits(s: string) {
  return s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * Normalizes an Iraqi phone as typed ("0770 123 4567", "+964770…", "٠٧٧٠…").
 * `local` is `07XXXXXXXXX`; `intl` is digits only with the 964 prefix (for wa.me / +964 links),
 * or null when the number isn't a recognizable Iraqi mobile.
 */
export function iraqiPhone(raw: string) {
  let national = toAsciiDigits(raw).replace(/\D/g, "");
  if (national.startsWith("00964")) national = national.slice(5);
  else if (national.startsWith("964")) national = national.slice(3);
  if (national.startsWith("0")) national = national.slice(1);
  if (/^7\d{9}$/.test(national)) {
    return { local: `0${national}`, intl: `964${national}` };
  }
  return { local: raw.trim(), intl: null };
}
