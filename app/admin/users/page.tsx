"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

type UserEntry = {
  id: string;
  email: string;
  roles: string[];
  lastLoginAt: string | null;
  createdAt: string;
};

export default function UsersPage() {
  const { user, loading, isSuperAdmin, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRoles, setNewRoles] = useState<string[]>(["admin"]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isSuperAdmin)) {
      router.push("/admin");
    }
  }, [loading, user, isSuperAdmin, router]);

  useEffect(() => {
    if (user && isSuperAdmin) {
      fetchUsers();
    }
  }, [user, isSuperAdmin]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      setUsers(await res.json());
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, roles: newRoles }),
    });
    if (res.ok) {
      setNewEmail("");
      setNewRoles(["admin"]);
      setToast("User added");
      fetchUsers();
    } else {
      const data = await res.json();
      setToast(data.error || "Error adding user");
    }
  };

  const updateRoles = async (userId: string, roles: string[]) => {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, roles }),
    });
    if (res.ok) {
      setToast("Roles updated");
      fetchUsers();
    } else {
      const data = await res.json();
      setToast(data.error || "Error updating roles");
    }
  };

  const removeUser = async (userId: string, email: string) => {
    if (!confirm(`Remove ${email}?`)) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setToast("User removed");
      fetchUsers();
    } else {
      const data = await res.json();
      setToast(data.error || "Error removing user");
    }
  };

  const toggleRole = (userId: string, currentRoles: string[], role: string) => {
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    updateRoles(userId, newRoles);
  };

  if (loading || !user || !isSuperAdmin) {
    return (
      <div style={{ background: "#0A2C23", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#BE945D", fontFamily: "var(--font-cinzel-var), serif" }}>Loading...</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    background: "#fbf8f5",
    color: "#0A2C23",
    padding: "8px 10px",
    borderRadius: "4px",
    fontSize: "0.9rem",
    border: "1px solid #B99865",
    boxSizing: "border-box",
  };

  return (
    <div style={{ background: "#0A2C23", minHeight: "100vh", padding: "24px 16px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Link
            href="/admin"
            style={{ fontFamily: "var(--font-cinzel-var), serif", color: "#BE945D", fontSize: "0.85rem", textDecoration: "none", opacity: 0.7 }}
          >
            &larr; Back to Admin
          </Link>
          <button
            onClick={async () => { await logout(); router.push("/"); }}
            style={{ background: "transparent", color: "#BE945D", border: "1px solid rgba(185,152,101,0.3)", padding: "4px 12px", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", fontFamily: "var(--font-cinzel-var), serif" }}
          >
            Logout
          </button>
        </div>

        <h1 style={{ fontFamily: "var(--font-cinzel-var), serif", color: "#BE945D", fontSize: "1.5rem", textAlign: "center", fontWeight: 900, marginBottom: "24px" }}>
          Manage Users
        </h1>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", top: "16px", right: "16px", background: "#B99865", color: "#0A2C23", padding: "8px 16px", borderRadius: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", fontFamily: "var(--font-cinzel-var), serif", fontSize: "0.85rem", zIndex: 50 }}>
            {toast}
          </div>
        )}

        {/* Add user form */}
        <form onSubmit={addUser} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(185,152,101,0.3)", borderRadius: "6px", padding: "16px", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "var(--font-cinzel-var), serif", color: "#BE945D", fontSize: "1rem", marginBottom: "12px" }}>
            Add User
          </h2>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email address"
              required
              style={{ ...inputStyle, flex: 1, minWidth: "200px" }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: "4px", color: "rgba(251,248,245,0.7)", fontSize: "0.8rem" }}>
              <input
                type="checkbox"
                checked={newRoles.includes("super_admin")}
                onChange={(e) =>
                  setNewRoles(
                    e.target.checked
                      ? ["admin", "super_admin"]
                      : ["admin"]
                  )
                }
              />
              Super Admin
            </label>
            <button
              type="submit"
              style={{ background: "#B99865", color: "#0A2C23", padding: "8px 16px", borderRadius: "4px", fontFamily: "var(--font-cinzel-var), serif", fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: "pointer" }}
            >
              Add
            </button>
          </div>
        </form>

        {/* User list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(185,152,101,0.3)",
                borderRadius: "6px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div>
                <div style={{ color: "#fbf8f5", fontSize: "0.9rem" }}>{u.email}</div>
                <div style={{ color: "rgba(251,248,245,0.4)", fontSize: "0.75rem" }}>
                  {u.roles.join(", ")}
                  {u.lastLoginAt && ` \u00B7 Last login: ${new Date(u.lastLoginAt).toLocaleDateString()}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {u.id !== user.id && (
                  <>
                    <button
                      onClick={() => toggleRole(u.id, u.roles, "super_admin")}
                      style={{
                        background: "transparent",
                        color: u.roles.includes("super_admin") ? "#BE945D" : "rgba(185,152,101,0.4)",
                        border: `1px solid ${u.roles.includes("super_admin") ? "#BE945D" : "rgba(185,152,101,0.3)"}`,
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      {u.roles.includes("super_admin") ? "Remove Super" : "Make Super"}
                    </button>
                    <button
                      onClick={() => removeUser(u.id, u.email)}
                      style={{
                        background: "transparent",
                        color: "#c44",
                        border: "1px solid rgba(204,68,68,0.3)",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </>
                )}
                {u.id === user.id && (
                  <span style={{ color: "rgba(251,248,245,0.3)", fontSize: "0.75rem" }}>You</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
