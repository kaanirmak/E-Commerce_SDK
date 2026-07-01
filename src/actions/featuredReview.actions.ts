"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function getFeaturedReviews(onlyActive = true) {
  return await prisma.featuredReview.findMany({
    where: onlyActive ? { isActive: true } : {},
    orderBy: { sortOrder: "asc" },
  });
}

export async function createFeaturedReview(formData: FormData) {
  const name = formData.get("name") as string;
  const role = formData.get("role") as string || null;
  const title = formData.get("title") as string || null;
  const location = formData.get("location") as string || null;
  const text = formData.get("text") as string;
  const rating = parseInt(formData.get("rating") as string) || 5;

  if (!name || !text) {
    return { success: false, error: "İsim ve yorum alanları zorunludur" };
  }

  // Handle image uploads (up to 3)
  const images: string[] = [];
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch (e) {}

  for (let i = 1; i <= 3; i++) {
    const file = formData.get(`imageFile${i}`) as File;
    if (file && file.size > 0) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `review-${Date.now()}-${i}${path.extname(file.name)}`;
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);
        images.push(`/uploads/${filename}`);
      } catch (err) {
        console.error(`Image ${i} upload failed:`, err);
      }
    }
  }

  try {
    await prisma.featuredReview.create({
      data: {
        name,
        role,
        title,
        location,
        text,
        rating,
        images,
      },
    });
    revalidatePath("/");
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Yorum eklenemedi" };
  }
}

export async function deleteFeaturedReview(id: string) {
  try {
    await prisma.featuredReview.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Yorum silinemedi" };
  }
}
