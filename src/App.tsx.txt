/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from "react";
import { 
  Activity, 
  Cpu, 
  Globe, 
  Search, 
  Smartphone,
  HardDrive,
  Infinity as InfinityIcon,
  Zap,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  User, 
  Wallet,
  ChevronRight,
  Info,
  ShieldCheck,
  RefreshCcw,
  ExternalLink,
  Github,
  Moon,
  Sun,
  Languages,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  History,
  Clock,
  PieChart as PieChartIcon,
  ArrowLeftRight,
  Star,
  Box,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatHashrate(hs: number) {
  const h = parseFloat(hs.toString()) || 0;
  if (h >= 1e9) return (h / 1e9).toFixed(2) + " GH/s";
  if (h >= 1e6) return (h / 1e6).toFixed(2) + " MH/s";
  if (h >= 1e3) return (h / 1e3).toFixed(2) + " kH/s";
  return h.toFixed(2) + " H/s";
}

function getMinerColor(name: string) {
  const n = name.toLowerCase();
  if (n.includes("esp32")) return "#9C27B0"; // Purple
  if (n.includes("esp8266")) return "#546E7A"; // Grey Blue
  if (n.includes("arduino")) return "#4CAF50"; // Green
  if (n.includes("rpi") || n.includes("raspberry")) return "#00BCD4"; // Cyan
  if (n.includes("cpu") || n.includes("computer")) return "#FFB300"; // Orange
  if (n.includes("web") || n.includes("browser")) return "#F44336"; // Red
  if (n.includes("phone") || n.includes("android") || n.includes("ios")) return "#3F51B5"; // Indigo
  return "#424242"; // Grey
}

function getMinerIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("phone") || n.includes("android")) return <Smartphone className="w-4 h-4" />;
  if (n.includes("web") || n.includes("browser")) return <Globe className="w-4 h-4" />;
  if (n.includes("other")) return <InfinityIcon className="w-4 h-4" />;
  if (n.includes("cpu") || n.includes("computer")) return <HardDrive className="w-4 h-4" />;
  if (n.includes("rpi")) return <Box className="w-4 h-4" />;
  return <Cpu className="w-4 h-4" />;
}

// --- Types ---
type Language = "ru" | "en" | "pl";
type Tab = "monitoring" | "account";

interface Miner {
  hashrate: number;
  identifier: string;
  algorithm: string;
  accepted: number;
  rejected: number;
  diff: number;
  software: string;
  pool?: string;
  ping?: number;
  threadid?: string | number;
  type?: string;
}

interface Transaction {
  datetime: string;
  sender: string;
  recipient: string;
  amount: number;
  memo: string;
  hash: string;
}

interface DucoData {
  miners: Miner[];
  balance: {
    balance: number;
    username: string;
    created: string;
    verified?: string;
  };
  transactions?: Transaction[];
}

