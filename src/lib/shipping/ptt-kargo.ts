// ─── PTT Kargo Entegrasyonu ─────────────────────────
// PTT Kargo SOAP/REST API entegrasyonu
// Barkod üretimi, kargo etiketi, takip sorgusu

// ─── Types ──────────────────────────────────────────

export interface PTTShipmentParams {
  orderId: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  senderDistrict: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  receiverDistrict: string;
  receiverPostalCode?: string;
  weight: number; // gram
  description?: string;
  paymentType: "SENDER" | "RECEIVER"; // Gönderici ödemeli / Alıcı ödemeli
  isCOD?: boolean; // Kapıda ödeme
  codAmount?: number; // Tahsilat tutarı
}

export interface PTTShipmentResult {
  success: boolean;
  trackingNumber?: string;
  barcodeUrl?: string;
  labelUrl?: string;
  errorMessage?: string;
}

export interface PTTTrackingResult {
  success: boolean;
  trackingNumber: string;
  status: string;
  statusCode: string;
  events: PTTTrackingEvent[];
  estimatedDelivery?: string;
  actualDelivery?: string;
}

export interface PTTTrackingEvent {
  date: string;
  time: string;
  status: string;
  location: string;
  description: string;
}

// ─── Config ─────────────────────────────────────────

const PTT_CONFIG = {
  baseUrl: process.env.PTT_KARGO_BASE_URL || "https://pttws.ptt.gov.tr",
  username: process.env.PTT_KARGO_USERNAME || "",
  password: process.env.PTT_KARGO_PASSWORD || "",
  customerId: process.env.PTT_KARGO_CUSTOMER_ID || "",
};

// ─── Gönderi Oluşturma ──────────────────────────────

export async function createPTTShipment(
  params: PTTShipmentParams
): Promise<PTTShipmentResult> {
  try {
    // SOAP XML payload hazırla
    const soapEnvelope = buildCreateShipmentSOAP(params);

    const response = await fetch(
      `${PTT_CONFIG.baseUrl}/Post/PostServis.asmx`,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction:
            "http://ptt.gov.tr/postservis/GonderiKaydet",
        },
        body: soapEnvelope,
      }
    );

    if (!response.ok) {
      return {
        success: false,
        errorMessage: `PTT API hatası: ${response.status} ${response.statusText}`,
      };
    }

    const responseText = await response.text();
    const result = parseShipmentResponse(responseText);
    return result;
  } catch (error) {
    console.error("PTT Kargo gönderi oluşturma hatası:", error);
    return {
      success: false,
      errorMessage:
        error instanceof Error
          ? error.message
          : "Bilinmeyen hata oluştu",
    };
  }
}

// ─── Kargo Takip ────────────────────────────────────

export async function trackPTTShipment(
  trackingNumber: string
): Promise<PTTTrackingResult> {
  try {
    const soapEnvelope = buildTrackShipmentSOAP(trackingNumber);

    const response = await fetch(
      `${PTT_CONFIG.baseUrl}/Post/PostServis.asmx`,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction:
            "http://ptt.gov.tr/postservis/GonderiDurumSorgula",
        },
        body: soapEnvelope,
      }
    );

    if (!response.ok) {
      return {
        success: false,
        trackingNumber,
        status: "ERROR",
        statusCode: "ERR",
        events: [],
      };
    }

    const responseText = await response.text();
    return parseTrackingResponse(trackingNumber, responseText);
  } catch (error) {
    console.error("PTT Kargo takip hatası:", error);
    return {
      success: false,
      trackingNumber,
      status: "ERROR",
      statusCode: "ERR",
      events: [],
    };
  }
}

// ─── Gönderi İptali ─────────────────────────────────

export async function cancelPTTShipment(
  trackingNumber: string
): Promise<{ success: boolean; message: string }> {
  try {
    const soapEnvelope = buildCancelShipmentSOAP(trackingNumber);

    const response = await fetch(
      `${PTT_CONFIG.baseUrl}/Post/PostServis.asmx`,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction:
            "http://ptt.gov.tr/postservis/GonderiIptal",
        },
        body: soapEnvelope,
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: `İptal hatası: ${response.status}`,
      };
    }

    return {
      success: true,
      message: "Gönderi başarıyla iptal edildi.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "İptal işlemi başarısız",
    };
  }
}

// ─── Kargo Ücreti Hesaplama ─────────────────────────

export function calculateShippingCost(
  weightGrams: number,
  city: string
): number {
  // PTT Kargo ücret tarifesi (yaklaşık)
  const FREE_SHIPPING_THRESHOLD = 300; // 300 TL üzeri ücretsiz kargo
  const BASE_COST = 39.99;
  const KG_COST = 5.0;

  const weightKg = Math.ceil(weightGrams / 1000);
  let cost = BASE_COST;

  if (weightKg > 1) {
    cost += (weightKg - 1) * KG_COST;
  }

  return Math.round(cost * 100) / 100;
}

/**
 * Ücretsiz kargo kontrolü
 */
