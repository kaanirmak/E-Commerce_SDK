import Link from "next/link";
import { getPages, deletePage } from "@/actions/page.actions";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Sayfalar | Admin",
};

export default async function AdminPagesPage() {
  const pages = await getPages();

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deletePage(id);
    revalidatePath("/admin/pages");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 className="font-display" style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>Sayfalar (CMS)</h1>
        <Link href="/admin/pages/new" className="btn btn-primary">
          + Yeni Sayfa Ekle
        </Link>
      </div>

      <div className="glass" style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <tr>
              <th style={{ padding: "var(--space-4)", fontWeight: 600 }}>Sayfa Başlığı</th>
              <th style={{ padding: "var(--space-4)", fontWeight: 600 }}>URL (Slug)</th>
              <th style={{ padding: "var(--space-4)", fontWeight: 600 }}>Durum</th>
              <th style={{ padding: "var(--space-4)", fontWeight: 600, textAlign: "right" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-text-muted)" }}>
                  Henüz sayfa eklenmemiş.
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "var(--space-4)" }}>{page.title}</td>
                  <td style={{ padding: "var(--space-4)", color: "var(--color-text-muted)" }}>/pages/{page.slug}</td>
                  <td style={{ padding: "var(--space-4)" }}>
                    {page.isActive ? (
                      <span style={{ color: "#10b981", fontSize: "14px" }}>Aktif</span>
                    ) : (
                      <span style={{ color: "#ef4444", fontSize: "14px" }}>Pasif</span>
                    )}
                  </td>
                  <td style={{ padding: "var(--space-4)", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <Link href={`/admin/pages/${page.slug}`} className="btn btn-outline btn-sm">
                        Düzenle
                      </Link>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={page.id} />
                        <button type="submit" className="btn btn-outline btn-sm" style={{ borderColor: "#ef4444", color: "#ef4444" }}>
                          Sil
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
