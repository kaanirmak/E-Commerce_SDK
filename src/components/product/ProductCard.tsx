import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number | string;
    compareAtPrice?: number | string | null;
    avgRating: number;
    reviewCount: number;
    isFeatured: boolean;
    category?: { name: string; slug: string } | null;
    images?: { url: string; altText?: string | null }[];
    variants?: { price: number | string }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = product.variants?.[0]
    ? Number(product.variants[0].price)
    : Number(product.basePrice);

  const comparePrice = product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null;

  const discount = comparePrice
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const imageUrl =
    product.images?.[0]?.url || "/images/product-placeholder.jpg";
  const imageAlt =
    product.images?.[0]?.altText || product.name;

  const stars = Array.from({ length: 5 }, (_, i) =>
    i < Math.round(product.avgRating) ? "★" : "☆"
  );

  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`}>
        {/* Image */}
        <div className="product-card__image-wrapper">
          <div
            className="product-card__image"
            style={{
              background: `linear-gradient(135deg, var(--color-primary-50), var(--color-bg-secondary))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
            }}
          >
            🧴
          </div>

          {/* Badges */}
          {discount > 0 && (
            <span className="product-card__badge badge-sale">
              %{discount} İndirim
            </span>
          )}
          {!discount && product.isFeatured && (
            <span className="product-card__badge badge-bestseller">
              Çok Satan
            </span>
          )}

          {/* Quick Actions */}
          <div className="product-card__actions">
            <button
              className="product-card__action-btn"
              title="Favorilere Ekle"
            >
              ♡
            </button>
            <button
              className="product-card__action-btn"
              title="Hızlı Bakış"
            >
              👁
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="product-card__info">
          {product.category && (
            <div className="product-card__category">
              {product.category.name}
            </div>
          )}
          <h3 className="product-card__name">{product.name}</h3>
          <div className="product-card__price">
            <span className="product-card__current-price">
              {formatPrice(price)}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="product-card__original-price">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>
          {product.reviewCount > 0 && (
            <div className="product-card__rating">
              <span className="star-filled">
                {stars.join("")}
              </span>
              <span>({product.reviewCount})</span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
