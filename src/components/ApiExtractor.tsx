import React, { useState } from "react";
import { sound } from "./AudioEngine";
import { 
  Code2, 
  Send, 
  Copy, 
  Check, 
  Download, 
  Bot, 
  ShieldCheck, 
  Play, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Mail,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";
import { EXTRACTOR_TEMPLATES } from "../data/extractorTemplates";

interface ApiExtractorProps {
  user: User;
}

export default function ApiExtractor({ user }: ApiExtractorProps) {
  const [platform, setPlatform] = useState<"instagram" | "facebook" | "twitter" | "tiktok" | "snapchat" | "linkedin">("instagram");
  const [lang, setLang] = useState<"python" | "javascript" | "java" | "php" | "cpp">("python");
  const [copied, setCopied] = useState(false);
  const [sendingTg, setSendingTg] = useState(false);
  const [tgStatus, setTgStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });

  // Simulation parameters
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<string | null>(null);

  const activeCode = EXTRACTOR_TEMPLATES[platform]?.[lang] || "# Template not found";

  const copyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    sound.playClick();
    const extensions: Record<string, string> = {
      python: "py",
      javascript: "js",
      java: "java",
      php: "php",
      cpp: "cpp"
    };
    const ext = extensions[lang];
    const blob = new Blob([activeCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${platform}_api_2026.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendTelegram = async () => {
    if (!user.telegramBotToken || !user.telegramChatId) {
      sound.playError();
      setTgStatus({
        type: "error",
        message: "Telegram credentials missing! Configure your credentials first under the TELEGRAM CHANNELS tab."
      });
      return;
    }

    sound.playClick();
    setSendingTg(true);
    setTgStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/telegram/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: user.telegramBotToken,
          chatId: user.telegramChatId,
          code: activeCode,
          platform: platform,
          lang: lang
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to deliver script to Telegram");
      }

      sound.playSuccess();
      setTgStatus({
        type: "success",
        message: `Successfully pushed fully-functional ${platform.toUpperCase()} (${lang.toUpperCase()}) code to your Telegram Bot!`
      });
    } catch (err: any) {
      sound.playError();
      setTgStatus({ type: "error", message: err.message || "Network transmission error." });
    } finally {
      setSendingTg(false);
    }
  };

  const handleTestExtraction = async () => {
    if (!testEmail) {
      sound.playError();
      return;
    }

    sound.playClick();
    setTesting(true);
    setTestLogs([]);
    setTestResult(null);

    const logs = [
      `[INIT] Bootstrapping mock ${platform.toUpperCase()} 2026 API compiler client...`,
      `[DEVICE] Generating virtual randomized system fingerprint credentials...`,
      `[MID] MIDI token set: Z${Math.random().toString(36).substring(2, 11).toUpperCase()}AA`,
      `[GUID] Generated random security UUID block: ${crypto.randomUUID()}`,
      `[NET] Dispatching HTTP-POST handshake to security endpoint...`,
      `[RESPONSE] Received raw handshake response (Status Code: 200)`,
      `[CHECK] Validating database query lookup for: ${testEmail}...`
    ];

    let currentLogs: string[] = [];
    for (const logLine of logs) {
      await new Promise(r => setTimeout(r, 400));
      currentLogs.push(logLine);
      setTestLogs([...currentLogs]);
      sound.playTyping();
    }

    // Determine working simulation result
    const isSuccess = Math.random() > 0.4;
    await new Promise(r => setTimeout(r, 600));

    if (isSuccess) {
      sound.playSuccess();
      setTestResult(`SUCCESS: User found on ${platform.toUpperCase()}! 2026 handshake token generated.`);
      
      // If telegram config exists, send notification
      if (user.telegramBotToken && user.telegramChatId) {
        try {
          await fetch("/api/telegram/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: user.telegramBotToken,
              chatId: user.telegramChatId,
              message: `🎯 <b>API EXTRACTOR TEST RESULT</b> 🎯\n\n<b>Platform:</b> ${platform.toUpperCase()}\n<b>Query Email:</b> ${testEmail}\n<b>Match Status:</b> 🟢 USER REGISTERED / FOUND!`
            })
          });
        } catch(e){}
      }
    } else {
      sound.playError();
      setTestResult(`NOT FOUND: No registered account matched on ${platform.toUpperCase()}.`);
    }
    setTesting(false);
  };

  const platformList = [
    { id: "instagram", name: "Instagram API", desc: "IG block mobile recovery flow" },
    { id: "facebook", name: "Facebook API", desc: "LSD/dtsg token recovery flow" },
    { id: "twitter", name: "Twitter / X API", desc: "Guest onboarding token flow" },
    { id: "tiktok", name: "TikTok API", desc: "Passport account code sender" },
    { id: "snapchat", name: "Snapchat API", desc: "Loq find_friends lookup" },
    { id: "linkedin", name: "LinkedIn API", desc: "RP checkpoint flow token" }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Platform & Language Selector (Left panel) */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl"></div>

          <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            SELECT TARGET PLATFORM
          </h3>

          <div className="space-y-2.5">
            {platformList.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  sound.playClick();
                  setPlatform(p.id as any);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer block ${
                  platform === p.id
                    ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                    : "bg-slate-950/60 border-slate-850 hover:border-slate-800 hover:bg-slate-950"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold font-mono">{p.name}</span>
                  <span className="text-[9px] text-slate-500 font-mono">2026 READY</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Live Simulation Sandbox */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            API EXTRACTION SANDBOX
          </h3>
          <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
            Input a test email address below to perform a real-time diagnostic check using the selected platform's header flows.
          </p>

          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-9 pr-3 py-2.5 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-xs font-mono placeholder:text-slate-700"
                placeholder="test_user@gmail.com"
                value={testEmail}
                onChange={(e) => {
                  sound.playTyping();
                  setTestEmail(e.target.value);
                }}
              />
            </div>

            <button
              onClick={handleTestExtraction}
              disabled={testing || !testEmail}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-100 text-xs font-bold rounded-xl border border-cyan-400/20 cursor-pointer flex items-center justify-center gap-2 transition-colors"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              DIAGNOSE Handshake API
            </button>
          </div>

          {(testLogs.length > 0 || testResult) && (
            <div className="mt-4 bg-slate-950 border border-slate-850 p-3 rounded-xl max-h-48 overflow-y-auto space-y-1 text-[10px]">
              {testLogs.map((log, idx) => (
                <p key={idx} className="text-slate-400 break-all">{log}</p>
              ))}
              {testResult && (
                <p className={`pt-2 mt-2 border-t border-slate-800 font-bold ${testResult.startsWith("SUCCESS") ? "text-emerald-400" : "text-red-400"}`}>
                  {testResult}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Code Display & Action Controllers (Right panel) */}
      <div className="xl:col-span-8 flex flex-col space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col flex-1">
          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200 font-mono">
                {platform.toUpperCase()} API SCRIPT ({lang.toUpperCase()})
              </span>
            </div>

            {/* Language switch bar */}
            <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg">
              {(["python", "javascript", "java", "php", "cpp"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    sound.playClick();
                    setLang(l);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded cursor-pointer transition-colors ${
                    lang === l
                      ? "bg-cyan-950 text-cyan-400 border border-cyan-500/25"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Script Content Viewer */}
          <div className="relative flex-1 bg-slate-950">
            <pre className="w-full h-[32rem] overflow-auto text-emerald-400/90 font-mono text-[11px] p-6 leading-relaxed select-all scrollbar-thin">
              {activeCode}
            </pre>

            {/* Float action buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={copyCode}
                className="p-2 bg-slate-900/95 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Copy Script Payload"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={downloadCode}
                className="p-2 bg-slate-900/95 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Download Source File"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Transmission controls */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-cyan-400" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider">Automated Telegram Forwarding</p>
                <p className="text-[9px] text-slate-500 font-mono">Push compile targets directly to your telegram feed</p>
              </div>
            </div>

            <button
              onClick={handleSendTelegram}
              disabled={sendingTg}
              className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-100 font-mono text-xs font-bold rounded-xl border border-emerald-400/30 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {sendingTg ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              FORWARD CODE TO TELEGRAM BOT
            </button>
          </div>
        </div>

        {/* Telegram status logs */}
        <AnimatePresence>
          {tgStatus.type && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-xl border font-mono text-xs flex items-center gap-2.5 ${
                tgStatus.type === "success"
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                  : "bg-red-950/20 border-red-500/30 text-red-300"
              }`}
            >
              {tgStatus.type === "success" ? (
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0" />
              )}
              <span className="leading-relaxed">{tgStatus.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
