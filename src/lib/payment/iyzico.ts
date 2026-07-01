// ─── İyzico Ödeme Entegrasyonu ───────────────────────
// Docs: https://dev.iyzipay.com/

import Iyzipay from "iyzipay";

// ─── İyzico Client ──────────────────────────────────

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
});

// ─── Types ──────────────────────────────────────────

export interface IyzicoPaymentParams {
  conversationId: string;
  orderNumber: string;
  totalAmount: string;
  paidPrice: string;
  currency: string;
  basketItems: IyzicoBasketItem[];
  buyer: IyzicoBuyer;
  shippingAddress: IyzicoAddress;
  billingAddress: IyzicoAddress;
  callbackUrl: string;
}

export interface IyzicoBasketItem {
  id: string;
  name: string;
  category1: string;
  itemType: string;
  price: string;
}

export interface IyzicoBuyer {
  id: string;
  name: string;
  surname: string;
  email: string;
  identityNumber: string;
  registrationAddress: string;
  ip: string;
  city: string;
  country: string;
}

export interface IyzicoAddress {
  contactName: string;
  city: string;
  country: string;
  address: string;
}

// ─── Checkout Form Oluşturma ────────────────────────

export async function createIyzicoCheckoutForm(
  params: IyzicoPaymentParams
): Promise<{ checkoutFormContent: string; token: string }> {
  return new Promise((resolve, reject) => {
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: params.conversationId,
      price: params.totalAmount,
      paidPrice: params.paidPrice,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: params.orderNumber,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: params.callbackUrl,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: params.buyer.id,
        name: params.buyer.name,
        surname: params.buyer.surname,
        gsmNumber: "+905350000000",
        email: params.buyer.email,
        identityNumber: params.buyer.identityNumber || "11111111111",
        registrationAddress: params.buyer.registrationAddress,
        ip: params.buyer.ip,
        city: params.buyer.city,
        country: params.buyer.country || "Turkey",
      },
      shippingAddress: {
        contactName: params.shippingAddress.contactName,
        city: params.shippingAddress.city,
        country: params.shippingAddress.country || "Turkey",
        address: params.shippingAddress.address,
      },
      billingAddress: {
        contactName: params.billingAddress.contactName,
        city: params.billingAddress.city,
        country: params.billingAddress.country || "Turkey",
        address: params.billingAddress.address,
      },
      basketItems: params.basketItems.map((item) => ({
        id: item.id,
        name: item.name,
        category1: item.category1,
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: item.price,
      })),
    };

    iyzipay.checkoutFormInitialize.create(request, (err: Error, result: any) => {
      if (err) {
        reject(err);
        return;
      }
      if (result.status !== "success") {
        reject(new Error(result.errorMessage || "İyzico ödeme başlatılamadı"));
        return;
      }
      resolve({
        checkoutFormContent: result.checkoutFormContent,
        token: result.token,
      });
    });
  });
}

// ─── Ödeme Sonucu Sorgulama ─────────────────────────

export async function retrieveIyzicoCheckoutForm(
  token: string
): Promise<{
  status: string;
  paymentId: string;
  price: number;
  paidPrice: number;
  basketId: string;
  cardType: string;
  lastFourDigits: string;
}> {
  return new Promise((resolve, reject) => {
    const request = {
      locale: Iyzipay.LOCALE.TR,
      token: token,
    };

    iyzipay.checkoutForm.retrieve(request, (err: Error, result: any) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        status: result.paymentStatus || result.status,
        paymentId: result.paymentId,
        price: result.price,
        paidPrice: result.paidPrice,
        basketId: result.basketId,
        cardType: result.cardType,
        lastFourDigits: result.lastFourDigits,
      });
    });
  });
}

// ─── İade İşlemi ────────────────────────────────────

export async function refundIyzicoPayment(
  paymentTransactionId: string,
  price: string,
  ip: string,
  conversationId: string
): Promise<{ status: string; paymentTransactionId: string }> {
  return new Promise((resolve, reject) => {
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      paymentTransactionId: paymentTransactionId,
      price: price,
      currency: Iyzipay.CURRENCY.TRY,
      ip: ip,
    };

    iyzipay.refund.create(request, (err: Error, result: any) => {
      if (err) {
        reject(err);
        return;
      }
      if (result.status !== "success") {
        reject(new Error(result.errorMessage || "İade işlemi başarısız"));
        return;
      }
      resolve({
        status: result.status,
        paymentTransactionId: result.paymentTransactionId,
      });
    });
  });
}
