"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { EventRecord } from "@/lib/types";

export default function AdminPage() {
  const { user, loading, logout, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<EventRecord[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const originalRef = useRef<string>("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user && (isAdmin || isSuperAdmin)) {
      fetch("/api/records")
        .then((r) => r.json())
        .then((data: EventRecord[]) => {
          setRecords(data);
          originalRef.current = JSON.stringify(data);
        });
    }
  }, [user, isAdmin, isSuperAdmin]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const markDirty = (key: string) => {
    setDirty((prev) => new Set(prev).add(key));
  };

  const cancelChanges = () => {
    if (originalRef.current) {
      setRecords(JSON.parse(originalRef.current));
      setDirty(new Set());
      setToast("Changes discarded");
    }
  };

  const updateField = (
    eventId: string,
    gender: "girls" | "boys",
    field: "year" | "mark",
    value: string
  ) => {
    markDirty(`${eventId}-${gender}`);
    setRecords((prev) =>
      prev.map((r) =>
        r.id === eventId
          ? { ...r, [gender]: { ...r[gender], [field]: value } }
          : r
      )
    );
  };

  const updateName = (
    eventId: string,
    gender: "girls" | "boys",
    nameIndex: number,
    value: string
  ) => {
    markDirty(`${eventId}-${gender}`);
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== eventId) return r;
        const newNames = [...r[gender].names];
        newNames[nameIndex] = value;
        return { ...r, [gender]: { ...r[gender], names: newNames } };
      })
    );
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const promises = records.flatMap((event) =>
        (["girls", "boys"] as const)
          .filter((gender) => dirty.has(`${event.id}-${gender}`))
          .map((gender) => {
            const entry = event[gender];
            return fetch("/api/records", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: event.id,
                gender,
                names: entry.names,
                year: entry.year,
                mark: entry.mark,
              }),
            });
          })
      );

      if (promises.length === 0) {
        setToast("No changes to save");
        setSaving(false);
        return;
      }

      const results = await Promise.all(promises);
      if (results.every((r) => r.ok)) {
        setToast("All Records Updated \u2713");
        setDirty(new Set());
        originalRef.current = JSON.stringify(records);
      } else {
        setToast("Error saving some records");
      }
    } catch {
      setToast("Error saving records");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#0A2C23", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#BE945D", fontFamily: "var(--font-cinzel-var), serif" }}>Loading...</p>
      </div>
    );
  }

  if (!user || (!isAdmin && !isSuperAdmin)) {
    return null;
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#fbf8f5",
    color: "#0A2C23",
    padding: "8px 10px",
    borderRadius: "4px",
    fontSize: "0.9rem",
    border: "1px solid #B99865",
    boxSizing: "border-box",
  };

  return (
    <div style={{ background: "#0A2C23", minHeight: "100vh", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Link
            href="/"
            style={{ fontFamily: "var(--font-cinzel-var), serif", color: "#BE945D", fontSize: "0.85rem", textDecoration: "none", opacity: 0.7 }}
          >
            &larr; Back to Records
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {isSuperAdmin && (
              <Link
                href="/admin/users"
                style={{ fontFamily: "var(--font-cinzel-var), serif", color: "#BE945D", fontSize: "0.85rem", textDecoration: "none", opacity: 0.7 }}
              >
                Manage Users
              </Link>
            )}
            <span style={{ color: "rgba(251,248,245,0.5)", fontSize: "0.8rem" }}>{user.email}</span>
            <button
              onClick={async () => { await logout(); router.push("/"); }}
              style={{ background: "transparent", color: "#BE945D", border: "1px solid rgba(185,152,101,0.3)", padding: "4px 12px", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", fontFamily: "var(--font-cinzel-var), serif" }}
            >
              Logout
            </button>
          </div>
        </div>

        <h1 style={{ fontFamily: "var(--font-cinzel-var), serif", color: "#BE945D", fontSize: "1.5rem", textAlign: "center", fontWeight: 900, margin: "0 0 24px" }}>
          Edit Records
        </h1>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", top: "16px", right: "16px", background: "#B99865", color: "#0A2C23", padding: "8px 16px", borderRadius: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", fontFamily: "var(--font-cinzel-var), serif", fontSize: "0.85rem", zIndex: 50 }}>
            {toast}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {records.map((event) => (
            <div
              key={event.id}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(185,152,101,0.3)", borderRadius: "6px", padding: "16px" }}
            >
              <h2 style={{ fontFamily: "var(--font-cinzel-var), serif", color: "#BE945D", fontSize: "1.1rem", marginBottom: "12px" }}>
                {event.label}
              </h2>

              <div className="admin-grid">
                {(["girls", "boys"] as const).map((gender) => {
                  const isDirty = dirty.has(`${event.id}-${gender}`);
                  return (
                    <div key={gender} style={{ display: "flex", flexDirection: "column", gap: "8px", borderLeft: isDirty ? "3px solid #BE945D" : "3px solid transparent", paddingLeft: "12px" }}>
                      <h3 style={{ fontFamily: "var(--font-cinzel-var), serif", color: "rgba(251,248,245,0.7)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                        {gender}
                      </h3>

                      {event[gender].names.map((name, i) => (
                        <input
                          key={i}
                          type="text"
                          value={name}
                          onChange={(e) =>
                            updateName(event.id, gender, i, e.target.value)
                          }
                          placeholder={`Name ${i + 1}`}
                          style={inputStyle}
                        />
                      ))}

                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          value={event[gender].year}
                          onChange={(e) =>
                            updateField(event.id, gender, "year", e.target.value)
                          }
                          placeholder="Year"
                          style={{ ...inputStyle, width: "90px", flex: "none" }}
                        />
                        <input
                          type="text"
                          value={event[gender].mark}
                          onChange={(e) =>
                            updateField(event.id, gender, "mark", e.target.value)
                          }
                          placeholder="Mark"
                          style={{ ...inputStyle, flex: 1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-width sticky action bar */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#0a1f1a",
        borderTop: "1px solid rgba(185,152,101,0.3)",
        padding: "12px 16px",
        zIndex: 50,
      }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", gap: "12px" }}>
          <button
            onClick={cancelChanges}
            disabled={saving || dirty.size === 0}
            style={{
              flex: "none",
              background: "transparent",
              color: dirty.size > 0 ? "#BE945D" : "rgba(185,152,101,0.3)",
              padding: "12px 24px",
              borderRadius: "6px",
              fontFamily: "var(--font-cinzel-var), serif",
              fontWeight: 700,
              fontSize: "0.9rem",
              border: dirty.size > 0 ? "1px solid #BE945D" : "1px solid rgba(185,152,101,0.3)",
              cursor: dirty.size > 0 ? "pointer" : "default",
              letterSpacing: "0.05em",
            }}
          >
            Cancel
          </button>
          <button
            onClick={saveAll}
            disabled={saving || dirty.size === 0}
            style={{
              flex: 1,
              background: dirty.size > 0 ? "#B99865" : "rgba(185,152,101,0.3)",
              color: "#0A2C23",
              padding: "12px",
              borderRadius: "6px",
              fontFamily: "var(--font-cinzel-var), serif",
              fontWeight: 900,
              fontSize: "1rem",
              border: "none",
              cursor: dirty.size > 0 ? "pointer" : "default",
              opacity: saving ? 0.5 : 1,
              letterSpacing: "0.05em",
            }}
          >
            {saving ? "Saving..." : dirty.size > 0 ? `Save All Changes (${dirty.size})` : "No Changes"}
          </button>
        </div>
      </div>

      <style>{`
        .admin-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 640px) {
          .admin-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}
