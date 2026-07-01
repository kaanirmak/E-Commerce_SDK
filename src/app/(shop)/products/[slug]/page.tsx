import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getRelatedProducts } from "@/actions/product.actions";
import ProductCard from "@/components/product/ProductCard";
import AddToCartButton from "@/components/product/AddToCartButton";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Ürün Bulunamadı" };
  return {
    title: `${product.name} | Butik Kozmetik`,
    description: product.shortDescription || product.description?.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.id, product.categoryId, 4);

  const stars = Array.from({ length: 5 }, (_, i) =>
    i < Math.round(product.avgRating) ? "★" : "☆"
  );

  return (
    <div className="section">
      <div className="container">
        {/* Breadcrumb */}
        <nav
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-8)",
            display: "flex",
            gap: "var(--space-2)",
          }}
        >
          <Link href="/" style={{ color: "var(--color-text-muted)" }}>Ana Sayfa</Link>
          <span>/</span>
          <Link href="/products" style={{ color: "var(--color-text-muted)" }}>Ürünler</Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category.slug}`}
            style={{ color: "var(--color-text-muted)" }}
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-12)",
            marginBottom: "var(--space-16)",
          }}
        >
          {/* Image Gallery */}
          <div>
            <div
              style={{
                aspectRatio: "1",
                borderRadius: "var(--radius-2xl)",
                background: "linear-gradient(135deg, var(--color-primary-50), var(--color-bg-secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "6rem",
                marginBottom: "var(--space-4)",
              }}
            >
              🧴
            </div>
            {/* Thumbnail Row */}
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "var(--radius-lg)",
                    background: "var(--color-bg-secondary)",
                    border: i === 1 ? "2px solid var(--color-primary)" : "2px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                  }}
                >
                  🧴
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <span
              style={{
                fontSize: "var(--text-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-primary)",
                fontWeight: 600,
              }}
            >
              {product.category.name}
            </span>

            <h1
              style={{
                fontSize: "var(--text-3xl)",
                marginTop: "var(--space-2)",
                marginBottom: "var(--space-4)",
              }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                marginBottom: "var(--space-6)",
              }}
            >
              <span style={{ color: "var(--color-accent)", fontSize: "var(--text-lg)" }}>
                {stars.join("")}
              </span>
              <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                {product.avgRating.toFixed(1)} ({product.reviewCount} değerlendirme)
              </span>
            </div>

            {/* Price */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "var(--space-3)",
                marginBottom: "var(--space-6)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-3xl)",
                  fontWeight: 700,
                  color: "var(--color-primary-dark)",
                }}
              >
                {formatPrice(Number(product.variants[0]?.price || product.basePrice))}
              </span>
              {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice) && (
                <span
                  style={{
                    fontSize: "var(--text-xl)",
                    color: "var(--color-text-muted)",
                    textDecoration: "line-through",
                  }}
                >
                  {formatPrice(Number(product.compareAtPrice))}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
                marginBottom: "var(--space-6)",
              }}
            >
              {product.shortDescription || product.description?.slice(0, 200)}
            </p>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div style={{ marginBottom: "var(--space-6)" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    marginBottom: "var(--space-3)",
                  }}
                >
                  Seçenek:
                </label>
                <div style={{ display: "flex", gap: "var(--space-3)" }}>
                  {product.variants.map((variant: any, index: number) => (
                    <button
                      key={variant.id}
                      className="btn"
                      style={{
                        padding: "var(--space-3) var(--space-5)",
                        border: index === 0 ? "2px solid var(--color-primary)" : "2px solid var(--color-border)",
                        borderRadius: "var(--radius-lg)",
                        background: index === 0 ? "var(--color-primary-50)" : "transparent",
                        fontWeight: index === 0 ? 600 : 400,
                      }}
                    >
                      {variant.name} — {formatPrice(Number(variant.price))}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Info */}
            <div
              style={{
                fontSize: "var(--text-sm)",
                marginBottom: "var(--space-6)",
                color: product.variants[0]?.stock > 10 ? "var(--color-success)" : "var(--color-warning)",
              }}
            >
              {product.variants[0]?.stock > 10
                ? "✓ Stokta var"
                : product.variants[0]?.stock > 0
                ? `⚠ Son ${product.variants[0].stock} adet`
                : "✕ Stokta yok"}
            </div>

            {/* Add to Cart */}
            <div style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
              <AddToCartButton 
                variantId={product.variants[0]?.id} 
                disabled={product.variants[0]?.stock <= 0} 
              />
              <button
                className="btn btn-secondary btn-lg btn-icon"
                title="Favorilere Ekle"
                style={{ width: 56 }}
              >
                ♡
              </button>
            </div>

            {/* Info Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-3)",
              }}
            >
              <div
                className="glass"
                style={{
                  padding: "var(--space-4)",
                  borderRadius: "var(--radius-lg)",
                  textAlign: "center",
                  fontSize: "var(--text-sm)",
                }}
              >
                📦 300₺ Üzeri Ücretsiz Kargo
              </div>
              <div
                className="glass"
                style={{
                  padding: "var(--space-4)",
                  borderRadius: "var(--radius-lg)",
                  textAlign: "center",
                  fontSize: "var(--text-sm)",
                }}
              >
                🔄 14 Gün İade Garantisi
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Ingredients / Reviews */}
        <div style={{ marginBottom: "var(--space-16)" }}>
          <div
            style={{
              display: "flex",
              gap: "var(--space-8)",
              borderBottom: "2px solid var(--color-border-light)",
              marginBottom: "var(--space-8)",
            }}
          >
            <button
              style={{
                paddingBottom: "var(--space-4)",
                borderBottom: "2px solid var(--color-primary)",
                fontWeight: 600,
                color: "var(--color-primary)",
                marginBottom: "-2px",
              }}
            >
              Ürün Açıklaması
            </button>
            <button
              style={{
                paddingBottom: "var(--space-4)",
                color: "var(--color-text-muted)",
                marginBottom: "-2px",
              }}
            >
              İçerik (INCI)
            </button>
            <button
              style={{
                paddingBottom: "var(--space-4)",
                color: "var(--color-text-muted)",
                marginBottom: "-2px",
              }}
            >
              Değerlendirmeler ({product.reviewCount})
            </button>
          </div>

          <div style={{ maxWidth: 700, lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
            <p>{product.description}</p>
            {product.usageInstructions && (
              <div style={{ marginTop: "var(--space-6)" }}>
                <h4 style={{ color: "var(--color-text)", marginBottom: "var(--space-3)" }}>
                  Kullanım Şekli
                </h4>
                <p>{product.usageInstructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <div className="section__header">
              <p className="section__tagline">Beğenebileceğiniz</p>
              <h2 className="section__title">Benzer Ürünler</h2>
            </div>
            <div className="product-grid">
              {relatedProducts.map((rp: any) => (
                <ProductCard
                  key={rp.id}
                  product={{
                    ...rp,
                    basePrice: Number(rp.basePrice),
                    compareAtPrice: rp.compareAtPrice ? Number(rp.compareAtPrice) : null,
                    variants: rp.variants.map((v: any) => ({ price: Number(v.price) })),
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
