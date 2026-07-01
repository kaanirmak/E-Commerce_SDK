# Test Edilecek Sayfalar ve URL'ler

Veritabanının (kategoriler, test kullanıcıları ve ürünler ile) dolu olduğundan emin olmak için tarayıcıda gezinmeden önce terminalde şu komutları çalıştırman yeterlidir:

```bash
# Veritabanı tablolarını oluşturur:
npx prisma db push

# Test verilerini (Ürünler, Kuponlar, Admin vb.) yükler:
npm run db:seed
```

---

## 🌐 Test Edebileceğin Sayfa URL'leri

1. **Ana Sayfa:**
   - URL: `http://localhost:3000/`
   - *Test:* Banner alanı, kategoriler, öne çıkan ve yeni ürünler.

2. **Üye Kayıt Sayfası:**
   - URL: `http://localhost:3000/register`
   - *Test:* Yeni bir müşteri hesabı oluşturma.

3. **Üye Giriş Sayfası:**
   - URL: `http://localhost:3000/login`
   - *Hazır Test Kullanıcıları:*
     - **Müşteri:** `musteri@test.com` / Şifre: `test123`
     - **Yönetici (Admin):** `admin@butikkozmetik.com` / Şifre: `admin123`

4. **Ürün Listeleme & Filtreleme:**
   - URL: `http://localhost:3000/products`
   - Kategori Filtresi için: `http://localhost:3000/products?category=cilt-bakimi`
   - Cilt Tipi Filtresi için: `http://localhost:3000/products?skinType=Kuru`

5. **Ürün Detay Sayfası:**
   - URL: `http://localhost:3000/products/rose-glow-serum`
   - *Test:* Seçenek (varyant) seçimi, sepete ekleme, içerik tabları.

6. **Sepetim:**
   - URL: `http://localhost:3000/cart`
   - *Test:* Ürün miktarı artırma/azaltma, sepetten çıkarma, kargo bedeli kontrolü.

7. **Ödeme (Checkout) Sayfası:**
   - URL: `http://localhost:3000/checkout` *(Giriş yapmış olmalısın)*
   - *Test:* Adres seçimi, ödeme yöntemi (İyzico / PayTR / Kapıda Ödeme) seçimi ve sipariş tamamlama.

8. **Siparişlerim:**
   - URL: `http://localhost:3000/orders`
   - *Test:* Önceki siparişlerin listelenmesi ve "Sipariş Detayı" butonuna basarak kargo takip timeline'ının görülmesi.

9. **Yönetici Paneli (Admin Dashboard):**
   - URL: `http://localhost:3000/admin/dashboard` *(Admin olarak giriş yapmış olmalısın)*
   - *Test:* Toplam ciro, sipariş istatistikleri, stok uyarıları ve son gelen siparişlerin tablosu.
