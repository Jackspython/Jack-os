import React, { useState } from "react";
import { sound } from "./AudioEngine";
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCw, 
  Server, 
  Send, 
  Loader2, 
  Sparkles,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, ScanResult } from "../types";
import { apiFetch } from "../utils/api";

interface NetworkScannerProps {
  user: User;
}

export default function NetworkScanner({ user }: NetworkScannerProps) {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [ip, setIp] = useState("");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState("");
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    sound.playClick();
    setLoading(true);
    setError("");
    setResults([]);
    setIp("");

    try {
      // Common ports to sweep
      const portsToScan = [21, 22, 23, 25, 53, 80, 110, 443, 3306, 8080];
      
      const response = await apiFetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          ports: portsToScan,
          username: user.username
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Port scanner sweep failed.");
      }

      setIp(data.ip || "127.0.0.1");
      
      // Stagger result rendering so that it looks realistic and is pleasant to watch!
      let currentResults: ScanResult[] = [];
      for (const res of data.results) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        currentResults.push(res);
        setResults([...currentResults]);
        sound.playBeep(res.status === "OPEN" ? 850 : 420, 0.05);
      }

      sound.playSuccess();
      showNotification("Diagnostic TCP Port sweep complete!");
    } catch (err: any) {
      sound.playError();
      setError(err.message || "Failed to parse target host or establish connection");
    } finally {
      setLoading(false);
    }
  };

  const handleSendToTelegram = async () => {
    if (!user.telegramBotToken || !user.telegramChatId) {
      sound.playError();
      showNotification("Configure Telegram bot details first in Telegram Settings!");
      return;
    }

    sound.playClick();
    setSendingTelegram(true);

    try {
      const res = await apiFetch("/api/telegram/send-osint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: user.telegramBotToken,
          chatId: user.telegramChatId,
          reportType: "TCP Port sweep telemetry",
          target,
          data: results
        })
      });

      if (res.ok) {
        sound.playSuccess();
        showNotification("Sent scan report to Telegram!");
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Network routing failed.");
      }
    } catch (err: any) {
      sound.playError();
      showNotification(`Failed to route: ${err.message}`);
    } finally {
      setSendingTelegram(false);
    }
  };

  const openCount = results.filter((r) => r.status === "OPEN").length;

  return (
    <div className="space-y-6">
      {/* Toast HUD */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border font-mono text-xs shadow-2xl bg-slate-900 border-amber-500/30 text-amber-400"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Header */}
      <div className="relative bg-slate-900/80 border border-amber-500/10 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-950/40 border border-amber-500/20 rounded-full text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider mb-3">
          <Activity className="w-3.5 h-3.5" /> PORT SECURITY SCANNING ENGINE
        </div>

        <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight mb-1.5">
          TCP Sockets Sweeper & Scanner
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-6 leading-relaxed max-w-2xl">
          Probe network firewalls, active server proxies, and exposed ports in real-time. Enter an IP or domain address to trigger socket analyzers.
        </p>

        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 font-mono">
            <Server className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              className="w-full bg-slate-950 border border-slate-800 text-amber-400 pl-11 pr-4 py-3 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-xs placeholder:text-slate-700 font-semibold"
              placeholder="e.g. example.com, 127.0.0.1, localhost"
              value={target}
              onChange={(e) => {
                sound.playTyping();
                setTarget(e.target.value);
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !target}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 cursor-pointer disabled:opacity-50 text-slate-950 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.05)] font-black uppercase"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                Sweeping...
              </>
            ) : (
              "Run Security Sweep"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-950/20 border border-red-500/30 text-red-300 text-xs rounded-xl font-mono">
            ❌ HOST CONCURRENT CRAWL FAILED: {error}
          </div>
        )}
      </div>

      {/* Results details */}
      {(results.length > 0 || loading) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden font-mono"
        >
          {/* Diagnostic Stats Header */}
          <div className="p-5 border-b border-slate-850 bg-slate-950/40 flex flex-wrap justify-between items-center gap-4 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-slate-200">SOCKET RESOLUTION REPORT</p>
              <p className="text-slate-400">Host IP Target: <span className="text-amber-500 font-bold">{ip ? ip : "RESOLVING DNS..."}</span></p>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-slate-400">Exposed Sockets: <b className="text-amber-500 font-black">{openCount} Open</b></span>
              <span className="text-slate-400">Status: <b className={loading ? "text-amber-500 animate-pulse" : "text-emerald-400 font-bold"}>{loading ? "RUNNING..." : "FINISHED"}</b></span>
              
              {results.length > 0 && (
                <button
                  onClick={handleSendToTelegram}
                  disabled={sendingTelegram}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)] disabled:opacity-40"
                >
                  {sendingTelegram ? (
                    <Loader2 className="w-3 h-3 animate-spin text-slate-950" />
                  ) : (
                    <Send className="w-3 h-3 text-slate-950" />
                  )}
                  FORWARD TO TELEGRAM
                </button>
              )}
            </div>
          </div>

          {/* Results Table */}
          <div className="p-6 bg-slate-950/20 max-h-96 overflow-y-auto space-y-2.5">
            {results.map((res, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-850 rounded-xl hover:border-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${
                    res.status === "OPEN" ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/10" : "bg-slate-900 text-slate-500 border-slate-850"
                  }`}>
                    {res.port}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">{res.service} Socket</p>
                    <p className="text-[10px] text-slate-500">TCP Socket Protocol</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    res.status === "OPEN" 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-slate-900 text-slate-500 border-slate-800"
                  }`}>
                    {res.status}
                  </span>
                  {res.status === "OPEN" ? <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" /> : <ShieldAlert className="w-4 h-4 text-slate-600" />}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
