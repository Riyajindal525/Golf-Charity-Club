import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Trophy, CalendarCheck, ShieldCheck, Loader2, Mail, Lock, ArrowRight } from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Automated Monthly Entries",
    desc: "Submit scores and qualify automatically — no manual sign-ups.",
  },
  {
    icon: Trophy,
    title: "Transparent Draw History",
    desc: "Full visibility into winning numbers, prize pools, and charity splits.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Payouts",
    desc: "Admin-reviewed proofs and tracked payout statuses, every time.",
  },
];

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await API.post("/auth/login", form);
      login(res.data);
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">

      {/* ── LEFT BRAND PANEL ── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 p-12 lg:flex">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />

        {/* logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Trophy size={18} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">Golf Charity Club</span>
        </div>

        {/* hero copy */}
        <div className="relative space-y-8">
          <div className="space-y-4">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-100">
              Members Platform
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
              A calmer way to manage play, pools, and prize draws.
            </h1>
            <p className="text-base leading-relaxed text-emerald-100">
              Track scores, qualify automatically for monthly entries, and keep charity and payout activity in one place.
            </p>
          </div>

          {/* feature list */}
          <ul className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <Icon size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-sm text-emerald-100">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* bottom tagline */}
        <p className="relative text-xs text-emerald-200/70">
          © {new Date().getFullYear()} Golf Charity Club. All rights reserved.
        </p>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
        {/* subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(16,185,129,0.06),transparent_70%)]" />

        <div className="relative w-full max-w-md">

          {/* mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
              <Trophy size={15} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">Golf Charity Club</span>
          </div>

          {/* card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/60">

            {/* header */}
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Welcome back</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Use your registered email to continue to your dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* error */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  <span className="shrink-0">⚠</span> {error}
                </div>
              )}

              {/* email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-3 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {/* password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-3 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all duration-200 hover:from-emerald-700 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* footer */}
            <p className="mt-6 text-center text-sm text-slate-500">
              New here?{" "}
              <Link
                to="/register"
                className="font-semibold text-emerald-600 transition hover:text-emerald-700"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;