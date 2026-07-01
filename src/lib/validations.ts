import { z } from "zod";

// ─── Auth Schemas ───────────────────────────────────

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir"),
  lastName: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad en fazla 50 karakter olabilir"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z
    .string()
    .min(6, "Şifre en az 6 karakter olmalıdır")
    .max(100, "Şifre en fazla 100 karakter olabilir"),
  confirmPassword: z.string(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 10,
      "Geçerli bir telefon numarası giriniz"
    ),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(1, "Şifre gereklidir"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

// ─── Address Schemas ────────────────────────────────

export const addressSchema = z.object({
  title: z.string().min(1, "Adres başlığı gereklidir"),
  fullName: z.string().min(2, "Ad soyad gereklidir"),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  city: z.string().min(1, "İl seçiniz"),
  district: z.string().min(1, "İlçe seçiniz"),
  neighborhood: z.string().optional(),
  addressLine: z.string().min(10, "Adres en az 10 karakter olmalıdır"),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// ─── Product Schemas ────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  categoryId: z.string().min(1, "Kategori seçiniz"),
  basePrice: z.number().positive("Fiyat pozitif olmalıdır"),
  compareAtPrice: z.number().positive().optional(),
  ingredients: z.string().optional(),
  usageInstructions: z.string().optional(),
  volumeMl: z.number().int().positive().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const productVariantSchema = z.object({
  name: z.string().min(1, "Varyant adı gereklidir"),
  sku: z.string().min(1, "SKU gereklidir"),
  price: z.number().positive("Fiyat pozitif olmalıdır"),
  stock: z.number().int().min(0, "Stok negatif olamaz"),
  weight: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

// ─── Cart Schemas ───────────────────────────────────

export const addToCartSchema = z.object({
  variantId: z.string().min(1, "Ürün varyantı seçiniz"),
  quantity: z.number().int().min(1, "Miktar en az 1 olmalıdır"),
});

export const updateCartSchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.number().int().min(0, "Miktar 0 veya daha fazla olmalıdır"),
});

// ─── Order Schemas ──────────────────────────────────

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Teslimat adresi seçiniz"),
  paymentMethod: z.enum(["IYZICO", "PAYTR", "COD"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Review Schemas ─────────────────────────────────

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1, "En az 1 yıldız veriniz").max(5, "En fazla 5 yıldız"),
  title: z.string().optional(),
  comment: z.string().optional(),
});

// ─── Coupon Schemas ─────────────────────────────────

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Kupon kodu en az 3 karakter olmalıdır")
    .max(20, "Kupon kodu en fazla 20 karakter olabilir")
    .toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive("İndirim değeri pozitif olmalıdır"),
  minOrderAmount: z.number().positive().optional(),
  maxUsageCount: z.number().int().positive().optional(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  isActive: z.boolean().optional(),
});

// ─── Type Exports ───────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartInput = z.infer<typeof updateCartSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
