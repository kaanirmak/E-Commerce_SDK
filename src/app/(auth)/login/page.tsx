"use client";

import { useState } from "react";
import Link from "next/link";
import { loginUser } from "@/actions/auth.actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await loginUser(formData);
      if (result && !result.success) {
        setError(result.error || "Giriş başarısız.");
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
          maxWidth: "440px",
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
            Hesabınıza giriş yapın
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
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "var(--text-sm)",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer" }}>
              <input type="checkbox" name="remember" />
              Beni hatırla
            </label>
            <Link
              href="/forgot-password"
              style={{ color: "var(--color-primary)", fontWeight: 500 }}
            >
              Şifremi Unuttum
            </Link>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
            {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-4)",
            margin: "var(--space-6) 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>veya</span>
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
        </div>

        {/* Register Link */}
        <p
          style={{
            textAlign: "center",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
          }}
        >
          Hesabınız yok mu?{" "}
          <Link
            href="/register"
            style={{ color: "var(--color-primary)", fontWeight: 600 }}
          >
            Üye Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
