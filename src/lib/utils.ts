/**
 * Fiyatı Türk Lirası formatında gösterir
 */
export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Tarihi Türkçe formatında gösterir
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Kısa tarih formatı
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Benzersiz sipariş numarası üretir: ORD-20260701-XXXX
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2, "0");
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${dateStr}-${randomPart}`;
}

/**
 * Text'i slug'a çevirir (Türkçe karakter desteği)
 */
export function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
  };

  return text
    .split("")
    .map((char) => turkishMap[char] || char)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Sipariş durumunu Türkçe'ye çevirir
 */
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Beklemede",
    CONFIRMED: "Onaylandı",
    PREPARING: "Hazırlanıyor",
    SHIPPED: "Kargoya Verildi",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal Edildi",
    RETURNED: "İade Edildi",
  };
  return labels[status] || status;
}

/**
 * Ödeme durumunu Türkçe'ye çevirir
 */
export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Beklemede",
    PAID: "Ödendi",
    FAILED: "Başarısız",
    REFUNDED: "İade Edildi",
  };
  return labels[status] || status;
}

/**
 * Kargo durumunu Türkçe'ye çevirir
 */
export function getShipmentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    CREATED: "Oluşturuldu",
    PICKED_UP: "Alındı",
    IN_TRANSIT: "Yolda",
    OUT_FOR_DELIVERY: "Dağıtımda",
    DELIVERED: "Teslim Edildi",
    RETURNED: "İade Edildi",
  };
  return labels[status] || status;
}

/**
 * Ödeme yöntemini Türkçe'ye çevirir
 */
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    IYZICO: "Kredi/Banka Kartı (İyzico)",
    PAYTR: "Kredi/Banka Kartı (PayTR)",
    COD: "Kapıda Ödeme",
  };
  return labels[method] || method;
}

/**
 * Sayfaya göre veri çeker (offset tabanlı)
 */
export function getPaginationParams(page: number, pageSize: number = 12) {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}
