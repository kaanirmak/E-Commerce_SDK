import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { getFeaturedProducts, getCategories, getNewProducts } from "@/actions/product.actions";
import { getStoreSettings } from "@/actions/settings.actions";
import { getFeaturedReviews } from "@/actions/featuredReview.actions";

export default async function HomePage() {
  const [featuredProducts, categories, newProducts, settings, reviews] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
    getNewProducts(4),
    getStoreSettings(),
    getFeaturedReviews(true),
  ]);

  return (
    <>
      {/* ─── Hero Section ──────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero__content">
            <p className="hero__tagline">{settings.heroTagline}</p>
            <h1 className="hero__title">
              {settings.heroTitle}
            </h1>
            <p className="hero__description">
              {settings.heroDescription}
            </p>
            <div className="hero__cta">
              <Link href="/products" className="btn btn-primary btn-lg">
                Ürünleri Keşfet →
              </Link>
              <Link href="/products?category=cilt-bakimi" className="btn btn-secondary btn-lg">
                Cilt Bakımı
              </Link>
            </div>
          </div>
        </div>
        <div className="hero__decoration" />
      </section>

      {/* ─── Kategoriler ───────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <p className="section__tagline">Koleksiyonlar</p>
            <h2 className="section__title">Kategorilere Göz At</h2>
            <p className="section__description">
              İhtiyacınıza uygun kozmetik ürünlerini kolayca bulun
            </p>
          </div>
          <div className="category-grid">
            {categories.map((category: any) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="category-card"
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(135deg, var(--color-primary-100), var(--color-bg-secondary))`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem",
                  }}
                >
                  📁
                </div>
                <div className="category-card__overlay" />
                <div className="category-card__content">
                  <h3 className="category-card__name">{category.name}</h3>
                  <span className="category-card__count">
                    {category._count?.products || 0} ürün
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Öne Çıkan Ürünler ─────────────────────── */}
      <section className="section" style={{ background: "var(--color-bg-secondary)" }}>
        <div className="container">
          <div className="section__header">
            <p className="section__tagline">En Beğenilenler</p>
            <h2 className="section__title">Öne Çıkan Ürünler</h2>
            <p className="section__description">
              Müşterilerimizin en çok tercih ettiği kozmetik ürünleri
            </p>
          </div>
          <div className="product-grid">
            {featuredProducts.map((product: any) => (
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
          <div className="text-center mt-8">
            <Link href="/products" className="btn btn-secondary btn-lg">
              Tüm Ürünleri Gör →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Yeni Ürünler ──────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <p className="section__tagline">Yeni Gelenler</p>
            <h2 className="section__title">Son Eklenen Ürünler</h2>
          </div>
          <div className="product-grid">
            {newProducts.map((product: any) => (
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
        </div>
      </section>

      {/* ─── Müşteri Yorumları (Testimonials) ────────── */}
      {reviews.length > 0 && (
        <section className="section" style={{ background: "var(--color-bg)" }}>
          <div className="container">
            <div className="section__header" style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
              <p className="section__tagline">Deneyimler</p>
              <h2 className="section__title">Müşterilerimizin Yorumları</h2>
              <p className="section__description" style={{ margin: "0 auto" }}>
                Kullanıcılarımızın marka ve ürünlerimiz hakkındaki gerçek geri bildirimleri.
              </p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-6)" }}>
              {reviews.map((rev) => (
                <div 
                  key={rev.id} 
                  className="glass" 
                  style={{ 
                    padding: "var(--space-6)", 
                    borderRadius: "var(--radius-xl)", 
                    display: "flex", 
                    flexDirection: "column", 
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    boxShadow: "var(--shadow-md)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                    <div style={{ color: "#fbbf24", fontSize: "16px" }}>
                      {"★".repeat(rev.rating)}
                    </div>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                      1 ay önce
                    </span>
                  </div>

                  {rev.title && (
                    <h4 style={{ fontSize: "var(--text-md)", fontWeight: 700, marginBottom: "var(--space-2)", color: "var(--color-text)" }}>
                      {rev.title}
                    </h4>
                  )}

                  <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)", lineHeight: 1.6 }}>
                    "{rev.text}"
                  </p>

                  {/* Review Images */}
                  {rev.images && rev.images.length > 0 && (
                    <div style={{ display: "flex", gap: "8px", marginBottom: "var(--space-4)" }}>
                      {rev.images.slice(0, 3).map((imgUrl, idx) => (
                        <img 
                          key={idx} 
                          src={imgUrl} 
                          alt="Yorum görseli" 
                          style={{ 
                            width: "72px", 
                            height: "72px", 
                            objectFit: "cover", 
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(255,255,255,0.05)"
                          }} 
                        />
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: "auto", paddingTop: "var(--space-4)", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontWeight: 600, fontSize: "14px" }}>{rev.name}</span>
                      <span style={{ color: "#10b981", fontSize: "12px" }} title="Doğrulanmış Müşteri">✔</span>
                    </div>
                    {rev.location && (
                      <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                        {rev.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Değer Önerisi ─────────────────────────── */}
      <section className="section" style={{ background: "var(--color-primary-50)" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "var(--space-8)",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-4)" }}>💎</div>
              <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>
                Orijinal Ürünler
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
                Satışını yaptığımız tüm ürünler %100 orijinal ve garantilidir
              </p>
            </div>
            <div>
              <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-4)" }}>⚡</div>
              <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>
                Hızlı Gönderim
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
                Hafta içi saat 14:00'e kadar olan siparişleriniz aynı gün kargoda
              </p>
            </div>
            <div>
              <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-4)" }}>📦</div>
              <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>
                Ücretsiz Kargo
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
                300₺ ve üzeri siparişlerde ücretsiz PTT Kargo
              </p>
            </div>
            <div>
              <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-4)" }}>🔒</div>
              <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>
                Güvenli Ödeme
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
                İyzico ve PayTR ile 3D Secure güvenli ödeme
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────── */}
      <section
        className="section"
        style={{
          background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))",
          color: "white",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <p
            className="font-accent"
            style={{ fontSize: "var(--text-lg)", fontStyle: "italic", opacity: 0.8, marginBottom: "var(--space-4)" }}
          >
            {settings.promoTagline}
          </p>
          <h2
            className="font-display"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, marginBottom: "var(--space-4)" }}
          >
            {settings.promoTitle}
          </h2>
          <p style={{ opacity: 0.8, marginBottom: "var(--space-8)", maxWidth: 500, margin: "0 auto var(--space-8)" }}>
            {settings.promoDescription}
          </p>
          <Link
            href="/register"
            className="btn btn-lg"
            style={{
              background: "white",
              color: "var(--color-primary-dark)",
              fontWeight: 600,
            }}
          >
            Üye Ol & İndirimi Kap →
          </Link>
        </div>
      </section>
    </>
  );
}
