import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
  Users,
  Trophy,
  Medal,
  RefreshCw,
  LogOut,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  ShieldCheck,
  Loader2,
  BadgeCheck,
  Banknote,
  Calendar,
  Hash,
} from "lucide-react";

/* ─── stat card ────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, value, label, accent = "emerald" }) => {
  const accents = {
    emerald: "bg-emerald-50 text-emerald-600",
    sky:     "bg-sky-50 text-sky-600",
    amber:   "bg-amber-50 text-amber-600",
    violet:  "bg-violet-50 text-violet-600",
  };
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className={`w-fit rounded-xl p-2.5 ${accents[accent]}`}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="mt-0.5 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
};

/* ─── section header ───────────────────────────────────────────── */
const SectionTitle = ({ children, sub, count }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-lg font-semibold text-slate-900">{children}</h2>
      {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
    </div>
    {count !== undefined && (
      <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold text-slate-600">
        {count}
      </span>
    )}
  </div>
);

/* ─── status badge ─────────────────────────────────────────────── */
const Badge = ({ variant, children }) => {
  const styles = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    muted:   "bg-slate-100 text-slate-600",
    danger:  "bg-rose-100 text-rose-700",
    info:    "bg-sky-100 text-sky-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[variant] || styles.muted}`}>
      {children}
    </span>
  );
};

