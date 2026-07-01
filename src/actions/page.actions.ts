"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPages() {
  return await prisma.page.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getPageBySlug(slug: string) {
  return await prisma.page.findUnique({
    where: { slug },
    include: {
      blocks: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function createPage(data: {
  title: string;
  slug: string;
  isActive?: boolean;
}) {
  try {
    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        isActive: data.isActive ?? true,
      },
    });
    revalidatePath("/");
    revalidatePath("/admin/pages");
    return { success: true, pageId: page.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Sayfa oluşturulamadı" };
  }
}

export async function updatePageBlocks(
  pageId: string,
  blocks: {
    id?: string;
    type: string;
    content?: string;
    mediaUrl?: string;
    sortOrder: number;
  }[]
) {
  try {
    // Delete existing blocks
    await prisma.pageBlock.deleteMany({
      where: { pageId },
    });

    // Create new blocks
    if (blocks.length > 0) {
      await prisma.pageBlock.createMany({
        data: blocks.map((b) => ({
          pageId,
          type: b.type,
          content: b.content,
          mediaUrl: b.mediaUrl,
          sortOrder: b.sortOrder,
        })),
      });
    }

    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (page) {
      revalidatePath(`/${page.slug}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Bloklar güncellenemedi" };
  }
}

export async function deletePage(id: string) {
  try {
    await prisma.page.delete({
      where: { id },
    });
    revalidatePath("/admin/pages");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Silinemedi" };
  }
}
