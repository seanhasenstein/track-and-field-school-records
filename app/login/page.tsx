"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "email" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStep("otp");
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (res.ok) {
        window.location.href = "/admin";
        return;
      } else {
        const data = await res.json();
        setError(data.error || "Invalid code");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "#fbf8f5",
    padding: "32px",
    borderRadius: "6px",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #B99865",
    padding: "10px 12px",
    borderRadius: "4px",
    color: "#0A2C23",
    fontSize: "1rem",
    boxSizing: "border-box",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    background: "#B99865",
    color: "#0A2C23",
    padding: "12px",
    borderRadius: "4px",
    fontFamily: "var(--font-cinzel-var), serif",
    fontWeight: 700,
    fontSize: "0.95rem",
    border: "none",
    cursor: loading ? "default" : "pointer",
    opacity: loading ? 0.6 : 1,
  };

  return (
    <div style={{ background: "#0A2C23", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={cardStyle}>
        <h1 style={{ fontFamily: "var(--font-cinzel-var), serif", color: "#0A2C23", fontSize: "1.3rem", textAlign: "center", marginBottom: "8px" }}>
          Admin Login
        </h1>
        <p style={{ color: "#666", fontSize: "0.85rem", textAlign: "center", marginBottom: "24px" }}>
          {step === "email"
            ? "Enter your email to receive a verification code"
            : `We sent a code to ${email}`}
        </p>

        {error && (
          <div style={{ background: "#fde8e8", color: "#991b1b", padding: "8px 12px", borderRadius: "4px", fontSize: "0.85rem", marginBottom: "16px", textAlign: "center" }}>
            {error}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={requestOtp}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              style={{ ...inputStyle, marginBottom: "16px" }}
            />
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Sending..." : "Send Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              required
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              style={{ ...inputStyle, marginBottom: "16px", textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.3em" }}
            />
            <button type="submit" disabled={loading || code.length !== 6} style={{ ...buttonStyle, opacity: loading || code.length !== 6 ? 0.6 : 1 }}>
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setCode(""); setError(""); }}
              style={{ width: "100%", background: "transparent", color: "#B99865", padding: "10px", border: "none", cursor: "pointer", fontSize: "0.85rem", marginTop: "8px" }}
            >
              Use a different email
            </button>
          </form>
        )}
      </div>

      <Link
        href="/"
        style={{ color: "rgba(185,152,101,0.5)", fontSize: "0.8rem", marginTop: "24px", fontFamily: "var(--font-cinzel-var), serif", textDecoration: "none" }}
      >
        &larr; Back to Records
      </Link>
    </div>
  );
}
