"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart } from "@/actions/cart.actions";
import { createOrder } from "@/actions/order.actions";
import { formatPrice } from "@/lib/utils";

interface Address {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  addressLine: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"IYZICO" | "PAYTR" | "COD">("IYZICO");
  const [couponCode, setCouponCode] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For payment rendering
  const [iyzicoHtml, setIyzicoHtml] = useState<string | null>(null);
  const [paytrUrl, setPaytrUrl] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const cart = await getCart();
        if (cart.items.length === 0) {
          router.push("/cart");
          return;
        }
        setCartItems(cart.items);
        setTotal(cart.total);

        // Mock some addresses since DB might be clean, or fetch if any
        // In real setup, we would fetch addresses via a server action
        const mockAddresses: Address[] = [
          {
            id: "addr_1",
            title: "Ev Adresim",
            fullName: "Ayşe Yılmaz",
            phone: "05321234567",
            city: "İstanbul",
            district: "Kadıköy",
            addressLine: "Caferağa Mah. Moda Cad. No:42 D:5",
            isDefault: true,
          },
          {
            id: "addr_2",
            title: "İş Adresim",
            fullName: "Ayşe Yılmaz",
            phone: "05321234567",
            city: "İstanbul",
            district: "Şişli",
            addressLine: "Büyükdere Cad. No:193 Kat:8",
            isDefault: false,
          }
        ];
        setAddresses(mockAddresses);
        setSelectedAddressId(mockAddresses[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("addressId", selectedAddressId);
    formData.append("paymentMethod", paymentMethod);
    if (couponCode) formData.append("couponCode", couponCode);
    if (notes) formData.append("notes", notes);

    try {
      const res = await createOrder(formData);
      if (!res.success) {
        setError(res.error || "Sipariş oluşturulurken bir hata oluştu.");
        setSubmitting(false);
        return;
      }

      if (paymentMethod === "COD") {
        router.push(`/orders/${res.orderId}`);
      } else if (paymentMethod === "IYZICO" && res.paymentHtml) {
        setIyzicoHtml(res.paymentHtml);
      } else if (paymentMethod === "PAYTR" && res.paymentUrl) {
        setPaytrUrl(res.paymentUrl);
      }
    } catch (err) {
      console.error(err);
      setError("Beklenmedik bir hata oluştu.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container section text-center">
        <div className="skeleton" style={{ height: "500px", width: "100%", borderRadius: "var(--radius-xl)" }} />
      </div>
    );
  }

  // If Iyzico Form needs to be initialized, display it
  if (iyzicoHtml) {
    return (
      <div className="section container text-center" style={{ maxWidth: 600 }}>
        <h2 className="font-display mb-8">Kredi Kartı Ödemesi (İyzico)</h2>
        <div className="card p-6 glass" style={{ minHeight: 400 }}>
          <div dangerouslySetInnerHTML={{ __html: iyzicoHtml }} />
        </div>
      </div>
    );
  }

  // If PayTR Frame needs to be initialized, display it
  if (paytrUrl) {
    return (
      <div className="section container text-center" style={{ maxWidth: 800 }}>
        <h2 className="font-display mb-8">Kredi Kartı Ödemesi (PayTR)</h2>
        <div className="card p-4 glass">
          <iframe
            src={paytrUrl}
            style={{ width: "100%", height: "600px", border: "none" }}
            title="PayTR Payment Frame"
          />
        </div>
      </div>
    );
  }

  const shippingCost = total >= 300 ? 0 : 39.99;
  const codFee = paymentMethod === "COD" ? 14.99 : 0;
  const totalPayable = total + shippingCost + codFee;

  return (
    <div className="section">
      <div className="container">
        <h1 className="font-display mb-8" style={{ fontSize: "var(--text-3xl)" }}>Ödeme Sayfası</h1>

        {error && (
          <div className="card p-4 mb-6" style={{ background: "var(--color-error-bg)", color: "var(--color-error)", borderLeft: "4px solid var(--color-error)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-8)" }}>
          {/* Left Column: Addresses & Payments */}
          <div className="flex flex-col gap-8">
            {/* Address Section */}
            <div className="card p-6">
              <h2 className="font-display mb-4" style={{ fontSize: "var(--text-xl)" }}>1. Teslimat Adresi</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="card p-4 cursor-pointer"
                    style={{
                      border: selectedAddressId === addr.id ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      background: selectedAddressId === addr.id ? "var(--color-primary-50)" : "transparent"
                    }}
                    onClick={() => setSelectedAddressId(addr.id)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <strong style={{ fontSize: "var(--text-sm)" }}>{addr.title}</strong>
                      {addr.isDefault && <span className="badge badge-info" style={{ fontSize: "10px" }}>Varsayılan</span>}
                    </div>
                    <p style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{addr.fullName}</p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: 4 }}>
                      {addr.addressLine}, {addr.district}/{addr.city}
                    </p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>{addr.phone}</p>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-secondary btn-sm">
                + Yeni Adres Ekle
              </button>
            </div>

            {/* Payment Section */}
            <div className="card p-6">
              <h2 className="font-display mb-4" style={{ fontSize: "var(--text-xl)" }}>2. Ödeme Yöntemi</h2>
              <div className="flex flex-col gap-3">
                <label
                  className="card p-4 flex items-center gap-4 cursor-pointer"
                  style={{
                    flexDirection: "row",
                    border: paymentMethod === "IYZICO" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                    background: paymentMethod === "IYZICO" ? "var(--color-primary-50)" : "transparent"
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "IYZICO"}
                    onChange={() => setPaymentMethod("IYZICO")}
                  />
                  <div>
                    <strong>İyzico Kredi / Banka Kartı</strong>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: 2 }}>
                      Tek çekim veya taksit seçenekleriyle güvenli ödeme.
                    </p>
                  </div>
                </label>

                <label
                  className="card p-4 flex items-center gap-4 cursor-pointer"
                  style={{
                    flexDirection: "row",
                    border: paymentMethod === "PAYTR" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                    background: paymentMethod === "PAYTR" ? "var(--color-primary-50)" : "transparent"
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "PAYTR"}
                    onChange={() => setPaymentMethod("PAYTR")}
                  />
                  <div>
                    <strong>PayTR Kredi / Banka Kartı</strong>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: 2 }}>
                      Alternatif güvenli ödeme altyapısı ile taksitli ödeme.
                    </p>
                  </div>
                </label>

                <label
                  className="card p-4 flex items-center gap-4 cursor-pointer"
                  style={{
                    flexDirection: "row",
                    border: paymentMethod === "COD" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                    background: paymentMethod === "COD" ? "var(--color-primary-50)" : "transparent"
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <div>
                    <strong>Kapıda Ödeme (Nakit / Kart)</strong>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: 2 }}>
                      Kapıda nakit veya kredi kartıyla ödeme. (+14.99 TL hizmet bedeli)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Notes Section */}
            <div className="card p-6">
              <h2 className="font-display mb-4" style={{ fontSize: "var(--text-xl)" }}>3. Sipariş Notu (Opsiyonel)</h2>
              <textarea
                className="input"
                style={{ height: 100, resize: "none" }}
                placeholder="Kargo firmasına veya satıcıya iletmek istediğiniz notlar..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="flex flex-col gap-6">
            {/* Coupon Box */}
            <div className="card p-4">
              <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: 8 }}>Kupon Kodu</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input"
                  placeholder="KODU GİRİN"
                  style={{ textTransform: "uppercase" }}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <button type="button" className="btn btn-secondary">
                  Uygula
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="card p-6 flex flex-col gap-4" style={{ background: "var(--color-bg-secondary)" }}>
              <h2 style={{ fontSize: "var(--text-xl)" }}>Siparişiniz</h2>
              <div style={{ height: 1, background: "var(--color-border)" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      {item.variant.product.name} (x{item.quantity})
                    </span>
                    <span style={{ fontWeight: 500 }}>
                      {formatPrice(Number(item.variant.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: "var(--color-border)" }} />

              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-secondary)" }}>Ara Toplam</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-secondary)" }}>Kargo Ücreti</span>
                <span>{shippingCost === 0 ? "Ücretsiz" : formatPrice(shippingCost)}</span>
              </div>
              {paymentMethod === "COD" && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--color-text-secondary)" }}>Kapıda Ödeme Farkı</span>
                  <span>{formatPrice(codFee)}</span>
                </div>
              )}

              <div style={{ height: 1, background: "var(--color-border)" }} />

              <div className="flex justify-between" style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>
                <span>Toplam</span>
                <span style={{ color: "var(--color-primary-dark)" }}>{formatPrice(totalPayable)}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg w-full mt-2"
              >
                {submitting ? "Sipariş Hazırlanıyor..." : "Siparişi Tamamla"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
