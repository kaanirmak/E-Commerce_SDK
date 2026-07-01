import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Guard: Redirect if not admin
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Admin Sidebar */}
      <aside
        style={{
          width: "var(--sidebar-width)",
          background: "var(--color-text)",
          color: "white",
          padding: "var(--space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-8)",
        }}
      >
        <div>
          <Link
            href="/admin/dashboard"
            className="font-display"
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              color: "var(--color-primary-light)",
            }}
          >
            Yönetim Paneli
          </Link>
          <span
            style={{
              display: "block",
              fontSize: "10px",
              color: "rgba(255,255,255,0.4)",
              marginTop: 4,
            }}
          >
            Butik Kozmetik
          </span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Link
            href="/admin/dashboard"
            className="btn btn-ghost"
            style={{ color: "white", justifyContent: "flex-start", opacity: 0.8 }}
          >
            📊 Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="btn btn-ghost"
            style={{ color: "white", justifyContent: "flex-start", opacity: 0.8 }}
          >
            🧴 Ürün Yönetimi
          </Link>
          <Link
            href="/admin/orders"
            className="btn btn-ghost"
            style={{ color: "white", justifyContent: "flex-start", opacity: 0.8 }}
          >
            📦 Siparişler
          </Link>
          <Link
            href="/admin/customers"
            className="btn btn-ghost"
            style={{ color: "white", justifyContent: "flex-start", opacity: 0.8 }}
          >
            👥 Müşteriler
          </Link>
          <Link
            href="/admin/categories"
            className="btn btn-ghost"
            style={{ color: "white", justifyContent: "flex-start", opacity: 0.8 }}
          >
            📁 Kategoriler
          </Link>
          <Link
            href="/admin/pages"
            className="btn btn-ghost"
            style={{ color: "white", justifyContent: "flex-start", opacity: 0.8 }}
          >
            📄 Sayfa Yönetimi
          </Link>
          <Link
            href="/admin/reviews"
            className="btn btn-ghost"
            style={{ color: "white", justifyContent: "flex-start", opacity: 0.8 }}
          >
            💬 Yorum Yönetimi
          </Link>
          <Link
            href="/admin/settings"
            className="btn btn-ghost"
            style={{ color: "white", justifyContent: "flex-start", opacity: 0.8 }}
          >
            ⚙️ Site Ayarları
          </Link>
          <Link
            href="/"
            className="btn btn-ghost"
            style={{ color: "white", justifyContent: "flex-start", opacity: 0.8 }}
          >
            🏠 Mağazaya Git
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "var(--space-8)", background: "var(--color-bg-secondary)", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
