"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateOrderNumber } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validations";
import { createIyzicoCheckoutForm } from "@/lib/payment/iyzico";
import { createPayTRToken, getPayTRiFrameUrl } from "@/lib/payment/paytr";
import { processCODOrder, calculateCODFee } from "@/lib/payment/cod";
import {
  calculateShippingCost,
  isFreeShipping,
} from "@/lib/shipping/ptt-kargo";

// ─── Types ──────────────────────────────────────────

export type OrderActionResult = {
  success: boolean;
  error?: string;
  orderId?: string;
  paymentHtml?: string; // İyzico checkout form
  paymentUrl?: string; // PayTR iFrame URL
};

// ─── Sipariş Oluştur ────────────────────────────────

export async function createOrder(
  formData: FormData
): Promise<OrderActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmalısınız" };
  }

  const rawData = {
    addressId: formData.get("addressId") as string,
    paymentMethod: formData.get("paymentMethod") as string,
    couponCode: (formData.get("couponCode") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = checkoutSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Geçersiz veri",
    };
  }

  const { addressId, paymentMethod, couponCode, notes } = parsed.data;

  // Sepeti al
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              category: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (cartItems.length === 0) {
    return { success: false, error: "Sepetiniz boş" };
  }

  // Adres kontrolü
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: session.user.id },
  });

  if (!address) {
    return { success: false, error: "Geçersiz teslimat adresi" };
  }

  // Stok kontrolü
  for (const item of cartItems) {
    if (item.variant.stock < item.quantity) {
      return {
        success: false,
        error: `${item.variant.product.name} - ${item.variant.name} için yeterli stok yok`,
      };
    }
  }

  // Fiyat hesaplama
  const subtotal = cartItems.reduce((sum: number, item: any) => {
    return sum + Number(item.variant.price) * item.quantity;
  }, 0);

  // Kargo ücreti
  const totalWeight = cartItems.reduce((sum: number, item: any) => {
    return sum + (item.variant.weight || 200) * item.quantity;
  }, 0);

  let shippingCost = isFreeShipping(subtotal)
    ? 0
    : calculateShippingCost(totalWeight, address.city);

  // Kupon kontrolü
  let discount = 0;
  let couponId: string | null = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });

    if (
      coupon &&
      coupon.isActive &&
      new Date() >= coupon.validFrom &&
      new Date() <= coupon.validUntil &&
      (!coupon.maxUsageCount ||
        coupon.currentUsageCount < coupon.maxUsageCount) &&
      (!coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount))
    ) {
      couponId = coupon.id;
      if (coupon.type === "PERCENTAGE") {
        discount = (subtotal * Number(coupon.value)) / 100;
      } else {
        discount = Number(coupon.value);
      }
    }
  }

  // Kapıda ödeme ek ücreti
  let codFee = 0;
  if (paymentMethod === "COD") {
    codFee = calculateCODFee(subtotal);
  }

  const totalAmount = subtotal - discount + shippingCost + codFee;
  const orderNumber = generateOrderNumber();

  // Sipariş oluştur (transaction)
  const order = await prisma.$transaction(async (tx: any) => {
    // Sipariş
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: session.user!.id,
        addressId,
        couponId,
        status: paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
        subtotal,
        shippingCost: shippingCost + codFee,
        discount,
        totalAmount,
        paymentMethod: paymentMethod as any,
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
        notes,
      },
    });

    // Sipariş kalemleri
    await tx.orderItem.createMany({
      data: cartItems.map((item: any) => ({
        orderId: newOrder.id,
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantName: item.variant.name,
        unitPrice: Number(item.variant.price),
        quantity: item.quantity,
        totalPrice: Number(item.variant.price) * item.quantity,
      })),
    });

    // Stok düş
    for (const item of cartItems as any[]) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Kupon kullanım sayısını artır
    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { currentUsageCount: { increment: 1 } },
      });
    }

    // Sipariş durum geçmişi
    await tx.orderStatusHistory.create({
      data: {
        orderId: newOrder.id,
        status: paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
        note: "Sipariş oluşturuldu",
      },
    });

    // Sepeti temizle
    await tx.cartItem.deleteMany({
      where: { userId: session.user!.id },
    });

    return newOrder;
  });

  // Ödeme işlemi
  if (paymentMethod === "IYZICO") {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      const result = await createIyzicoCheckoutForm({
        conversationId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: totalAmount.toFixed(2),
        paidPrice: totalAmount.toFixed(2),
        currency: "TRY",
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/iyzico`,
        buyer: {
          id: session.user.id,
          name: user?.firstName || "Müşteri",
          surname: user?.lastName || "",
          email: session.user.email!,
          identityNumber: "11111111111",
          registrationAddress: address.addressLine,
          ip: "127.0.0.1",
          city: address.city,
          country: "Turkey",
        },
        shippingAddress: {
          contactName: address.fullName,
          city: address.city,
          country: "Turkey",
          address: address.addressLine,
        },
        billingAddress: {
          contactName: address.fullName,
          city: address.city,
          country: "Turkey",
          address: address.addressLine,
        },
        basketItems: cartItems.map((item: any) => ({
          id: item.variantId,
          name: `${item.variant.product.name} - ${item.variant.name}`,
          category1: item.variant.product.category?.name || "Kozmetik",
          itemType: "PHYSICAL",
          price: (Number(item.variant.price) * item.quantity).toFixed(2),
        })),
      });

      // Payment kaydı oluştur
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: "IYZICO",
          conversationId: order.id,
          amount: totalAmount,
          status: "PENDING",
        },
      });

      return {
        success: true,
        orderId: order.id,
        paymentHtml: result.checkoutFormContent,
      };
    } catch (error) {
      console.error("İyzico ödeme hatası:", error);
      return {
        success: false,
        error: "Ödeme başlatılamadı. Lütfen tekrar deneyiniz.",
      };
    }
  }

  if (paymentMethod === "PAYTR") {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      const token = await createPayTRToken({
        orderId: order.orderNumber,
        email: session.user.email!,
        totalAmount: Math.round(totalAmount * 100), // Kuruşa çevir
        userName: `${user?.firstName} ${user?.lastName}`,
        userAddress: address.addressLine,
        userPhone: address.phone,
        userIp: "127.0.0.1",
        basketItems: cartItems.map((item: any) => ({
          name: `${item.variant.product.name} - ${item.variant.name}`,
          price: (Number(item.variant.price) * item.quantity * 100).toString(),
          quantity: item.quantity,
        })),
        testMode: process.env.NODE_ENV !== "production",
      });

      // Payment kaydı oluştur
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: "PAYTR",
          conversationId: order.orderNumber,
          amount: totalAmount,
          status: "PENDING",
        },
      });

      return {
        success: true,
        orderId: order.id,
        paymentUrl: getPayTRiFrameUrl(token),
      };
    } catch (error) {
      console.error("PayTR ödeme hatası:", error);
      return {
        success: false,
        error: "Ödeme başlatılamadı. Lütfen tekrar deneyiniz.",
      };
    }
  }

  if (paymentMethod === "COD") {
    const codResult = await processCODOrder({
      orderId: order.id,
      totalAmount,
      customerName: address.fullName,
      customerPhone: address.phone,
      customerEmail: session.user.email!,
    });

    if (!codResult.success) {
      return { success: false, error: codResult.message };
    }

    // Payment kaydı
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "COD",
        amount: totalAmount,
        status: "PENDING",
      },
    });

    revalidatePath("/orders");
    return { success: true, orderId: order.id };
  }

  return { success: false, error: "Geçersiz ödeme yöntemi" };
}

// ─── Siparişlerimi Getir ────────────────────────────

export async function getMyOrders(page: number = 1, pageSize: number = 10) {
  const session = await auth();
  if (!session?.user?.id) return { orders: [], total: 0 };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 },
                  },
                },
              },
            },
          },
        },
        address: true,
        shipment: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where: { userId: session.user.id } }),
  ]);

  return { orders, total, totalPages: Math.ceil(total / pageSize) };
}

// ─── Sipariş Detayı ─────────────────────────────────

export async function getOrderById(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { images: { where: { isPrimary: true }, take: 1 } },
              },
            },
          },
        },
      },
      address: true,
      payment: true,
      shipment: {
        include: {
          tracking: { orderBy: { timestamp: "desc" } },
        },
      },
      statusHistory: { orderBy: { createdAt: "desc" } },
      coupon: true,
    },
  });
}

// ─── Sipariş İptali ─────────────────────────────────

export async function cancelOrder(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmalısınız" };
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    include: { items: true },
  });

  if (!order) {
    return {
      success: false,
      error: "Sipariş bulunamadı veya iptal edilemez",
    };
  }

  await prisma.$transaction(async (tx: any) => {
    // Siparişi iptal et
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        paymentStatus: "REFUNDED",
      },
    });

    // Stokları geri yükle
    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }

    // Durum geçmişi
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "CANCELLED",
        note: "Müşteri tarafından iptal edildi",
      },
    });
  });

  revalidatePath("/orders");
  return { success: true };
}
