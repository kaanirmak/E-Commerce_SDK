import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getStoreSettings } from "@/actions/settings.actions";
import { getCategories } from "@/actions/product.actions";
import { prisma } from "@/lib/prisma";

export default async function Header() {
  const session = await auth();
  const settings = await getStoreSettings();
  const [categories, customPages] = await Promise.all([
    getCategories(),
    prisma.page.findMany({ where: { isActive: true } }),
  ]);

  return (
    <header className="header">
      <div className="header__inner">
        {/* Logo */}
        <Link href="/" className="header__logo" style={{ display: "flex", alignItems: "center" }}>
          <img 
            src={settings.logoUrl || "/logo.png"}
            alt={settings.storeName}
            style={{ height: "40px", objectFit: "contain" }} 
          />
        </Link>

        {/* Navigation */}
        <nav className="header__nav">
          <Link href="/products" className="header__nav-link">
            Tüm Ürünler
          </Link>
          {categories.slice(0, 4).map((cat) => (
            <Link key={cat.id} href={`/products?category=${cat.slug}`} className="header__nav-link">
              {cat.name}
            </Link>
          ))}
          {customPages.slice(0, 3).map((page) => (
            <Link key={page.id} href={`/pages/${page.slug}`} className="header__nav-link">
              {page.title}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="header__actions">
          <Link href="/wishlist" className="btn btn-ghost btn-icon" title="Favorilerim">
            ♡
          </Link>
          <Link href="/cart" className="btn btn-ghost btn-icon header__cart-btn" title="Sepetim">
            🛒
            <span className="header__cart-badge">0</span>
          </Link>

          {session?.user ? (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {session.user.role === "ADMIN" && (
                <Link href="/admin/dashboard" className="btn btn-ghost btn-sm">
                  Admin
                </Link>
              )}
              <Link href="/profile" className="btn btn-outline btn-sm">
                Profilim
              </Link>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
