import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!token) return setError("This reset link is missing its token. Request a new password reset link.");
    if (password !== confirmPassword) return setError("The passwords do not match.");
    setBusy(true);
    try {
      const result = await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setSuccess(result.message || "Password updated. Please sign in with your new password.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "This reset link is invalid or has expired.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl font-black text-indigo-900">C</div>
        <h1 className="text-2xl font-extrabold text-slate-950">Create a new password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Choose a new password with at least 8 characters. The reset link can only be used once.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700" htmlFor="new-password">New password</label>
          <input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" />
          <label className="block text-sm font-semibold text-slate-700" htmlFor="confirm-password">Confirm new password</label>
          <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" />
          {success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {success ? <Link to="/login" className="flex h-11 w-full items-center justify-center rounded-xl bg-indigo-900 text-sm font-bold text-white hover:bg-indigo-800">Go to sign in</Link> : <button type="submit" disabled={busy || !token} className="h-11 w-full rounded-xl bg-indigo-900 text-sm font-bold text-white hover:bg-indigo-800 disabled:opacity-60">{busy ? "Updating..." : "Update password"}</button>}
        </form>
        <p className="mt-6 text-center text-sm text-slate-600"><Link to="/login" className="font-bold text-indigo-700 hover:underline">Back to sign in</Link></p>
      </section>
    </main>
  );
}
