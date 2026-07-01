"use server";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import bcrypt from "bcryptjs";
import { registerSchema, loginSchema } from "@/lib/validations";
import { redirect } from "next/navigation";

// ─── Types ──────────────────────────────────────────

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

// ─── Kayıt ──────────────────────────────────────────

export async function registerUser(
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    phone: (formData.get("phone") as string) || undefined,
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Geçersiz veri",
    };
  }

  const { firstName, lastName, email, password, phone } = parsed.data;

  // E-posta kontrolü
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return {
      success: false,
      error: "Bu e-posta adresi zaten kullanılıyor",
    };
  }

  // Şifre hash'leme
  const passwordHash = await bcrypt.hash(password, 12);

  // Kullanıcı oluştur
  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      phone: phone || null,
      role: "CUSTOMER",
    },
  });

  // Otomatik giriş yap
  await signIn("credentials", {
    email: email.toLowerCase(),
    password,
    redirectTo: "/",
  });

  return { success: true };
}

// ─── Giriş ──────────────────────────────────────────

export async function loginUser(
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Geçersiz veri",
    };
  }

  try {
    const callbackUrl =
      (formData.get("callbackUrl") as string) || "/";

    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });

    return { success: true };
  } catch (error) {
    // AuthJS NEXT_REDIRECT hatalarını yeniden fırlat
    if (
      error instanceof Error &&
      error.message === "NEXT_REDIRECT"
    ) {
      throw error;
    }
    return {
      success: false,
      error: "E-posta veya şifre hatalı",
    };
  }
}

// ─── Çıkış ──────────────────────────────────────────

export async function logoutUser() {
  await signOut({ redirectTo: "/" });
}

// ─── Profil Güncelle ────────────────────────────────

export async function updateProfile(
  userId: string,
  formData: FormData
): Promise<AuthActionResult> {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;

  if (!firstName || !lastName) {
    return {
      success: false,
      error: "Ad ve soyad gereklidir",
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      phone: phone || null,
    },
  });

  return { success: true };
}

// ─── Şifre Değiştir ─────────────────────────────────

export async function changePassword(
  userId: string,
  formData: FormData
): Promise<AuthActionResult> {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      success: false,
      error: "Tüm alanları doldurunuz",
    };
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      error: "Yeni şifre en az 6 karakter olmalıdır",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: "Yeni şifreler eşleşmiyor",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.passwordHash) {
    return {
      success: false,
      error: "Kullanıcı bulunamadı",
    };
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return {
      success: false,
      error: "Mevcut şifre hatalı",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { success: true };
}
