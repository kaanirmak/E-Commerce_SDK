// ─── Kapıda Ödeme (Cash on Delivery) ────────────────
// Kapıda nakit veya kapıda kart ile ödeme

export interface CODOrderParams {
  orderId: string;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export interface CODResult {
  success: boolean;
  message: string;
  orderId: string;
  paymentMethod: "COD";
}

/**
 * Kapıda ödeme siparişini işler
 * Kapıda ödemede ödeme sipariş teslimatında alınır,
 * bu yüzden burada sadece sipariş onaylanır
 */
export async function processCODOrder(
  params: CODOrderParams
): Promise<CODResult> {
  // Kapıda ödeme için minimum sipariş tutarı kontrolü
  const MIN_COD_AMOUNT = 50; // 50 TL
  const MAX_COD_AMOUNT = 5000; // 5000 TL

  if (params.totalAmount < MIN_COD_AMOUNT) {
    return {
      success: false,
      message: `Kapıda ödeme için minimum sipariş tutarı ${MIN_COD_AMOUNT} TL'dir.`,
      orderId: params.orderId,
      paymentMethod: "COD",
    };
  }

  if (params.totalAmount > MAX_COD_AMOUNT) {
    return {
      success: false,
      message: `Kapıda ödeme için maksimum sipariş tutarı ${MAX_COD_AMOUNT} TL'dir.`,
      orderId: params.orderId,
      paymentMethod: "COD",
    };
  }

  // Telefon numarası kontrolü (kapıda ödemede zorunlu)
  if (!params.customerPhone || params.customerPhone.length < 10) {
    return {
      success: false,
      message: "Kapıda ödeme için geçerli bir telefon numarası gereklidir.",
      orderId: params.orderId,
      paymentMethod: "COD",
    };
  }

  return {
    success: true,
    message: "Kapıda ödeme siparişi başarıyla oluşturuldu.",
    orderId: params.orderId,
    paymentMethod: "COD",
  };
}

/**
 * Kapıda ödeme ek ücreti hesaplar
 */
export function calculateCODFee(subtotal: number): number {
  // Kapıda ödeme için sabit ek ücret
  const COD_FEE = 14.99;
  return COD_FEE;
}

/**
 * Kapıda ödeme için uygunluğu kontrol eder
 */
export function isCODAvailable(
  totalAmount: number,
  city?: string
): { available: boolean; reason?: string } {
  const MIN_COD_AMOUNT = 50;
  const MAX_COD_AMOUNT = 5000;

  if (totalAmount < MIN_COD_AMOUNT) {
    return {
      available: false,
      reason: `Minimum ${MIN_COD_AMOUNT} TL sipariş gereklidir.`,
    };
  }

  if (totalAmount > MAX_COD_AMOUNT) {
    return {
      available: false,
      reason: `Kapıda ödeme ${MAX_COD_AMOUNT} TL üzeri siparişlerde kullanılamaz.`,
    };
  }

  return { available: true };
}
