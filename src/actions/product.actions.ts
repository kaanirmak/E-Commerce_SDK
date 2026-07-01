"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getPaginationParams } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────

export interface ProductFilters {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular" | "rating";
  page?: number;
  pageSize?: number;
  isFeatured?: boolean;
}

export interface ProductListResult {
  products: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Ürün Listeleme ─────────────────────────────────

export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductListResult> {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 12;
  const { skip, take } = getPaginationParams(page, pageSize);

  // Where koşulları
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }

  if (filters.minPrice || filters.maxPrice) {
    where.basePrice = {};
    if (filters.minPrice) {
      where.basePrice.gte = filters.minPrice;
    }
    if (filters.maxPrice) {
      where.basePrice.lte = filters.maxPrice;
    }
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { shortDescription: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.isFeatured !== undefined) {
    where.isFeatured = filters.isFeatured;
  }

  // Sıralama
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (filters.sortBy) {
    case "price_asc":
      orderBy = { basePrice: "asc" };
      break;
    case "price_desc":
      orderBy = { basePrice: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "popular":
      orderBy = { reviewCount: "desc" };
      break;
    case "rating":
      orderBy = { avgRating: "desc" };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        variants: {
          where: { isActive: true },
          orderBy: { price: "asc" },
          take: 1,
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─── Ürün Detay ─────────────────────────────────────

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
      tags: { include: { tag: true } },
      reviews: {
        where: { isApproved: true },
        include: {
          user: {
            select: { firstName: true, lastName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return product;
}

// ─── Öne Çıkan Ürünler ─────────────────────────────

export async function getFeaturedProducts(limit: number = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      variants: {
        where: { isActive: true },
        orderBy: { price: "asc" },
        take: 1,
      },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ─── Yeni Ürünler ───────────────────────────────────

export async function getNewProducts(limit: number = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      variants: {
        where: { isActive: true },
        orderBy: { price: "asc" },
        take: 1,
      },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ─── Kategoriler ────────────────────────────────────

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

// ─── Ürün Arama ─────────────────────────────────────

export async function searchProducts(query: string, limit: number = 10) {
  if (!query || query.length < 2) return [];

  return prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      variants: {
        where: { isActive: true },
        orderBy: { price: "asc" },
        take: 1,
      },
    },
    take: limit,
  });
}

// ─── İlişkili Ürünler ──────────────────────────────

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit: number = 4
) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      categoryId,
      id: { not: productId },
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      variants: {
        where: { isActive: true },
        orderBy: { price: "asc" },
        take: 1,
      },
    },
    take: limit,
    orderBy: { avgRating: "desc" },
  });
}
