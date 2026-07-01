import { getPageBySlug } from "@/actions/page.actions";
import { notFound } from "next/navigation";
import PageBuilder from "./PageBuilder";

export const metadata = {
  title: "Sayfa Düzenle | Admin",
};

export default async function EditPage({ params }: { params: { slug: string } }) {
  const page = await getPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="font-display" style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>
          Sayfa Düzenle: {page.title}
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>URL: /pages/{page.slug}</p>
      </div>

      <PageBuilder pageId={page.id} initialBlocks={page.blocks} />
    </div>
  );
}
