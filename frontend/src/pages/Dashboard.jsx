import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
  Trophy,
  CreditCard,
  Target,
  Medal,
  RefreshCw,
  LogOut,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronRight,
  Loader2,
} from "lucide-react";

/* ─── tiny helpers ─────────────────────────────────────────────── */
const fmt = (v) => (v !== undefined && v !== null ? v : "—");

/* ─── stat card ────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, value, label, accent = "emerald" }) => {
  const accents = {
    emerald: "bg-emerald-50 text-emerald-600",
    sky: "bg-sky-50 text-sky-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className={`w-fit rounded-xl p-2.5 ${accents[accent]}`}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-slate-900">{fmt(value)}</p>
        <p className="mt-0.5 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
};

/* ─── section header ───────────────────────────────────────────── */
const SectionTitle = ({ children, sub }) => (
  <div className="mb-5">
    <h2 className="text-lg font-semibold text-slate-900">{children}</h2>
    {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
  </div>
);

/* ─── badge ────────────────────────────────────────────────────── */
const Badge = ({ active }) =>
  active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
      <CheckCircle2 size={12} /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
      <XCircle size={12} /> Expired
    </span>
  );

/* ─── main component ───────────────────────────────────────────── */
const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [value, setValue] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [entry, setEntry] = useState(null);
  const [draws, setDraws] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [proofDrafts, setProofDrafts] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [s, sub, e, d, w] = await Promise.all([
        API.get("/scores"),
        API.get("/subscription/me"),
        API.get("/entry/me"),
        API.get("/draw"),
        API.get("/winner/me"),
      ]);
      setScores(s.data.scores || []);
      setSubscription(sub.data);
      setEntry(e.data);
      setDraws(d.data || []);
      setWinnings(w.data || []);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to load dashboard data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addScore = async () => {
    if (!value) return;
    setIsSubmittingScore(true);
    setStatus({ type: "", message: "" });
    try {
      await API.post("/scores", { value: Number(value) });
      setValue("");
      setStatus({ type: "success", message: "Score added successfully." });
      await fetchData();
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Unable to add score." });
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const subscribe = async (plan) => {
    setIsUpdatingSubscription(true);
    setStatus({ type: "", message: "" });
    try {
      await API.post("/subscription/subscribe", { plan });
      setStatus({ type: "success", message: `${plan[0].toUpperCase() + plan.slice(1)} subscription activated.` });
      await fetchData();
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Unable to activate subscription." });
    } finally {
      setIsUpdatingSubscription(false);
    }
  };

  const cancelSubscription = async () => {
    setIsUpdatingSubscription(true);
    setStatus({ type: "", message: "" });
    try {
      await API.post("/subscription/cancel");
      setStatus({ type: "success", message: "Subscription cancelled." });
      await fetchData();
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Unable to cancel subscription." });
    } finally {
      setIsUpdatingSubscription(false);
    }
  };

  const submitProof = async (winnerId) => {
    const proof = proofDrafts[winnerId]?.trim();
    if (!proof) return;
    setStatus({ type: "", message: "" });
    try {
      await API.post("/winner/proof", { winnerId, proof });
      setProofDrafts((cur) => ({ ...cur, [winnerId]: "" }));
      setStatus({ type: "success", message: "Proof submitted successfully." });
      await fetchData();
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Unable to submit proof." });
    }
  };

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };

  const latestDraw = draws[0];
  const lastScore = scores[0];

  /* ── derived draw date ── */
  const nextDrawLabel = latestDraw
    ? `${latestDraw.month}/${latestDraw.year}`
    : "TBA";

  /* ── loading screen ── */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
          <p className="text-sm font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── top nav bar ── */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600">
              <Trophy size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">GolfDraw</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">

        {/* ── status banner ── */}
        {status.message && (
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
              status.type === "error"
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {status.type === "error" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            {status.message}
          </div>
        )}

        {/* ── HERO ── */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-8 text-white shadow-lg">
          {/* decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 -right-4 h-72 w-72 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <Badge active={subscription?.active} />
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.name || "Player"} 👋
              </h1>
              <p className="max-w-md text-emerald-100">
                You have{" "}
                <span className="font-semibold text-white">{scores.length} score{scores.length !== 1 ? "s" : ""}</span>{" "}
                recorded. {entry ? "Your entry is locked in." : `Add ${Math.max(5 - scores.length, 0)} more to qualify.`}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-1 rounded-2xl bg-white/15 px-6 py-4 backdrop-blur-sm sm:items-center">
              <div className="flex items-center gap-2 text-emerald-100">
                <Calendar size={14} />
                <span className="text-xs font-semibold uppercase tracking-widest">Next Draw</span>
              </div>
              <p className="text-2xl font-bold">{nextDrawLabel}</p>
            </div>
          </div>
        </section>

        {/* ── 4 STAT CARDS ── */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={Target}
            value={scores.length}
            label="Total Entries"
            accent="emerald"
          />
          <StatCard
            icon={CreditCard}
            value={subscription?.active ? (subscription.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : "Active") : "None"}
            label="Current Plan"
            accent="sky"
          />
          <StatCard
            icon={Trophy}
            value={lastScore ? lastScore.value : "—"}
            label="Last Score"
            accent="amber"
          />
          <StatCard
            icon={Medal}
            value={winnings.length}
            label="Total Wins"
            accent="violet"
          />
        </section>

        {/* ── SUBSCRIPTION + ADD SCORE ── */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* subscription card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SectionTitle sub="An active subscription is required to submit scores and qualify for the draw.">
                  Subscription
                </SectionTitle>
              </div>
              <Badge active={subscription?.active} />
            </div>

            {subscription?.active ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Current plan</p>
                  <p className="mt-1 text-lg font-semibold capitalize text-slate-900">{subscription.plan}</p>
                  <p className="text-sm text-slate-500">
                    Renews {new Date(subscription.renewalDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={cancelSubscription}
                  disabled={isUpdatingSubscription}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {isUpdatingSubscription ? <Loader2 size={14} className="animate-spin" /> : null}
                  {isUpdatingSubscription ? "Updating…" : "Cancel Subscription"}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => subscribe("monthly")}
                  disabled={isUpdatingSubscription}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isUpdatingSubscription ? <Loader2 size={14} className="animate-spin" /> : null}
                  Monthly Plan
                </button>
                <button
                  onClick={() => subscribe("yearly")}
                  disabled={isUpdatingSubscription}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Yearly Plan
                </button>
              </div>
            )}
          </div>

          {/* add score card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <SectionTitle sub="Enter a score between 1 and 45. Your latest five scores become your monthly entry.">
              Add Score
            </SectionTitle>

            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                max="45"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="1 – 45"
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                onClick={addScore}
                disabled={isSubmittingScore}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSubmittingScore ? <Loader2 size={14} className="animate-spin" /> : null}
                {isSubmittingScore ? "Saving…" : "Add"}
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-3">
              <p className="text-sm text-emerald-800">
                {entry
                  ? `✅ Entry locked in: ${entry.numbers.join(", ")}`
                  : `You need ${Math.max(5 - scores.length, 0)} more score${Math.max(5 - scores.length, 0) !== 1 ? "s" : ""} to qualify.`}
              </p>
            </div>
          </div>
        </section>

        {/* ── SCORES + DRAW ── */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* recent scores */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <SectionTitle sub="Latest entries shown first.">Recent Scores</SectionTitle>
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold text-slate-600">
                {scores.length} saved
              </span>
            </div>

            {scores.length ? (
              <ul className="divide-y divide-slate-100">
                {scores.map((score, i) => (
                  <li key={`${score.date}-${i}`} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Score {score.value}</p>
                      <p className="text-xs text-slate-400">{new Date(score.date).toLocaleString()}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                      #{scores.length - i}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                <Target size={28} strokeWidth={1.5} />
                <p className="text-sm">No scores yet. Start recording!</p>
              </div>
            )}
          </div>

          {/* draw overview */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <SectionTitle sub="Latest draw information available to members.">Draw Overview</SectionTitle>

            {latestDraw ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    {latestDraw.month}/{latestDraw.year}
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    Winning Numbers: {latestDraw.winningNumbers.join(", ")}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Pool: {latestDraw.totalPool} · Charity: {latestDraw.charityAmount}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="mt-0.5 text-sm font-semibold capitalize text-slate-900">{latestDraw.status}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Rollover</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">{latestDraw.rolloverAmount}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                <Calendar size={28} strokeWidth={1.5} />
                <p className="text-sm">No draws completed yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── WINNINGS ── */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <SectionTitle sub="Submit proof for unverified wins and track payout progress.">
              Winnings
            </SectionTitle>
            <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold text-slate-600">
              {winnings.length} records
            </span>
          </div>

          {winnings.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {winnings.map((winner) => (
                <div
                  key={winner._id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Position {winner.position}</p>
                      <p className="text-xl font-bold text-slate-900">{winner.prize}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${winner.verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {winner.verified ? "Verified" : "Needs Proof"}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${winner.payoutStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                        {winner.payoutStatus}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 break-all text-xs text-slate-400">Draw: {winner.drawId}</p>

                  {winner.verified ? (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-700">
                      <CheckCircle2 size={14} />
                      Verification complete{winner.proof ? " · proof received." : "."}
                    </p>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <input
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        placeholder="Paste proof URL"
                        value={proofDrafts[winner._id] || ""}
                        onChange={(e) =>
                          setProofDrafts((cur) => ({ ...cur, [winner._id]: e.target.value }))
                        }
                      />
                      <button
                        onClick={() => submitProof(winner._id)}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Submit <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
              <Medal size={32} strokeWidth={1.5} />
              <p className="text-sm">No winnings recorded yet.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;