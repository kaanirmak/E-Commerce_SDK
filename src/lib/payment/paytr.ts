// ─── PayTR Ödeme Entegrasyonu ────────────────────────
// PayTR iFrame API entegrasyonu
// Docs: PayTR Merchant Panel > Destek & Kurulum > Developer Portal

import crypto from "crypto";

// ─── Types ──────────────────────────────────────────

export interface PayTRTokenParams {
  orderId: string;
  email: string;
  totalAmount: number; // Kuruş cinsinden (100.00 TL = 10000)
  userName: string;
  userAddress: string;
  userPhone: string;
  userIp: string;
  basketItems: PayTRBasketItem[];
  noInstallment?: boolean;
  maxInstallment?: number;
  currency?: string;
  testMode?: boolean;
  lang?: string;
}

export interface PayTRBasketItem {
  name: string;
  price: string; // Kuruş cinsinden string
  quantity: number;
}

export interface PayTRCallbackData {
  merchant_oid: string;
  status: "success" | "failed";
  total_amount: string;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  test_mode?: string;
  payment_type?: string;
}

// ─── Config ─────────────────────────────────────────

const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID!;
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!;
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─── Token Üretimi ──────────────────────────────────

export async function createPayTRToken(
  params: PayTRTokenParams
): Promise<string> {
  const merchantOid = params.orderId;
  const paymentAmount = params.totalAmount.toString();
  const currency = params.currency || "TL";
  const testMode = params.testMode ? "1" : "0";
  const noInstallment = params.noInstallment ? "1" : "0";
  const maxInstallment = params.maxInstallment?.toString() || "0";
  const lang = params.lang || "tr";

  // Basket JSON encode (Base64)
  const userBasket = params.basketItems.map((item) => [
    item.name,
    item.price,
    item.quantity,
  ]);
  const userBasketStr = Buffer.from(JSON.stringify(userBasket)).toString(
    "base64"
  );

  const merchantOkUrl = `${APP_URL}/checkout/success`;
  const merchantFailUrl = `${APP_URL}/checkout/fail`;

  // Hash string oluştur
  const hashStr = `${PAYTR_MERCHANT_ID}${params.userIp}${merchantOid}${params.email}${paymentAmount}${userBasketStr}${noInstallment}${maxInstallment}${currency}${testMode}`;
  const paytrToken = crypto
    .createHmac("sha256", PAYTR_MERCHANT_KEY)
    .update(hashStr + PAYTR_MERCHANT_SALT)
    .digest("base64");

  // PayTR API'ye istek
  const formData = new URLSearchParams({
    merchant_id: PAYTR_MERCHANT_ID,
    user_ip: params.userIp,
    merchant_oid: merchantOid,
    email: params.email,
    payment_amount: paymentAmount,
    paytr_token: paytrToken,
    user_basket: userBasketStr,
    debug_on: testMode === "1" ? "1" : "0",
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: params.userName,
    user_address: params.userAddress,
    user_phone: params.userPhone,
    merchant_ok_url: merchantOkUrl,
    merchant_fail_url: merchantFailUrl,
    timeout_limit: "30",
    currency: currency,
    test_mode: testMode,
    lang: lang,
  });

  const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const result = await response.json();

  if (result.status !== "success") {
    throw new Error(result.reason || "PayTR token oluşturulamadı");
  }

  return result.token;
}

// ─── Callback Doğrulama ─────────────────────────────

export function verifyPayTRCallback(data: PayTRCallbackData): boolean {
  const hashStr = `${data.merchant_oid}${PAYTR_MERCHANT_SALT}${data.status}${data.total_amount}`;
  const expectedHash = crypto
    .createHmac("sha256", PAYTR_MERCHANT_KEY)
    .update(hashStr)
    .digest("base64");

  return expectedHash === data.hash;
}

// ─── iFrame URL oluşturma ───────────────────────────

export function getPayTRiFrameUrl(token: string): string {
  return `https://www.paytr.com/odeme/guvenli/${token}`;
}
