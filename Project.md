# Kozmetik E-Ticaret Platformu - Kapsamlı Sistem Tasarım Dokümanı

Bu doküman; kişiye özel (butik/şahıs markası) bir kozmetik e-ticaret platformunun uçtan uca sistem mimarisini, veri tabanı ilişkilerini, kimlik doğrulama mekanizmalarını, ödeme (İyzico/PayTR & Kapıda Ödeme) ve kargo (PTT Kargo) entegrasyon iş akışlarını teknik detaylarıyla ele almaktadır.

---

## 1. Giriş ve Proje Özeti

Proje, yüksek dönüşüm oranları ve kusursuz kullanıcı deneyimi hedefleyen modern bir kozmetik e-ticaret sitesidir. Kozmetik dikeyindeki dinamikler (hızlı tüketim, anlık indirim kampanyaları, yoğun mobil kullanım) göz önüne alınarak sistem mimarisi; düşük gecikmeli, SEO dostu, stok güvenliğini önceliklendiren ve sahte siparişleri minimize eden modüler bir yapıda tasarlanmıştır.

### Temel İşlevsel Gereksinimler:
* **Çoklu Ödeme Kanalları:** İyzico veya PayTR ile güvenli online kredi/banka kartı tahsilatı ve SMS OTP doğrulamalı kapıda ödeme seçeneği.
* **Otomatik Kargo Süreci:** PTT Kargo API'si ile gerçek zamanlı barkod üretimi ve arka plan kargo durum senkronizasyonu.
* **Modern Giriş Mimarisi:** Sepet terk etme oranını düşürmek amacıyla şifresiz (Passwordless OTP) SMS ile giriş, Sosyal Medya (Google/Apple) OAuth2 entegrasyonu ve Misafir Alışverişi (Guest Checkout).

---

## 2. Genel Sistem Mimarisi (High-Level Architecture)

Sistem, maliyet ve yönetim kolaylığı açısından ilk aşamada **Modüler Monolit (Modular Monolith)** olarak yapılandırılmıştır. Ancak servisler (Auth, Product, Order, Payment, Shipping) kendi içlerinde gevşek bağlı (loosely coupled) tasarlandığı için ilerleyen süreçte kolayca mikroservis mimarisine evrilebilir.

```mermaid
graph TD
    %% Müşteri ve Admin Katmanı
    Customer((Müşteri / Web-Mobil)) -->|HTTPS| Frontend[Next.js / Nuxt.js Frontend]
    Admin((Admin / Yönetici)) -->|HTTPS| AdminPanel[React / Vue Admin Dashboard]

    %% API Ağ Geçidi ve Backend
    Frontend -->|API Requests| Gateway[API Gateway / Load Balancer]
    AdminPanel -->|API Requests| Gateway
    
    subgraph Backend_Sunucusu [Backend Modüler Monolit / Servisler]
        Gateway --> Auth[Auth Service]
        Gateway --> ProductServ[Product & Stock Service]
        Gateway --> OrderServ[Order & Cart Service]
        Gateway --> PaymentServ[Payment Gateway Service]
        Gateway --> ShippingServ[Shipping & Delivery Service]
    end

    %% Veri Katmanı
    ProductServ -->|Read/Write| DB[(PostgreSQL / MySQL Main DB)]
    OrderServ -->|Read/Write| DB
    Auth -->|Read/Write| DB
    OrderServ -->|Session & Cart| Cache[(Redis Cache)]

    %% Dış Entegrasyonlar (3rd Party)
    PaymentServ -->|API / Webhook| Iyzico[İyzico / PayTR API]
    ShippingServ -->|API / Cron Sync| PTT[PTT Kargo API]
    OrderServ -->|OTP / Transactional SMS| SMS[SMS Gateway - Netgsm/İletimerkezi]