// --- Translations ---
const translations = {
    ru: {
        title: "Hleb Duino-Coin Monitor",
        monitoring: "Мониторинг",
        account: "Аккаунт",
        placeholder: "Введите никнейм DUCO...",
        btnSearch: "Поиск",
        lblHashrate: "Общий Хешрейт",
        lblWorkers: "Устройства",
        lblDifficulty: "Сложность",
        lblChartTitle: "График хешрейта",
        lblApprox: "Примерно",
        lblMinerProfile: "Duino-Coin Miner Profile",
        thWorker: "Worker ID",
        thAlgo: "Алгоритм",
        thHashrate: "Хешрейт",
        thEff: "Эфф.",
        thShares: "Шары",
        thStatus: "Статус",
        statusOnline: "ОНЛАЙН",
        statusOffline: "ОФФЛАЙН",
        errUser: "Введите имя пользователя.",
        err404: "Пользователь не найден (404)",
        loading: "Загрузка...",
        noMiners: "Нет активных майнеров",
        thUptime: "Сложность",
        balance: "Баланс",
        duco: "DUCO",
        policy: "Политика конфиденциальности",
        lblRecentTrans: "Последние транзакции",
        lblMinerDist: "Распределение майнеров",
        lblEstProfit: "Предполагаемая прибыль",
        lblEarnedCoins: "Добытые монеты",
        lblTotalMiners: "Всего майнеров",
        lblMin: "Мин",
        lblMax: "Макс",
        lblAvg: "Средний",
        lblIn24h: "через 24 часа",
        lblDaily: "Суточный",
        lblWeekly: "Недельный",
        lblCreated: "Создан",
        lblVerified: "Верифицирован",
        lblYes: "Да",
        lblNo: "Нет",
        lblFrom: "от",
        lblTo: "для",
        thSoftware: "ПО",
        thIdentifier: "ID Воркера",
        thAccepted: "Принято",
        thRejected: "Отклонено",
        thDiff: "Сложность",
        thPing: "Пинг",
        thPool: "Пул",
        thType: "Тип",
        thThread: "Поток"
    },
    en: {
        title: "Hleb Duino-Coin Monitor",
        monitoring: "Monitoring",
        account: "Account",
        placeholder: "Enter DUCO username...",
        btnSearch: "Search",
        lblHashrate: "Total Hashrate",
        lblWorkers: "Your Workers",
        lblDifficulty: "Difficulty",
        lblChartTitle: "Hashrate Chart",
        lblApprox: "Approx.",
        lblMinerProfile: "Duino-Coin Miner Profile",
        thWorker: "Worker ID",
        thAlgo: "Algorithm",
        thHashrate: "Hashrate",
        thEff: "Eff.",
        thShares: "Shares",
        thStatus: "Status",
        statusOnline: "ONLINE",
        statusOffline: "OFFLINE",
        errUser: "Please enter a username.",
        err404: "User not found (404)",
        loading: "Loading...",
        noMiners: "No active miners",
        thUptime: "Difficulty",
        balance: "Balance",
        duco: "DUCO",
        policy: "Privacy Policy",
        lblRecentTrans: "Recent Transactions",
        lblMinerDist: "Miner Distribution",
        lblEstProfit: "Estimated Profit",
        lblEarnedCoins: "Earned Coins",
        lblTotalMiners: "Total Miners",
        lblMin: "Min",
        lblMax: "Max",
        lblAvg: "Avg",
        lblIn24h: "in 24h",
        lblDaily: "Daily",
        lblWeekly: "Weekly",
        lblCreated: "Created At",
        lblVerified: "Verified",
        lblYes: "Yes",
        lblNo: "No",
        lblFrom: "from",
        lblTo: "to",
        thSoftware: "Software",
        thIdentifier: "Identifier",
        thAccepted: "Accepted",
        thRejected: "Rejected",
        thDiff: "Diff",
        thPing: "Ping",
        thPool: "Pool",
        thType: "Type",
        thThread: "Thread ID"
    },
    pl: {
        title: "Hleb Duino-Coin Monitor",
        monitoring: "Monitorowanie",
        account: "Konto",
        placeholder: "Wpisz nazwę użytkownika...",
        btnSearch: "Szukaj",
        lblHashrate: "Całkowity Hashrate",
        lblWorkers: "Twoi Górnicy",
        lblDifficulty: "Trudność",
        lblChartTitle: "Wykres wydajności",
        lblApprox: "Wartość",
        lblMinerProfile: "Profil górnika Duino-Coin",
        thWorker: "ID Górnika",
        thAlgo: "Algorytm",
        thHashrate: "Wydajność",
        thEff: "Wydajn.",
        thShares: "Udziały",
        thStatus: "Status",
        statusOnline: "AKTYWNY",
        statusOffline: "NIEAKTYWNY",
        errUser: "Wpisz nazwę użytkownika.",
        err404: "Użytkownik nie znaleziony (404)",
        loading: "Ładowanie...",
        noMiners: "Brak aktywnych górników",
        thUptime: "Trudność",
        balance: "Saldo",
        duco: "DUCO",
        policy: "Polityka prywatności",
        lblRecentTrans: "Ostatnie transakcje",
        lblMinerDist: "Dystrybucja górników",
        lblEstProfit: "Przewidywany zysk",
        lblEarnedCoins: "Wydobyte monety",
        lblTotalMiners: "Suma górników",
        lblMin: "Min",
        lblMax: "Maks",
        lblAvg: "Średnio",
        lblIn24h: "w 24h",
        lblDaily: "Dzienny",
        lblWeekly: "Tygodniowy",
        lblCreated: "Utworzono",
        lblVerified: "Weryfikacja",
        lblYes: "Tak",
        lblNo: "Nie",
        lblFrom: "od",
        lblTo: "do",
        thSoftware: "Oprogramowanie",
        thIdentifier: "Identyfikator",
        thAccepted: "Zaakceptowane",
        thRejected: "Odrzucone",
        thDiff: "Diff",
        thPing: "Ping",
        thPool: "Pula",
        thType: "Typ",
        thThread: "ID Wątku"
    }
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("duco_lang");
    return (saved as Language) || "ru";
  });
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("duco_theme");
    return (saved === "light" ? "light" : "dark");
  });
  const [activeTab, setActiveTab] = useState<Tab>("monitoring");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DucoData | null>(null);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [price, setPrice] = useState(0.002);
  const [difficulty, setDifficulty] = useState(50);
  const [history, setHistory] = useState<{ time: string; val: number }[]>([]);
  const [showPolicy, setShowPolicy] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("duco_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem("duco_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("duco_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const processStats = (statsRes: any) => {
    if (!statsRes || typeof statsRes !== 'object') return;

    if (statsRes["Duco price"]) setPrice(parseFloat(statsRes["Duco price"]));
    if (statsRes["Current difficulty"]) setDifficulty(statsRes["Current difficulty"]);
      
    const rawDist = statsRes["Miner distribution"];
    if (rawDist && typeof rawDist === 'object' && Object.keys(rawDist).length > 0) {
      const entries = Object.entries(rawDist).filter(([name]) => 
        !["all", "total", "miners", "total miners", "other"].includes(name.toLowerCase())
      );

      const othersCount = (rawDist["Other"] || rawDist["other"] || 0) as number;
      const total = entries.reduce((acc, [, count]) => acc + (count as number), 0) + othersCount;
      
      if (total > 0) {
        const distribution = entries.map(([name, count]: [string, any]) => ({
          name: name.toUpperCase(),
          count,
          value: (count / total) * 100
        })).sort((a, b) => b.count - a.count);

        if (othersCount > 0) {
          distribution.push({
            name: "OTHER",
            count: othersCount,
            value: (othersCount / total) * 100
          });
        }
        
        setGlobalStats({
          totalMiners: total,
          distribution
        });
      }
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const resp = await fetch("https://server.duinocoin.com/statistics");
      if (!resp.ok) return;
      const statsRes = await resp.json();
      processStats(statsRes);
    } catch (e) {
      console.error("Fetch error:", e);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
    const interval = setInterval(fetchGlobalStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("duco_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (name: string) => {
    setFavorites(prev => 
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  const fetchData = async (isAuto = false, overrideName?: string) => {
    const targetUser = overrideName || username;
    if (!targetUser.trim()) {
      if (!isAuto) setError(t.errUser);
      return;
    }
    setError(null);
    if (!isAuto) setLoading(true);

    try {
      const [statsRes, userRes, transRes] = await Promise.all([
        fetch("https://server.duinocoin.com/statistics").then(r => r.json()),
        fetch(`https://server.duinocoin.com/users/${encodeURIComponent(targetUser.trim())}`).then(r => r.json()),
        fetch(`https://server.duinocoin.com/user_transactions/${encodeURIComponent(targetUser.trim())}`).then(r => r.json().catch(() => ({ success: false })))
      ]);

      processStats(statsRes);

      if (!userRes.success) throw new Error(t.err404);

      const result = userRes.result as DucoData;
      if (transRes.success) {
        result.transactions = transRes.result;
      }
      setData(result);

      const totalHR = result.miners.reduce((acc, m) => acc + (parseFloat(m.hashrate.toString()) || 0), 0);
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setHistory(prev => {
        const next = [...prev, { time, val: totalHR }];
        return next.slice(-40);
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (!isAuto) setLoading(false);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (data && username) {
      interval = setInterval(() => fetchData(true), 15000);
    }
    return () => clearInterval(interval);
  }, [data, username]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-5 min-h-screen flex flex-col font-sans">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-5 border-b border-[var(--header-border)] gap-5">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <img 
            src="/images/Hleb.png" 
            alt="Hleb Logo" 
            className="h-10 w-auto object-contain" 
            onError={(e) => (e.target as HTMLImageElement).src = "https://picsum.photos/seed/duino/64/64"} 
          />
          <h1 className="text-2xl font-bold tracking-tight text-[var(--duino-yellow)] whitespace-nowrap">{t.title}</h1>
        </div>

        <div className="flex items-center gap-2 order-2 sm:order-none">
          <button 
            className="w-10 h-10 rounded-[var(--radius)] bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] flex items-center justify-center hover:border-[var(--duino-blue)] transition-all"
            onClick={() => setTheme(th => th === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            className="h-10 px-3 rounded-[var(--radius)] bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] font-bold text-sm flex items-center justify-center hover:border-[var(--duino-blue)] transition-all min-w-[40px]"
            onClick={() => setLang(l => l === "ru" ? "en" : l === "en" ? "pl" : "ru")}
          >
            {lang.toUpperCase()}
          </button>
        </div>

        <div className="flex flex-col gap-2 w-full sm:max-w-[450px]">
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--duino-yellow)] pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchData()}
                placeholder={t.placeholder}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] pl-10 pr-4 py-3 rounded-[var(--radius)] outline-none focus:border-[var(--duino-yellow)] transition-all text-sm"
              />
            </div>
            <button 
              className="bg-[var(--duino-yellow)] text-[#121212] px-6 py-2.5 rounded-[var(--radius)] font-bold flex items-center gap-2 whitespace-nowrap hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 text-sm h-[46px]"
              onClick={() => fetchData()}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin-fast" /> : <Search className="w-4 h-4" />}
              {t.btnSearch}
            </button>
          </div>
          
          {favorites.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center px-1 max-h-16 overflow-y-auto custom-scrollbar">
              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40 mr-1 shrink-0">Favorites</span>
              {favorites.map(f => (
                <button
                  key={f}
                  onClick={() => {
                    setUsername(f);
                    // Pass username directly to avoid state lag
                    fetchData(false, f); 
                  }}
                  className="bg-white/5 hover:bg-[var(--duino-yellow)]/10 hover:text-[var(--duino-yellow)] border border-white/5 hover:border-[var(--duino-yellow)]/30 text-[var(--text-muted)] px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap"
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["monitoring", "account"] as Tab[]).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-[var(--radius)] border font-bold transition-all text-sm uppercase tracking-wider",
              activeTab === tab 
                ? "bg-[var(--duino-yellow)] text-[#121212] border-[var(--duino-yellow)]" 
                : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--duino-yellow)]"
            )}
          >
             {tab === "monitoring" && <LayoutDashboard className="w-4 h-4" />}
             {tab === "account" && <User className="w-4 h-4" />}
             {t[tab]}
          </button>
        ))}
      </div>

      {error && <div className="error-msg block mb-6">{error}</div>}

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "monitoring" && (
              <div className="space-y-6">
                {data && (
                  <>
                    {/* Top Dashboard Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card 
                        icon={<Cpu className="w-5 h-5" />}
                        label={t.lblWorkers}
                        value={data.miners.length.toString()}
                        accentColor="var(--duino-red)"
                      />
                      <Card 
                        icon={<Activity className="w-5 h-5" />}
                        label={t.lblHashrate}
                        value={formatHashrate(data.miners.reduce((acc, m) => acc + (parseFloat(m.hashrate.toString()) || 0), 0))}
                        subtext={`Efficiency: ${(data.miners.reduce((acc, m) => acc + (m.accepted || 0), 0) + data.miners.reduce((acc, m) => acc + (m.rejected || 0), 0)) > 0 ? (data.miners.reduce((acc, m) => acc + (m.accepted || 0), 0) / (data.miners.reduce((acc, m) => acc + (m.accepted || 0), 0) + data.miners.reduce((acc, m) => acc + (m.rejected || 0), 0)) * 100).toFixed(1) : "100"}%`}
                        accentColor="var(--duino-yellow)"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Financial Forecast (Earned Coins) - Website Style */}
                      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius)] p-6 shadow-sm flex flex-col group">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--duino-yellow)]/10 flex items-center justify-center text-[var(--duino-yellow)]">
                              <DollarSign className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">{t.lblEarnedCoins}</h3>
                          </div>
                          <div className="text-[10px] font-bold text-[var(--text-muted)] bg-white/5 px-2 py-0.5 rounded uppercase tracking-widest">{t.lblApprox}</div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { label: t.lblMin, color: "#FF5252", factor: 0.00001, icon: <TrendingDown className="w-4 h-4" /> },
                            { label: t.lblAvg, color: "#FBBF24", factor: 0.00003, icon: <Zap className="w-4 h-4" /> },
                            { label: t.lblMax, color: "#00E676", factor: 0.00005, icon: <TrendingUp className="w-4 h-4" /> }
                          ].map((item, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col gap-2 group-hover:border-[var(--duino-yellow)]/20 transition-all">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{item.label}</span>
                                <div className="p-1 rounded bg-white/5" style={{ color: item.color }}>{item.icon}</div>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-[var(--text-main)]">
                                  {data.miners.length > 0 ? (data.miners.reduce((acc, m) => acc + (parseFloat(m.hashrate.toString()) || 0), 0) * item.factor * 1440).toFixed(2) : '0.00'}
                                </span>
                                <span className="text-[9px] font-bold text-[var(--text-muted)]">DUCO</span>
                              </div>
                              <div className="text-[9px] font-medium text-[var(--text-muted)] opacity-50">{t.lblDaily}</div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-white/5">
                          <div className="flex justify-between items-center mb-2">
                             <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Efficiency</div>
                             <div className="text-[10px] font-bold text-[var(--duino-green)]">99.8%</div>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-[var(--duino-yellow)] rounded-full w-[99.8%] shadow-[0_0_8px_var(--duino-yellow)]" />
                          </div>
                        </div>
                      </div>

                      {/* Hashrate Chart Section */}
                      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius)] p-6 shadow-sm lg:col-span-1">
                         <div className="flex items-center gap-2 mb-8 text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">
                           <Activity className="w-4 h-4 text-[var(--duino-yellow)]" />
                           {t.lblChartTitle}
                         </div>
                         <div className="h-[200px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={history}>
                               <defs>
                                 <linearGradient id="colorHrDash" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="var(--duino-yellow)" stopOpacity={0.1}/>
                                   <stop offset="95%" stopColor="var(--duino-yellow)" stopOpacity={0}/>
                                 </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                               <XAxis dataKey="time" hide />
                               <YAxis hide />
                               <Tooltip contentStyle={{ backgroundColor: "rgba(15,15,15,0.95)", border: "1px solid var(--duino-yellow-dim)", borderRadius: "10px", fontSize: "10px", color: "var(--text-main)" }} />
                               <Area type="monotone" dataKey="val" stroke="var(--duino-yellow)" strokeWidth={2} fill="url(#colorHrDash)" animationDuration={600} />
                             </AreaChart>
                           </ResponsiveContainer>
                         </div>
                      </div>

                      {/* Miner Distribution Section */}
                      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius)] p-6 shadow-xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <PieChartIcon className="w-5 h-5 text-[var(--duino-yellow)]" />
                               <h3 className="text-base font-bold text-[var(--text-main)] uppercase tracking-wider">{t.lblMinerDist}</h3>
                            </div>
                            <button onClick={fetchGlobalStats} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="relative flex flex-col items-center">
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={globalStats?.distribution || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={4}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {(globalStats?.distribution || []).map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={getMinerColor(entry.name)} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const d = payload[0].payload;
                                                        return (
                                                            <div className="bg-[#1a1a1a] border border-[var(--duino-yellow-dim)] p-2 rounded-lg shadow-2xl">
                                                                <p className="text-[10px] font-bold text-white uppercase">{d.name}</p>
                                                                <p className="text-[12px] font-black text-[var(--duino-yellow)]">{d.count} ({d.value.toFixed(2)}%)</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center text-center">
                                    <span className="text-2xl font-black text-white">{globalStats?.totalMiners || 0}</span>
                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t.lblTotalMiners}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {globalStats?.distribution?.slice(0, 8).map((item: any) => (
                                    <div key={item.name} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getMinerColor(item.name)}20` }}>
                                                {getMinerIcon(item.name)}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white uppercase">{item.name}</div>
                                                <div className="text-[10px] font-medium text-[var(--text-muted)]">{item.value.toFixed(2)}%</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-black text-[var(--text-muted)] group-hover:text-white transition-colors">
                                            {item.count}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       {/* Recent Transactions Section */}
                       <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius)] overflow-hidden flex flex-col shadow-lg">
                          <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
                             <div className="flex items-center gap-2 font-bold text-[var(--duino-yellow)] uppercase tracking-wider text-sm">
                                <History className="w-4 h-4" />
                                {t.lblRecentTrans}
                             </div>
                          </div>
                          <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                             {data.transactions && data.transactions.length > 0 ? data.transactions.map((tx, i) => {
                                const isIncoming = tx.recipient.toLowerCase() === username.toLowerCase();
                                return (
                                <div key={i} className="p-5 border-b border-white/5 last:border-none flex items-start gap-4 hover:bg-white/5 transition-all">
                                   <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg", isIncoming ? "bg-[var(--duino-green)]/10 text-[var(--duino-green)]" : "bg-[var(--duino-red)]/10 text-[var(--duino-red)]")}>
                                      <Wallet className="w-6 h-6" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start mb-0.5">
                                         <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                                            {isIncoming ? `${t.lblFrom} ${tx.sender}` : `${t.lblTo} ${tx.recipient}`}
                                         </div>
                                         <div className="text-[10px] text-[var(--text-muted)] font-mono font-bold">{tx.datetime}</div>
                                      </div>
                                      <div className="text-sm font-black text-[var(--text-main)] mb-3 leading-tight">
                                         {tx.memo || (isIncoming ? 'Incoming Transfer' : 'Outgoing Transfer')}
                                      </div>
                                      <div className={cn("text-lg font-black font-mono text-right mt-1", isIncoming ? "text-[var(--duino-green)]" : "text-[var(--duino-red)]")}>
                                         {isIncoming ? "+" : "-"}{tx.amount} <span className="text-[10px] opacity-60 ml-0.5">DUCO</span>
                                      </div>
                                   </div>
                                </div>
                                );
                             }) : (
                                <div className="p-10 text-center text-[var(--text-muted)] italic text-sm">{t.noMiners}</div>
                             )}
                          </div>
                       </div>

                        {/* Workers Summary Table - Refined like in photo */}
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius)] overflow-hidden shadow-lg flex flex-col lg:col-span-2">
                           <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
                              <div className="flex items-center gap-2 font-bold text-[var(--duino-yellow)] uppercase tracking-wider text-sm">
                                 <Cpu className="w-4 h-4" />
                                 {t.lblWorkers}
                              </div>
                              <div className="text-[var(--text-muted)] opacity-40">
                                 <ArrowLeftRight className="w-4 h-4 rotate-90" />
                              </div>
                           </div>
                           <div className="flex-1 overflow-x-auto custom-scrollbar">
                             <table className="w-full text-left border-collapse min-w-[1240px]">
                               <thead>
                                 <tr className="bg-black/40 border-b border-white/5">
                                   <th className="p-4 text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">#</th>
                                   <th className="p-4 text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">{t.thSoftware}</th>
                                   <th className="p-4 text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">{t.thIdentifier}</th>
                                   <th className="p-4 text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">{t.thAccepted}</th>
                                   <th className="p-4 text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">{t.thRejected}</th>
                                   <th className="p-4 text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">{t.thHashrate}</th>
                                   <th className="p-4 text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">{t.thDiff}</th>
                                   <th className="p-4 text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">{t.thPing}</th>
                                   <th className="p-4 text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">{t.thPool}</th>
                                   <th className="p-4 text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">{t.thType}</th>
                                   <th className="p-4 text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">{t.thAlgo}</th>
                                   <th className="p-4 text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest">{t.thThread}</th>
                                 </tr>
                               </thead>
                               <tbody className="divide-y divide-white/5">
                                 {data.miners.length > 0 ? data.miners.map((m, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                       <td className="p-4 text-[11px] font-mono font-bold text-[var(--text-muted)] opacity-40">{i + 1}</td>
                                       <td className="p-4 text-[11px] font-bold text-[var(--text-main)] truncate max-w-[120px]">{m.software}</td>
                                       <td className="p-4 text-[11px] font-mono font-black text-[var(--duino-yellow)]">{m.identifier}</td>
                                       <td className="p-4 text-[11px] font-mono text-[var(--duino-green)] font-black">{m.accepted}</td>
                                       <td className="p-4 text-[11px] font-mono text-[var(--duino-red)] font-black">{m.rejected}</td>
                                       <td className="p-4 text-[11px] font-mono font-black text-[var(--text-main)]">{formatHashrate(m.hashrate)}</td>
                                       <td className="p-4 text-[11px] font-mono text-[var(--text-muted)] opacity-80">{m.diff}</td>
                                       <td className="p-4 text-[11px] font-mono text-[var(--duino-blue)] font-bold">{m.ping !== undefined && m.ping !== null ? `${m.ping}ms` : "---"}</td>
                                       <td className="p-4 text-[11px] font-bold text-[var(--text-main)] opacity-70 whitespace-nowrap">{m.pool || 'Default'}</td>
                                       <td className="p-4 text-[11px]">
                                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-black uppercase text-[var(--text-muted)] border border-white/5">
                                             {m.type || "Worker"}
                                          </span>
                                       </td>
                                       <td className="p-4 text-[11px] font-bold opacity-80">{m.algorithm}</td>
                                       <td className="p-4 text-[11px] font-mono opacity-50">{m.threadid || '-'}</td>
                                    </tr>
                                 )) : (
                                   <tr>
                                     <td colSpan={12} className="p-16 text-center">
                                       <div className="flex flex-col items-center gap-3 opacity-20">
                                          <User className="w-10 h-10" />
                                          <div className="text-sm font-black uppercase tracking-widest">{t.noMiners}</div>
                                       </div>
                                     </td>
                                   </tr>
                                 )}
                               </tbody>
                             </table>
                           </div>
                        </div>
                     </div>
                  </>
                )}
                {!data && (
                    <div className="flex flex-col items-center justify-center h-80 text-[var(--text-muted)] opacity-30 italic font-medium p-6 text-center border-2 border-dashed border-[var(--border-color)] rounded-[var(--radius)]">
                        <User className="w-12 h-12 mb-4" />
                        <p className="text-lg">{t.placeholder}</p>
                    </div>
                )}
              </div>
            )}
            {activeTab === "account" && (
              <div className="max-w-4xl mx-auto space-y-8">
                 {data ? (
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius)] p-6 sm:p-10 shadow-2xl border-t-2 border-[var(--duino-yellow)]">
                        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-8 border-b border-[var(--border-color)]">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[var(--duino-yellow)] p-1.5 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--duino-yellow)] via-[#FF8F00] to-[var(--duino-yellow)]">
                                <img src={`https://wallet.duinocoin.com/api/v1/users/${encodeURIComponent(data.balance.username)}/avatar.png`} alt={data.balance.username} onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${data.balance.username}`; }} className="w-full h-full rounded-full object-cover shadow-inner" />
                            </div>
                            <div className="text-center sm:text-left">
                                <div className="flex items-center gap-3 justify-center sm:justify-start">
                                  <h2 className="text-3xl sm:text-4xl font-black text-[var(--duino-yellow)] mb-1 uppercase leading-tight">{data.balance.username}</h2>
                                  <button 
                                    onClick={() => toggleFavorite(data.balance.username)}
                                    className={cn("p-2 rounded-full transition-all", favorites.includes(data.balance.username) ? "text-[var(--duino-yellow)]" : "text-white/20 hover:text-white/40")}
                                  >
                                    <Star className={cn("w-6 h-6", favorites.includes(data.balance.username) && "fill-current")} />
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center sm:justify-start items-center">
                                    <div className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[1px] opacity-70">
                                        {t.lblCreated}: <span className="text-[var(--text-main)]">{data.balance.created}</span>
                                    </div>
                                    <div className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[1px] opacity-70 flex items-center gap-1">
                                        {t.lblVerified}: 
                                        <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-black uppercase", data.balance.verified === "yes" ? "bg-[var(--duino-green)]/20 text-[var(--duino-green)]" : "bg-[var(--duino-red)]/20 text-[var(--duino-red)]")}>
                                            {data.balance.verified === "yes" ? t.lblYes : t.lblNo}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col items-center p-8 bg-black/20 rounded-[var(--radius)] border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><Wallet className="w-16 h-16" /></div>
                                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 self-start"><div className="w-1.5 h-1.5 rounded-full inline-block bg-[var(--duino-yellow)] mr-1.5" />{t.balance}</div>
                                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter mb-1 text-[var(--text-main)] truncate max-w-full">{data.balance.balance.toFixed(2)}</div>
                                <div className="text-[var(--duino-yellow)] font-black text-sm uppercase tracking-widest">{t.duco}</div>
                            </div>
                            <div className="flex flex-col items-center p-8 bg-black/20 rounded-[var(--radius)] border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><DollarSign className="w-16 h-16 text-[var(--duino-yellow)]" /></div>
                                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 self-start"><div className="w-1.5 h-1.5 rounded-full inline-block bg-[var(--duino-yellow)] mr-1.5" />{t.lblApprox}</div>
                                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter mb-1 text-[var(--text-main)] truncate max-w-full">${(data.balance.balance * price).toFixed(4)}</div>
                                <div className="text-[var(--duino-yellow)] font-black text-sm uppercase tracking-widest">USD VALUATION</div>
                            </div>
                        </div>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center h-80 text-[var(--text-muted)] opacity-30 italic font-medium p-6 text-center border-2 border-dashed border-[var(--border-color)] rounded-[var(--radius)]">
                        <User className="w-12 h-12 mb-4" />
                        <p className="text-lg">{t.placeholder}</p>
                    </div>
                 )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="mt-12 py-8 text-center border-t border-[var(--header-border)] space-y-4">
          <p className="text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-[2px] opacity-60">
            © 2026 Hleb Duino-Coin Monitor
          </p>
          <div className="flex justify-center gap-6">
              <button onClick={() => setShowPolicy(true)} className="text-[var(--text-muted)] hover:text-[var(--duino-yellow)] text-[10px] font-bold uppercase tracking-widest transition-colors border-b border-transparent hover:border-[var(--duino-yellow)] pb-1">{t.policy}</button>
          </div>
      </footer>

      <AnimatePresence>
        {showPolicy && (
            <div className="fixed inset-0 z-[100] backdrop-blur-xl bg-black/60 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius)] max-w-2xl w-full p-8 shadow-2xl relative max-h-[80vh] overflow-y-auto">
                    <button onClick={() => setShowPolicy(false)} className="absolute top-6 right-6 text-[var(--text-muted)]"><ChevronRight className="w-6 h-6 rotate-180" /></button>
                    <h2 className="text-3xl font-black text-[var(--duino-yellow)] mb-8 uppercase tracking-tighter">{t.policy}</h2>
                    <div className="space-y-6 text-[var(--text-main)] text-sm leading-relaxed opacity-80 font-medium">
                        <div className="lang-section mb-10">
                            <h3 className="text-xl font-black text-[var(--duino-yellow)] mb-4 uppercase tracking-tighter">Политика конфиденциальности</h3>
                            <p className="mb-4">Ваша конфиденциальность важна для нас. Данный документ разъясняет, как <strong>Hleb Duco Monitor</strong> работает с вашими данными.</p>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-[var(--radius)] border border-white/5">
                                    <h4 className="font-black text-[var(--duino-yellow)] uppercase tracking-[1px] text-xs mb-2 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> 🔒 Безопасность и данные
                                    </h4>
                                    <p>Приложение является статическим (Client-side). Это означает, что вся обработка данных происходит исключительно в вашем браузере. Мы не имеем собственных серверов для сбора или хранения вашей информации.</p>
                                    <ul className="list-disc ml-5 mt-2 space-y-1">
                                        <li>Мы не собираем и не храним ваши пароли или приватные ключи.</li>
                                        <li>Мы не используем файлы cookie для отслеживания ваших действий.</li>
                                        <li>Все данные запрашиваются напрямую через публичное Duino-Coin API.</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-white/5 rounded-[var(--radius)] border border-white/5">
                                    <h4 className="font-black text-[var(--duino-yellow)] uppercase tracking-[1px] text-xs mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> ⚠️ Отказ от ответственности
                                    </h4>
                                    <p>Этот инструмент предоставляется бесплатно «как есть» (AS IS). Автор не несет ответственности за ошибки программного обеспечения или любые финансовые потери.</p>
                                </div>
                            </div>
                        </div>

                        <hr className="border-[var(--border-color)] my-10" />

                        <div className="lang-section">
                            <h3 className="text-xl font-black text-[var(--duino-yellow)] mb-4 uppercase tracking-tighter">Privacy Policy</h3>
                            <p className="mb-4">Your privacy is important to us. This document explains how <strong>Hleb Duco Monitor</strong> handles your information.</p>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-[var(--radius)] border border-white/5">
                                    <h4 className="font-black text-[var(--duino-yellow)] uppercase tracking-[1px] text-xs mb-2 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> 🔒 Data & Security
                                    </h4>
                                    <p>This is a client-side static application. All data processing occurs exclusively within your browser. We do not operate any servers to collect or store your information.</p>
                                    <ul className="list-disc ml-5 mt-2 space-y-1">
                                        <li>We do not collect or store your passwords or private keys.</li>
                                        <li>We do not use tracking cookies.</li>
                                        <li>All statistics are fetched directly from the public Duino-Coin API.</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-white/5 rounded-[var(--radius)] border border-white/5">
                                    <h4 className="font-black text-[var(--duino-yellow)] uppercase tracking-[1px] text-xs mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> ⚠️ Disclaimer
                                    </h4>
                                    <p>This tool is provided for free "AS IS". The author is not responsible for any software bugs or any financial losses resulting from the use of this software.</p>
                                </div>
                            </div>
                        </div>
                        
                        <p className="pt-8 text-[10px] font-bold uppercase tracking-[3px] text-[var(--text-muted)] text-center border-t border-[var(--border-color)]">
                            Обновлено: 20 апреля 2026
                        </p>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Card({ icon, label, value, subtext, accentColor }: { icon: React.ReactNode; label: string; value: string; subtext?: string; accentColor?: string }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-[var(--radius)] relative overflow-hidden flex flex-col justify-center min-h-[140px] shadow-lg group hover:border-[var(--duino-yellow)] transition-all">
      <div 
        className="absolute top-0 left-0 w-1 h-full opacity-80" 
        style={{ backgroundColor: accentColor || "var(--duino-yellow)" }} 
      />
      <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110" style={{ color: accentColor || "var(--duino-yellow)" }}>
        {icon}
      </div>
      <div className="text-[10px] uppercase font-black tracking-[2px] text-[var(--text-muted)] mb-3">{label}</div>
      <div className="text-2xl font-bold tracking-tighter text-[var(--text-main)] font-mono truncate mr-8">{value}</div>
      {subtext && <div className="text-[10px] text-[var(--text-muted)] mt-2 font-bold uppercase tracking-wider opacity-80">{subtext}</div>}
    </div>
  );
}

