"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyOrders } from "@/actions/order.actions";
import { formatPrice, formatDateShort, getOrderStatusLabel, getPaymentStatusLabel } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  createdAt: Date;
  status: string;
  totalAmount: number | string;
  paymentStatus: string;
  items: any[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getMyOrders();
        // Cast or map type from action output
        setOrders(res.orders as unknown as Order[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container section text-center">
        <div className="skeleton" style={{ height: "400px", width: "100%", borderRadius: "var(--radius-xl)" }} />
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 className="font-display mb-8" style={{ fontSize: "var(--text-3xl)" }}>Siparişlerim</h1>

        {orders.length === 0 ? (
          <div className="card text-center p-8 glass">
            <div style={{ fontSize: "4rem", marginBottom: "var(--space-4)" }}>📦</div>
            <h2 className="mb-4">Henüz Siparişiniz Yok</h2>
            <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
              Siparişleriniz burada listelenecektir. Mağazamızdaki özel ürünlere göz atmak ister misiniz?
            </p>
            <Link href="/products" className="btn btn-primary btn-lg">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const statusColor =
                order.status === "DELIVERED"
                  ? "badge-success"
                  : order.status === "CANCELLED"
                  ? "badge-error"
                  : "badge-info";

              return (
                <div key={order.id} className="card p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <strong style={{ fontSize: "var(--text-base)" }}>#{order.orderNumber}</strong>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: 2 }}>
                        Tarih: {formatDateShort(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`badge ${statusColor}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  <div style={{ height: 1, background: "var(--color-border-light)" }} />

                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                        Ürünler: {order.items.map((i) => i.productName).join(", ")}
                      </p>
                      <strong style={{ fontSize: "var(--text-lg)", color: "var(--color-primary-dark)", display: "block", marginTop: 4 }}>
                        {formatPrice(Number(order.totalAmount))}
                      </strong>
                    </div>
                    <Link href={`/orders/${order.id}`} className="btn btn-secondary btn-sm">
                      Sipariş Detayı →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
