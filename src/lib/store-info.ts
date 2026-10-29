/**
 * Single source for store facts shown across the storefront (delivery, contact, returns).
 * Only put confirmed facts here — never invent terms.
 */

/** Same number as the floating WhatsApp button. */
export const STORE_WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9647722551877").replace(/\D/g, "");

/** `07722551877` style, for display. */
export const STORE_WHATSAPP_LOCAL = `0${STORE_WHATSAPP.replace(/^964/, "")}`;

export function whatsappLink(text?: string) {
  return `https://wa.me/${STORE_WHATSAPP}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export const DELIVERY = {
  /** The one delivery sentence used everywhere (product page, cart, checkout, landing). */
  sentence: "توصيل مجاني لجميع أنحاء العراق",
  short: "توصيل مجاني 🚚",
  /**
   * TODO(owner): confirm the delivery time (the cart used to say "24 - 48 ساعة"). Shown only
   * when set.
   */
  time: null as string | null,
};

export const RETURNS = {
  /**
   * TODO(owner): the actual exchange/return policy (window in days, conditions, who pays
   * shipping). Until it is provided, /returns only tells customers to contact us.
   */
  policy: null as string[] | null,
};

export const STORE_CONTACT = {
  /** TODO(owner): showroom address and working hours, if any. Shown only when set. */
  address: null as string | null,
  hours: null as string | null,
};

export const IRAQ_GOVERNORATES = [
  "بغداد",
  "البصرة",
  "نينوى",
  "أربيل",
  "النجف",
  "كربلاء",
  "بابل",
  "ذي قار",
  "الأنبار",
  "ديالى",
  "كركوك",
  "صلاح الدين",
  "واسط",
  "ميسان",
  "المثنى",
  "القادسية",
  "دهوك",
  "السليمانية",
] as const;
