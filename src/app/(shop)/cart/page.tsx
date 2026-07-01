"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCart, updateCartItem, removeFromCart } from "@/actions/cart.actions";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    name: string;
    price: number | string;
    stock: number;
    product: {
      name: string;
      slug: string;
      basePrice: number | string;
      images: { url: string }[];
    };
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const cart = await getCart();
      // Server action returns items as any, map it properly
      setCartItems(cart.items as unknown as CartItem[]);
      setTotal(cart.total);
    } catch (error) {
      console.error("Sepet yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      const res = await updateCartItem(itemId, newQty);
      if (res.success) {
        fetchCart();
      } else {
        alert(res.error || "Miktar güncellenemedi");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const res = await removeFromCart(itemId);
      if (res.success) {
        fetchCart();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container section text-center">
        <div className="skeleton" style={{ height: "400px", width: "100%", borderRadius: "var(--radius-xl)" }} />
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="font-display mb-8" style={{ fontSize: "var(--text-3xl)" }}>Sepetim</h1>

        {cartItems.length === 0 ? (
          <div className="card text-center p-8 glass">
            <div style={{ fontSize: "4rem", marginBottom: "var(--space-4)" }}>🛒</div>
            <h2 className="mb-4">Sepetiniz Boş</h2>
            <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
              Görünüşe göre sepetinize henüz bir ürün eklememişsiniz. Harika doğal kozmetik ürünlerimizi keşfetmeye ne dersiniz?
            </p>
            <Link href="/products" className="btn btn-primary btn-lg">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-8)" }}>
            {/* Items List */}
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => {
                const itemPrice = Number(item.variant.price);
                return (
                  <div key={item.id} className="card p-4 flex items-center justify-between gap-4" style={{ flexDirection: "row" }}>
                    {/* Placeholder Thumbnail */}
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: "var(--radius-md)",
                      background: "linear-gradient(135deg, var(--color-primary-50), var(--color-bg-secondary))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem"
                    }}>
                      🧴
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>
                        <Link href={`/products/${item.variant.product.slug}`}>
                          {item.variant.product.name}
                        </Link>
                      </h3>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                        Seçenek: {item.variant.name}
                      </p>
                      <span style={{ fontWeight: 700, color: "var(--color-primary-dark)" }}>
                        {formatPrice(itemPrice)}
                      </span>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ minWidth: 32, padding: "var(--space-1) var(--space-2)" }}
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>
                        {item.quantity}
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ minWidth: 32, padding: "var(--space-1) var(--space-2)" }}
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.variant.stock}
                      >
                        +
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      className="btn btn-ghost"
                      style={{ color: "var(--color-error)", fontSize: "var(--text-lg)" }}
                      onClick={() => handleRemoveItem(item.id)}
                      title="Sepetten Çıkar"
                    >
                      🗑
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="card p-6 flex flex-col gap-4" style={{ height: "fit-content", background: "var(--color-bg-secondary)" }}>
              <h2 style={{ fontSize: "var(--text-xl)" }}>Sipariş Özeti</h2>
              <div style={{ height: 1, background: "var(--color-border)" }} />
              
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-secondary)" }}>Ara Toplam</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-secondary)" }}>Kargo</span>
                <span style={{ color: total >= 300 ? "var(--color-success)" : "var(--color-text)" }}>
                  {total >= 300 ? "Ücretsiz" : formatPrice(39.99)}
                </span>
              </div>

              <div style={{ height: 1, background: "var(--color-border)" }} />
              
              <div className="flex justify-between" style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>
                <span>Toplam</span>
                <span style={{ color: "var(--color-primary-dark)" }}>
                  {formatPrice(total + (total >= 300 ? 0 : 39.99))}
                </span>
              </div>

              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                * 300 TL ve üzeri siparişlerde kargo ücretsizdir.
              </p>

              <Link href="/checkout" className="btn btn-primary btn-lg w-full text-center mt-2">
                Ödemeye Geç
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
