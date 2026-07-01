import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/layout/FloatingButtons";
import { getStoreSettings } from "@/actions/settings.actions";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingButtons 
        whatsAppNumber={settings.whatsAppNumber || "905000000000"} 
        defaultMessage={settings.whatsAppMessage || "Merhaba!"} 
      />
    </>
  );
}
