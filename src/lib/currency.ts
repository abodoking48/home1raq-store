/** عرض المبلغ بالأرقام العربية العراقية فقط */
export function formatIqdNumber(amount: number | string) {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("ar-IQ", {
    maximumFractionDigits: 0,
  }).format(n);
}

/** عرض المبلغ مع لاحقة د.ع (كما في واجهة المتجر) */
export function formatIqd(amount: number | string) {
  const num = formatIqdNumber(amount);
  if (num === "—") return "—";
  return `${num} د.ع`;
}
