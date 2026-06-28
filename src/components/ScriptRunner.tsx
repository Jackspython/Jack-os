import React, { useState, useEffect } from "react";
import { sound } from "./AudioEngine";
import { 
  Terminal, 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  Layers, 
  Bot, 
  Cpu, 
  HardDrive, 
  Globe, 
  Check, 
  AlertCircle,
  Code,
  RefreshCw,
  Server
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";

interface ScriptRunnerProps {
  user: User;
}

interface ProcessNode {
  id: string;
  name: string;
  lang: "javascript" | "python";
  code: string;
  status: "IDLE" | "RUNNING" | "DEPLOYED" | "CRASHED";
  port: number;
  cpu: number;
  memory: number;
  logs: string[];
  uptime: number;
  url: string;
}

const TEMPLATES = [
  {
    name: "Telegram Bot Relayer",
    lang: "python" as const,
    code: `# 2026 TELEGRAM BOT DEPLOYER
import telebot
import os

bot = telebot.TeleBot("8290595105:AAHeKiCw4xumX5gv4R3q3f2gXGA8wNlAPSw")

print("[INIT] Starting polling loop for Telegram Bot...")
print("[SYSTEM] Hooking active webhooks on port 8443...")

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    print(f"[POLL] Message received from User: {message.from_user.username}")
    bot.reply_to(message, "Jack OS Hub relay terminal connected successfully.")

bot.infinity_polling()`
  },
  {
    name: "Custom REST API Server",
    lang: "javascript" as const,
    code: `// CUSTOM REST API WEB SERVER
const express = require('express');
const app = express();
const PORT = 8080;

app.get('/api/v1/extract', (req, res) => {
  console.log("[HTTP-GET] Scraper dispatch requested from client " + req.ip);
  res.json({ status: "success", session: "secured" });
});

app.listen(PORT, () => {
  console.log("[SERVER] REST API listening on port " + PORT);
});`
  },
  {
    name: "IG Scraper Engine",
    lang: "python" as const,
    code: `# INSTAGRAM MEDIA SCRAPER ENGINE
import requests
import json

target = "https://instagram.com/api/v1/feed"
print(f"[CRAWL] Emitting authenticated fetch request to {target}...")

response = requests.get(target, headers={"X-IG-App-ID": "936619743392459"})
if response.status_code == 200:
    print(f"[SUCCESS] Scraped 24 media posts successfully.")
else:
    print("[ERROR] IG API returned non-200. Re-authenticating token...")`
  }
];

export default function ScriptRunner({ user }: ScriptRunnerProps) {
  const [processes, setProcesses] = useState<ProcessNode[]>([
    {
      id: "proc_1",
      name: "Telegram News Bot",
      lang: "python",
      code: TEMPLATES[0].code,
      status: "IDLE",
      port: 8000,
      cpu: 0,
      memory: 0,
      logs: ["Sandbox idle. Press Deploy/Run to spawn host process..."],
      uptime: 0,
      url: "https://news-bot.jackoshub.local"
    },
    {
      id: "proc_2",
      name: "Jack API Server",
      lang: "javascript",
      code: TEMPLATES[1].code,
      status: "DEPLOYED",
      port: 8080,
      cpu: 1.2,
      memory: 24.5,
      logs: [
        "[SYSTEM] Bootstrapping node server on standard port 8080...",
        "[SERVER] REST API listening on port 8080",
        "[HTTP-GET] Healthcheck request completed on path: /api/v1/extract (Status: 200)",
        "[SERVER] Monitoring active connection pools (Active clients: 1)..."
      ],
      uptime: 120,
      url: "https://api-server.jackoshub.local:8080"
    }
  ]);

  const [selectedProcId, setSelectedProcId] = useState<string>("proc_1");
  const [newProcName, setNewProcName] = useState("");
  const [newProcLang, setNewProcLang] = useState<"javascript" | "python">("javascript");

  const selectedProc = processes.find(p => p.id === selectedProcId) || processes[0];

  // Live simulations for deployed/running processes
  useEffect(() => {
    const timer = setInterval(() => {
      setProcesses(prev => prev.map(p => {
        if (p.status === "RUNNING" || p.status === "DEPLOYED") {
          // Dynamic simulation logs
          const extraLogs = [...p.logs];
          if (Math.random() > 0.7) {
            const time = new Date().toLocaleTimeString();
            if (p.name.includes("Telegram")) {
              extraLogs.push(`[POLL] [${time}] Check webhook gateway... 0 new messages`);
            } else if (p.name.includes("API")) {
              extraLogs.push(`[HTTP-GET] [${time}] Requested route '/' from local sandbox tunnel IP.`);
            } else {
              extraLogs.push(`[ENGINE] [${time}] Diagnostic sweep completed (All nodes green)`);
            }
          }

          // Keep logs length reasonable
          const finalLogs = extraLogs.slice(-40);

          return {
            ...p,
            uptime: p.uptime + 1,
            cpu: Number((Math.random() * 5 + (p.status === "DEPLOYED" ? 1 : 12)).toFixed(1)),
            memory: Number((p.memory + (Math.random() * 0.4 - 0.2)).toFixed(1)),
            logs: finalLogs
          };
        }
        return p;
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCreateProcess = () => {
    if (!newProcName.trim()) return;
    sound.playClick();
    const id = "proc_" + Math.random().toString(36).substring(2, 9);
    const port = Math.floor(4000 + Math.random() * 5000);
    const newProc: ProcessNode = {
      id,
      name: newProcName,
      lang: newProcLang,
      code: newProcLang === "javascript" ? TEMPLATES[1].code : TEMPLATES[0].code,
      status: "IDLE",
      port,
      cpu: 0,
      memory: 0,
      logs: ["Process created. Paste your script payload and press Deploy / Run."],
      uptime: 0,
      url: `https://${newProcName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jackoshub.local:${port}`
    };

    setProcesses([...processes, newProc]);
    setSelectedProcId(id);
    setNewProcName("");
  };

  const handleDeleteProcess = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (processes.length <= 1) {
      sound.playError();
      return;
    }
    sound.playClick();
    const updated = processes.filter(p => p.id !== id);
    setProcesses(updated);
    if (selectedProcId === id) {
      setSelectedProcId(updated[0].id);
    }
  };

  const handleStartProcess = async (id: string) => {
    sound.playClick();
    
    setProcesses(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: "RUNNING",
          cpu: 18.4,
          memory: 45.2,
          logs: [
            `[SYSTEM] Spawning process virtual execution thread (Lang: ${p.lang.toUpperCase()})...`,
            `[SANDBOX] Mapping sandbox virtual network adapter on port ${p.port}...`,
            `[CONSOLE] Executing deployment code segments...`
          ]
        };
      }
      return p;
    }));

    // Trigger API backend notification log to register run in terminal
    try {
      const proc = processes.find(p => p.id === id);
      if (proc) {
        await fetch("/api/scripts/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: proc.code,
            type: proc.lang,
            username: user.username
          })
        });
      }
    } catch(err){}

    await new Promise(r => setTimeout(r, 800));
    sound.playSuccess();

    setProcesses(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: "DEPLOYED",
          logs: [
            ...p.logs,
            `[SYSTEM] DEPLOYMENT CONCLUDED SUCCESSFULLY. Host listening on port ${p.port}.`,
            `[SYSTEM] Dynamic remote tunnel hooked on URL: ${p.url}`
          ]
        };
      }
      return p;
    }));
  };

  const handleStopProcess = (id: string) => {
    sound.playClick();
    setProcesses(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: "IDLE",
          cpu: 0,
          memory: 0,
          logs: [...p.logs, "[SYSTEM] Terminated user process. Port released."]
        };
      }
      return p;
    }));
  };

  const handleCodeChange = (val: string) => {
    setProcesses(prev => prev.map(p => {
      if (p.id === selectedProcId) {
        return { ...p, code: val };
      }
      return p;
    }));
  };

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Sidebar: Server Processes list */}
      <div className="xl:col-span-4 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
              DYNAMIC LOCAL HOSTS
            </h3>
            <span className="text-[10px] bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-lg font-bold font-mono">
              {processes.filter(p => p.status === "DEPLOYED" || p.status === "RUNNING").length} ACTIVE
            </span>
          </div>

          <div className="space-y-2.5 max-h-[22rem] overflow-y-auto scrollbar-thin">
            {processes.map((p) => {
              const isActive = selectedProcId === p.id;
              const isOnline = p.status === "DEPLOYED" || p.status === "RUNNING";
              return (
                <div
                  key={p.id}
                  onClick={() => { sound.playClick(); setSelectedProcId(p.id); }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between font-mono ${
                    isActive 
                      ? "bg-cyan-950/25 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/10" 
                      : "bg-slate-950/60 border-slate-850 hover:border-slate-800 hover:bg-slate-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="relative">
                      <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`}></div>
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-200 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {p.lang.toUpperCase()} | PORT: {p.port}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-bold text-[10px]">
                    {isOnline && (
                      <span className="text-emerald-400 shrink-0">
                        {p.cpu}% CPU
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDeleteProcess(p.id, e)}
                      className="text-slate-600 hover:text-red-400 p-1 cursor-pointer transition-colors"
                      title="Destroy host process"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add new process controller */}
          <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-3 font-mono">
            <div>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl text-xs placeholder:text-slate-700 outline-none focus:border-cyan-500"
                placeholder="New Process Name... e.g. IG Bot"
                value={newProcName}
                onChange={(e) => setNewProcName(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <select
                className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-400 px-2 py-2 rounded-xl outline-none"
                value={newProcLang}
                onChange={(e) => setNewProcLang(e.target.value as any)}
              >
                <option value="javascript">JavaScript (Node)</option>
                <option value="python">Python v3.10</option>
              </select>

              <button
                onClick={handleCreateProcess}
                disabled={!newProcName.trim()}
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-100 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                ADD
              </button>
            </div>
          </div>
        </div>

        {/* Global stats panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-2 gap-4 font-mono">
          <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
              <Cpu className="w-3.5 h-3.5" /> CPU OVERHEAD
            </div>
            <p className="text-sm font-bold text-slate-300 mt-1">
              {processes.reduce((acc, p) => acc + p.cpu, 0).toFixed(1)}% / 400%
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
              <HardDrive className="w-3.5 h-3.5" /> MEMORY UTIL
            </div>
            <p className="text-sm font-bold text-slate-300 mt-1">
              {processes.reduce((acc, p) => acc + p.memory, 0).toFixed(1)} MB
            </p>
          </div>
        </div>
      </div>

      {/* IDE Editor & Console Log Output (Right Panel) */}
      <div className="xl:col-span-8 flex flex-col space-y-4">
        {/* Editor Screen */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">
                ACTIVE WORKSPACE IDE: {selectedProc.name.toUpperCase()} ({selectedProc.lang.toUpperCase()})
              </span>
            </div>

            {/* Deploy controls */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-slate-500 font-semibold">
                PORT: {selectedProc.port}
              </span>

              {selectedProc.status === "DEPLOYED" || selectedProc.status === "RUNNING" ? (
                <button
                  onClick={() => handleStopProcess(selectedProc.id)}
                  className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/20 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Square className="w-3 h-3" /> STOP PROCESS
                </button>
              ) : (
                <button
                  onClick={() => handleStartProcess(selectedProc.id)}
                  className="px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/20 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3 h-3" /> DEPLOY / RUN
                </button>
              )}
            </div>
          </div>

          <textarea
            rows={10}
            className="w-full bg-slate-950 border-0 text-emerald-400 font-mono text-xs p-5 focus:ring-0 outline-none resize-none leading-relaxed"
            value={selectedProc.code}
            onChange={(e) => {
              sound.playTyping();
              handleCodeChange(e.target.value);
            }}
          />

          {/* Simulated Web Server URL banner */}
          {(selectedProc.status === "DEPLOYED" || selectedProc.status === "RUNNING") && (
            <div className="bg-cyan-950/15 border-t border-slate-800 px-5 py-2 flex items-center gap-2 text-[10px] font-mono">
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-slate-400">Deployed dynamic tunnel URL:</span>
              <a href="#tunnel" className="text-cyan-400 font-bold hover:underline" onClick={(e) => e.preventDefault()}>
                {selectedProc.url}
              </a>
              <span className="ml-auto text-slate-500">Uptime: {formatUptime(selectedProc.uptime)}</span>
            </div>
          )}
        </div>

        {/* Live Terminal Console logs */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono">
          <div className="flex justify-between items-center mb-3 text-[10px]">
            <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              TERMINAL stdout RELAY (PROCESS ID: {selectedProc.id})
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-850/60 rounded-xl p-4 h-48 overflow-y-auto space-y-1.5 leading-relaxed scrollbar-thin">
            {selectedProc.logs.map((log, idx) => {
              let colorClass = "text-slate-300";
              if (log.startsWith("[SYSTEM]")) colorClass = "text-cyan-400";
              else if (log.startsWith("[SERVER]")) colorClass = "text-indigo-400 font-semibold";
              else if (log.startsWith("[POLL]")) colorClass = "text-amber-400";
              else if (log.startsWith("[HTTP-GET]")) colorClass = "text-emerald-400 font-bold";
              else if (log.startsWith("[ERROR]")) colorClass = "text-red-400 font-bold";

              return (
                <p key={idx} className={`text-[11px] break-all ${colorClass}`}>
                  {log}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
