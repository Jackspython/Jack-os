import React, { useState } from "react";
import { sound } from "./AudioEngine";
import { Activity, ShieldAlert, CheckCircle, RefreshCw, Server } from "lucide-react";
import { motion } from "motion/react";
import { User, ScanResult } from "../types";

interface NetworkScannerProps {
  user: User;
}

export default function NetworkScanner({ user }: NetworkScannerProps) {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [ip, setIp] = useState("");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState("");

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    sound.playClick();
    setLoading(true);
    setError("");
    setResults([]);
    setIp("");

    try {
      // Common ports we want to test
      const portsToScan = [21, 22, 23, 25, 53, 80, 110, 443, 3306, 8080];
      
      const response = await fetch("/api/scanner", {
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
        throw new Error(data.error || "Port scanner sweep failed on proxy node.");
      }

      setIp(data.ip || "127.0.0.1");
      
      // Stagger result rendering so that it looks realistic and is pleasant to watch!
      let currentResults: ScanResult[] = [];
      for (const res of data.results) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        currentResults.push(res);
        setResults([...currentResults]);
        sound.playBeep(res.status === "OPEN" ? 900 : 450, 0.05);
      }

      sound.playSuccess();
    } catch (err: any) {
      sound.playError();
      setError(err.message || "Failed to parse target host or establish connection");
    } finally {
      setLoading(false);
    }
  };

  const openCount = results.filter((r) => r.status === "OPEN").length;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>

        <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-amber-500" />
          TCP PORT SWEEPER & DIAGNOSTIC SCANNER
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-6 leading-relaxed">
          Verify firewall profiles, web proxies, and exposed sockets. Enter an IP or domain address to trigger automated port crawlers.
        </p>

        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              required
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-11 pr-4 py-3 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-xs font-mono placeholder:text-slate-600"
              placeholder="e.g. google.com, 192.168.1.1, localhost"
              value={target}
              onChange={(e) => {
                sound.playTyping();
                setTarget(e.target.value);
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 cursor-pointer disabled:opacity-50 text-slate-100 font-mono text-xs font-bold rounded-xl border border-amber-400/30 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? "SCANNING TARGET HOSTS..." : "RUN SECURITY SWEEP"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-950/20 border border-red-500/30 text-red-200 text-xs rounded-xl font-mono">
            ❌ HOST CONCURRENT CRAWL FAILED: {error}
          </div>
        )}
      </div>

      {/* Results details */}
      {(results.length > 0 || loading) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden font-mono"
        >
          {/* Diagnostic Stats Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex flex-wrap justify-between items-center gap-4 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-slate-300">TARGET RESOLUTION REPORT</p>
              <p className="text-slate-400">Host IP Address: {ip ? ip : "RESOLVING DNS..."}</p>
            </div>
            
            <div className="flex gap-4">
              <span className="text-slate-400">Exposed Sockets: <b className="text-amber-500">{openCount} Open</b></span>
              <span className="text-slate-400">Status: <b className={loading ? "text-cyan-400 animate-pulse" : "text-emerald-400"}>{loading ? "RUNNING..." : "FINISHED"}</b></span>
            </div>
          </div>

          {/* Results Table */}
          <div className="p-6 bg-slate-950/20 max-h-96 overflow-y-auto space-y-2.5">
            {results.map((res, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    res.status === "OPEN" ? "bg-emerald-950/30 text-emerald-400 border border-emerald-500/10" : "bg-slate-900 text-slate-500 border border-slate-850"
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
                  {res.status === "OPEN" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-slate-600" />}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
