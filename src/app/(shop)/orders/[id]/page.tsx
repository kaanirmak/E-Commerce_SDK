"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getOrderById, cancelOrder } from "@/actions/order.actions";
import {
  formatPrice,
  formatDate,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getPaymentMethodLabel
} from "@/lib/utils";

interface OrderDetailProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!confirm("Siparişi iptal etmek istediğinize emin misiniz?")) return;
    setCancelling(true);
    try {
      const res = await cancelOrder(id);
      if (res.success) {
        fetchOrder();
      } else {
        alert(res.error || "Sipariş iptal edilemedi.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container section text-center">
        <div className="skeleton" style={{ height: "500px", width: "100%", borderRadius: "var(--radius-xl)" }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container section text-center">
        <h2 className="mb-4">Sipariş Bulunamadı</h2>
        <Link href="/orders" className="btn btn-primary">Siparişlerime Dön</Link>
      </div>
    );
  }

  const statusColor =
    order.status === "DELIVERED"
      ? "badge-success"
      : order.status === "CANCELLED"
      ? "badge-error"
      : "badge-info";

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Navigation / Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <Link href="/orders" className="btn btn-ghost btn-sm mb-2" style={{ paddingLeft: 0 }}>
              ← Siparişlerime Dön
            </Link>
            <h1 className="font-display" style={{ fontSize: "var(--text-2xl)" }}>
              Sipariş Detayı #{order.orderNumber}
            </h1>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
              {formatDate(order.createdAt)} tarihinde oluşturuldu
            </p>
          </div>
          <div className="flex gap-3">
            <span className={`badge ${statusColor}`} style={{ fontSize: "var(--text-sm)", padding: "var(--space-2) var(--space-4)" }}>
              {getOrderStatusLabel(order.status)}
            </span>
            {(order.status === "PENDING" || order.status === "CONFIRMED") && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn btn-secondary text-red-500"
                style={{ color: "var(--color-error)", borderColor: "var(--color-error)" }}
              >
                Siparişi İptal Et
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-8)" }}>
          {/* Main info */}
          <div className="flex flex-col gap-6">
            {/* Items Card */}
            <div className="card p-6">
              <h2 className="font-display mb-4" style={{ fontSize: "var(--text-lg)" }}>Ürünler</h2>
              <div className="flex flex-col gap-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center gap-4">
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: "var(--radius-md)",
                      background: "linear-gradient(135deg, var(--color-primary-50), var(--color-bg-secondary))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem"
                    }}>
                      🧴
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: "var(--text-sm)" }}>{item.productName}</strong>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{item.variantName} x {item.quantity}</p>
                    </div>
                    <span style={{ fontWeight: 600 }}>{formatPrice(Number(item.totalPrice))}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipment Card */}
            {order.shipment && (
              <div className="card p-6">
                <h2 className="font-display mb-4" style={{ fontSize: "var(--text-lg)" }}>Kargo Takibi ({order.shipment.carrier})</h2>
                {order.shipment.trackingNumber ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border">
                      <div>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Takip Numarası:</span>
                        <strong className="block" style={{ display: "block" }}>{order.shipment.trackingNumber}</strong>
                      </div>
                      {order.shipment.labelUrl && (
                        <a href={order.shipment.labelUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                          Barkod Yazdır
                        </a>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="flex flex-col gap-4 mt-2" style={{ borderLeft: "2px solid var(--color-primary-light)", paddingLeft: "var(--space-4)", marginLeft: 8 }}>
                      {order.shipment.tracking && order.shipment.tracking.length > 0 ? (
                        order.shipment.tracking.map((track: any, index: number) => (
                          <div key={track.id} style={{ position: "relative" }}>
                            <div style={{
                              position: "absolute",
                              left: -22,
                              top: 4,
                              width: 10,
                              height: 10,
                              borderRadius: "var(--radius-full)",
                              background: index === 0 ? "var(--color-primary)" : "var(--color-primary-light)"
                            }} />
                            <strong style={{ fontSize: "var(--text-sm)" }}>{track.status}</strong>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>{track.description}</p>
                            {track.location && <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>📍 {track.location}</span>}
                            <span style={{ display: "block", fontSize: "10px", color: "var(--color-text-muted)", marginTop: 2 }}>
                              {formatDate(track.timestamp)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>Takip bilgisi henüz girilmemiş.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>Kargo hazırlandığında takip bilgisi burada görünecektir.</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="flex flex-col gap-6">
            {/* Delivery address details */}
            <div className="card p-6">
              <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-secondary)", marginBottom: 12 }}>
                Teslimat Adresi
              </h3>
              <strong style={{ fontSize: "var(--text-sm)", display: "block", marginBottom: 4 }}>{order.address.fullName}</strong>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                {order.address.addressLine}, {order.address.district}/{order.address.city}
              </p>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", display: "block", marginTop: 4 }}>
                📞 {order.address.phone}
              </span>
            </div>

            {/* Payment Summary */}
            <div className="card p-6 flex flex-col gap-3" style={{ background: "var(--color-bg-secondary)" }}>
              <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-secondary)" }}>
                Ödeme Bilgisi
              </h3>
              <div className="flex justify-between text-xs">
                <span>Yöntem</span>
                <strong>{getPaymentMethodLabel(order.paymentMethod)}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span>Durum</span>
                <strong>{getPaymentStatusLabel(order.paymentStatus)}</strong>
              </div>

              <div style={{ height: 1, background: "var(--color-border-light)", margin: "4px 0" }} />

              <div className="flex justify-between text-xs">
                <span>Ara Toplam</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Kargo</span>
                <span>{Number(order.shippingCost) === 0 ? "Ücretsiz" : formatPrice(Number(order.shippingCost))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-xs" style={{ color: "var(--color-success)" }}>
                  <span>İndirim</span>
                  <span>-{formatPrice(Number(order.discount))}</span>
                </div>
              )}

              <div style={{ height: 1, background: "var(--color-border)", margin: "4px 0" }} />

              <div className="flex justify-between" style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>
                <span>Toplam</span>
                <span style={{ color: "var(--color-primary-dark)" }}>{formatPrice(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