export function isFreeShipping(subtotal: number): boolean {
  const FREE_SHIPPING_THRESHOLD = 300; // 300 TL
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

// ─── PTT Kargo durumunu internal statüye çevir ─────

export function mapPTTStatusToInternal(
  pttStatus: string
): string {
  const statusMap: Record<string, string> = {
    KABUL: "PICKED_UP",
    "AKTARMA MERKEZİNDE": "IN_TRANSIT",
    DAGITIMDA: "OUT_FOR_DELIVERY",
    "TESLİM EDİLDİ": "DELIVERED",
    İADE: "RETURNED",
  };

  return statusMap[pttStatus.toUpperCase()] || "IN_TRANSIT";
}

// ─── SOAP Helpers ───────────────────────────────────

function buildCreateShipmentSOAP(params: PTTShipmentParams): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <AuthHeader xmlns="http://ptt.gov.tr/postservis">
      <KullaniciAdi>${PTT_CONFIG.username}</KullaniciAdi>
      <Sifre>${PTT_CONFIG.password}</Sifre>
      <MusteriNo>${PTT_CONFIG.customerId}</MusteriNo>
    </AuthHeader>
  </soap:Header>
  <soap:Body>
    <GonderiKaydet xmlns="http://ptt.gov.tr/postservis">
      <gonderiDetay>
        <GondericiAdi>${escapeXml(params.senderName)}</GondericiAdi>
        <GondericiTelefon>${params.senderPhone}</GondericiTelefon>
        <GondericiAdres>${escapeXml(params.senderAddress)}</GondericiAdres>
        <GondericiIl>${escapeXml(params.senderCity)}</GondericiIl>
        <GondericiIlce>${escapeXml(params.senderDistrict)}</GondericiIlce>
        <AliciAdi>${escapeXml(params.receiverName)}</AliciAdi>
        <AliciTelefon>${params.receiverPhone}</AliciTelefon>
        <AliciAdres>${escapeXml(params.receiverAddress)}</AliciAdres>
        <AliciIl>${escapeXml(params.receiverCity)}</AliciIl>
        <AliciIlce>${escapeXml(params.receiverDistrict)}</AliciIlce>
        ${params.receiverPostalCode ? `<AliciPostaKodu>${params.receiverPostalCode}</AliciPostaKodu>` : ""}
        <Agirlik>${params.weight}</Agirlik>
        <Aciklama>${escapeXml(params.description || "Kozmetik Ürün")}</Aciklama>
        <OdemeYonu>${params.paymentType === "SENDER" ? "1" : "2"}</OdemeYonu>
        ${params.isCOD ? `<TahsilatTutari>${params.codAmount}</TahsilatTutari>` : ""}
      </gonderiDetay>
    </GonderiKaydet>
  </soap:Body>
</soap:Envelope>`;
}

function buildTrackShipmentSOAP(trackingNumber: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <AuthHeader xmlns="http://ptt.gov.tr/postservis">
      <KullaniciAdi>${PTT_CONFIG.username}</KullaniciAdi>
      <Sifre>${PTT_CONFIG.password}</Sifre>
      <MusteriNo>${PTT_CONFIG.customerId}</MusteriNo>
    </AuthHeader>
  </soap:Header>
  <soap:Body>
    <GonderiDurumSorgula xmlns="http://ptt.gov.tr/postservis">
      <barkodNo>${trackingNumber}</barkodNo>
    </GonderiDurumSorgula>
  </soap:Body>
</soap:Envelope>`;
}

function buildCancelShipmentSOAP(trackingNumber: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <AuthHeader xmlns="http://ptt.gov.tr/postservis">
      <KullaniciAdi>${PTT_CONFIG.username}</KullaniciAdi>
      <Sifre>${PTT_CONFIG.password}</Sifre>
      <MusteriNo>${PTT_CONFIG.customerId}</MusteriNo>
    </AuthHeader>
  </soap:Header>
  <soap:Body>
    <GonderiIptal xmlns="http://ptt.gov.tr/postservis">
      <barkodNo>${trackingNumber}</barkodNo>
    </GonderiIptal>
  </soap:Body>
</soap:Envelope>`;
}

function parseShipmentResponse(xml: string): PTTShipmentResult {
  // Basit XML parsing — production'da xml2js veya fast-xml-parser kullanılmalı
  const barcodeMatch = xml.match(/<BarkodNo>(.*?)<\/BarkodNo>/);
  const errorMatch = xml.match(/<HataMesaji>(.*?)<\/HataMesaji>/);

  if (barcodeMatch && barcodeMatch[1]) {
    return {
      success: true,
      trackingNumber: barcodeMatch[1],
      barcodeUrl: `${PTT_CONFIG.baseUrl}/Post/BarkodYazdir.aspx?barkodNo=${barcodeMatch[1]}`,
      labelUrl: `${PTT_CONFIG.baseUrl}/Post/EtiketYazdir.aspx?barkodNo=${barcodeMatch[1]}`,
    };
  }

  return {
    success: false,
    errorMessage: errorMatch?.[1] || "Gönderi oluşturulamadı",
  };
}

function parseTrackingResponse(
  trackingNumber: string,
  xml: string
): PTTTrackingResult {
  // Basit XML parsing
  const events: PTTTrackingEvent[] = [];
  const eventRegex =
    /<GonderiDurum>([\s\S]*?)<\/GonderiDurum>/g;
  let match;

  while ((match = eventRegex.exec(xml)) !== null) {
    const eventXml = match[1];
    const dateMatch = eventXml.match(/<Tarih>(.*?)<\/Tarih>/);
    const timeMatch = eventXml.match(/<Saat>(.*?)<\/Saat>/);
    const statusMatch = eventXml.match(/<Durum>(.*?)<\/Durum>/);
    const locationMatch = eventXml.match(/<Lokasyon>(.*?)<\/Lokasyon>/);
    const descMatch = eventXml.match(/<Aciklama>(.*?)<\/Aciklama>/);

    events.push({
      date: dateMatch?.[1] || "",
      time: timeMatch?.[1] || "",
      status: statusMatch?.[1] || "",
      location: locationMatch?.[1] || "",
      description: descMatch?.[1] || "",
    });
  }

  const lastEvent = events[events.length - 1];

  return {
    success: events.length > 0,
    trackingNumber,
    status: lastEvent?.status || "UNKNOWN",
    statusCode: lastEvent ? mapPTTStatusToInternal(lastEvent.status) : "CREATED",
    events,
  };
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
