import { createPage } from "@/actions/page.actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Yeni Sayfa Ekle | Admin",
};

export default function NewPage() {
  async function handleCreate(formData: FormData) {
    "use server";
    
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    
    const result = await createPage({ title, slug });
    if (result.success) {
      redirect(`/admin/pages/${slug}`);
    } else {
      redirect(`/admin/pages/new?error=${encodeURIComponent(result.error || "Hata")}`);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="font-display" style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>Yeni Sayfa Oluştur</h1>
      </div>

      <form action={handleCreate} style={{ display: "grid", gap: "var(--space-8)" }}>
        <div className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)", display: "grid", gap: "var(--space-4)" }}>
          <div className="form-group">
            <label className="form-label">Sayfa Başlığı</label>
            <input type="text" name="title" className="form-input" required placeholder="Örn: Hakkımızda" />
          </div>

          <div className="form-group">
            <label className="form-label">URL (Slug)</label>
            <input type="text" name="slug" className="form-input" required placeholder="Örn: hakkimizda" />
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
              Boşluk kullanmayın. Sayfa /pages/slug adresinden yayınlanır.
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary btn-lg">
            Sayfayı Oluştur ve İçerik Ekle
          </button>
        </div>
      </form>
    </div>
  );
}
