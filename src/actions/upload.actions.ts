"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "Dosya bulunamadı" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {
      // ignore if already exists
    }

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filepath = path.join(uploadsDir, filename);
    
    await writeFile(filepath, buffer);
    
    return { success: true, url: `/uploads/${filename}` };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Dosya yüklenirken hata oluştu" };
  }
}
