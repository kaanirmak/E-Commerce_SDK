"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validations";

// ─── Admin Guard ────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yetkiniz yok");
  }
  return session;
}

// ─── Dashboard İstatistikleri ───────────────────────

export async function getDashboardStats() {
  await requireAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalOrders,
    monthlyOrders,
    totalRevenue,
    monthlyRevenue,
    totalCustomers,
    pendingOrders,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: "PAID" },
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count({
      where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING"] } },
    }),
    prisma.productVariant.count({
      where: { stock: { lte: 5 }, isActive: true },
    }),
    prisma.order.findMany({
      include: {
        user: { select: { firstName: true, lastName: true } },
        items: { take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    totalOrders,
    monthlyOrders,
    totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
    monthlyRevenue: Number(monthlyRevenue._sum.totalAmount || 0),
    totalCustomers,
    pendingOrders,
    lowStockProducts,
    recentOrders,
  };
}

// ─── Ürün CRUD (Admin) ─────────────────────────────

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    shortDescription:
      (formData.get("shortDescription") as string) || undefined,
    categoryId: formData.get("categoryId") as string,
    basePrice: parseFloat(formData.get("basePrice") as string),
    compareAtPrice: formData.get("compareAtPrice")
      ? parseFloat(formData.get("compareAtPrice") as string)
      : undefined,
    ingredients: (formData.get("ingredients") as string) || undefined,
    usageInstructions:
      (formData.get("usageInstructions") as string) || undefined,
    volumeMl: formData.get("volumeMl")
      ? parseInt(formData.get("volumeMl") as string)
      : undefined,
    isFeatured: formData.get("isFeatured") === "true",
    isActive: formData.get("isActive") !== "false",
  };

  const stock = formData.get("stock") ? parseInt(formData.get("stock") as string) : 10;
  const imageUrl = formData.get("imageUrl") as string | undefined;

  const parsed = productSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message,
    };
  }

  const slug = slugify(parsed.data.name);

  // Slug benzersizlik kontrolü
  const existing = await prisma.product.findUnique({
    where: { slug },
  });
  const finalSlug = existing
    ? `${slug}-${Date.now().toString(36)}`
    : slug;

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      slug: finalSlug,
      variants: {
        create: [
          {
            name: "Standart Boy",
            sku: `${finalSlug}-STD`,
            price: parsed.data.basePrice,
            stock: stock,
          }
        ]
      },
      images: imageUrl ? {
        create: [
          {
            url: imageUrl,
            altText: parsed.data.name,
            isPrimary: true,
            sortOrder: 1,
          }
        ]
      } : undefined
    },
  });

  revalidatePath("/admin/products");
  return { success: true, productId: product.id };
}

export async function updateProduct(
  productId: string,
  formData: FormData
) {
  await requireAdmin();

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    shortDescription:
      (formData.get("shortDescription") as string) || undefined,
    categoryId: formData.get("categoryId") as string,
    basePrice: parseFloat(formData.get("basePrice") as string),
    compareAtPrice: formData.get("compareAtPrice")
      ? parseFloat(formData.get("compareAtPrice") as string)
      : undefined,
    ingredients: (formData.get("ingredients") as string) || undefined,
    usageInstructions:
      (formData.get("usageInstructions") as string) || undefined,
    volumeMl: formData.get("volumeMl")
      ? parseInt(formData.get("volumeMl") as string)
      : undefined,
    isFeatured: formData.get("isFeatured") === "true",
    isActive: formData.get("isActive") !== "false",
  };

  const parsed = productSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message,
    };
  }

  await prisma.product.update({
    where: { id: productId },
    data: parsed.data,
  });

  revalidatePath("/admin/products");
  revalidatePath(`/products`);
  return { success: true };
}

export async function deleteProduct(productId: string) {
  await requireAdmin();

  await prisma.product.update({
    where: { id: productId },
    data: { isActive: false },
  });

  revalidatePath("/admin/products");
  return { success: true };
}

// ─── Sipariş Durum Güncelleme (Admin) ───────────────

export async function updateOrderStatus(
  orderId: string,
  status: string,
  note?: string
) {
  await requireAdmin();

  await prisma.$transaction(async (tx: any) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: status as any,
        note: note || `Durum güncellendi: ${status}`,
      },
    });
  });

  revalidatePath("/admin/orders");
  return { success: true };
}

// ─── Tüm Siparişler (Admin) ────────────────────────

export async function getAllOrders(
  page: number = 1,
  pageSize: number = 20,
  status?: string
) {
  await requireAdmin();

  const where = status ? { status: status as any } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        items: { take: 3 },
        shipment: { select: { trackingNumber: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─── Müşteriler (Admin) ────────────────────────────

export async function getAllCustomers(
  page: number = 1,
  pageSize: number = 20
) {
  await requireAdmin();

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: { totalAmount: true },
          where: { paymentStatus: "PAID" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  return {
    customers: customers.map((c: any) => ({
      ...c,
      totalSpent: c.orders.reduce(
        (sum: number, o: any) => sum + Number(o.totalAmount),
        0
      ),
      orders: undefined,
    })),
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─── Kategori CRUD (Admin) ─────────────────────────

export async function adminGetCategories() {
  await requireAdmin();
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      parent: true,
      _count: { select: { products: true } }
    }
  });
}

export async function adminCreateCategory(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string || undefined;
  const parentId = formData.get("parentId") as string || undefined;
  const isActive = formData.get("isActive") !== "false";

  if (!name) return { success: false, error: "Kategori adı gerekli" };

  const slug = slugify(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        parentId,
        isActive,
      }
    });
    revalidatePath("/admin/categories");
    return { success: true, categoryId: category.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Kategori oluşturulamadı" };
  }
}

export async function adminUpdateCategory(id: string, formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string || undefined;
  const parentId = formData.get("parentId") as string || undefined;
  const isActive = formData.get("isActive") === "true";

  if (!name) return { success: false, error: "Kategori adı gerekli" };

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        parentId,
        isActive,
      }
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Kategori güncellenemedi" };
  }
}

export async function adminDeleteCategory(id: string) {
  await requireAdmin();
  try {
    await prisma.category.delete({
      where: { id }
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Kategori silinemedi. Bu kategoriye bağlı ürünler veya alt kategoriler olabilir." };
  }
}

