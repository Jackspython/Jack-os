import React, { useState, useEffect, useRef } from "react";
import { sound } from "./AudioEngine";
import { Terminal, Shield, Cpu, RefreshCw, Send, Trash2, Power, HelpCircle, Bot, AlertTriangle, Layers } from "lucide-react";
import { motion } from "motion/react";
import { User } from "../types";

interface TerminalAppProps {
  user: User;
  onLogout: () => void;
}

export default function TerminalApp({ user, onLogout }: TerminalAppProps) {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<string[]>([
    "JACK OS v2.0 - ULTRA SECURE WEB TERMINAL HUB",
    "Owner: @Jackspython | Channel: @Jackspython",
    "--------------------------------------------------",
    `🔐 WELCOME BACK AGENT: ${user.username.toUpperCase()}`,
    `📧 SESSION ID: ${user.email}`,
    "🚨 TELEGRAM INTEGRITY MONITOR: ACTIVE",
    "Type 'help' or click utility tabs to trigger modules.",
    ""
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const executeCommand = (cmdText: string) => {
    const args = cmdText.trim().split(" ");
    const command = args[0].toLowerCase();
    const cleanCmd = cmdText.trim();

    sound.playClick();
    let response: string[] = [`[user@jack-os]$ ${cmdText}`];

    switch (command) {
      case "help":
        response.push(
          "AVAILABLE CORE TERMINAL SYSTEMS:",
          "  help           Display this help catalog",
          "  clear          Empty the terminal stream buffer",
          "  system_info    Display hardware metrics & virtual cluster stats",
          "  rat            Toggle educational Remote Access socket listener",
          "  ddos           Simulate target stress load test sweep",
          "  exploitdb      Retrieve details from exploit indexing DB",
          "  calc <expr>    Safe scientific evaluator (e.g. calc 25*4)",
          "  sqlmap         Scan URL parameters for active SQLi injection",
          "  telegram_test  Verify Telegram integration state",
          "  logout         Terminate active session securely"
        );
        break;

      case "clear":
        setLogs([]);
        return;

      case "system_info":
        response.push(
          "💻 JACK OS VIRTUAL CLUSTER STATS:",
          `  • HOST NODE: ${window.location.hostname}`,
          "  • ENHANCED COMPILING: ACTIVE (esbuild native)",
          `  • CORE KERNEL: NODE ${process.env.NODE_ENV || "development"} API proxy`,
          "  • TELEGRAM RELAY STATUS: CONNECTED",
          "  • ALLOCATED BUFFER HEAP: 412 MB / 1024 MB",
          "  • IP TUNNEL: ANONYMOUS SOCKS5 PROXY"
        );
        break;

      case "rat":
        response.push(
          "💀 REMOTE ACCESS HOOK (RAT SIMULATION) INITIATED...",
          "  [+] Launching local listener on port: 4444",
          "  [+] Waiting for incoming remote connection buffer...",
          "  [!] SIMULATION: Connection hook dispatched. Active back-shell open."
        );
        break;

      case "ddos":
        if (args.length < 2) {
          response.push("❌ Usage: ddos <target_ip_or_domain>");
        } else {
          response.push(
            `🔥 STRESS TESTING INITIATED AGAINST: ${args[1]}`,
            "  [+] Spawning 150 local network threads...",
            "  [+] Overflow packets transmitting [size 64KB, SOCKS5]...",
            "  [+] Target threshold saturated. System load-testing confirmed."
          );
        }
        break;

      case "exploitdb":
        response.push(
          "📂 REPRODUCIBLE CVE EXPLOIT ARCHIVES:",
          "  • CVE-2026-1022 - RCE Buffer Overflow [Linux Kernel v6.12] - Remote",
          "  • CVE-2026-4439 - SQL Command Injector [Express-Router] - Remote",
          "  • CVE-2026-9051 - Zero-Width Unicode Steg Vulnerability [DOM parser]"
        );
        break;

      case "calc":
        if (args.length < 2) {
          response.push("❌ Usage: calc <mathematical_expression>");
        } else {
          try {
            const expr = args.slice(1).join("");
            // safe evaluator of simple math
            if (/^[0-9+\-*/().\s]+$/.test(expr)) {
              const res = Function(`"use strict"; return (${expr})`)();
              response.push(`📝 Evaluator Output: ${res}`);
            } else {
              response.push("❌ Security violation: Invalid character in expression.");
            }
          } catch (e) {
            response.push("❌ Syntax error in science evaluator.");
          }
        }
        break;

      case "sqlmap":
        if (args.length < 2) {
          response.push("❌ Usage: sqlmap <target_url>");
        } else {
          response.push(
            `🔎 SCANNING SQL INJECTION ON URL: ${args[1]}`,
            "  [*] Testing parameters: 'id', 'user', 'session'",
            "  [!] Injecting Payload: ' UNION SELECT 1,2,3--",
            "  [!] ALERT: Target DOM displays SQL debug log outputs. POTENTIALLY VULNERABLE."
          );
        }
        break;

      case "telegram_test":
        response.push(
          "🤖 TESTING TELEGRAM RELAY CREDENTIAL INTEGRITY...",
          `  • Admin Bot: ${ADMIN_INFO}`,
          user.telegramBotToken 
            ? `  • User Bot Token: PROVIDE STATUS [OK]` 
            : "  • User Bot Token: NOT CONFIGURED (Defaulting to Admin channel)"
        );
        break;

      case "logout":
        onLogout();
        return;

      default:
        response.push(`❌ Command not recognized: '${command}'. Type 'help' for diagnostics.`);
    }

    setLogs((prev) => [...prev, ...response, ""]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeCommand(input);
    setInput("");
  };

  const ADMIN_INFO = "8290595105 (ACTIVE MONITORING)";

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs flex flex-col shadow-2xl h-96">
      {/* Top Console Bar */}
      <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4.5 h-4.5 text-cyan-400" />
          <span className="font-bold text-slate-200 tracking-wider">JACK OS CONSOLE RECEPTOR</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
            SHIELD MONITOR LIVE
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onLogout();
            }}
            className="p-1.5 bg-slate-950 border border-slate-850 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-lg cursor-pointer transition-colors"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal logs body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-1.5 scrollbar-thin bg-slate-950/60 leading-relaxed max-h-72">
        {logs.map((log, idx) => {
          let lineClass = "text-slate-300";
          if (log.startsWith("[user@jack-os]")) lineClass = "text-cyan-400 font-bold";
          else if (log.startsWith("❌")) lineClass = "text-red-400";
          else if (log.startsWith("📝") || log.startsWith("💻")) lineClass = "text-emerald-400";
          else if (log.startsWith("💀") || log.startsWith("🔥")) lineClass = "text-rose-400 font-bold";
          else if (log.includes("🔐") || log.includes("🚨")) lineClass = "text-cyan-300 font-semibold";

          return (
            <div key={idx} className={lineClass}>
              {log}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Command input form */}
      <form onSubmit={handleFormSubmit} className="p-3 border-t border-slate-800 bg-slate-900/40 flex items-center gap-3">
        <span className="text-cyan-500 font-bold pl-2">jack-os$</span>
        <input
          type="text"
          className="flex-1 bg-transparent border-0 text-slate-100 outline-none focus:ring-0 text-xs font-mono placeholder:text-slate-700"
          placeholder="Type 'help' or custom actions..."
          value={input}
          onChange={(e) => {
            sound.playTyping();
            setInput(e.target.value);
          }}
        />
        <button
          type="submit"
          className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-100 border border-cyan-400/20 rounded-lg cursor-pointer transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
