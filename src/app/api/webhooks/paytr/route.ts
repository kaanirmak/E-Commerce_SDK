import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayTRCallback, type PayTRCallbackData } from "@/lib/payment/paytr";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const callbackData: PayTRCallbackData = {
      merchant_oid: formData.get("merchant_oid") as string,
      status: formData.get("status") as "success" | "failed",
      total_amount: formData.get("total_amount") as string,
      hash: formData.get("hash") as string,
      failed_reason_code: (formData.get("failed_reason_code") as string) || undefined,
      failed_reason_msg: (formData.get("failed_reason_msg") as string) || undefined,
      test_mode: (formData.get("test_mode") as string) || undefined,
      payment_type: (formData.get("payment_type") as string) || undefined,
    };

    // Hash doğrulama — ÇOK ÖNEMLİ!
    if (!verifyPayTRCallback(callbackData)) {
      console.error("PayTR callback: Hash doğrulama başarısız");
      return new NextResponse("HASH_ERROR", { status: 400 });
    }

    // Payment kaydını bul (merchant_oid = orderNumber)
    const payment = await prisma.payment.findFirst({
      where: {
        provider: "PAYTR",
        order: { orderNumber: callbackData.merchant_oid },
      },
    });

    if (!payment) {
      console.error(
        "PayTR callback: Payment bulunamadı",
        callbackData.merchant_oid
      );
      return new NextResponse("OK"); // PayTR "OK" bekliyor
    }

    if (callbackData.status === "success") {
      await prisma.$transaction(async (tx: any) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            transactionId: callbackData.merchant_oid,
            rawResponse: JSON.stringify(callbackData),
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            status: "CONFIRMED",
            note: `PayTR ile ödeme alındı.`,
          },
        });
      });
    } else {
      await prisma.$transaction(async (tx: any) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            rawResponse: JSON.stringify(callbackData),
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "FAILED" },
        });
      });
    }

    // PayTR mutlaka "OK" döndürülmeli, yoksa tekrar dener
    return new NextResponse("OK");
  } catch (error) {
    console.error("PayTR callback hatası:", error);
    return new NextResponse("OK"); // Hata durumunda bile OK dönmeli
  }
}
