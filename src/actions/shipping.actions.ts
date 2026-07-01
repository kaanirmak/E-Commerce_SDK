"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  createPTTShipment,
  trackPTTShipment,
  cancelPTTShipment,
  mapPTTStatusToInternal,
} from "@/lib/shipping/ptt-kargo";

// ─── Kargo Oluştur (Admin) ─────────────────────────

export async function createShipmentForOrder(orderId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Yetkiniz yok" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      address: true,
      items: { include: { variant: true } },
      user: true,
    },
  });

  if (!order) {
    return { success: false, error: "Sipariş bulunamadı" };
  }

  if (order.status !== "CONFIRMED" && order.status !== "PREPARING") {
    return {
      success: false,
      error: "Bu sipariş kargoya verilemez",
    };
  }

  // Toplam ağırlık hesapla
  const totalWeight = order.items.reduce((sum: number, item: any) => {
    return sum + (item.variant.weight || 200) * item.quantity;
  }, 0);

  // PTT Kargo gönderi oluştur
  const result = await createPTTShipment({
    orderId: order.orderNumber,
    senderName: process.env.NEXT_PUBLIC_APP_NAME || "Butik Kozmetik",
    senderPhone: "05001234567", // Mağaza telefonu
    senderAddress: "Mağaza Adresi", // .env'den alınabilir
    senderCity: "İstanbul",
    senderDistrict: "Kadıköy",
    receiverName: order.address.fullName,
    receiverPhone: order.address.phone,
    receiverAddress: order.address.addressLine,
    receiverCity: order.address.city,
    receiverDistrict: order.address.district,
    receiverPostalCode: order.address.postalCode || undefined,
    weight: totalWeight,
    description: `Sipariş #${order.orderNumber}`,
    paymentType: order.paymentMethod === "COD" ? "RECEIVER" : "SENDER",
    isCOD: order.paymentMethod === "COD",
    codAmount:
      order.paymentMethod === "COD"
        ? Number(order.totalAmount)
        : undefined,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.errorMessage || "Kargo oluşturulamadı",
    };
  }

  // DB güncelle
  await prisma.$transaction(async (tx: any) => {
    await tx.shipment.create({
      data: {
        orderId: order.id,
        carrier: "PTT",
        trackingNumber: result.trackingNumber || null,
        barcodeUrl: result.barcodeUrl || null,
        labelUrl: result.labelUrl || null,
        status: "CREATED",
        weight: totalWeight / 1000, // kg
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: "SHIPPED" },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: "SHIPPED",
        note: `PTT Kargo ile gönderildi. Takip No: ${result.trackingNumber}`,
      },
    });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);
  return {
    success: true,
    trackingNumber: result.trackingNumber,
  };
}

// ─── Kargo Takip ────────────────────────────────────

export async function getShipmentTracking(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const shipment = await prisma.shipment.findFirst({
    where: {
      orderId,
      order: {
        OR: [
          { userId: session.user.id },
          ...(session.user.role === "ADMIN" ? [{}] : []),
        ],
      },
    },
    include: {
      tracking: { orderBy: { timestamp: "desc" } },
      order: {
        select: { orderNumber: true, status: true },
      },
    },
  });

  return shipment;
}

// ─── Kargo Durumu Senkronize Et ─────────────────────

export async function syncShipmentStatus(shipmentId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Yetkiniz yok" };
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
  });

  if (!shipment || !shipment.trackingNumber) {
    return { success: false, error: "Kargo bilgisi bulunamadı" };
  }

  const trackingResult = await trackPTTShipment(shipment.trackingNumber);

  if (!trackingResult.success) {
    return { success: false, error: "Takip bilgisi alınamadı" };
  }

  // Tracking event'leri kaydet
  await prisma.$transaction(async (tx: any) => {
    // Mevcut tracking'leri temizle ve yenilerini ekle
    await tx.shipmentTracking.deleteMany({
      where: { shipmentId: shipment.id },
    });

    if (trackingResult.events.length > 0) {
      await tx.shipmentTracking.createMany({
        data: trackingResult.events.map((event: any) => ({
          shipmentId: shipment.id,
          status: event.status,
          location: event.location,
          description: event.description,
          timestamp: new Date(`${event.date} ${event.time}`),
        })),
      });
    }

    // Shipment durumunu güncelle
    const internalStatus = mapPTTStatusToInternal(
      trackingResult.status
    ) as any;
    await tx.shipment.update({
      where: { id: shipment.id },
      data: {
        status: internalStatus,
        actualDelivery:
          internalStatus === "DELIVERED" ? new Date() : undefined,
      },
    });

    // Teslim edildiyse siparişi de güncelle
    if (internalStatus === "DELIVERED") {
      await tx.order.update({
        where: { id: shipment.orderId },
        data: {
          status: "DELIVERED",
          paymentStatus:
            (
              await tx.order.findUnique({
                where: { id: shipment.orderId },
              })
            )?.paymentMethod === "COD"
              ? "PAID"
              : undefined,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: shipment.orderId,
          status: "DELIVERED",
          note: "Kargo teslim edildi",
        },
      });
    }
  });

  revalidatePath("/admin/orders");
  return { success: true };
}

// ─── Kargo İptali ───────────────────────────────────

export async function cancelShipment(shipmentId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Yetkiniz yok" };
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
  });

  if (!shipment || !shipment.trackingNumber) {
    return { success: false, error: "Kargo bilgisi bulunamadı" };
  }

  if (shipment.status !== "CREATED") {
    return {
      success: false,
      error: "Sadece oluşturulmuş kargolar iptal edilebilir",
    };
  }

  const result = await cancelPTTShipment(shipment.trackingNumber);

  if (result.success) {
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: "RETURNED" },
    });
  }

  return result;
}
