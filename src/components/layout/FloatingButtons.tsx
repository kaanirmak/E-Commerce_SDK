"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import { useEffect, useState } from "react";

interface FloatingButtonsProps {
  whatsAppNumber: string;
  defaultMessage: string;
}

export default function FloatingButtons({ whatsAppNumber, defaultMessage }: FloatingButtonsProps) {
  const { items, totalItems, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const count = totalItems();
  const total = totalPrice();

  // Generate WhatsApp message based on cart items
  let waMessage = defaultMessage;
  if (items.length > 0) {
    const itemsList = items
      .map((item) => `- ${item.productName} (${item.variantName}) x ${item.quantity} = ${(item.price * item.quantity).toFixed(2)}₺`)
      .join("\n");
    waMessage = `Merhaba, web sitenizden aşağıdaki ürünleri sipariş vermek istiyorum:\n\n${itemsList}\n\nToplam Tutar: ${total.toFixed(2)}₺`;
  }

  const sanitizedPhone = whatsAppNumber.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(waMessage);
  const waLink = `https://wa.me/${sanitizedPhone}?text=${encodedMessage}`;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        zIndex: 9999,
      }}
    >
      {/* WhatsApp Button */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#25d366",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          fontSize: "30px",
          textDecoration: "none",
          transition: "transform 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="WhatsApp ile Sipariş Ver"
      >
        💬
      </a>

      {/* Floating Cart Button */}
      <Link
        href="/cart"
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "var(--color-primary)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          fontSize: "25px",
          textDecoration: "none",
          position: "relative",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="Sepetime Git"
      >
        🛒
        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              backgroundColor: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              fontSize: "12px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          >
            {count}
          </span>
        )}
      </Link>
    </div>
  );
}
