import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import {
  Activity, ShoppingCart, Users, Database, Cpu, RefreshCw, Layers,
  ShieldAlert, TrendingUp, Sparkles, Filter, Award, Search, MessageSquare,
  Zap, AlertTriangle, CheckCircle, ArrowRight, PlusCircle, Globe,
  ChevronRight, Play, Eye, X, BarChart2, Home, Terminal, Sliders,
  Package, GitBranch, Wifi, Hash
} from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000/api";

const SENTIMENT_COLORS = { positive: '#10B981', neutral: '#F59E0B', negative: '#EF4444' };
const SEGMENT_COLORS = {
  'VIP Champions': '#7C3AED',
  'Loyal Customers': '#2563EB',
  'Potential Loyalists': '#059669',
  'At Risk / New': '#EA580C'
};
const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6'];

const FUNNEL_DATA = [
  { stage: 'Page Views', count: 30000, fill: '#3B82F6' },
  { stage: 'Searches', count: 18400, fill: '#6366F1' },
  { stage: 'Add to Cart', count: 9200, fill: '#8B5CF6' },
  { stage: 'Checkout', count: 4800, fill: '#EC4899' },
  { stage: 'Purchased', count: 2450, fill: '#10B981' }
];

const MONTHLY_REVENUE = [
  { month: "Dec'10", revenue: 48234 }, { month: "Jan'11", revenue: 52891 },
  { month: "Feb'11", revenue: 45673 }, { month: "Mar'11", revenue: 61234 },
  { month: "Apr'11", revenue: 58901 }, { month: "May'11", revenue: 67432 },
  { month: "Jun'11", revenue: 72156 }, { month: "Jul'11", revenue: 65890 },
  { month: "Aug'11", revenue: 59234 }, { month: "Sep'11", revenue: 78934 },
  { month: "Oct'11", revenue: 92345 }, { month: "Nov'11", revenue: 115678 }
];

