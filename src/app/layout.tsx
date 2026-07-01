import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Butik Kozmetik | Kişiye Özel Doğal Kozmetik",
  description:
    "El yapımı, doğal ve vegan kozmetik ürünleri. Cilt bakımı, saç bakımı, makyaj ve parfüm. Ücretsiz kargo, güvenli ödeme.",
  keywords: [
    "kozmetik",
    "cilt bakımı",
    "doğal kozmetik",
    "vegan kozmetik",
    "el yapımı",
    "butik kozmetik",
  ],
  openGraph: {
    title: "Butik Kozmetik | Kişiye Özel Doğal Kozmetik",
    description:
      "El yapımı, doğal ve vegan kozmetik ürünleri. Cilt bakımı, saç bakımı, makyaj ve parfüm.",
    type: "website",
    locale: "tr_TR",
    siteName: "Butik Kozmetik",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
