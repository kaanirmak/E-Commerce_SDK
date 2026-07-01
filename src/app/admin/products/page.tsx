import { getProducts } from "@/actions/product.actions";
import Link from "next/link";
import { deleteProduct } from "@/actions/admin.actions";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Ürün Yönetimi | Admin",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const search = searchParams.search || "";

  const { products, total, totalPages } = await getProducts({
    page,
    pageSize: 20,
    search,
  });

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteProduct(id);
    revalidatePath("/admin/products");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 className="font-display" style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>Ürün Yönetimi</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          + Yeni Ürün Ekle
        </Link>
      </div>

      <div className="glass" style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
              <th style={{ padding: "var(--space-4)" }}>Ürün Adı</th>
              <th style={{ padding: "var(--space-4)" }}>Kategori</th>
              <th style={{ padding: "var(--space-4)" }}>Fiyat</th>
              <th style={{ padding: "var(--space-4)" }}>Durum</th>
              <th style={{ padding: "var(--space-4)", textAlign: "right" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-text-muted)" }}>
                  Kayıtlı ürün bulunamadı.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "var(--space-4)" }}>
                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{product.slug}</div>
                  </td>
                  <td style={{ padding: "var(--space-4)" }}>{product.category?.name}</td>
                  <td style={{ padding: "var(--space-4)" }}>{Number(product.basePrice).toLocaleString("tr-TR")} ₺</td>
                  <td style={{ padding: "var(--space-4)" }}>
                    {product.isActive ? (
                      <span style={{ padding: "4px 8px", background: "var(--color-primary-50)", color: "var(--color-primary-dark)", borderRadius: "12px", fontSize: "0.8rem" }}>Aktif</span>
                    ) : (
                      <span style={{ padding: "4px 8px", background: "#fee2e2", color: "#991b1b", borderRadius: "12px", fontSize: "0.8rem" }}>Pasif</span>
                    )}
                  </td>
                  <td style={{ padding: "var(--space-4)", textAlign: "right" }}>
                    <form action={handleDelete} style={{ display: "inline-block" }}>
                      <input type="hidden" name="id" value={product.id} />
                      <button type="submit" className="btn btn-outline btn-sm" style={{ borderColor: "#ef4444", color: "#ef4444" }}>
                        Sil
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination (Basit) */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-6)", justifyContent: "center" }}>
          <Link href={`/admin/products?page=${Math.max(1, page - 1)}`} className="btn btn-outline btn-sm">Önceki</Link>
          <span style={{ padding: "var(--space-2) var(--space-4)" }}>Sayfa {page} / {totalPages}</span>
          <Link href={`/admin/products?page=${Math.min(totalPages, page + 1)}`} className="btn btn-outline btn-sm">Sonraki</Link>
        </div>
      )}
    </div>
  );
}
