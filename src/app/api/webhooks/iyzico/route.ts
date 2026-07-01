import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retrieveIyzicoCheckoutForm } from "@/lib/payment/iyzico";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json(
        { error: "Token gerekli" },
        { status: 400 }
      );
    }

    // İyzico'dan ödeme sonucunu sorgula
    const result = await retrieveIyzicoCheckoutForm(token);

    // Payment kaydını bul
    const payment = await prisma.payment.findFirst({
      where: {
        provider: "IYZICO",
        order: { orderNumber: result.basketId },
      },
    });

    if (!payment) {
      console.error("İyzico webhook: Payment bulunamadı", result.basketId);
      return NextResponse.json(
        { error: "Payment bulunamadı" },
        { status: 404 }
      );
    }

    if (result.status === "SUCCESS") {
      // Ödeme başarılı
      await prisma.$transaction(async (tx: any) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            transactionId: result.paymentId,
            rawResponse: JSON.stringify(result),
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
            note: `İyzico ile ödeme alındı. İşlem ID: ${result.paymentId}`,
          },
        });
      });
    } else {
      // Ödeme başarısız
      await prisma.$transaction(async (tx: any) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            rawResponse: JSON.stringify(result),
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "FAILED" },
        });
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("İyzico webhook hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
