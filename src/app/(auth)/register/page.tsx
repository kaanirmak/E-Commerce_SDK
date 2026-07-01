"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/actions/auth.actions";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await registerUser(formData);
      if (result && !result.success) {
        setError(result.error || "Kayıt başarısız.");
      }
    } catch (err) {
      console.error(err);
      setError("Beklenmedik bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, var(--color-bg) 0%, var(--color-primary-50) 100%)",
        padding: "var(--space-4)",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "var(--space-10)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <Link
            href="/"
            className="font-display"
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              color: "var(--color-primary-dark)",
            }}
          >
            Butik<span style={{ color: "var(--color-accent)" }}>Kozmetik</span>
          </Link>
          <p
            style={{
              marginTop: "var(--space-2)",
              color: "var(--color-text-secondary)",
              fontSize: "var(--text-sm)",
            }}
          >
            Üye olun, avantajlardan yararlanın
          </p>
        </div>

        {error && (
          <div
            className="card p-3 mb-4"
            style={{
              background: "var(--color-error-bg)",
              color: "var(--color-error)",
              fontSize: "var(--text-sm)",
              borderLeft: "4px solid var(--color-error)"
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div className="input-group">
              <label htmlFor="firstName">Ad</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="input"
                placeholder="Adınız"
                required
                minLength={2}
              />
            </div>
            <div className="input-group">
              <label htmlFor="lastName">Soyad</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="input"
                placeholder="Soyadınız"
                required
                minLength={2}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">E-posta Adresi</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone">Telefon (Opsiyonel)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input"
              placeholder="0532 123 4567"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="En az 6 karakter"
              required
              minLength={6}
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Şifre Tekrar</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input"
              placeholder="Şifrenizi tekrar girin"
              required
              minLength={6}
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-2)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
            }}
          >
            <input type="checkbox" required style={{ marginTop: 2 }} />
            <span>
              <Link href="/kvkk" style={{ color: "var(--color-primary)" }}>
                KVKK Aydınlatma Metni
              </Link>
              {" "}ve{" "}
              <Link href="/uyelik-sozlesmesi" style={{ color: "var(--color-primary)" }}>
                Üyelik Sözleşmesi
              </Link>
              &apos;ni okudum, kabul ediyorum.
            </span>
          </label>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
            {submitting ? "Hesap oluşturuluyor..." : "Üye Ol"}
          </button>
        </form>

        {/* Login Link */}
        <p
          style={{
            textAlign: "center",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            marginTop: "var(--space-6)",
          }}
        >
          Zaten üye misiniz?{" "}
          <Link
            href="/login"
            style={{ color: "var(--color-primary)", fontWeight: 600 }}
          >
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
