import { getDashboardStats } from "@/actions/admin.actions";
import { formatPrice, formatDateShort, getOrderStatusLabel } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      {/* Page Header */}
      <div>
        <h1 className="font-display" style={{ fontSize: "var(--text-3xl)", marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
          Mağazanızın güncel durumuna genel bakış
        </p>
      </div>

      {/* Grid Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-6)" }}>
        {/* Revenue */}
        <div className="card p-6 flex flex-col justify-between" style={{ background: "white" }}>
          <div>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Toplam Ciro (Ödenen)
            </span>
            <h2 style={{ fontSize: "var(--text-2xl)", color: "var(--color-primary-dark)", marginTop: 4 }}>
              {formatPrice(stats.totalRevenue)}
            </h2>
          </div>
          <span style={{ fontSize: "10px", color: "var(--color-success)", marginTop: 8 }}>
            💳 İyzico & PayTR Dahil
          </span>
        </div>

        {/* Total Orders */}
        <div className="card p-6 flex flex-col justify-between" style={{ background: "white" }}>
          <div>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Toplam Sipariş
            </span>
            <h2 style={{ fontSize: "var(--text-2xl)", marginTop: 4 }}>
              {stats.totalOrders}
            </h2>
          </div>
          <span style={{ fontSize: "10px", color: "var(--color-text-secondary)", marginTop: 8 }}>
            Aylık Sipariş: {stats.monthlyOrders}
          </span>
        </div>

        {/* Customers */}
        <div className="card p-6 flex flex-col justify-between" style={{ background: "white" }}>
          <div>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Kayıtlı Müşteri
            </span>
            <h2 style={{ fontSize: "var(--text-2xl)", marginTop: 4 }}>
              {stats.totalCustomers}
            </h2>
          </div>
          <span style={{ fontSize: "10px", color: "var(--color-text-secondary)", marginTop: 8 }}>
            Aktif müşteriler
          </span>
        </div>

        {/* Low Stock Products */}
        <div className="card p-6 flex flex-col justify-between" style={{ background: "white" }}>
          <div>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Düşük Stoklu Ürünler
            </span>
            <h2 style={{ fontSize: "var(--text-2xl)", color: stats.lowStockProducts > 0 ? "var(--color-warning)" : "var(--color-success)", marginTop: 4 }}>
              {stats.lowStockProducts}
            </h2>
          </div>
          <span style={{ fontSize: "10px", color: stats.lowStockProducts > 0 ? "var(--color-warning)" : "var(--color-text-muted)", marginTop: 8 }}>
            {stats.lowStockProducts > 0 ? "Stok yenileme gerekiyor" : "Stoklar güvende"}
          </span>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card p-6" style={{ background: "white" }}>
        <h3 className="font-display mb-4" style={{ fontSize: "var(--text-lg)" }}>Son Siparişler</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "var(--text-sm)" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-border-light)", color: "var(--color-text-secondary)" }}>
                <th style={{ padding: "12px 8px" }}>Sipariş No</th>
                <th style={{ padding: "12px 8px" }}>Müşteri</th>
                <th style={{ padding: "12px 8px" }}>Tarih</th>
                <th style={{ padding: "12px 8px" }}>Yöntem</th>
                <th style={{ padding: "12px 8px" }}>Durum</th>
                <th style={{ padding: "12px 8px" }}>Toplam</th>
                <th style={{ padding: "12px 8px" }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                  <td style={{ padding: "12px 8px" }}><strong>#{order.orderNumber}</strong></td>
                  <td style={{ padding: "12px 8px" }}>{order.user.firstName} {order.user.lastName}</td>
                  <td style={{ padding: "12px 8px" }}>{formatDateShort(order.createdAt)}</td>
                  <td style={{ padding: "12px 8px" }}>{order.paymentMethod}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <span className={`badge ${
                      order.status === "DELIVERED"
                        ? "badge-success"
                        : order.status === "CANCELLED"
                        ? "badge-error"
                        : "badge-info"
                    }`} style={{ fontSize: "11px" }}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", fontWeight: 600 }}>{formatPrice(Number(order.totalAmount))}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <Link href={`/admin/orders/${order.id}`} className="btn btn-secondary btn-sm">
                      Yönet
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
