import ProductCard from "@/components/product/ProductCard";
import { getProducts, getCategories } from "@/actions/product.actions";
import Link from "next/link";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");

  const [result, categories] = await Promise.all([
    getProducts({
      categorySlug: params.category,
      minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
      search: params.search,
      sortBy: params.sort as any,
      page: currentPage,
    }),
    getCategories(),
  ]);

  const sortOptions = [
    { value: "newest", label: "En Yeni" },
    { value: "price_asc", label: "Fiyat: Düşükten Yükseğe" },
    { value: "price_desc", label: "Fiyat: Yüksekten Düşüğe" },
    { value: "popular", label: "En Popüler" },
    { value: "rating", label: "En Yüksek Puan" },
  ];

  return (
    <div className="section">
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: "var(--space-8)" }}>
          <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: "var(--space-2)" }}>
            {params.category
              ? categories.find((c: any) => c.slug === params.category)?.name || "Ürünler"
              : params.search
              ? `"${params.search}" için sonuçlar`
              : "Tüm Ürünler"}
          </h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            {result.total} ürün bulundu
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            gap: "var(--space-8)",
          }}
        >
          {/* Sidebar Filters */}
          <aside>
            {/* Kategoriler */}
            <div style={{ marginBottom: "var(--space-8)" }}>
              <h3
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-text-secondary)",
                  marginBottom: "var(--space-4)",
                }}
              >
                Kategoriler
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <Link
                  href="/products"
                  className="btn btn-ghost"
                  style={{
                    justifyContent: "flex-start",
                    padding: "var(--space-2) var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    fontWeight: !params.category ? 600 : 400,
                    color: !params.category ? "var(--color-primary)" : undefined,
                    background: !params.category ? "var(--color-primary-50)" : undefined,
                  }}
                >
                  Tümü
                </Link>
                {categories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="btn btn-ghost"
                    style={{
                      justifyContent: "flex-start",
                      padding: "var(--space-2) var(--space-3)",
                      borderRadius: "var(--radius-md)",
                      fontWeight: params.category === cat.slug ? 600 : 400,
                      color: params.category === cat.slug ? "var(--color-primary)" : undefined,
                      background: params.category === cat.slug ? "var(--color-primary-50)" : undefined,
                    }}
                  >
                    {cat.name}
                    <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                      {cat._count?.products || 0}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div>
            {/* Sort Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-6)",
                paddingBottom: "var(--space-4)",
                borderBottom: "1px solid var(--color-border-light)",
              }}
            >
              <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
                {result.total} ürün
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <label style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                  Sırala:
                </label>
                <select
                  className="input"
                  defaultValue={params.sort || "newest"}
                  style={{ width: "auto", padding: "var(--space-2) var(--space-8) var(--space-2) var(--space-3)" }}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products */}
            {result.products.length > 0 ? (
              <div className="product-grid">
                {result.products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      basePrice: Number(product.basePrice),
                      compareAtPrice: product.compareAtPrice
                        ? Number(product.compareAtPrice)
                        : null,
                      variants: product.variants.map((v: any) => ({
                        price: Number(v.price),
                      })),
                    }}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--space-16)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}>🔍</div>
                <h3>Ürün Bulunamadı</h3>
                <p style={{ marginTop: "var(--space-2)" }}>
                  Farklı filtreler deneyerek arama yapabilirsiniz.
                </p>
              </div>
            )}

            {/* Pagination */}
            {result.totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "var(--space-2)",
                  marginTop: "var(--space-10)",
                }}
              >
                {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Link
                      key={page}
                      href={`/products?${params.category ? `category=${params.category}&` : ""}page=${page}`}
                      className="btn"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "var(--radius-full)",
                        background:
                          page === currentPage
                            ? "var(--color-primary)"
                            : "var(--color-bg-secondary)",
                        color:
                          page === currentPage
                            ? "white"
                            : "var(--color-text)",
                        fontWeight: page === currentPage ? 700 : 400,
                      }}
                    >
                      {page}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
