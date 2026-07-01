import { adminCreateCategory, adminGetCategories } from "@/actions/admin.actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Yeni Kategori Ekle | Admin",
};

export default async function NewCategoryPage() {
  const categories = await adminGetCategories();
  const parentCategories = categories.filter(c => !c.parentId);

  async function handleCreate(formData: FormData) {
    "use server";
    
    const result = await adminCreateCategory(formData);
    if (result.success) {
      redirect("/admin/categories");
    } else {
      redirect(`/admin/categories/new?error=${encodeURIComponent(result.error || "Hata")}`);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="font-display" style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>Yeni Kategori Ekle</h1>
      </div>

      <form action={handleCreate} style={{ display: "grid", gap: "var(--space-8)" }}>
        <div className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)", display: "grid", gap: "var(--space-4)" }}>
          <div className="form-group">
            <label className="form-label">Kategori Adı</label>
            <input type="text" name="name" className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Açıklama (Opsiyonel)</label>
            <textarea name="description" className="form-input" rows={3}></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Üst Kategori (Alt kategori oluşturmak için seçin)</label>
            <select name="parentId" className="form-input">
              <option value="">Yok (Ana Kategori)</option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "var(--space-2)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" name="isActive" value="true" defaultChecked />
              <span>Aktif Kategori (Sitede görünür)</span>
            </label>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary btn-lg">
            Kategoriyi Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
