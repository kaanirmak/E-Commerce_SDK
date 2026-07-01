import { getStoreSettings, updateStoreSettings } from "@/actions/settings.actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Site Ayarları | Admin",
};

export default async function SettingsPage() {
  const settings = await getStoreSettings();

  async function handleSave(formData: FormData) {
    "use server";
    await updateStoreSettings(formData);
    redirect("/admin/settings?success=1");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 className="font-display" style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>Site Ayarları (CMS)</h1>
      </div>

      <form action={handleSave} style={{ display: "grid", gap: "var(--space-8)" }}>
        {/* Branding Section */}
        <section className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)" }}>
          <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)" }}>Marka Ayarları</h2>
          <div className="form-group">
            <label className="form-label">Marka Adı</label>
            <input type="text" name="storeName" defaultValue={settings.storeName} className="form-input" required />
          </div>
          <div className="form-group" style={{ marginTop: "var(--space-4)" }}>
            <label className="form-label">Mevcut Logo</label>
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" style={{ height: "60px", objectFit: "contain", background: "white", padding: "8px", borderRadius: "8px" }} />
            ) : (
              <p style={{ color: "var(--color-text-muted)" }}>Yüklü logo yok.</p>
            )}
          </div>
          <div className="form-group" style={{ marginTop: "var(--space-4)" }}>
            <label className="form-label">Yeni Logo Yükle</label>
            <input type="file" name="logoFile" accept="image/*" className="form-input" />
          </div>
        </section>
        {/* Hero Section Settings */}
        <section className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)" }}>
          <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)" }}>Ana Sayfa: Üst Alan (Hero)</h2>
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            <div className="form-group">
              <label className="form-label">Üst Etiket (Tagline)</label>
              <input type="text" name="heroTagline" defaultValue={settings.heroTagline} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Ana Başlık</label>
              <input type="text" name="heroTitle" defaultValue={settings.heroTitle} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Açıklama Metni</label>
              <textarea name="heroDescription" defaultValue={settings.heroDescription} className="form-input" rows={3} required />
            </div>
            <div className="form-group">
              <label className="form-label">Görsel URL (Opsiyonel - Boş bırakılırsa varsayılan gradient görünür)</label>
              <input type="url" name="heroImageUrl" defaultValue={settings.heroImageUrl || ""} className="form-input" placeholder="https://..." />
            </div>
          </div>
        </section>

        {/* Promo Section Settings */}
        <section className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)" }}>
          <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)" }}>Ana Sayfa: Promosyon Banner (En Alt)</h2>
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            <div className="form-group">
              <label className="form-label">Promosyon Etiketi</label>
              <input type="text" name="promoTagline" defaultValue={settings.promoTagline} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Promosyon Başlığı</label>
              <input type="text" name="promoTitle" defaultValue={settings.promoTitle} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Promosyon Açıklaması</label>
              <textarea name="promoDescription" defaultValue={settings.promoDescription} className="form-input" rows={2} required />
            </div>
            <div className="form-group">
              <label className="form-label">Kupon Kodu (Opsiyonel)</label>
              <input type="text" name="promoCode" defaultValue={settings.promoCode || ""} className="form-input" />
            </div>
          </div>
        </section>

        {/* WhatsApp Support Settings */}
        <section className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)" }}>
          <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)" }}>İletişim & Sosyal Medya Ayarları</h2>
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            <div className="form-group">
              <label className="form-label">WhatsApp Numarası (Ülke kodlu, boşluksuz)</label>
              <input type="text" name="whatsAppNumber" defaultValue={settings.whatsAppNumber || ""} className="form-input" placeholder="905XXXXXXXXX" />
            </div>
            <div className="form-group">
              <label className="form-label">Varsayılan Bilgi Mesajı (Sepet boşken gönderilecek)</label>
              <input type="text" name="whatsAppMessage" defaultValue={settings.whatsAppMessage || ""} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Instagram Linki (Opsiyonel)</label>
              <input type="url" name="instagramUrl" defaultValue={settings.instagramUrl || ""} className="form-input" placeholder="https://instagram.com/marka" />
            </div>
            <div className="form-group">
              <label className="form-label">Trendyol Mağaza Linki (Opsiyonel)</label>
              <input type="url" name="trendyolUrl" defaultValue={settings.trendyolUrl || ""} className="form-input" placeholder="https://trendyol.com/magaza/marka" />
            </div>
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary btn-lg">
            Ayarları Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