/* ─── main component ───────────────────────────────────────────── */
const Admin = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winners, setWinners] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningDraw, setIsRunningDraw] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [u, d, w] = await Promise.all([
        API.get("/admin/users"),
        API.get("/admin/draws"),
        API.get("/admin/winners"),
      ]);
      setUsers(u.data);
      setDraws(d.data);
      setWinners(w.data);
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Unable to load admin data." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const runDraw = async () => {
    setIsRunningDraw(true);
    setStatus({ type: "", message: "" });
    try {
      await API.post("/draw/run");
      setStatus({ type: "success", message: "Monthly draw completed successfully." });
      await fetchData();
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Unable to run draw." });
    } finally {
      setIsRunningDraw(false);
    }
  };

  const verifyWinner = async (winnerId) => {
    setStatus({ type: "", message: "" });
    try {
      await API.post("/winner/verify", { winnerId });
      setStatus({ type: "success", message: "Winner verified." });
      await fetchData();
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Unable to verify winner." });
    }
  };

  const markPaid = async (winnerId) => {
    setStatus({ type: "", message: "" });
    try {
      await API.post("/winner/pay", { winnerId });
      setStatus({ type: "success", message: "Winner marked as paid." });
      await fetchData();
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Unable to mark payout as paid." });
    }
  };

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };

  /* ── derived stats ── */
  const activeSubscriptions = users.filter((u) => u.subscription?.active).length;
  const totalPool = draws.reduce((sum, d) => sum + (Number(d.totalPool) || 0), 0);
  const pendingWinners = winners.filter((w) => !w.verified).length;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
          <p className="text-sm font-medium">Loading admin dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── sticky nav ── */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">GolfDraw</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
              <LogOut size={14} /> Logout
            </button>
            <button
              onClick={runDraw}
              disabled={isRunningDraw}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-600 disabled:opacity-60"
            >
              {isRunningDraw ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {isRunningDraw ? "Running…" : "Run Monthly Draw"}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">

        {/* ── status banner ── */}
        {status.message && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium border ${
            status.type === "error"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}>
            {status.type === "error" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            {status.message}
          </div>
        )}

        {/* ── HERO ── */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 p-8 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-16 right-20 h-72 w-72 rounded-full bg-emerald-500/10" />
          <div className="relative">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-300">
              Admin Console
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Operations, draws, and payouts.</h1>
            <p className="mt-2 max-w-xl text-slate-300">
              Monitor members, run the monthly draw, and move winners through verification and payout.
            </p>
          </div>
        </section>

        {/* ── 4 STAT CARDS ── */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={Users}       value={users.length}         label="Total Users"           accent="sky"     />
          <StatCard icon={Trophy}      value={activeSubscriptions}  label="Active Subscriptions"  accent="emerald" />
          <StatCard icon={DollarSign}  value={totalPool || "—"}     label="Total Prize Pool"       accent="amber"   />
          <StatCard icon={Clock}       value={pendingWinners}       label="Pending Winners"        accent="violet"  />
        </section>

        {/* ── MEMBERS + DRAWS ── */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* members */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <SectionTitle sub="Registered users currently in the platform." count={`${users.length} users`}>
              Members
            </SectionTitle>

            <div className="mt-5 divide-y divide-slate-100">
              {users.length ? users.map((u) => (
                <div key={u._id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {u.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={u.subscription?.active ? "success" : "muted"}>
                      {u.subscription?.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant={u.role === "admin" ? "warning" : "muted"}>
                      {u.role}
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                  <Users size={28} strokeWidth={1.5} />
                  <p className="text-sm">No users yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* draw history */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <SectionTitle sub="Recent draw records and pool details." count={`${draws.length} draws`}>
              Draw History
            </SectionTitle>

            <div className="mt-5 space-y-3">
              {draws.length ? draws.map((draw) => (
                <div key={draw._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar size={11} />
                        {draw.month}/{draw.year}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {draw.winningNumbers.join(", ")}
                      </p>
                    </div>
                    <Badge variant={draw.status === "completed" ? "success" : "warning"}>
                      {draw.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><DollarSign size={11} /> Pool: {draw.totalPool}</span>
                    <span>·</span>
                    <span>Charity: {draw.charityAmount}</span>
                    <span>·</span>
                    <span>Rollover: {draw.rolloverAmount}</span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                  <Trophy size={28} strokeWidth={1.5} />
                  <p className="text-sm">No draws run yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── WINNER MANAGEMENT ── */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <SectionTitle sub="Review submitted proof, verify winners, and mark payouts as paid." count={`${winners.length} winners`}>
            Winner Management
          </SectionTitle>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {winners.length ? winners.map((winner) => (
              <div key={winner._id} className="rounded-xl border border-slate-100 bg-slate-50 p-5 transition hover:border-slate-200 hover:shadow-sm">

                {/* user row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-sm font-bold text-slate-600 border border-slate-100">
                      {winner.userId?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{winner.userId?.name || "Unknown User"}</p>
                      <p className="text-xs text-slate-400">{winner.userId?.email || "No email"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={winner.verified ? "success" : "warning"}>
                      {winner.verified ? <><BadgeCheck size={11} /> Verified</> : <><Clock size={11} /> Pending</>}
                    </Badge>
                    <Badge variant={winner.payoutStatus === "paid" ? "success" : "muted"}>
                      {winner.payoutStatus === "paid" ? <><Banknote size={11} /> Paid</> : winner.payoutStatus}
                    </Badge>
                  </div>
                </div>

                {/* prize row */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-400">Position</p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900">{winner.position}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-400">Prize</p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900">{winner.prize}</p>
                  </div>
                </div>

                {/* proof */}
                <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2.5">
                  <p className="text-xs font-medium text-slate-400">Proof</p>
                  <p className="mt-0.5 break-all text-xs text-slate-600">
                    {winner.proof || <span className="italic text-slate-400">Not submitted yet</span>}
                  </p>
                </div>

                {/* actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => verifyWinner(winner._id)}
                    disabled={winner.verified}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <BadgeCheck size={13} />
                    {winner.verified ? "Verified" : "Verify Winner"}
                  </button>
                  <button
                    onClick={() => markPaid(winner._id)}
                    disabled={!winner.verified || winner.payoutStatus === "paid"}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Banknote size={13} />
                    {winner.payoutStatus === "paid" ? "Paid" : "Mark as Paid"}
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-2 flex flex-col items-center gap-2 py-12 text-slate-400">
                <Medal size={32} strokeWidth={1.5} />
                <p className="text-sm">No winners to manage yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;