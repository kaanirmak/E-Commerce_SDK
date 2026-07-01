"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/actions/cart.actions";
import { useRouter } from "next/navigation";

export default function AddToCartButton({
  variantId,
  disabled = false,
}: {
  variantId: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddToCart = () => {
    if (disabled || isPending) return;
    setError(null);

    startTransition(async () => {
      const result = await addToCart(variantId, 1);
      if (result.success) {
        // Sepete eklendiğinde sepet sayfasına veya yan panele yönlendirebiliriz
        // Şimdilik sayfayı yenilemek /cart sayfasına yönlendirmek iyi bir UX olabilir.
        router.push("/cart");
      } else {
        if (result.error === "Giriş yapmalısınız") {
          router.push("/login");
        } else {
          setError(result.error || "Bir hata oluştu");
        }
      }
    });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <button
        className="btn btn-primary btn-lg"
        onClick={handleAddToCart}
        disabled={disabled || isPending}
        style={{ width: "100%", opacity: disabled || isPending ? 0.7 : 1 }}
      >
        {isPending ? "Ekleniyor..." : "🛒 Sepete Ekle"}
      </button>
      {error && <span style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>{error}</span>}
    </div>
  );
}
