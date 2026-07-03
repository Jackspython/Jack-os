import React, { useState, useEffect } from "react";
import { sound } from "./AudioEngine";
import { 
  Shield, 
  Activity, 
  Cpu, 
  Layers, 
  Globe, 
  Zap, 
  TrendingUp, 
  ArrowUpRight, 
  Lock, 
  Server, 
  Clock, 
  Bot,
  AlertTriangle,
  Play,
  Terminal,
  LayoutGrid,
  Send,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import { User } from "../types";

interface DashboardProps {
  user: User;
  onNavigate: (tab: any) => void;
  onQuickScan: (url: string) => void;
}

export default function Dashboard({ user, onNavigate, onQuickScan }: DashboardProps) {
  const [quickUrl, setQuickUrl] = useState("");
  const [metrics, setMetrics] = useState({
    cpu: 24,
    ram: 4.1,
    allocated: 412,
    traffic: 1.2
  });

  // Dynamic status updates for realism and visual feedback
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.min(99, Math.max(12, Math.round(prev.cpu + (Math.random() * 8 - 4)))),
        ram: Number(Math.min(8.0, Math.max(3.2, prev.ram + (Math.random() * 0.2 - 0.1))).toFixed(2)),
        allocated: Math.min(1024, Math.max(256, Math.round(prev.allocated + (Math.random() * 20 - 10)))),
        traffic: Number(Math.min(5.0, Math.max(0.1, prev.traffic + (Math.random() * 0.4 - 0.2))).toFixed(2))
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl) return;
    sound.playClick();
    onQuickScan(quickUrl);
  };

  const dashboardCards = [
    {
      title: "OSINT GIT SUITE",
      value: "INTEL RECON",
      desc: "Sherlock username audit, Katana spider & GAU archives",
      icon: Zap,
      tab: "osint",
      color: "text-amber-400",
      bgGlow: "from-amber-500/10",
      borderColor: "hover:border-amber-500/35"
    },
    {
      title: "OS CONSOLE",
      value: "UNIX SHELL",
      desc: "Diagnostics & remote command execution",
      icon: Terminal,
      tab: "terminal",
      color: "text-amber-400",
      bgGlow: "from-amber-500/10",
      borderColor: "hover:border-amber-500/35"
    },
    {
      title: "PORT SWEEPER",
      value: "TCP AUDITOR",
      desc: "TCP sockets sweep, protocol verification",
      icon: Activity,
      tab: "scanner",
      color: "text-amber-400",
      bgGlow: "from-amber-500/10",
      borderColor: "hover:border-amber-500/35"
    },
    {
      title: "APP CABINET",
      value: "SECURITY UTILS",
      desc: "Cryptographic hashers, stego & passwords",
      icon: LayoutGrid,
      tab: "catalog",
      color: "text-amber-400",
      bgGlow: "from-amber-500/10",
      borderColor: "hover:border-amber-500/35"
    },
    {
      title: "PYTHON CRYPTER",
      value: "NINJAPY CRYPTER",
      desc: "Multi-layered expiration & key binding",
      icon: Lock,
      tab: "encryptor",
      color: "text-amber-400",
      bgGlow: "from-amber-500/10",
      borderColor: "hover:border-amber-500/35"
    },
    {
      title: "API EXTRACTOR",
      value: "SOCKET CRAWLER",
      desc: "Deep AST parsing, JS rendering & credential exposure checks",
      icon: Globe,
      tab: "extractor",
      color: "text-amber-400",
      bgGlow: "from-amber-500/10",
      borderColor: "hover:border-amber-500/35"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Visual Header / Banner */}
      <div className="relative bg-slate-900 border border-amber-500/15 rounded-3xl p-8 lg:p-10 overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.03)]">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-amber-500/5 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
 
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/40 border border-amber-500/25 rounded-full text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 animate-pulse text-amber-400" /> JACK OS HUB CORE ACTIVE
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
              Welcome back, <span className="text-amber-400 font-bold">Agent {user.username}</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Equipped with professional security diagnostics, script crypters, and intelligence harvesting. Sweep active network ports, trace user profiles across 50+ platforms with Sherlock, or download GitHub repo source codes directly to your local sandbox.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <a 
                href="https://t.me/vcxah" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[11px] font-mono text-amber-400 font-bold rounded-xl transition-all hover:border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
              >
                <Bot className="w-4 h-4 text-amber-500" /> DM @vcxah
              </a>
              <a 
                href="https://t.me/Jaack1" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[11px] font-mono text-slate-300 font-bold rounded-xl transition-all hover:border-blue-500/30"
              >
                <Send className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Channel @Jaack1
              </a>
              <a 
                href="https://t.me/Jackspython" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[11px] font-mono text-slate-300 font-bold rounded-xl transition-all hover:border-blue-500/30"
              >
                <Send className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Python @Jackspython
              </a>
            </div>
          </div>
 
          {/* Quick Gateway Scan Terminal */}
          <div className="w-full lg:max-w-md bg-slate-950 border border-slate-850 p-6 rounded-2xl font-mono relative shadow-inner">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800/60">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-black">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                QUICK RECON SEARCH
              </span>
              <span className="text-[9px] text-slate-600 font-bold">SYSTEM ACTIVE</span>
            </div>
 
            <form onSubmit={handleQuickSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Enter target username or domain..."
                  value={quickUrl}
                  onChange={(e) => {
                    sound.playTyping();
                    setQuickUrl(e.target.value);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 text-amber-400 px-3.5 py-2.5 rounded-xl text-xs font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder:text-slate-700 font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={!quickUrl}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-black font-mono text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-amber-400/20 shadow-lg shadow-amber-950/40 transition-all uppercase"
              >
                <Play className="w-3.5 h-3.5 text-slate-950" /> Initiate Recon Discovery
              </button>
            </form>
          </div>
        </div>
      </div>
  
      {/* Primary Tool Shortcuts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => {
                sound.playClick();
                onNavigate(card.tab);
              }}
              className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 group cursor-pointer ${card.borderColor} hover:bg-slate-900/80 hover:translate-y-[-2px] hover:shadow-[0_4px_20px_rgba(245,158,11,0.02)]`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.bgGlow} to-transparent rounded-full blur-xl opacity-50`}></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">{card.title}</span>
                  <p className="text-base font-black text-slate-200 font-mono tracking-wide">{card.value}</p>
                </div>
                <div className={`w-9 h-9 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center ${card.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono relative z-10">
                <span className="truncate max-w-[70%]">{card.desc}</span>
                <span className="text-amber-500 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-bold text-[9px]">
                  LAUNCH <ArrowUpRight className="w-3 h-3 text-amber-500" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Metrics, Graphs & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Hardware Console Audit */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col font-mono shadow-inner">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
            <Activity className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">SYSTEM TELEMETRY</h3>
          </div>

          <div className="space-y-4 flex-1 justify-center flex flex-col">
            {/* CPU */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 font-semibold uppercase">VIRTUAL CPU LOAD</span>
                <span className="text-amber-400 font-bold">{metrics.cpu}%</span>
              </div>
              <div className="h-1.5 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-1000" 
                  style={{ width: `${metrics.cpu}%` }}
                ></div>
              </div>
            </div>

            {/* RAM */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 font-semibold uppercase">HEAP MEMORY</span>
                <span className="text-amber-500 font-bold">{metrics.ram} GB / 8.0 GB</span>
              </div>
              <div className="h-1.5 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500/80 transition-all duration-1000" 
                  style={{ width: `${(metrics.ram / 8) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Allocated Cache */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 font-semibold uppercase">AUDIT BUFFER CACHE</span>
                <span className="text-amber-400 font-bold">{metrics.allocated} MB</span>
              </div>
              <div className="h-1.5 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-1000" 
                  style={{ width: `${(metrics.allocated / 1024) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Bandwidth */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 font-semibold uppercase">SOCKS PROXY STREAMS</span>
                <span className="text-emerald-400 font-bold">{metrics.traffic} MB/s</span>
              </div>
              <div className="h-1.5 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${(metrics.traffic / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log / Event Feed */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 font-mono flex flex-col shadow-inner">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">AUDIT TRAIL SECURE FEED</h3>
            </div>
            <span className="text-[10px] bg-amber-950 border border-amber-500/25 px-2.5 py-0.5 rounded text-amber-400 font-bold">TUNNELED ENCRYPTION</span>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-56 pr-2">
            <div className="flex gap-4 items-start text-xs border-b border-slate-850/40 pb-2.5">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-200 font-semibold">Registered new session connection successfully</p>
                <span className="text-[9px] text-slate-500 font-mono">Agent: {user.username} | IP: 127.0.0.1 (VPN Proxied)</span>
              </div>
            </div>

            <div className="flex gap-4 items-start text-xs border-b border-slate-850/40 pb-2.5">
              <Bot className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="text-slate-200 font-semibold">Telegram Integrity Monitor online</p>
                <span className="text-[9px] text-slate-500 font-mono">
                  {user.telegramBotToken ? "✅ Live channels reporting operational" : "⚠️ Telegram bot token missing, using default channel"}
                </span>
              </div>
            </div>

            <div className="flex gap-4 items-start text-xs border-b border-slate-850/40 pb-2.5">
              <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-200 font-semibold">Loaded AST parsing scripts successfully</p>
                <span className="text-[9px] text-slate-500 font-mono">Modules: python_extractor, beautifulsoup4, requests</span>
              </div>
            </div>

            <div className="flex gap-4 items-start text-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-200 font-semibold">Local workspace key instantiated</p>
                <span className="text-[9px] text-slate-500 font-mono">UUID payload: 3f1e9c20-a841-4775-9011-cb82750e32aa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
