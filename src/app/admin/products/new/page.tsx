import { createProduct } from "@/actions/admin.actions";
import { getCategories } from "@/actions/product.actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Yeni Ürün Ekle | Admin",
};

export default async function NewProductPage() {
  const categories = await getCategories();

  async function handleCreate(formData: FormData) {
    "use server";
    
    // Additional parameters we need to explicitly format before passing to createProduct if needed
    // But our server action handles FormData parsing directly.
    const result = await createProduct(formData);
    
    if (result.success) {
      redirect("/admin/products?success=1");
    } else {
      redirect(`/admin/products/new?error=${encodeURIComponent(result.error || "Hata oluştu")}`);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="font-display" style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>Yeni Ürün Ekle</h1>
      </div>

      <form action={handleCreate} style={{ display: "grid", gap: "var(--space-8)" }}>
        <div className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)", display: "grid", gap: "var(--space-4)" }}>
          <div className="form-group">
            <label className="form-label">Ürün Adı</label>
            <input type="text" name="name" className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select name="categoryId" className="form-input" required>
              <option value="">Kategori Seçin</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)" }}>
            <div className="form-group">
              <label className="form-label">Fiyat (₺)</label>
              <input type="number" step="0.01" name="basePrice" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">İndirimsiz Fiyat (Opsiyonel)</label>
              <input type="number" step="0.01" name="compareAtPrice" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Başlangıç Stoğu</label>
              <input type="number" name="stock" defaultValue="10" className="form-input" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kısa Açıklama (Özet)</label>
            <input type="text" name="shortDescription" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Detaylı Açıklama</label>
            <textarea name="description" className="form-input" rows={4} required></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Görsel URL (Geçici Olarak URL ile)</label>
            <input type="url" name="imageUrl" className="form-input" placeholder="https://..." />
          </div>
          
          <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center", marginTop: "var(--space-2)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" name="isFeatured" value="true" />
              <span>Öne Çıkan Ürün Yap (Ana sayfada görünür)</span>
            </label>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary btn-lg">
            Ürünü Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
