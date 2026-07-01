import { getFeaturedReviews, createFeaturedReview, deleteFeaturedReview } from "@/actions/featuredReview.actions";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Öne Çıkan Yorumlar | Admin",
};

export default async function AdminReviewsPage() {
  const reviews = await getFeaturedReviews(false);

  async function handleAdd(formData: FormData) {
    "use server";
    await createFeaturedReview(formData);
    revalidatePath("/admin/reviews");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteFeaturedReview(id);
    revalidatePath("/admin/reviews");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }}>
      {/* List Reviews */}
      <div>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <h1 className="font-display" style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>Öne Çıkan Müşteri Yorumları</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Ana sayfada gösterilen referans yorumlar (Görsel destekli).</p>
        </div>

        <div className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)", display: "grid", gap: "var(--space-4)" }}>
          {reviews.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "20px" }}>Henüz öne çıkan yorum eklenmemiş.</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "var(--space-4)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ fontWeight: 600, fontSize: "16px" }}>{rev.name}</div>
                    {rev.location && <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>({rev.location})</div>}
                  </div>
                  {rev.role && <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{rev.role}</div>}
                  <div style={{ margin: "4px 0", color: "#fbbf24" }}>{"★".repeat(rev.rating)}</div>
                  {rev.title && <div style={{ fontWeight: 600, fontSize: "14px", marginTop: "4px" }}>{rev.title}</div>}
                  <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "2px" }}>"{rev.text}"</p>
                  
                  {/* Review Images */}
                  {rev.images && rev.images.length > 0 && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      {rev.images.map((imgUrl, idx) => (
                        <img key={idx} src={imgUrl} alt={`Yorum görsel ${idx + 1}`} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }} />
                      ))}
                    </div>
                  )}
                </div>
                <form action={handleDelete} style={{ marginLeft: "10px" }}>
                  <input type="hidden" name="id" value={rev.id} />
                  <button type="submit" className="btn btn-outline btn-sm" style={{ color: "#ef4444", borderColor: "#ef4444" }}>Sil</button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Review Form */}
      <div>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <h2 className="font-display" style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>Yeni Referans Yorum Ekle</h2>
        </div>

        <form action={handleAdd} className="glass" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)", display: "grid", gap: "var(--space-4)" }}>
          <div className="form-group">
            <label className="form-label">Müşteri İsmi</label>
            <input type="text" name="name" className="form-input" required placeholder="Örn: Rahila T." />
          </div>

          <div className="form-group">
            <label className="form-label">Konum / Şehir (Opsiyonel)</label>
            <input type="text" name="location" className="form-input" placeholder="Örn: Birmingham, United Kingdom" />
          </div>

          <div className="form-group">
            <label className="form-label">Ünvan / Rol (Opsiyonel)</label>
            <input type="text" name="role" className="form-input" placeholder="Örn: Müşteri" />
          </div>

          <div className="form-group">
            <label className="form-label">Yorum Başlığı (Opsiyonel)</label>
            <input type="text" name="title" className="form-input" placeholder="Örn: Harika! / Kesinlikle Tavsiye Ederim" />
          </div>

          <div className="form-group">
            <label className="form-label">Yorum Puanı (1-5)</label>
            <select name="rating" className="form-input" defaultValue="5">
              <option value="5">5 Yıldız</option>
              <option value="4">4 Yıldız</option>
              <option value="3">3 Yıldız</option>
              <option value="2">2 Yıldız</option>
              <option value="1">1 Yıldız</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Yorum Metni</label>
            <textarea name="text" className="form-input" rows={4} required placeholder="Müşterinizin yazdığı geri bildirimi girin..."></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Yorum Görselleri (Maksimum 3 Görsel)</label>
            <div style={{ display: "grid", gap: "8px" }}>
              <input type="file" name="imageFile1" accept="image/*" className="form-input" />
              <input type="file" name="imageFile2" accept="image/*" className="form-input" />
              <input type="file" name="imageFile3" accept="image/*" className="form-input" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ justifySelf: "end", marginTop: "10px" }}>Yorumu Ekle</button>
        </form>
      </div>
    </div>
  );
}
