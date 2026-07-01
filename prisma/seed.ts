import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seed başlatılıyor...\n");

  // ─── Admin Kullanıcı ─────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@butikkozmetik.com" },
    update: {},
    create: {
      email: "admin@butikkozmetik.com",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "Yönetici",
      phone: "05001234567",
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log("✅ Admin kullanıcı oluşturuldu:", admin.email);

  // ─── Test Müşteri ────────────────────────────────
  const customerPassword = await bcrypt.hash("test123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "musteri@test.com" },
    update: {},
    create: {
      email: "musteri@test.com",
      passwordHash: customerPassword,
      firstName: "Ayşe",
      lastName: "Yılmaz",
      phone: "05321234567",
      role: "CUSTOMER",
      emailVerified: true,
    },
  });
  console.log("✅ Test müşteri oluşturuldu:", customer.email);

  // ─── Adres ───────────────────────────────────────
  await prisma.address.upsert({
    where: { id: "seed-address-1" },
    update: {},
    create: {
      id: "seed-address-1",
      userId: customer.id,
      title: "Ev",
      fullName: "Ayşe Yılmaz",
      phone: "05321234567",
      city: "İstanbul",
      district: "Kadıköy",
      neighborhood: "Caferağa",
      addressLine: "Moda Cad. No:42 D:5",
      postalCode: "34710",
      isDefault: true,
    },
  });
  console.log("✅ Test adres oluşturuldu");

  // ─── Kategoriler ─────────────────────────────────
  const categories = [
    {
      name: "Cilt Bakımı",
      slug: "cilt-bakimi",
      description: "Yüz ve vücut cilt bakım ürünleri",
      sortOrder: 1,
    },
    {
      name: "Saç Bakımı",
      slug: "sac-bakimi",
      description: "Şampuan, krem ve saç maskeleri",
      sortOrder: 2,
    },
    {
      name: "Makyaj",
      slug: "makyaj",
      description: "Fondöten, ruj, maskara ve daha fazlası",
      sortOrder: 3,
    },
    {
      name: "Parfüm",
      slug: "parfum",
      description: "Kadın ve erkek parfümleri",
      sortOrder: 4,
    },
    {
      name: "Vücut Bakımı",
      slug: "vucut-bakimi",
      description: "El kremi, vücut losyonu ve daha fazlası",
      sortOrder: 5,
    },
  ];

  const createdCategories: Record<string, string> = {};

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = category.id;
  }
  console.log("✅ Kategoriler oluşturuldu:", categories.length);

  // ─── Etiketler ───────────────────────────────────
  const tags = [
    { name: "Doğal", slug: "dogal" },
    { name: "Vegan", slug: "vegan" },
    { name: "Organik", slug: "organik" },
    { name: "Paraben İçermez", slug: "paraben-icermez" },
    { name: "El Yapımı", slug: "el-yapimi" },
    { name: "Yeni", slug: "yeni" },
    { name: "Çok Satan", slug: "cok-satan" },
  ];

  const createdTags: Record<string, string> = {};

  for (const tag of tags) {
    const t = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    createdTags[tag.slug] = t.id;
  }
  console.log("✅ Etiketler oluşturuldu:", tags.length);

  // ─── Ürünler ─────────────────────────────────────
  const products = [
    {
      name: "Rose Glow Serum",
      slug: "rose-glow-serum",
      shortDescription: "Gül özlü aydınlatıcı yüz serumu",
      description:
        "Doğal gül suyu ve hyaluronik asit ile zenginleştirilmiş bu lüks serum, cildinizi derinlemesine nemlendirirken doğal bir parlaklık kazandırır. Tüm cilt tiplerine uygundur. Sabah ve akşam temiz cilde birkaç damla uygulayın.",
      categoryId: createdCategories["cilt-bakimi"],
      basePrice: 289.99,
      compareAtPrice: 349.99,
      skinType: "Tüm Cilt Tipleri",
      ingredients:
        "Aqua, Rosa Damascena Flower Water, Glycerin, Hyaluronic Acid, Niacinamide, Tocopherol, Citric Acid",
      usageInstructions:
        "Temiz cilde sabah ve akşam 3-4 damla uygulayın. Hafifçe masaj yaparak yayın.",
      volumeMl: 30,
      isFeatured: true,
      avgRating: 4.8,
      reviewCount: 24,
    },
    {
      name: "Vitamin C Aydınlatıcı Krem",
      slug: "vitamin-c-aydinlatici-krem",
      shortDescription: "C vitamini ve arbutin ile leke giderici krem",
      description:
        "Yüksek konsantrasyonlu C vitamini, arbutin ve meyan kökü özü ile formüle edilmiş bu krem, cilt tonunu eşitler, lekeleri azaltır ve cildi korur.",
      categoryId: createdCategories["cilt-bakimi"],
      basePrice: 199.99,
      compareAtPrice: 249.99,
      skinType: "Karma",
      ingredients:
        "Aqua, Ascorbic Acid, Arbutin, Glycyrrhiza Glabra Root Extract, Cetearyl Alcohol, Shea Butter",
      usageInstructions:
        "Günde iki kez temiz cilde uygulayın. Güneş koruyucu ile kullanınız.",
      volumeMl: 50,
      isFeatured: true,
      avgRating: 4.5,
      reviewCount: 18,
    },
    {
      name: "Hyaluronik Asit Nemlendirici",
      slug: "hyaluronik-asit-nemlendirici",
      shortDescription: "3 katmanlı hyaluronik asit ile derin nemlendirme",
      description:
        "Düşük, orta ve yüksek molekül ağırlıklı hyaluronik asit kombinasyonu ile cildinizin her katmanını nemlendirin. Hafif yapısı ile makyaj altına idealdir.",
      categoryId: createdCategories["cilt-bakimi"],
      basePrice: 159.99,
      skinType: "Kuru",
      ingredients:
        "Aqua, Sodium Hyaluronate, Panthenol, Aloe Barbadensis Leaf Juice, Allantoin",
      usageInstructions:
        "Nemli cilde uygulayın, nemlendirici ile sabitleyiniz.",
      volumeMl: 30,
      isFeatured: true,
      avgRating: 4.9,
      reviewCount: 32,
    },
    {
      name: "Argan Yağı Saç Serumu",
      slug: "argan-yagi-sac-serumu",
      shortDescription: "Saf argan yağı ile saç onarım serumu",
      description:
        "Fas'tan ithal edilen soğuk pres argan yağı, kuru ve yıpranmış saçlara yoğun bakım sağlar. E vitamini ve omega yağ asitleri ile saçlarınızı besler.",
      categoryId: createdCategories["sac-bakimi"],
      basePrice: 179.99,
      compareAtPrice: 219.99,
      skinType: null,
      ingredients:
        "Argania Spinosa Kernel Oil, Tocopherol, Cyclomethicone, Dimethicone",
      usageInstructions:
        "Nemli veya kuru saça birkaç damla uygulayın. Uçlara özellikle dikkat edin.",
      volumeMl: 50,
      isFeatured: true,
      avgRating: 4.7,
      reviewCount: 15,
    },
    {
      name: "Mat Ruj Koleksiyonu - Gül Kurusu",
      slug: "mat-ruj-gul-kurusu",
      shortDescription: "Uzun süre kalıcı mat ruj - Gül Kurusu tonu",
      description:
        "12 saat kalıcı formülü ile dudaklarınızda pürüzsüz ve mat bir görünüm bırakır. E vitamini ve jojoba yağı ile dudak bakımı yapar.",
      categoryId: createdCategories["makyaj"],
      basePrice: 129.99,
      skinType: null,
      ingredients:
        "Isododecane, Dimethicone, Trimethylsiloxysilicate, Tocopherol, Jojoba Oil, CI 77891, CI 15850",
      usageInstructions:
        "Dudak kalemi ile çerçeveledikten sonra direkt uygulayın.",
      volumeMl: 4,
      isFeatured: false,
      avgRating: 4.6,
      reviewCount: 28,
    },
    {
      name: "Lavanta Vücut Losyonu",
      slug: "lavanta-vucut-losyonu",
      shortDescription: "Rahatlatıcı lavanta özlü vücut nemlendirici",
      description:
        "Isparta lavantası ve shea yağı ile formüle edilmiş bu vücut losyonu, cildinizi 24 saat nemlendirirken rahatlatıcı aromaterapi etkisi sunar.",
      categoryId: createdCategories["vucut-bakimi"],
      basePrice: 119.99,
      skinType: "Tüm Cilt Tipleri",
      ingredients:
        "Aqua, Butyrospermum Parkii Butter, Lavandula Angustifolia Oil, Glycerin, Cetearyl Alcohol",
      usageInstructions: "Banyo sonrası nemli cilde bol miktarda uygulayın.",
      volumeMl: 250,
      isFeatured: true,
      avgRating: 4.4,
      reviewCount: 12,
    },
  ];

  for (const prod of products) {
    const product = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });

    // Varyantlar
    const variants = [];
    if (prod.volumeMl && prod.volumeMl <= 50) {
      variants.push({
        name: `${prod.volumeMl}ml`,
        sku: `${prod.slug}-${prod.volumeMl}ml`,
        price: prod.basePrice,
        stock: 50,
        weight: prod.volumeMl * 2 + 50,
      });
      if (prod.volumeMl === 30) {
        variants.push({
          name: "50ml",
          sku: `${prod.slug}-50ml`,
          price: prod.basePrice * 1.5,
          stock: 30,
          weight: 150,
        });
      }
    } else {
      variants.push({
        name: `${prod.volumeMl || 100}ml`,
        sku: `${prod.slug}-${prod.volumeMl || 100}ml`,
        price: prod.basePrice,
        stock: 40,
        weight: (prod.volumeMl || 100) + 100,
      });
    }

    for (const variant of variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: {},
        create: {
          productId: product.id,
          ...variant,
        },
      });
    }

    // Placeholder görseller
    await prisma.productImage.upsert({
      where: { id: `img-${prod.slug}-1` },
      update: {},
      create: {
        id: `img-${prod.slug}-1`,
        productId: product.id,
        url: `/images/products/${prod.slug}.jpg`,
        altText: prod.name,
        sortOrder: 0,
        isPrimary: true,
      },
    });

    // Tag ata
    const tagSlugs = ["dogal", "paraben-icermez"];
    if (prod.isFeatured) tagSlugs.push("cok-satan");

    for (const tagSlug of tagSlugs) {
      if (createdTags[tagSlug]) {
        await prisma.productTag.upsert({
          where: {
            productId_tagId: {
              productId: product.id,
              tagId: createdTags[tagSlug],
            },
          },
          update: {},
          create: {
            productId: product.id,
            tagId: createdTags[tagSlug],
          },
        });
      }
    }
  }
  console.log("✅ Ürünler ve varyantlar oluşturuldu:", products.length);

  // ─── Kuponlar ────────────────────────────────────
  const coupons = [
    {
      code: "HOSGELDIN",
      type: "PERCENTAGE" as const,
      value: 10,
      minOrderAmount: 100,
      maxUsageCount: 1000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      code: "YAZ2026",
      type: "FIXED" as const,
      value: 50,
      minOrderAmount: 300,
      maxUsageCount: 500,
      validFrom: new Date(),
      validUntil: new Date("2026-09-01"),
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }
  console.log("✅ Kuponlar oluşturuldu:", coupons.length);

  console.log("\n🎉 Seed tamamlandı!");
  console.log("─────────────────────────────────────");
  console.log("Admin: admin@butikkozmetik.com / admin123");
  console.log("Müşteri: musteri@test.com / test123");
  console.log("Kuponlar: HOSGELDIN (%10), YAZ2026 (50₺)");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
