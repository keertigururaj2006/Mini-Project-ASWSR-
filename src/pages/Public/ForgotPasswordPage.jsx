import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const result = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(result.message || "If an active CrediFit account matches that email, a reset link will be sent.");
    } catch (err) {
      setError(err.message || "Unable to request a password reset right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl font-black text-indigo-900">C</div>
        <h1 className="text-2xl font-extrabold text-slate-950">Forgot your password?</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Enter the email address linked to your CrediFit account. If it is registered, we will send a one-time reset link.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700" htmlFor="reset-email">Email address</label>
          <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" />
          {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className="h-11 w-full rounded-xl bg-indigo-900 text-sm font-bold text-white hover:bg-indigo-800 disabled:opacity-60">{busy ? "Sending..." : "Send reset link"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600"><Link to="/login" className="font-bold text-indigo-700 hover:underline">Back to sign in</Link></p>
      </section>
    </main>
  );
}
