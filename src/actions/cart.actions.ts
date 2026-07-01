"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ─── Sepete Ürün Ekle ───────────────────────────────

export async function addToCart(variantId: string, quantity: number = 1) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmalısınız" };
  }

  // Varyant kontrolü
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: { isActive: true, name: true } } },
  });

  if (!variant || !variant.isActive || !variant.product.isActive) {
    return { success: false, error: "Ürün bulunamadı veya satışta değil" };
  }

  if (variant.stock < quantity) {
    return { success: false, error: "Yetersiz stok" };
  }

  // Sepette mevcut mu kontrol et
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_variantId: {
        userId: session.user.id,
        variantId,
      },
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > variant.stock) {
      return { success: false, error: "Stok limiti aşıldı" };
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        variantId,
        quantity,
      },
    });
  }

  revalidatePath("/cart");
  return { success: true };
}

// ─── Sepet Miktarını Güncelle ───────────────────────

export async function updateCartItem(
  cartItemId: string,
  quantity: number
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmalısınız" };
  }

  if (quantity <= 0) {
    // Sil
    await prisma.cartItem.deleteMany({
      where: { id: cartItemId, userId: session.user.id },
    });
  } else {
    // Stok kontrolü
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, userId: session.user.id },
      include: { variant: true },
    });

    if (!cartItem) {
      return { success: false, error: "Sepet öğesi bulunamadı" };
    }

    if (quantity > cartItem.variant.stock) {
      return { success: false, error: "Yetersiz stok" };
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  revalidatePath("/cart");
  return { success: true };
}

// ─── Sepetten Ürün Kaldır ───────────────────────────

export async function removeFromCart(cartItemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmalısınız" };
  }

  await prisma.cartItem.deleteMany({
    where: { id: cartItemId, userId: session.user.id },
  });

  revalidatePath("/cart");
  return { success: true };
}

// ─── Sepeti Getir ───────────────────────────────────

export async function getCart() {
  const session = await auth();
  if (!session?.user?.id) {
    return { items: [], total: 0, itemCount: 0 };
  }

  const items = await prisma.cartItem.findMany({
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
    orderBy: { addedAt: "desc" },
  });

  const total = items.reduce((sum: number, item: any) => {
    return sum + Number(item.variant.price) * item.quantity;
  }, 0);

  return {
    items,
    total,
    itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
  };
}

// ─── Sepeti Temizle ─────────────────────────────────

export async function clearCart() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Giriş yapmalısınız" };
  }

  await prisma.cartItem.deleteMany({
    where: { userId: session.user.id },
  });

  revalidatePath("/cart");
  return { success: true };
}

// ─── Sepetteki Ürün Sayısı ──────────────────────────

export async function getCartCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const result = await prisma.cartItem.aggregate({
    where: { userId: session.user.id },
    _sum: { quantity: true },
  });

  return result._sum.quantity || 0;
}
