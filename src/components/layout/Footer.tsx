import Link from "next/link";
import { getStoreSettings } from "@/actions/settings.actions";

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const settings = await getStoreSettings();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div>
            <div className="footer__brand-name">
              {settings.storeName}
            </div>
            <p className="footer__brand-desc">
              {settings.heroDescription || "Güvenli ve kaliteli alışverişin adresi."}
            </p>
            <div style={{ display: "flex", gap: "15px", marginTop: "15px", fontSize: "14px" }}>
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="footer__link" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  📸 Instagram
                </a>
              )}
              {settings.trendyolUrl && (
                <a href={settings.trendyolUrl} target="_blank" rel="noopener noreferrer" className="footer__link" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  🛍️ Trendyol
                </a>
              )}
            </div>
          </div>

          {/* Mağaza */}
          <div>
            <h4 className="footer__title">Mağaza</h4>
            <Link href="/products?category=cilt-bakimi" className="footer__link">
              Cilt Bakımı
            </Link>
            <Link href="/products?category=sac-bakimi" className="footer__link">
              Saç Bakımı
            </Link>
            <Link href="/products?category=makyaj" className="footer__link">
              Makyaj
            </Link>
            <Link href="/products?category=parfum" className="footer__link">
              Parfüm
            </Link>
            <Link href="/products?category=vucut-bakimi" className="footer__link">
              Vücut Bakımı
            </Link>
          </div>

          {/* Hesap */}
          <div>
            <h4 className="footer__title">Hesabım</h4>
            <Link href="/profile" className="footer__link">
              Profilim
            </Link>
            <Link href="/orders" className="footer__link">
              Siparişlerim
            </Link>
            <Link href="/wishlist" className="footer__link">
              Favorilerim
            </Link>
            <Link href="/cart" className="footer__link">
              Sepetim
            </Link>
          </div>

          {/* Bilgi */}
          <div>
            <h4 className="footer__title">Bilgi</h4>
            <Link href="/hakkimizda" className="footer__link">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="footer__link">
              İletişim
            </Link>
            <Link href="/kvkk" className="footer__link">
              KVKK & Gizlilik
            </Link>
            <Link href="/iade-kosullari" className="footer__link">
              İade Koşulları
            </Link>
            <Link href="/kargo-bilgileri" className="footer__link">
              Kargo Bilgileri
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer__bottom">
          <p>© {currentYear} {settings.storeName}. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <span>💳 İyzico</span>
            <span>💳 PayTR</span>
            <span>📦 PTT Kargo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
