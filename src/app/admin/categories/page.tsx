import Link from "next/link";
import { adminGetCategories, adminDeleteCategory } from "@/actions/admin.actions";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Kategoriler | Admin",
};

export default async function AdminCategoriesPage() {
  const categories = await adminGetCategories();

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await adminDeleteCategory(id);
    revalidatePath("/admin/categories");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 className="font-display" style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>Kategoriler</h1>
        <Link href="/admin/categories/new" className="btn btn-primary">
          + Yeni Kategori Ekle
        </Link>
      </div>

      <div className="glass" style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <tr>
              <th style={{ padding: "var(--space-4)", fontWeight: 600 }}>Kategori Adı</th>
              <th style={{ padding: "var(--space-4)", fontWeight: 600 }}>Slug</th>
              <th style={{ padding: "var(--space-4)", fontWeight: 600 }}>Üst Kategori</th>
              <th style={{ padding: "var(--space-4)", fontWeight: 600 }}>Ürün Sayısı</th>
              <th style={{ padding: "var(--space-4)", fontWeight: 600 }}>Durum</th>
              <th style={{ padding: "var(--space-4)", fontWeight: 600, textAlign: "right" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-text-muted)" }}>
                  Henüz kategori eklenmemiş.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "var(--space-4)" }}>{cat.name}</td>
                  <td style={{ padding: "var(--space-4)", color: "var(--color-text-muted)" }}>{cat.slug}</td>
                  <td style={{ padding: "var(--space-4)", color: "var(--color-text-muted)" }}>{cat.parent?.name || "-"}</td>
                  <td style={{ padding: "var(--space-4)" }}>{cat._count.products}</td>
                  <td style={{ padding: "var(--space-4)" }}>
                    {cat.isActive ? (
                      <span style={{ color: "#10b981", fontSize: "14px" }}>Aktif</span>
                    ) : (
                      <span style={{ color: "#ef4444", fontSize: "14px" }}>Pasif</span>
                    )}
                  </td>
                  <td style={{ padding: "var(--space-4)", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <Link href={`/admin/categories/${cat.id}`} className="btn btn-outline btn-sm">
                        Düzenle
                      </Link>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={cat.id} />
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
