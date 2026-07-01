"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

export async function getStoreSettings() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: "default" },
      });
    }

    return settings;
  } catch (error) {
    console.error("Error fetching store settings:", error);
    throw new Error("Mağaza ayarları alınamadı.");
  }
}

export async function updateStoreSettings(formData: FormData) {
  try {
    const data: any = {
      storeName: formData.get("storeName") as string,
      heroTagline: formData.get("heroTagline") as string,
      heroTitle: formData.get("heroTitle") as string,
      heroDescription: formData.get("heroDescription") as string,
      heroImageUrl: (formData.get("heroImageUrl") as string) || undefined,
      promoTagline: formData.get("promoTagline") as string,
      promoTitle: formData.get("promoTitle") as string,
      promoDescription: formData.get("promoDescription") as string,
      promoCode: (formData.get("promoCode") as string) || undefined,
      whatsAppNumber: (formData.get("whatsAppNumber") as string) || undefined,
      whatsAppMessage: (formData.get("whatsAppMessage") as string) || undefined,
      instagramUrl: (formData.get("instagramUrl") as string) || undefined,
      trendyolUrl: (formData.get("trendyolUrl") as string) || undefined,
    };

    // Handle logo upload
    const logoFile = formData.get("logoFile") as File;
    if (logoFile && logoFile.size > 0) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      // Write file to public directory
      const filename = `logo-${Date.now()}${path.extname(logoFile.name)}`;
      const filepath = path.join(process.cwd(), "public", filename);
      await writeFile(filepath, buffer);
      data.logoUrl = `/${filename}`;
    }

    const updated = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: data,
      create: {
        id: "default",
        ...data,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");
    
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating store settings:", error);
    return { success: false, error: "Ayarlar güncellenemedi." };
  }
}