const TT = { backgroundColor: '#fff', border: '1px solid #E2E8F0', color: '#0F172A', fontSize: 11, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' };

/* ─── Reusable KPI Card ─── */
const KpiCard = ({ label, value, sub, icon: Icon, color = 'blue' }) => {
  const cfg = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: 'bg-blue-100 text-blue-600',   border: 'border-blue-100' },
    green:  { bg: 'bg-emerald-50',text: 'text-emerald-600',icon: 'bg-emerald-100 text-emerald-600',border: 'border-emerald-100' },
    red:    { bg: 'bg-rose-50',   text: 'text-rose-600',   icon: 'bg-rose-100 text-rose-600',   border: 'border-rose-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'bg-indigo-100 text-indigo-600',border: 'border-indigo-100' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  icon: 'bg-amber-100 text-amber-600', border: 'border-amber-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', icon: 'bg-violet-100 text-violet-600',border: 'border-violet-100' },
  };
  const c = cfg[color] || cfg.blue;
  return (
    <div className={`bg-white rounded-2xl p-5 border ${c.border} shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group`}>
      <div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</p>
        <h3 className="text-2xl font-black text-slate-800 mt-1 tabular-nums">{value}</h3>
        {sub && <span className={`text-[11px] ${c.text} flex items-center gap-1 mt-1 font-medium`}>{sub}</span>}
      </div>
      <div className={`p-3 ${c.icon} rounded-xl group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

/* ─── Section Title ─── */
const SectionTitle = ({ icon: Icon, title, color = 'text-blue-600', subtitle }) => (
  <div className="mb-1">
    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} /> {title}
    </h3>
    {subtitle && <p className="text-xs text-slate-400 mt-0.5 ml-6">{subtitle}</p>}
  </div>
);

/* ─── Panel wrapper ─── */
const Panel = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 ${className}`}>{children}</div>
);

/* ─── Pipeline badge ─── */
const PipelineBadge = ({ label, status }) => {
  const cfg = {
    idle:    { wrap: 'bg-slate-50 border-slate-200 text-slate-500', dot: 'bg-slate-300',           text: 'Idle' },
    running: { wrap: 'bg-amber-50 border-amber-200 text-amber-700',  dot: 'bg-amber-400 animate-pulse', text: 'Running' },
    done:    { wrap: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500',    text: 'Done' },
  };
  const c = cfg[status] || cfg.idle;
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold ${c.wrap}`}>
      <span>{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span>{c.text}</span>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({ country_analytics: [], top_products: [], rfm_segmentation: [], wordcount: [], bloom_filter: {}, market_basket: [] });

  /* filters */
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [reviewSentiment, setReviewSentiment] = useState('all');
  const [reviewSearch, setReviewSearch]       = useState('');
  const [rfmSegment, setRfmSegment]           = useState('All');
  const [rfmSearch, setRfmSearch]             = useState('');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0);

  /* bloom / stream */
  const [bloomTestInput, setBloomTestInput]   = useState('');
  const [bloomTestResult, setBloomTestResult] = useState(null);
  const [simulating, setSimulating]           = useState(false);
  const [liveStreamLogs, setLiveStreamLogs]   = useState([]);
  const [sampleIds, setSampleIds] = useState({ sample_user_ids: [], sample_ips: [], sample_bot_ids: [] });
  const [streamHistory, setStreamHistory]     = useState([]);
  const [streamStats, setStreamStats]         = useState({ total: 0, unique: 0, dups: 0, bots: 0 });

  /* forms */
  const [newOrder, setNewOrder] = useState({ country: 'United Kingdom', stock_code: '85123A', description: 'WHITE HANGING HEART T-LIGHT HOLDER', quantity: 10, unit_price: 2.55, customer_id: '17850' });
  const [newReview, setNewReview] = useState({ product_id: 'P101', user_id: 'USER-888', rating: 5, sentiment: 'positive', review_text: 'Outstanding quality and super fast shipping!' });
  const [orderSubmitting, setOrderSubmitting]   = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  /* pipeline & log */
  const [pipelineStatus, setPipelineStatus] = useState({ etl: 'idle', mapreduce: 'idle', bloom: 'idle', ml: 'idle' });
  const [ingestionLog, setIngestionLog]     = useState([]);
  const logRef = useRef(null);

  /* ── fetch ── */
  const fetchAnalytics = async () => {
    try {
      const r1 = await fetch(`${API_BASE}/analytics/summary`);
      if (r1.ok) setData(await r1.json());
      const r2 = await fetch(`${API_BASE}/bloom/sample-ids`);
      if (r2.ok) setSampleIds(await r2.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAnalytics();
    const id = setInterval(fetchAnalytics, 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = 0; }, [ingestionLog]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); };
  const addLog = (msg, type = 'info') =>
    setIngestionLog(prev => [{ ts: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 30));

  /* ── pipeline ── */
  const handleTriggerPipeline = async () => {
    setRefreshing(true);
    setPipelineStatus({ etl: 'running', mapreduce: 'running', bloom: 'running', ml: 'running' });
    addLog('Full PySpark pipeline triggered — all 4 jobs queued', 'pipeline');
    try {
      await fetch(`${API_BASE}/pipeline/trigger`, { method: 'POST' });
      showToast('Data Pipeline triggered!');
      setTimeout(() => {
        setPipelineStatus({ etl: 'done', mapreduce: 'done', bloom: 'done', ml: 'done' });
        addLog('Pipeline complete — analytics synced to MongoDB', 'success');
        fetchAnalytics(); setRefreshing(false);
      }, 4000);
    } catch { setRefreshing(false); setPipelineStatus({ etl: 'idle', mapreduce: 'idle', bloom: 'idle', ml: 'idle' }); }
  };

  /* ── traffic sim ── */
  const handleSimulateTraffic = async (mode = 'normal', count = 100) => {
    setSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/stream/simulate?count=${count}&mode=${mode}`, { method: 'POST' });
      if (res.ok) {
        const r = await res.json();
        setLiveStreamLogs(prev => [...(r.recent_events || []), ...prev].slice(0, 15));
        setStreamStats(prev => {
          const next = { total: prev.total + count, unique: prev.unique + (r.generated_count - r.duplicates_detected), dups: prev.dups + r.duplicates_detected, bots: prev.bots + r.bot_threats };
          setStreamHistory(h => [...h, { batch: h.length + 1, unique: next.unique, duplicates: next.dups }].slice(-10));
          return next;
        });
        showToast(`Injected ${count} ${mode.replace('_', ' ')} events!`);
        fetchAnalytics();
      }
    } catch (e) { console.error(e); }
    finally { setSimulating(false); }
  };

  /* ── bloom test ── */
  const testIdentifier = async (id) => {
    const q = id || bloomTestInput; if (!q.trim()) return;
    setBloomTestInput(q);
    try {
      const res = await fetch(`${API_BASE}/bloom/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: q.trim() }) });
      if (res.ok) setBloomTestResult(await res.json());
    } catch (e) { console.error(e); }
  };

  /* ── order ── */
  const handleCreateOrder = async (e) => {
    e.preventDefault(); setOrderSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/orders/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrder) });
      if (res.ok) {
        const r = await res.json();
        showToast(r.message || 'Order created!');
        addLog(`Order #${r.invoice_no} · £${r.total_amount} · ${newOrder.country} [${newOrder.customer_id}]`, 'order');
        setPipelineStatus(p => ({ ...p, etl: 'running' }));
        setTimeout(() => { setPipelineStatus(p => ({ ...p, etl: 'done' })); fetchAnalytics(); }, 3500);
      }
    } catch (e) { console.error(e); }
    finally { setOrderSubmitting(false); }
  };

  /* ── review ── */
  const handleAddReview = async (e) => {
    e.preventDefault(); setReviewSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reviews/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReview) });
      if (res.ok) {
        const r = await res.json();
        showToast(r.message || 'Review submitted!');
        addLog(`Review ${r.review_id} · "${newReview.review_text.slice(0, 40)}…" [${newReview.sentiment}]`, 'review');
        setPipelineStatus(p => ({ ...p, mapreduce: 'running' }));
        setTimeout(() => { setPipelineStatus(p => ({ ...p, mapreduce: 'done' })); fetchAnalytics(); }, 3500);
      }
    } catch (e) { console.error(e); }
    finally { setReviewSubmitting(false); }
  };

  /* ── computed ── */
  const bloom          = data.bloom_filter || {};
  const countryList    = ['All', ...new Set((data.country_analytics || []).map(c => c.Country))];
  const productList    = ['All', ...new Set((data.market_basket || []).flatMap(r => [r.antecedent, r.consequent]))];
  const filteredCountries = selectedCountry === 'All' ? (data.country_analytics || []) : (data.country_analytics || []).filter(c => c.Country === selectedCountry);
  const filteredReviews   = (data.wordcount || []).filter(i => (reviewSentiment === 'all' || i.sentiment === reviewSentiment) && (!reviewSearch || i.word.toLowerCase().includes(reviewSearch.toLowerCase())));
  const filteredRfm       = (data.rfm_segmentation || []).filter(c => (rfmSegment === 'All' || c.segment === rfmSegment) && (!rfmSearch || String(c.customer_id).includes(rfmSearch)));
  const filteredBasket    = (data.market_basket || []).filter(r => (selectedProduct === 'All' || r.antecedent === selectedProduct || r.consequent === selectedProduct) && ((r.confidence || 0) * 100 >= confidenceThreshold));
  const totalRevenue      = (data.country_analytics || []).reduce((a, c) => a + (c.TotalRevenue || 0), 0);

  const sentimentDist = [
    { name: 'Positive', value: (data.wordcount || []).filter(w => w.sentiment === 'positive').length, color: '#10B981' },
    { name: 'Neutral',  value: (data.wordcount || []).filter(w => w.sentiment === 'neutral').length,  color: '#F59E0B' },
    { name: 'Negative', value: (data.wordcount || []).filter(w => w.sentiment === 'negative').length, color: '#EF4444' },
  ];
  const segmentDist = Object.entries(
    (data.rfm_segmentation || []).reduce((acc, c) => { acc[c.segment] = (acc[c.segment] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value, color: SEGMENT_COLORS[name] || '#94A3B8' }));

  const topWords     = [...filteredReviews].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 10);
  const topCustomers = [...(data.rfm_segmentation || [])].sort((a, b) => (b.monetary || 0) - (a.monetary || 0)).slice(0, 8);
  const scatterData  = (data.rfm_segmentation || []).slice(0, 60).map(c => ({ x: c.frequency || 0, y: Math.round(c.monetary || 0), z: 60 }));

  const NAVLINKS = [
    { id: 'overview',  label: 'Dashboard',          icon: Home },
    { id: 'sales',     label: 'Sales & Revenue',     icon: TrendingUp },
    { id: 'bloom',     label: 'Traffic Simulator',   icon: Zap },
    { id: 'mapreduce', label: 'Review Intelligence', icon: MessageSquare },
    { id: 'rfm',       label: 'Customer Cohorts',    icon: Users },
    { id: 'basket',    label: 'Recommendations',     icon: ShoppingCart },
    { id: 'ingest',    label: 'Ingestion Lab',       icon: PlusCircle },
  ];

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* ══ SIDEBAR ══ */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 z-40 shrink-0">
        <div>
          {/* Brand */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600 shadow-md shadow-blue-200">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-800">ShopPulse</h1>
                <p className="text-[10px] text-blue-500 font-semibold">Big Data Analytics</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live · MongoDB Connected
            </div>
          </div>

          {/* Nav */}
          <nav className="px-2.5 py-3 space-y-0.5">
            {NAVLINKS.map(tab => {
              const Ico = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}>
                  <div className="flex items-center gap-2.5">
                    <Ico className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3 h-3 text-blue-200" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span className="flex items-center gap-1"><Database className="w-3 h-3 text-emerald-500" /> MongoDB</span>
            <span className="text-emerald-600 font-semibold">Connected</span>
          </div>
          <button onClick={handleTriggerPipeline} disabled={refreshing}
            className="w-full bg-slate-100 hover:bg-slate-200 text-blue-600 text-[10px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 transition-all cursor-pointer disabled:opacity-40">
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Running…' : 'Run Pipeline'}
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-7 py-3.5 sticky top-0 z-30 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">{NAVLINKS.find(n => n.id === activeTab)?.label}</h2>
            <p className="text-[10px] text-slate-400">ShopPulse Analytics · Auto-refreshes every 8s</p>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600">
              <Activity className="w-3 h-3 text-blue-500" />
              Events: <strong className="text-slate-800 ml-1">{(bloom.total_events_processed || 0).toLocaleString()}</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-700">
              <Wifi className="w-3 h-3" /> API Online
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading Analytics Engine…</p>
            </div>
          ) : (
            <div style={{ animation: 'fadeSlide 0.2s ease-out' }}>

              {/* Global KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <KpiCard label="Total Revenue"       value={`£${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub={<><TrendingUp className="w-3 h-3" /> 540K+ transactions</>} icon={ShoppingCart} color="blue" />
                <KpiCard label="Unique Visitors"     value={(bloom.unique_visitors_bloomfilter || 0).toLocaleString()} sub={<><Sparkles className="w-3 h-3" /> Bloom FP: {bloom.estimated_fp_rate_pct || 0}%</>} icon={Filter} color="green" />
                <KpiCard label="Threats Blocked"     value={(bloom.duplicate_events_filtered || 0).toLocaleString()} sub={<><ShieldAlert className="w-3 h-3" /> Bot & duplicate events</>} icon={ShieldAlert} color="red" />
                <KpiCard label="Recommendation Rules" value={`${(data.market_basket || []).length} Rules`} sub={<><Award className="w-3 h-3" /> Co-purchase associations</>} icon={Award} color="indigo" />
              </div>

              {/* ── OVERVIEW ── */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <Panel>
                      <SectionTitle icon={TrendingUp} title="Monthly Revenue Trend" subtitle="PySpark batch ETL — 12 month aggregation" />
                      <div className="h-52 mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={MONTHLY_REVENUE}>
                            <defs>
                              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="month" fontSize={10} tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis fontSize={10} tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `£${(v/1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={TT} formatter={v => [`£${v.toLocaleString()}`, 'Revenue']} />
                            <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fill="url(#g1)" dot={{ fill: '#3B82F6', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Panel>

                    <Panel>
                      <SectionTitle icon={Activity} title="Sales Conversion Funnel" color="text-indigo-600" subtitle="Customer journey drop-off analysis" />
                      <div className="h-52 mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={FUNNEL_DATA} layout="vertical">
                            <XAxis type="number" fontSize={10} tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="stage" fontSize={10} width={75} tick={{ fill: '#64748B' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TT} />
                            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                              {FUNNEL_DATA.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Panel>
                  </div>

                  {/* Pipeline Status */}
                  <Panel>
                    <SectionTitle icon={GitBranch} title="PySpark Pipeline Health" color="text-violet-600" subtitle="Real-time job execution status" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                      <PipelineBadge label="Batch ETL"        status={pipelineStatus.etl} />
                      <PipelineBadge label="MapReduce"        status={pipelineStatus.mapreduce} />
                      <PipelineBadge label="Bloom Filter"     status={pipelineStatus.bloom} />
                      <PipelineBadge label="ML Engine"        status={pipelineStatus.ml} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
                      {[
                        { label: 'Dataset Size',    val: '540K+ rows',         cls: 'text-slate-700' },
                        { label: 'Bloom Filter Bits', val: `${(bloom.bloom_filter_size_bits||20000).toLocaleString()} bits`, cls: 'text-slate-700' },
                        { label: 'NoSQL Store',     val: 'MongoDB Connected',  cls: 'text-emerald-600 font-semibold' },
                      ].map((s,i) => (
                        <div key={i}><p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">{s.label}</p><p className={s.cls}>{s.val}</p></div>
                      ))}
                    </div>
                  </Panel>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Countries Served',  val: (data.country_analytics || []).length,   icon: Globe,        cls: 'text-blue-600',   bg: 'bg-blue-50' },
                      { label: 'Customer Segments', val: segmentDist.length,                      icon: Users,        cls: 'text-violet-600', bg: 'bg-violet-50' },
                      { label: 'Review Keywords',   val: (data.wordcount || []).length,            icon: MessageSquare,cls: 'text-emerald-600',bg: 'bg-emerald-50' },
                      { label: 'Top Products',      val: (data.top_products || []).length,         icon: Package,      cls: 'text-amber-600',  bg: 'bg-amber-50' },
                    ].map((s,i) => (
                      <div key={i} className={`${s.bg} rounded-2xl border border-slate-200 p-4 flex items-center gap-3`}>
                        <s.icon className={`w-5 h-5 ${s.cls}`} />
                        <div>
                          <p className="text-xl font-black text-slate-800">{s.val}</p>
                          <p className="text-[10px] text-slate-500">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SALES ── */}
              {activeTab === 'sales' && (
                <div className="space-y-5">
                  <Panel className="flex flex-wrap items-center justify-between gap-3 !p-4">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <label className="text-xs font-bold text-slate-600">Filter Region:</label>
                      <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}
                        className="bg-white text-slate-700 text-xs border border-slate-300 rounded-xl px-3 py-2 cursor-pointer focus:border-blue-400 outline-none">
                        {countryList.map((c,i) => <option key={i}>{c}</option>)}
                      </select>
                    </div>
                    <span className="text-xs text-slate-500">
                      <strong className="text-slate-800">{filteredCountries.length}</strong> regions ·
                      Total: <strong className="text-emerald-600">£{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                    </span>
                  </Panel>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <Panel>
                      <SectionTitle icon={TrendingUp} title="Revenue by Region" subtitle="PySpark groupBy().agg() on 540K rows" />
                      <div className="h-56 mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={filteredCountries.slice(0, 10)}>
                            <XAxis dataKey="Country" fontSize={9} tick={{ fill: '#94A3B8' }} angle={-20} textAnchor="end" height={40} axisLine={false} tickLine={false} />
                            <YAxis fontSize={10} tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `£${(v/1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={TT} formatter={v => [`£${v.toLocaleString()}`, 'Revenue']} />
                            <Bar dataKey="TotalRevenue" radius={[4,4,0,0]}>
                              {filteredCountries.slice(0,10).map((_,i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Panel>

                    <Panel>
                      <SectionTitle icon={Activity} title="Monthly Revenue Trend" color="text-indigo-600" />
                      <div className="h-56 mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={MONTHLY_REVENUE}>
                            <defs>
                              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15}/><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="month" fontSize={10} tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
                            <YAxis fontSize={10} tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `£${(v/1000).toFixed(0)}k`}/>
                            <Tooltip contentStyle={TT} formatter={v => [`£${v.toLocaleString()}`, 'Revenue']}/>
                            <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#g2)" dot={{ fill: '#8B5CF6', r: 3, strokeWidth: 0 }}/>
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Panel>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <Panel>
                      <SectionTitle icon={Filter} title="Conversion Funnel" color="text-emerald-600"/>
                      <div className="h-52 mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={FUNNEL_DATA} layout="vertical">
                            <XAxis type="number" fontSize={9} tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
                            <YAxis type="category" dataKey="stage" fontSize={9} width={70} tick={{ fill: '#64748B' }} axisLine={false} tickLine={false}/>
                            <Tooltip contentStyle={TT}/>
                            <Bar dataKey="count" radius={[0,4,4,0]}>{FUNNEL_DATA.map((e,i) => <Cell key={i} fill={e.fill}/>)}</Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Panel>

                    <Panel className="lg:col-span-2">
                      <SectionTitle icon={Award} title="Top Performing Products" color="text-amber-600" subtitle="Ranked by total revenue"/>
                      <div className="overflow-x-auto mt-3">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px]">
                            <tr><th className="p-2.5 rounded-tl-xl">Code</th><th className="p-2.5">Description</th><th className="p-2.5 text-right">Units</th><th className="p-2.5 text-right rounded-tr-xl">Revenue</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(data.top_products || []).map((item, i) => (
                              <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="p-2.5 font-mono text-blue-600 font-bold text-[11px]">{item.StockCode}</td>
                                <td className="p-2.5 truncate max-w-[180px] text-slate-700">{item.Description}</td>
                                <td className="p-2.5 text-right font-medium">{item.TotalUnitsSold}</td>
                                <td className="p-2.5 text-right text-emerald-600 font-bold">£{item.TotalRevenue?.toFixed(0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Panel>
                  </div>
                </div>
              )}

              {/* ── TRAFFIC / BLOOM ── */}
              {activeTab === 'bloom' && (
                <div className="space-y-5">
                  <Panel>
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500"/>Real-Time Traffic Stream Simulator</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Inject live events — Bloom Filter deduplicates in O(1)</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { mode:'normal',         count:200, label:'Inject 200 Events',  cls:'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',   Ico:Play },
                          { mode:'purchase_surge', count:300, label:'Purchase Surge',      cls:'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100', Ico:ShoppingCart },
                          { mode:'bot_attack',     count:500, label:'Bot Attack',          cls:'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100',   Ico:AlertTriangle },
                        ].map(({ mode, count, label, cls, Ico }) => (
                          <button key={mode} onClick={() => handleSimulateTraffic(mode, count)} disabled={simulating}
                            className={`${cls} border text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all`}>
                            <Ico className="w-3.5 h-3.5"/>{label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stream counters */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                      {[
                        { label:'Total Events',      val:(bloom.total_events_processed||0)+streamStats.total, cls:'bg-blue-50 text-blue-700 border-blue-100' },
                        { label:'Unique Visitors',   val:(bloom.unique_visitors_bloomfilter||0)+streamStats.unique, cls:'bg-emerald-50 text-emerald-700 border-emerald-100' },
                        { label:'Duplicates Blocked',val:(bloom.duplicate_events_filtered||0)+streamStats.dups, cls:'bg-amber-50 text-amber-700 border-amber-100' },
                        { label:'Bot Threats',       val:(bloom.bot_threats_blocked||0)+streamStats.bots, cls:'bg-rose-50 text-rose-700 border-rose-100' },
                      ].map((s,i) => (
                        <div key={i} className={`${s.cls} border rounded-xl p-3.5 text-center`}>
                          <p className="text-xl font-black tabular-nums">{s.val.toLocaleString()}</p>
                          <p className="text-[10px] font-semibold mt-0.5 opacity-70">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Stream history chart */}
                    {streamHistory.length > 0 && (
                      <div className="mb-5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Stream History</p>
                        <div className="h-36">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={streamHistory}>
                              <defs>
                                <linearGradient id="uG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                                <linearGradient id="dG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/></linearGradient>
                              </defs>
                              <XAxis dataKey="batch" fontSize={9} tick={{ fill:'#94A3B8' }} axisLine={false} tickLine={false}/>
                              <YAxis fontSize={9} tick={{ fill:'#94A3B8' }} axisLine={false} tickLine={false}/>
                              <Tooltip contentStyle={TT}/>
                              <Area type="monotone" dataKey="unique"     stroke="#10B981" strokeWidth={2} fill="url(#uG)" name="Unique"/>
                              <Area type="monotone" dataKey="duplicates" stroke="#EF4444" strokeWidth={2} fill="url(#dG)" name="Duplicates"/>
                              <Legend wrapperStyle={{ fontSize:10, color:'#64748B' }}/>
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Bloom lookup */}
                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5 text-blue-500"/>O(1) Bloom Filter Membership Test
                      </label>
                      <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex-1 min-w-[240px] relative">
                          <input type="text" placeholder="Enter User ID or IP address…" value={bloomTestInput}
                            onChange={e => setBloomTestInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && testIdentifier()}
                            className="w-full bg-white text-slate-800 text-xs border border-slate-300 rounded-xl px-4 py-3 pr-10 outline-none focus:border-blue-400"/>
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5"/>
                        </div>
                        <button onClick={() => testIdentifier()}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-3 rounded-xl cursor-pointer transition-all shadow-sm">
                          Test Membership
                        </button>
                      </div>
                      {/* Sample chips */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Sample IDs:</span>
                        {[...(sampleIds.sample_user_ids||[]),...(sampleIds.sample_bot_ids||[])].map((s,i) => (
                          <button key={i} onClick={() => testIdentifier(s)}
                            className="bg-slate-100 hover:bg-blue-50 hover:border-blue-300 text-slate-600 font-mono text-[10px] px-2 py-1 rounded-lg border border-slate-200 cursor-pointer transition-all">
                            {s}
                          </button>
                        ))}
                      </div>
                      {bloomTestResult && (
                        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                          bloomTestResult.might_exist
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          <div className="flex items-center gap-2">
                            {bloomTestResult.might_exist ? <AlertTriangle className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                            <span><strong className="font-mono">{bloomTestResult.identifier}</strong>: {bloomTestResult.might_exist ? ' IN BITARRAY — KNOWN / DUPLICATE' : ' NOT IN BITARRAY — NEW UNIQUE VISITOR'}</span>
                          </div>
                          <span className="font-mono text-[10px] opacity-70">FP: {bloomTestResult.false_positive_rate_pct}%</span>
                        </div>
                      )}
                    </div>
                  </Panel>

                  {liveStreamLogs.length > 0 && (
                    <Panel>
                      <div className="flex items-center justify-between mb-3">
                        <SectionTitle icon={Terminal} title="Live Event Stream Log" color="text-emerald-600"/>
                        <span className="text-[10px] text-slate-400">{liveStreamLogs.length} events</span>
                      </div>
                      <div className="space-y-1.5 max-h-52 overflow-y-auto">
                        {liveStreamLogs.map((evt, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-slate-400">{evt.timestamp}</span>
                              <span className="font-mono text-blue-600 font-bold">{evt.user_id}</span>
                              <span className="text-slate-400">({evt.ip_address})</span>
                              <span className="bg-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-600 uppercase font-bold">{evt.event_type}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${evt.is_duplicate ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {evt.is_duplicate ? 'Blocked' : 'Allowed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  )}
                </div>
              )}

              {/* ── REVIEW INTELLIGENCE ── */}
              {activeTab === 'mapreduce' && (
                <div className="space-y-5">
                  <Panel className="!p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {['all','positive','neutral','negative'].map(s => (
                        <button key={s} onClick={() => setReviewSentiment(s)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize cursor-pointer transition-all ${
                            reviewSentiment === s
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}>{s}</button>
                      ))}
                    </div>
                    <div className="relative min-w-[220px]">
                      <input type="text" placeholder="Search keyphrases…" value={reviewSearch} onChange={e => setReviewSearch(e.target.value)}
                        className="w-full bg-white text-slate-700 text-xs border border-slate-300 rounded-xl px-4 py-2.5 pl-9 outline-none focus:border-blue-400"/>
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5"/>
                    </div>
                  </Panel>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-5">
                      <Panel>
                        <SectionTitle icon={BarChart2} title="Top Keyphrase Frequencies" color="text-indigo-600" subtitle="MapReduce reduce output — word counts by sentiment"/>
                        <div className="h-52 mt-3">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topWords} margin={{ bottom: 20 }}>
                              <XAxis dataKey="word" fontSize={9} tick={{ fill:'#94A3B8' }} angle={-30} textAnchor="end" height={45} axisLine={false} tickLine={false}/>
                              <YAxis fontSize={10} tick={{ fill:'#94A3B8' }} axisLine={false} tickLine={false}/>
                              <Tooltip contentStyle={TT}/>
                              <Bar dataKey="count" radius={[4,4,0,0]}>{topWords.map((item,i) => <Cell key={i} fill={SENTIMENT_COLORS[item.sentiment]||'#3B82F6'}/>)}</Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </Panel>
                      <Panel>
                        <div className="flex items-center justify-between mb-3">
                          <SectionTitle icon={Hash} title="Keyphrase Cloud" color="text-emerald-600"/>
                          <span className="text-[10px] text-slate-400">{filteredReviews.length} terms</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {filteredReviews.map((item, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-transform hover:scale-105 cursor-default"
                              style={{ backgroundColor:`${SENTIMENT_COLORS[item.sentiment]||'#3B82F6'}18`, borderColor:`${SENTIMENT_COLORS[item.sentiment]||'#3B82F6'}40`, color: SENTIMENT_COLORS[item.sentiment]||'#3B82F6' }}>
                              {item.word}
                              <span className="bg-black/10 px-1.5 py-0.5 rounded text-[10px] font-bold">{item.count}</span>
                            </span>
                          ))}
                        </div>
                      </Panel>
                    </div>

                    <Panel>
                      <SectionTitle icon={Activity} title="Sentiment Ratio" color="text-rose-500" subtitle="Distribution across reviews"/>
                      <div className="h-48 mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={sentimentDist} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={65} innerRadius={28} paddingAngle={3} label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                              {sentimentDist.map((e,i) => <Cell key={i} fill={e.color}/>)}
                            </Pie>
                            <Tooltip contentStyle={TT}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2 border-t border-slate-100 pt-3 mt-2">
                        {sentimentDist.map((s,i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}/>
                              <span className="text-slate-600">{s.name}</span>
                            </div>
                            <span className="font-bold text-slate-800">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </div>
                </div>
              )}

              {/* ── CUSTOMER COHORTS ── */}
              {activeTab === 'rfm' && (
                <div className="space-y-5">
                  <Panel className="!p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-slate-600">Cohort:</label>
                      <select value={rfmSegment} onChange={e => setRfmSegment(e.target.value)}
                        className="bg-white text-slate-700 text-xs border border-slate-300 rounded-xl px-3 py-2 cursor-pointer outline-none focus:border-blue-400">
                        {['All','VIP Champions','Loyal Customers','Potential Loyalists','At Risk / New'].map((s,i)=><option key={i}>{s}</option>)}
                      </select>
                    </div>
                    <div className="relative min-w-[200px]">
                      <input type="text" placeholder="Search Customer ID…" value={rfmSearch} onChange={e => setRfmSearch(e.target.value)}
                        className="w-full bg-white text-slate-700 text-xs border border-slate-300 rounded-xl px-4 py-2.5 pl-9 outline-none focus:border-blue-400"/>
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5"/>
                    </div>
                  </Panel>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <Panel className="lg:col-span-2">
                      <SectionTitle icon={Users} title="Customer Value Matrix" subtitle={`${filteredRfm.length} customers · RFM segmentation`}/>
                      <div className="overflow-x-auto max-h-72 overflow-y-auto mt-3">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] sticky top-0">
                            <tr><th className="p-2.5">ID</th><th className="p-2.5 text-center">Orders</th><th className="p-2.5 text-right">Spend</th><th className="p-2.5 text-center">Cohort</th><th className="p-2.5 text-center">Action</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredRfm.map((c,i) => (
                              <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="p-2.5 font-mono text-blue-600 font-bold text-[11px]">#{c.customer_id}</td>
                                <td className="p-2.5 text-center">{c.frequency}</td>
                                <td className="p-2.5 text-right text-emerald-600 font-bold">£{c.monetary?.toFixed(0)}</td>
                                <td className="p-2.5 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                                    style={{ backgroundColor:`${SEGMENT_COLORS[c.segment]||'#94A3B8'}18`, borderColor:`${SEGMENT_COLORS[c.segment]||'#94A3B8'}40`, color:SEGMENT_COLORS[c.segment]||'#64748B' }}>
                                    {c.segment}
                                  </span>
                                </td>
                                <td className="p-2.5 text-center">
                                  <button onClick={() => setSelectedCustomer(c)}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-blue-200 flex items-center gap-1 mx-auto cursor-pointer">
                                    <Eye className="w-2.5 h-2.5"/> Profile
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Panel>

                    <div className="space-y-4">
                      <Panel>
                        <SectionTitle icon={Layers} title="Segment Split" color="text-violet-600"/>
                        <div className="h-44 mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={segmentDist} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={22} paddingAngle={3}>
                                {segmentDist.map((e,i) => <Cell key={i} fill={e.color}/>)}
                              </Pie>
                              <Tooltip contentStyle={TT}/>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        {segmentDist.map((s,i) => (
                          <div key={i} className="flex items-center justify-between text-[10px] mt-1">
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor:s.color }}/><span className="text-slate-500">{s.name}</span></div>
                            <span className="font-bold text-slate-700">{s.value}</span>
                          </div>
                        ))}
                      </Panel>

                      <Panel>
                        <SectionTitle icon={Award} title="Top Customers" color="text-amber-600" subtitle="By lifetime spend"/>
                        <div className="h-44 mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCustomers} layout="vertical">
                              <XAxis type="number" fontSize={9} tick={{ fill:'#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v=>`£${(v/1000).toFixed(0)}k`}/>
                              <YAxis type="category" dataKey="customer_id" fontSize={9} width={50} tick={{ fill:'#64748B' }} axisLine={false} tickLine={false} tickFormatter={v=>`#${v}`}/>
                              <Tooltip contentStyle={TT} formatter={v => [`£${v.toFixed(0)}`,'Spend']}/>
                              <Bar dataKey="monetary" radius={[0,4,4,0]}>{topCustomers.map((c,i) => <Cell key={i} fill={SEGMENT_COLORS[c.segment]||'#94A3B8'}/>)}</Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </Panel>
                    </div>
                  </div>

                  <Panel>
                    <SectionTitle icon={Sparkles} title="Customer Value Scatter Plot" color="text-indigo-600" subtitle="Frequency vs Monetary — spot VIP clusters"/>
                    <div className="h-52 mt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                          <XAxis dataKey="x" name="Orders" fontSize={10} tick={{ fill:'#94A3B8' }} axisLine={false} tickLine={false} label={{ value:'Order Frequency', position:'insideBottom', offset:-4, fill:'#94A3B8', fontSize:10 }}/>
                          <YAxis dataKey="y" name="Spend" fontSize={10} tick={{ fill:'#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v=>`£${v}`} label={{ value:'Spend (£)', angle:-90, position:'insideLeft', fill:'#94A3B8', fontSize:10 }}/>
                          <ZAxis dataKey="z" range={[35,35]}/>
                          <Tooltip contentStyle={TT} formatter={(v,name) => [name==='Spend'?`£${v}`:v, name==='Orders'?'Orders':'Spend']}/>
                          <Scatter data={scatterData} fill="#6366F1" opacity={0.6}/>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </Panel>
                </div>
              )}

              {/* ── RECOMMENDATIONS ── */}
              {activeTab === 'basket' && (
                <div className="space-y-5">
                  <Panel className="!p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-slate-600">Product:</label>
                        <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
                          className="bg-white text-slate-700 text-xs border border-slate-300 rounded-xl px-3 py-2 cursor-pointer max-w-[220px] outline-none focus:border-blue-400">
                          {productList.map((p,i) => <option key={i}>{p}</option>)}
                        </select>
                      </div>
                      <span className="text-xs text-slate-500"><strong className="text-slate-800">{filteredBasket.length}</strong> rules · confidence ≥ {confidenceThreshold}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sliders className="w-3.5 h-3.5 text-indigo-500 shrink-0"/>
                      <label className="text-[11px] font-bold text-slate-500 w-36">Min Confidence: {confidenceThreshold}%</label>
                      <input type="range" min={0} max={100} step={5} value={confidenceThreshold} onChange={e => setConfidenceThreshold(Number(e.target.value))} className="flex-1"/>
                      <span className="text-xs font-bold text-indigo-600 w-10 text-right">{confidenceThreshold}%</span>
                    </div>
                  </Panel>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBasket.map((rule, i) => {
                      const conf = Math.round((rule.confidence || 0) * 100);
                      return (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-indigo-300 hover:shadow-md transition-all space-y-3">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-xl flex-1 font-semibold text-center truncate">{rule.antecedent}</div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0"/>
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl flex-1 font-semibold text-center truncate">{rule.consequent}</div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1.5"><span>Confidence</span><span className="text-indigo-600 font-bold">{conf}%</span></div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width:`${conf}%` }}/>
                            </div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                            <span>Co-purchases: <strong className="text-slate-700">{rule.co_purchase_count}</strong></span>
                            <span className="text-indigo-500 font-bold">{conf}% confidence</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {filteredBasket.length === 0 && (
                    <div className="text-center py-16 text-slate-400 text-sm">No rules match — try lowering the confidence threshold</div>
                  )}
                </div>
              )}

              {/* ── DATA INGESTION LAB ── */}
              {activeTab === 'ingest' && (
                <div className="space-y-5">
                  <Panel>
                    <SectionTitle icon={GitBranch} title="PySpark Pipeline Status" color="text-violet-600" subtitle="Real-time job execution state"/>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                      <PipelineBadge label="Batch ETL"    status={pipelineStatus.etl}/>
                      <PipelineBadge label="MapReduce"    status={pipelineStatus.mapreduce}/>
                      <PipelineBadge label="Bloom Filter" status={pipelineStatus.bloom}/>
                      <PipelineBadge label="ML Engine"    status={pipelineStatus.ml}/>
                    </div>
                    <button onClick={handleTriggerPipeline} disabled={refreshing}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-sm transition-all">
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshing?'animate-spin':''}`}/>
                      {refreshing ? 'Running All PySpark Jobs…' : 'Run Full Data Pipeline'}
                    </button>
                  </Panel>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Order form */}
                    <Panel>
                      <SectionTitle icon={PlusCircle} title="Create Custom Order" subtitle="Injects into dataset → triggers ETL → MongoDB sync"/>
                      <form onSubmit={handleCreateOrder} className="space-y-3 mt-3">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label:'Country',     key:'country',     type:'text' },
                            { label:'Customer ID', key:'customer_id', type:'text' },
                            { label:'Stock Code',  key:'stock_code',  type:'text' },
                            { label:'Quantity',    key:'quantity',    type:'number' },
                          ].map(({ label, key, type }) => (
                            <div key={key}>
                              <label className="text-[10px] text-slate-500 font-bold uppercase">{label}</label>
                              <input type={type} value={newOrder[key]}
                                onChange={e => setNewOrder({ ...newOrder, [key]: type==='number' ? parseInt(e.target.value) : e.target.value })}
                                className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 mt-1 outline-none focus:border-blue-400" required/>
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Product Description</label>
                          <input type="text" value={newOrder.description} onChange={e => setNewOrder({ ...newOrder, description: e.target.value })}
                            className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 mt-1 outline-none focus:border-blue-400" required/>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Unit Price (£)</label>
                          <input type="number" step="0.01" value={newOrder.unit_price} onChange={e => setNewOrder({ ...newOrder, unit_price: parseFloat(e.target.value) })}
                            className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 mt-1 outline-none focus:border-blue-400" required/>
                        </div>
                        <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                          Order Total: <strong className="text-emerald-600">£{(newOrder.quantity * newOrder.unit_price).toFixed(2)}</strong> · Triggers PySpark ETL on submit
                        </div>
                        <button type="submit" disabled={orderSubmitting}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl cursor-pointer shadow-sm disabled:opacity-40 transition-all">
                          {orderSubmitting ? 'Creating & Ingesting…' : 'Submit Order to Pipeline'}
                        </button>
                      </form>
                    </Panel>

                    {/* Review form */}
                    <Panel>
                      <SectionTitle icon={MessageSquare} title="Submit Customer Review" color="text-indigo-600" subtitle="Adds to corpus → triggers MapReduce re-analysis"/>
                      <form onSubmit={handleAddReview} className="space-y-3 mt-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Product ID</label>
                            <input type="text" value={newReview.product_id} onChange={e => setNewReview({ ...newReview, product_id:e.target.value })}
                              className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 mt-1 outline-none focus:border-blue-400" required/>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase">User ID</label>
                            <input type="text" value={newReview.user_id} onChange={e => setNewReview({ ...newReview, user_id:e.target.value })}
                              className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 mt-1 outline-none focus:border-blue-400" required/>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Rating (1–5)</label>
                            <input type="number" min={1} max={5} value={newReview.rating} onChange={e => setNewReview({ ...newReview, rating:parseInt(e.target.value) })}
                              className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 mt-1 outline-none focus:border-blue-400" required/>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Sentiment</label>
                            <select value={newReview.sentiment} onChange={e => setNewReview({ ...newReview, sentiment:e.target.value })}
                              className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 mt-1 cursor-pointer outline-none focus:border-blue-400">
                              <option value="positive">Positive</option>
                              <option value="neutral">Neutral</option>
                              <option value="negative">Negative</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Review Text</label>
                          <textarea rows={3} value={newReview.review_text} onChange={e => setNewReview({ ...newReview, review_text:e.target.value })}
                            className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-2.5 mt-1 resize-none outline-none focus:border-blue-400" required/>
                        </div>
                        <div className="flex gap-2">
                          {['Outstanding quality!','Poor packaging, arrived damaged.','Average product, okay price.'].map((t,i) => (
                            <button key={i} type="button" onClick={() => setNewReview({ ...newReview, review_text:t })}
                              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-500 px-2 py-1 rounded-lg border border-slate-200 cursor-pointer flex-1 text-center truncate">
                              {t.slice(0,18)}…
                            </button>
                          ))}
                        </div>
                        <button type="submit" disabled={reviewSubmitting}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl cursor-pointer shadow-sm disabled:opacity-40 transition-all">
                          {reviewSubmitting ? 'Submitting & Running MapReduce…' : 'Submit Review to Engine'}
                        </button>
                      </form>
                    </Panel>
                  </div>

                  {/* Activity Log */}
                  <Panel>
                    <div className="flex items-center justify-between mb-3">
                      <SectionTitle icon={Terminal} title="Ingestion Activity Log" color="text-emerald-600" subtitle="Live log of all pipeline operations"/>
                      {ingestionLog.length > 0 && (
                        <button onClick={() => setIngestionLog([])} className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer">
                          <X className="w-3 h-3"/>Clear
                        </button>
                      )}
                    </div>
                    {ingestionLog.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No activity yet — submit an order or review to see the log</p>
                    ) : (
                      <div ref={logRef} className="space-y-1.5 max-h-52 overflow-y-auto">
                        {ingestionLog.map((entry, i) => {
                          const typeColors = { order:'text-blue-600', review:'text-indigo-600', pipeline:'text-amber-600', success:'text-emerald-600', info:'text-slate-500' };
                          const typeBg    = { order:'bg-blue-50 border-blue-200', review:'bg-indigo-50 border-indigo-200', pipeline:'bg-amber-50 border-amber-200', success:'bg-emerald-50 border-emerald-200', info:'bg-slate-50 border-slate-200' };
                          const prefix    = { order:'📦 ORDER', review:'⭐ REVIEW', pipeline:'⚙️ PIPELINE', success:'✅ DONE', info:'ℹ️ INFO' };
                          return (
                            <div key={i} className={`text-[11px] ${typeBg[entry.type]||'bg-slate-50 border-slate-200'} border rounded-xl px-3 py-2 flex items-start gap-2`}>
                              <span className="text-slate-400 font-mono shrink-0">{entry.ts}</span>
                              <span className={`font-bold shrink-0 ${typeColors[entry.type]||'text-slate-500'}`}>{prefix[entry.type]||''}</span>
                              <span className="text-slate-600">{entry.msg}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Panel>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500"/>Customer #{selectedCustomer.customer_id}
              </h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4"/></button>
            </div>
            <div className="space-y-3 text-xs">
              {[
                { label:'Order Frequency',   val:`${selectedCustomer.frequency} orders` },
                { label:'Lifetime Spend',    val:`£${selectedCustomer.monetary?.toFixed(2)}`, cls:'text-emerald-600 font-bold' },
                { label:'Cohort Segment',    val:selectedCustomer.segment },
              ].map((r,i) => (
                <div key={i} className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">{r.label}</span>
                  <span className={r.cls || 'text-slate-800 font-semibold'}
                    style={r.label === 'Cohort Segment' ? { color: SEGMENT_COLORS[selectedCustomer.segment] || '#64748B', fontWeight: 700 } : {}}>
                    {r.val}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl text-xs border"
              style={{ backgroundColor:`${SEGMENT_COLORS[selectedCustomer.segment]||'#94A3B8'}12`, borderColor:`${SEGMENT_COLORS[selectedCustomer.segment]||'#94A3B8'}30` }}>
              <p className="font-bold mb-1" style={{ color: SEGMENT_COLORS[selectedCustomer.segment]||'#64748B' }}>Marketing Recommendation</p>
              <p className="text-slate-500">
                {selectedCustomer.segment === 'VIP Champions'        && 'Offer exclusive VIP rewards and early product access.'}
                {selectedCustomer.segment === 'Loyal Customers'      && 'Send loyalty points and personalised upsell offers.'}
                {selectedCustomer.segment === 'Potential Loyalists'  && 'Target with discount coupons to boost purchase frequency.'}
                {selectedCustomer.segment === 'At Risk / New'        && 'Send a win-back email with a special first-order discount.'}
              </p>
            </div>
            <button onClick={() => setSelectedCustomer(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-all">
              Close Profile
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlide { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        input[type=range] { -webkit-appearance:none; height:4px; background:#E2E8F0; border-radius:4px; outline:none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; background:#6366F1; border-radius:50%; cursor:pointer; box-shadow:0 1px 4px rgba(99,102,241,.4); }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:4px; }
        .tabular-nums { font-variant-numeric:tabular-nums; font-feature-settings:"tnum"; }
      `}</style>
    </div>
  );
}
