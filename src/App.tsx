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
  User, 
  Wallet,
  Zap,
  Hammer,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  Sun,
  Moon,
  ChevronRight,
  DollarSign,
  ShieldCheck,
  Info,
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  ChevronsDown,
  ChevronsUp,
  TrendingUp,
  History,
  PieChart as PieChartIcon,
  Star
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

// --- Types ---
type Language = "ru" | "en" | "pl";
type Tab = "monitoring" | "mining" | "account";

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
        mining: "Майнинг",
        account: "Аккаунт",
        placeholder: "Введите никнейм DUCO...",
        btnSearch: "Поиск",
        lblHashrate: "Общий Хешрейт",
        lblWorkers: "Твои Воркеры",
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
        webMiner: "Веб-майнер",
        startMining: "Запустить майнинг",
        stopMining: "Остановить",
        threads: "Потоки",
        miningKey: "Ключ майнинга",
        miningDiff: "Сложность",
        sharesAccepted: "Принято шар",
        localHashrate: "Локальный хешрейт",
        lblCreated: "Создан",
        lblVerified: "Верифицирован",
        lblYes: "Да",
        lblNo: "Нет",
        lblFrom: "от",
        lblTo: "для",
        thSoftware: "Программное обеспечение",
        thIdentifier: "Идентификатор",
        thAccepted: "Принял",
        thRejected: "Отклоненный",
        thDiff: "Разница",
        thPing: "Пинг",
        thPool: "Бассейн",
        thType: "Это",
        thThread: "Идентификатор потока"
    },
    en: {
        title: "Hleb Duino-Coin Monitor",
        monitoring: "Monitoring",
        mining: "Mining",
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
        webMiner: "Web Miner",
        startMining: "Start Mining",
        stopMining: "Stop Mining",
        threads: "Threads",
        miningKey: "Mining Key",
        miningDiff: "Difficulty",
        sharesAccepted: "Accepted Shares",
        localHashrate: "Local Hashrate",
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
        mining: "Mining",
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
        webMiner: "Web Miner",
        startMining: "Uruchom Mining",
        stopMining: "Zatrzymaj",
        threads: "Wątki",
        miningKey: "Klucz",
        miningDiff: "Slożność",
        sharesAccepted: "Zaakceptowane",
        localHashrate: "Hashrate lokalny",
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
        lblVerified: "Zweryfikowany",
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
  const [lang, setLang] = useState<Language>("ru");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
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

  const fetchGlobalStats = async () => {
    try {
      const statsRes = await fetch("https://server.duinocoin.com/statistics").then(r => r.json());
      if (statsRes) {
        setPrice(parseFloat(statsRes?.["Duco price"]) || 0.002);
        setDifficulty(statsRes?.["Current difficulty"] || 50);
        setGlobalStats(statsRes);
      }
    } catch (e) {
      console.error("Failed to fetch global stats:", e);
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

      if (statsRes) {
        setPrice(parseFloat(statsRes?.["Duco price"]) || 0.002);
        setDifficulty(statsRes?.["Current difficulty"] || 50);
        setGlobalStats(statsRes);
      }

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
            src="images/Hleb.png" 
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
                        subtext="Efficiency: 100%"
                        accentColor="var(--duino-yellow)"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Mining Distribution Section */}
                      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius)] p-5 shadow-lg relative flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 font-bold text-[var(--duino-yellow)] uppercase tracking-wider text-sm">
                               <PieChartIcon className="w-4 h-4" />
                               {t.lblMinerDist}
                            </div>
                            <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded text-[var(--text-muted)] uppercase tracking-widest">Global Network</span>
                        </div>
                        <div className="flex items-start justify-between mb-8">
                           <div className="flex flex-col">
                              <span className="text-3xl font-black text-[var(--text-main)] tracking-tighter mb-1">
                                {globalStats ? (Number(globalStats["Total miners"]) || Object.values(globalStats["Miner distribution"] || {}).reduce((a: any, b: any) => a + (Number(b) || 0), 0)) : '---'}
                              </span>
                              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[2px] opacity-60">{t.lblTotalMiners}</span>
                           </div>
                           <div className="h-[100px] w-[100px]">
                              <ResponsiveContainer width="100%" height="100%">
                                 <PieChart>
                                   <Pie
                                     data={globalStats ? Object.entries(globalStats["Miner distribution"] || {}).map(([name, value]) => ({ name, value: Number(value) })) : []}
                                     innerRadius={30}
                                     outerRadius={45}
                                     paddingAngle={4}
                                     dataKey="value"
                                   >
                                     {globalStats && Object.entries(globalStats["Miner distribution"] || {}).map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={["#818CF8", "#34D399", "#FBBF24", "#F87171", "#60A5FA", "#6366F1", "#A78BFA", "#F472B6"][index % 8]} />
                                     ))}
                                   </Pie>
                                 </PieChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                        <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                           {globalStats && Object.entries(globalStats["Miner distribution"] || {}).sort((a: any, b: any) => Number(b[1]) - Number(a[1])).map(([name, val]: any, i) => {
                              const distData = globalStats["Miner distribution"] || {};
                              const total = Number(Object.values(distData).reduce((a: any, b: any) => a + (Number(b) || 0), 0)) || 1;
                              const currentVal = Number(val) || 0;
                              const percent = ((currentVal / total) * 100).toFixed(2);
                              const colors = ["#818CF8", "#34D399", "#FBBF24", "#F87171", "#60A5FA", "#6366F1", "#A78BFA", "#F472B6"];
                              return (
                                <div key={i} className="flex items-center gap-3 p-2 group transition-all">
                                   <div 
                                     className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner"
                                     style={{ backgroundColor: `${colors[i % colors.length]}10`, color: colors[i % colors.length] }}
                                   >
                                      {name.toLowerCase().includes("esp") ? <Cpu className="w-5 h-5" /> : name.toLowerCase().includes("web") ? <Globe className="w-5 h-5" /> : name.toLowerCase().includes("arduino") ? <Hammer className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <div className="text-[13px] font-black text-[var(--text-main)] uppercase tracking-tight truncate leading-none mb-1">{name}</div>
                                      <div className="text-[10px] font-bold text-[var(--text-muted)] opacity-60">{percent}%</div>
                                   </div>
                                   <div className="text-[12px] font-mono font-black text-[var(--text-main)] opacity-80">{val}</div>
                                </div>
                              );
                           })}
                        </div>
                      </div>

                      {/* Earned Coins Section (Returned to Monitoring) */}
                      {/* Earned Coins Section (Returned to Monitoring) */}
                      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius)] p-6 shadow-xl relative flex flex-col min-h-[460px]">
                        <h3 className="text-xl font-black text-[var(--duino-yellow)] mb-10 opacity-90 uppercase tracking-tighter">{t.lblEarnedCoins}</h3>
                        
                        <div className="flex-1 space-y-10 relative">
                           {/* Dotted lines background effect - matched to photo */}
                           <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none opacity-[0.08] flex flex-col justify-between py-1 px-4">
                              {[1, 2, 3, 4, 5, 6].map((it) => (
                                <div key={it} className="border-t border-dashed border-[var(--text-muted)] w-full h-0" />
                              ))}
                           </div>
                           
                           {[
                             { label: t.lblMin, icon: <ChevronsDown className="w-5 h-5" />, color: "#F87171", factor: 0.00001 },
                             { label: t.lblMax, icon: <ChevronsUp className="w-5 h-5" />, color: "#34D399", factor: 0.00005 },
                             { label: t.lblAvg, icon: <ArrowLeftRight className="w-5 h-5" />, color: "#FBBF24", factor: 0.00003 }
                           ].map((item, i) => (
                             <div key={i} className="flex items-center gap-6 relative z-10 transition-all hover:translate-x-1 cursor-default">
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg border border-white/5"
                                     style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                   {item.icon}
                                </div>
                                <div className="flex flex-col">
                                   <div className="text-[13px] font-bold text-[var(--text-muted)] opacity-50 mb-0.5">{item.label}</div>
                                   <div className="text-2xl font-black text-[var(--text-main)] font-mono tracking-tighter">
                                      Đ {data.miners.length > 0 ? (data.miners.reduce((acc, m) => acc + (parseFloat(m.hashrate.toString()) || 0), 0) * item.factor * 1440).toFixed(2) : '-'}
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>

                        {/* Decorative bottom bar and knob like in photo */}
                        <div className="mt-auto pt-10 px-1">
                           <div className="h-1 w-full bg-white/10 rounded-full relative">
                              <div className="absolute top-0 left-0 h-full w-[98%] bg-gradient-to-r from-transparent via-[var(--duino-blue)]/40 to-[var(--duino-blue)] rounded-full" />
                              <div className="absolute top-1/2 right-[2%] -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,1)] z-20" />
                           </div>
                        </div>
                      </div>

                      {/* Hashrate Chart Section */}
                      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius)] p-5 shadow-lg lg:col-span-1">
                         <div className="flex items-center gap-2 mb-8 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                           <Activity className="w-3 h-3 text-[var(--duino-yellow)]" />
                           {t.lblChartTitle}
                         </div>
                         <div className="h-[400px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={history}>
                               <defs>
                                 <linearGradient id="colorHrDash" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="var(--duino-yellow)" stopOpacity={0.2}/>
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
                                 <Hammer className="w-4 h-4" />
                                 {lang === "ru" ? "Шахтеры" : t.lblWorkers}
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
                                       <td className="p-4 text-[11px] font-mono text-[var(--duino-blue)]">{m.ping ? `${m.ping}ms` : '-'}</td>
                                       <td className="p-4 text-[11px] font-bold text-[var(--text-muted)] opacity-60 truncate max-w-[100px]">{m.pool || '-'}</td>
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
                                          <Hammer className="w-10 h-10" />
                                          <div className="text-sm font-black uppercase tracking-widest">{lang === "ru" ? "В таблице отсутствуют данные" : t.noMiners}</div>
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
                                        <li>All mining statistics are fetched directly from the public Duino-Coin API.</li>
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

function MinerRow({ miner, t }: { miner: Miner; t: any; key?: React.Key }) {
  const hr = parseFloat(miner.hashrate.toString()) || 0;
  const accepted = miner.accepted || 0;
  const rejected = miner.rejected || 0;
  const total = accepted + rejected;
  const eff = total > 0 ? (accepted / total * 100) : (hr > 0 ? 100 : 0);
  const color = eff > 95 ? "var(--duino-green)" : (eff > 80 ? "var(--duino-yellow)" : "var(--duino-red)");
  return (
    <tr className="border-b border-[var(--border-color)] last:border-none hover:bg-[var(--table-hover)] transition-all">
      <td className="p-4 font-mono font-bold text-sm">{miner.identifier}</td>
      <td className="p-4"><span className="text-[var(--duino-yellow)] font-bold text-xs uppercase">{miner.algorithm}</span></td>
      <td className="p-4 font-mono font-medium text-sm">{formatHashrate(hr)}</td>
      <td className="p-4">
        <div className="text-[11px] font-bold mb-1.5" style={{ color }}>{eff.toFixed(1)}%</div>
        <div className="efficiency-bar-bg h-1.5"><div className="efficiency-bar-fill h-full" style={{ width: `${eff}%`, backgroundColor: color }}></div></div>
      </td>
      <td className="p-4 font-mono text-sm"><span className="text-[var(--duino-green)] font-bold">{accepted}</span> / <span className={rejected > 0 ? "text-[var(--duino-red)] font-bold" : "text-[var(--text-muted)]"}>{rejected}</span></td>
      <td className="p-4 text-[var(--text-muted)] font-mono text-sm">{miner.diff || '---'}</td>
      <td className="p-4"><span className={cn("status-badge px-3 py-1 text-[10px] font-bold", hr > 0 ? "status-online" : "status-offline")}>{hr > 0 ? t.statusOnline : t.statusOffline}</span></td>
    </tr>
  );
}
