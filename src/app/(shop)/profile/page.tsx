import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Profilim | Butik Kozmetik",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      createdAt: true,
      addresses: {
        orderBy: { isDefault: "desc" }
      }
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="section" style={{ minHeight: "60vh" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-8)" }}>
          <h1 className="section__title" style={{ margin: 0 }}>Profilim</h1>
          
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="btn btn-outline btn-sm">
              Çıkış Yap
            </button>
          </form>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }}>
          {/* User Info */}
          <div className="glass" style={{ padding: "var(--space-8)", borderRadius: "var(--radius-xl)", alignSelf: "start" }}>
            <h3 style={{ marginBottom: "var(--space-6)", fontSize: "var(--text-lg)" }}>Hesap Bilgileri</h3>
            <div style={{ marginBottom: "var(--space-6)", display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
              <div 
                style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: "50%", 
                  backgroundColor: "var(--color-primary)", 
                  color: "white", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: "1.5rem",
                  fontWeight: "bold"
                }}
              >
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <h2 style={{ fontSize: "var(--text-xl)" }}>{user.firstName} {user.lastName}</h2>
                <p style={{ color: "var(--color-text-muted)" }}>{user.email}</p>
              </div>
            </div>

            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              <div>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Telefon</span>
                <p>{user.phone || "Belirtilmemiş"}</p>
              </div>
              <div>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Üyelik Tarihi</span>
                <p>{new Date(user.createdAt).toLocaleDateString("tr-TR")}</p>
              </div>
            </div>

            <div style={{ marginTop: "var(--space-8)", display: "flex", gap: "var(--space-4)" }}>
              <Link href="/orders" className="btn btn-primary" style={{ flex: 1, textAlign: "center" }}>
                Siparişlerim
              </Link>
              <Link href="/cart" className="btn btn-outline" style={{ flex: 1, textAlign: "center" }}>
                Sepetim
              </Link>
            </div>
          </div>

          {/* Addresses */}
          <div className="glass" style={{ padding: "var(--space-8)", borderRadius: "var(--radius-xl)", alignSelf: "start" }}>
            <h3 style={{ marginBottom: "var(--space-6)", fontSize: "var(--text-lg)" }}>Adreslerim</h3>
            
            {user.addresses.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)" }}>Henüz kayıtlı bir adresiniz bulunmuyor.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {user.addresses.map((address: any) => (
                  <div key={address.id} style={{ 
                    padding: "var(--space-4)", 
                    border: "1px solid var(--color-border)", 
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: address.isDefault ? "var(--color-primary-50)" : "transparent"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                      <strong style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        {address.title}
                        {address.isDefault && (
                          <span style={{ fontSize: "0.7rem", padding: "2px 6px", background: "var(--color-primary)", color: "white", borderRadius: "10px" }}>
                            Varsayılan
                          </span>
                        )}
                      </strong>
                    </div>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-1)" }}>
                      {address.fullName} • {address.phone}
                    </p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                      {address.addressLine}, {address.neighborhood ? `${address.neighborhood}, ` : ""}{address.district}/{address.city}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
