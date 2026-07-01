import { getPageBySlug } from "@/actions/page.actions";
import { notFound } from "next/navigation";

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page || !page.isActive) {
    notFound();
  }

  return (
    <main style={{ minHeight: "80vh", padding: "var(--space-12) 0" }}>
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "0 var(--space-4)" }}>
        <h1 className="font-display" style={{ fontSize: "var(--text-4xl)", fontWeight: 800, marginBottom: "var(--space-8)", textAlign: "center" }}>
          {page.title}
        </h1>

        <div style={{ display: "grid", gap: "var(--space-8)" }}>
          {page.blocks.map((block) => {
            if (block.type === "TEXT") {
              return (
                <div 
                  key={block.id} 
                  className="prose"
                  style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "var(--color-text)" }}
                  dangerouslySetInnerHTML={{ __html: block.content || "" }}
                />
              );
            }
            if (block.type === "IMAGE" && block.mediaUrl) {
              return (
                <div key={block.id} style={{ display: "flex", justifyContent: "center", margin: "var(--space-4) 0" }}>
                  <img 
                    src={block.mediaUrl} 
                    alt={page.title} 
                    style={{ maxWidth: "100%", height: "auto", borderRadius: "var(--radius-lg)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} 
                  />
                </div>
              );
            }
            if (block.type === "VIDEO" && block.mediaUrl) {
              return (
                <div key={block.id} style={{ display: "flex", justifyContent: "center", margin: "var(--space-4) 0", width: "100%" }}>
                  <video 
                    src={block.mediaUrl} 
                    controls 
                    style={{ width: "100%", borderRadius: "var(--radius-lg)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} 
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </main>
  );
}
