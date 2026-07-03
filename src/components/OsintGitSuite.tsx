import React, { useState, useEffect } from "react";
import { sound } from "./AudioEngine";
import { 
  Shield, 
  Search, 
  Terminal, 
  GitBranch, 
  FolderGit, 
  Layers, 
  Download, 
  Copy, 
  ExternalLink, 
  Play, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Sparkles,
  Link2,
  FileText,
  Clock,
  Code2,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";
import { apiFetch } from "../utils/api";

interface OsintGitSuiteProps {
  user: User;
  initialTab?: "sherlock" | "katana" | "gau" | "gitexplorer" | "extractor";
}

export default function OsintGitSuite({ user, initialTab = "sherlock" }: OsintGitSuiteProps) {
  const [activeSubTab, setActiveSubTab] = useState<"sherlock" | "katana" | "gau" | "gitexplorer" | "extractor">(initialTab as any);
  
  // Telegram Routing State
  const [sendingTelegram, setSendingTelegram] = useState<Record<string, boolean>>({});

  const handleSendToTelegram = async (reportType: string, target: string, data: any) => {
    if (!user.telegramBotToken || !user.telegramChatId) {
      sound.playError();
      showNotification("Telegram bot details not configured. Setup in Telegram Settings.", "error");
      return;
    }

    sound.playClick();
    setSendingTelegram(prev => ({ ...prev, [reportType]: true }));

    try {
      const res = await apiFetch("/api/telegram/send-osint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: user.telegramBotToken,
          chatId: user.telegramChatId,
          reportType,
          target,
          data
        })
      });

      if (res.ok) {
        sound.playSuccess();
        showNotification(`Sent ${reportType} report to Telegram!`, "success");
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Network routing failed.");
      }
    } catch (err: any) {
      sound.playError();
      showNotification(`Failed to route: ${err.message}`, "error");
    } finally {
      setSendingTelegram(prev => ({ ...prev, [reportType]: false }));
    }
  };
  
  // Sherlock State
  const [sherlockUsername, setSherlockUsername] = useState("");
  const [sherlockLoading, setSherlockLoading] = useState(false);
  const [sherlockLogs, setSherlockLogs] = useState<string[]>([]);
  const [sherlockResults, setSherlockResults] = useState<any[]>([]);
  const [sherlockProgress, setSherlockProgress] = useState(0);

  // Katana State
  const [katanaUrl, setKatanaUrl] = useState("");
  const [katanaLoading, setKatanaLoading] = useState(false);
  const [katanaLogs, setKatanaLogs] = useState<string[]>([]);
  const [katanaEndpoints, setKatanaEndpoints] = useState<any[]>([]);
  const [katanaFilter, setKatanaFilter] = useState("all");

  // GAU / Wayback State
  const [gauDomain, setGauDomain] = useState("");
  const [gauLoading, setGauLoading] = useState(false);
  const [gauLogs, setGauLogs] = useState<string[]>([]);
  const [gauResults, setGauResults] = useState<any[]>([]);
  const [gauSearchQuery, setGauSearchQuery] = useState("");

  // Git Explorer State
  const [repoUrl, setRepoUrl] = useState("");
  const [repoLoading, setRepoLoading] = useState(false);
  const [repoError, setRepoError] = useState("");
  const [repoFiles, setRepoFiles] = useState<any[]>([]);
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [currentRepoName, setCurrentRepoName] = useState("");

  // API Extractor State
  const [extractorUrl, setExtractorUrl] = useState("");
  const [extractorDepth, setExtractorDepth] = useState(1);
  const [extractorValidate, setExtractorValidate] = useState(true);
  const [extractorProxy, setExtractorProxy] = useState(false);
  const [extractorLoading, setExtractorLoading] = useState(false);
  const [extractorLogs, setExtractorLogs] = useState<string[]>([]);
  const [extractorEndpoints, setExtractorEndpoints] = useState<any[]>([]);
  const [extractorAuthFindings, setExtractorAuthFindings] = useState<any[]>([]);
  const [extractorFilter, setExtractorFilter] = useState("all");
  const [extractorSearchQuery, setExtractorSearchQuery] = useState("");

  // Common notification helper
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    sound.playClick();
    showNotification("Copied to clipboard!", "success");
  };

  // Preconfigured Git Tools
  const GIT_PRESETS = [
    { name: "sherlock-project/sherlock", url: "https://github.com/sherlock-project/sherlock" },
    { name: "soxoj/maigret", url: "https://github.com/soxoj/maigret" },
    { name: "bugbasesecurity/pentest-copilot", url: "https://github.com/bugbasesecurity/pentest-copilot" },
    { name: "dedibagus/aipentestcopilot", url: "https://github.com/dedibagus/aipentestcopilot" },
    { name: "ben-slates/CVE-FINDER", url: "https://github.com/ben-slates/CVE-FINDER" },
    { name: "26zl/cybersec-toolkit", url: "https://github.com/26zl/cybersec-toolkit" },
    { name: "Quincunx33/EthicalHackingTools", url: "https://github.com/Quincunx33/EthicalHackingTools" },
    { name: "projectdiscovery/katana", url: "https://github.com/projectdiscovery/katana" },
    { name: "lc/gau", url: "https://github.com/lc/gau" }
  ];

  // 1. Sherlock Run
  const handleSherlockScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sherlockUsername.trim()) return;
    sound.playClick();
    setSherlockLoading(true);
    setSherlockResults([]);
    setSherlockProgress(0);
    setSherlockLogs([
      `[SYSTEM] [${new Date().toLocaleTimeString()}] Spawning Sherlock execution thread...`,
      `[SYSTEM] Loaded database of target platforms...`,
      `[+] Scanning alias: "${sherlockUsername}"`
    ]);

    try {
      const serverUrl = localStorage.getItem("jack_os_api_server_url") || "";
      const res = await fetch(`${serverUrl}/api/osint/sherlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: sherlockUsername, username_session: user.username })
      });
      
      if (!res.ok) {
        throw new Error("Target scanning returned a connection failure.");
      }

      const data = await res.json();
      
      if (data.success) {
        // Animate simulation of logs
        let currentIdx = 0;
        const total = data.results.length;
        
        const interval = setInterval(() => {
          if (currentIdx < total) {
            const platform = data.results[currentIdx];
            setSherlockLogs(prev => [
              ...prev,
              `[${platform.status === "FOUND" ? "✓" : "✗"}] Searching in ${platform.name}...`
            ]);
            if (platform.status === "FOUND") {
              setSherlockResults(prev => [...prev, platform]);
            }
            setSherlockProgress(Math.round(((currentIdx + 1) / total) * 100));
            currentIdx++;
          } else {
            clearInterval(interval);
            setSherlockLogs(prev => [
              ...prev,
              `[SYSTEM] Sherlock audit completed. Detected ${data.results.filter((r: any) => r.status === "FOUND").length} active user matches.`
            ]);
            setSherlockLoading(false);
          }
        }, 150);
      } else {
        throw new Error(data.error || "Execution failed");
      }
    } catch (err: any) {
      setSherlockLogs(prev => [...prev, `[!] Critical: ${err.message}`]);
      setSherlockLoading(false);
    }
  };

  // 2. Katana Run
  const handleKatanaScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!katanaUrl.trim()) return;
    sound.playClick();
    setKatanaLoading(true);
    setKatanaEndpoints([]);
    setKatanaLogs([
      `[SYSTEM] [${new Date().toLocaleTimeString()}] Starting Katana spider engine...`,
      `[SYSTEM] Initializing headless AST tree analyzer...`,
      `[+] Crawling domain node: ${katanaUrl}`
    ]);

    try {
      const serverUrl = localStorage.getItem("jack_os_api_server_url") || "";
      const res = await fetch(`${serverUrl}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: katanaUrl, username: user.username })
      });

      if (!res.ok) {
        throw new Error("Failed network socket fetch.");
      }

      const data = await res.json();

      setKatanaLogs(prev => [
        ...prev,
        `[✓] Target metadata captured. Title: "${data.title}"`,
        `[+] Compiling links, endpoints, script bundles, and email addresses...`,
        `[SYSTEM] Katana scanner finished. Extracted ${data.links?.length || 0} relative links, ${data.emails?.length || 0} email addresses.`
      ]);

      const compiled: any[] = [];
      if (data.links) {
        data.links.forEach((l: any) => {
          if (l) {
            const lStr = String(l);
            compiled.push({
              value: lStr,
              type: lStr.includes("api") || lStr.includes("graphql") || lStr.includes("v1") || lStr.includes("v2") ? "api" : "link"
            });
          }
        });
      }
      if (data.emails) {
        data.emails.forEach((e: string) => {
          compiled.push({ value: e, type: "email" });
        });
      }
      if (data.scripts) {
        data.scripts.forEach((s: string) => {
          compiled.push({ value: s, type: "script" });
        });
      }

      setKatanaEndpoints(compiled);
      setKatanaLoading(false);
    } catch (err: any) {
      setKatanaLogs(prev => [...prev, `[!] Execution error: ${err.message}`]);
      setKatanaLoading(false);
    }
  };

  // 3. GAU / Wayback Run
  const handleGauScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gauDomain.trim()) return;
    sound.playClick();
    setGauLoading(true);
    setGauResults([]);
    setGauLogs([
      `[SYSTEM] [${new Date().toLocaleTimeString()}] Initializing GAU Wayback engine...`,
      `[SYSTEM] Querying Wayback archival database for domain: ${gauDomain}...`,
      `[+] Dispatching public API cluster requests...`
    ]);

    try {
      const serverUrl = localStorage.getItem("jack_os_api_server_url") || "";
      const res = await fetch(`${serverUrl}/api/osint/wayback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: gauDomain, username: user.username })
      });

      if (!res.ok) {
        throw new Error("Wayback database connection timeout.");
      }

      const data = await res.json();

      if (data.success) {
        setGauLogs(prev => [
          ...prev,
          `[✓] Wayback machine records fetched successfully!`,
          `[SYSTEM] Parsed ${data.results.length} historical URLs and endpoint records.`
        ]);
        setGauResults(data.results);
      } else {
        throw new Error(data.error || "Retrieval error");
      }
      setGauLoading(false);
    } catch (err: any) {
      setGauLogs(prev => [...prev, `[!] Failed: ${err.message}`]);
      setGauLoading(false);
    }
  };

  // 3b. API Extractor Run
  const handleExtractorRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractorUrl.trim()) return;
    sound.playClick();
    setExtractorLoading(true);
    setExtractorEndpoints([]);
    setExtractorAuthFindings([]);
    setExtractorLogs([
      `[SYSTEM] [${new Date().toLocaleTimeString()}] Spawning High-Performance API Extractor Engine...`,
      `[SYSTEM] Rotating user agents and proxy configuration...`,
      `[+] Target: ${extractorUrl}`,
      `[+] Depth parameter: ${extractorDepth} | Validate: ${extractorValidate ? "ON" : "OFF"} | Proxy: ${extractorProxy ? "ON" : "OFF"}`
    ]);

    try {
      const serverUrl = localStorage.getItem("jack_os_api_server_url") || "";
      const res = await fetch(`${serverUrl}/api/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: extractorUrl,
          depth: extractorDepth,
          validate: extractorValidate,
          proxy: extractorProxy,
          username: user.username
        })
      });

      if (!res.ok) {
        throw new Error("API Extractor server node returned a connection failure.");
      }

      const data = await res.json();

      if (data.success) {
        setExtractorEndpoints(data.endpoints || []);
        setExtractorAuthFindings(data.auth_findings || []);

        // Stagger logs to make the audit review pleasant
        const tempLogs = [
          `[✓] Target analyzed successfully!`,
          `[SYSTEM] Processed ${data.endpoints?.length || 0} API endpoint routes.`,
          `[SYSTEM] Extracted ${data.auth_findings?.length || 0} credential keys & tokens.`,
          `[✓] Extraction complete.`
        ];

        let index = 0;
        const interval = setInterval(() => {
          if (index < tempLogs.length) {
            setExtractorLogs(prev => [...prev, tempLogs[index]]);
            sound.playBeep(450 + index * 50, 0.05);
            index++;
          } else {
            clearInterval(interval);
            setExtractorLoading(false);
            sound.playSuccess();
            showNotification("Ultimate API Extraction complete!", "success");

            // Auto-forward full results to Telegram if configured
            if (user.telegramBotToken && user.telegramChatId) {
              handleSendToTelegram("API Extractor Discovery", extractorUrl, data);
            }
          }
        }, 300);

      } else {
        throw new Error(data.error || "Extraction task failed.");
      }
    } catch (err: any) {
      setExtractorLogs(prev => [
        ...prev,
        `[!] CRITICAL FAILURE: ${err.message}`
      ]);
      setExtractorLoading(false);
      sound.playError();
      showNotification(`Extraction failed: ${err.message}`, "error");
    }
  };

  // 4. Git Explorer Load
  const handleGitLoad = async (presetUrl?: string) => {
    const targetUrl = presetUrl || repoUrl;
    if (!targetUrl.trim()) return;
    sound.playClick();
    setRepoLoading(true);
    setRepoError("");
    setRepoFiles([]);
    setSelectedFileContent("");
    setSelectedFileName("");

    // Extract user and repo
    const match = targetUrl.match(/github\.com\/([a-zA-Z0-9_\-.]+)\/([a-zA-Z0-9_\-.]+)/i);
    if (!match) {
      setRepoError("Invalid GitHub repository URL. Must be like https://github.com/owner/repo");
      setRepoLoading(false);
      return;
    }

    const owner = match[1];
    const name = match[2].replace(/\.git$/i, "");
    setCurrentRepoName(`${owner}/${name}`);

    try {
      // Query GitHub REST API to explorer repository files
      const res = await fetch(`https://api.github.com/repos/${owner}/${name}/contents`);
      if (!res.ok) {
        throw new Error("Failed to fetch repository structure. Ensure it is public.");
      }
      const files = await res.json();
      
      if (Array.isArray(files)) {
        setRepoFiles(files);
        showNotification(`Successfully loaded Git Repository: ${owner}/${name}`, "success");
      } else {
        throw new Error("Repository returned non-directory nodes.");
      }
      setRepoLoading(false);
    } catch (err: any) {
      setRepoError(err.message || "Error connecting to GitHub API");
      setRepoLoading(false);
    }
  };

  const handleFileClick = async (file: any) => {
    if (file.type !== "file") return;
    sound.playClick();
    setSelectedFileName(file.name);
    setSelectedFileContent("// Fetching file code content from GitHub CDN...");

    try {
      const res = await fetch(file.download_url);
      if (!res.ok) throw new Error("Could not download file content.");
      const text = await res.text();
      setSelectedFileContent(text);
    } catch (err: any) {
      setSelectedFileContent(`// Error loading file: ${err.message}`);
    }
  };

  const loadIntoScriptRunner = () => {
    if (!selectedFileContent) return;
    sound.playClick();
    localStorage.setItem("jack_os_preload_script", selectedFileContent);
    localStorage.setItem("jack_os_preload_script_name", selectedFileName);
    showNotification("Loaded into local Script Runner buffer! Switch to SCRIPT RUNNER tab.", "success");
  };

  const filteredKatanaEndpoints = katanaEndpoints.filter(ep => {
    if (katanaFilter === "all") return true;
    return ep.type === katanaFilter;
  });

  const filteredGauResults = (gauResults || []).filter(r => {
    if (!r) return false;
    if (!gauSearchQuery) return true;
    const originalStr = r.original ? String(r.original).toLowerCase() : "";
    const mimetypeStr = r.mimetype ? String(r.mimetype).toLowerCase() : "";
    const query = gauSearchQuery.toLowerCase();
    return originalStr.includes(query) || mimetypeStr.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Visual Notification HUD */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border font-mono text-xs shadow-2xl bg-slate-900 border-amber-500/30 text-amber-400"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="relative bg-slate-900/80 border border-amber-500/10 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-950/40 border border-amber-500/20 rounded-full text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> INTEL REPO SUITE ACTIVE
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
              OSINT & Git Repository Suite
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Leverage elite automated OSINT frameworks: Sherlock Username auditor, Katana webcrawler, and Wayback historical indexing.
            </p>
          </div>

          {/* Sub Navigation Bar */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-850 self-start md:self-center">
            <button
              onClick={() => { sound.playClick(); setActiveSubTab("sherlock"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSubTab === "sherlock" 
                  ? "bg-amber-950/50 border border-amber-500/30 text-amber-400" 
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              SHERLOCK AUDITOR
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveSubTab("katana"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSubTab === "katana" 
                  ? "bg-amber-950/50 border border-amber-500/30 text-amber-400" 
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              KATANA CRAWLER
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveSubTab("gau"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSubTab === "gau" 
                  ? "bg-amber-950/50 border border-amber-500/30 text-amber-400" 
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              GAU ARCHIVES
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveSubTab("gitexplorer"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSubTab === "gitexplorer" 
                  ? "bg-amber-950/50 border border-amber-500/30 text-amber-400" 
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              GIT REPO EXPLORER
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveSubTab("extractor"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSubTab === "extractor" 
                  ? "bg-amber-950/50 border border-amber-500/30 text-amber-400" 
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              API EXTRACTOR
            </button>
          </div>
        </div>
      </div>

      {/* Main Feature Container */}
      <div className="grid grid-cols-1 gap-6">

        {/* 1. SHERLOCK / MAIGRET */}
        {activeSubTab === "sherlock" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Search className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Sherlock Username Auditor</h3>
              </div>

              <form onSubmit={handleSherlockScan} className="space-y-3 font-mono">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase font-bold">Audit Target Alias</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. john_doe"
                      value={sherlockUsername}
                      onChange={(e) => { sound.playTyping(); setSherlockUsername(e.target.value); }}
                      className="w-full bg-slate-950 border border-slate-800 text-amber-400 px-3.5 py-2.5 rounded-xl text-xs focus:border-amber-500 outline-none placeholder:text-slate-700"
                    />
                    {sherlockLoading && (
                      <div className="absolute right-3.5 top-2.5">
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sherlockLoading || !sherlockUsername}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                >
                  <Play className="w-3.5 h-3.5" /> RUN SOCIAL AUDIT
                </button>
              </form>

              {/* Console Output logs */}
              <div className="flex-1 bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-[10px] space-y-2 overflow-y-auto max-h-56 min-h-[14rem]">
                <div className="flex items-center justify-between text-slate-500 pb-1.5 border-b border-slate-900 mb-1">
                  <span>TERMINAL FEED LOG</span>
                  <span>THREADS ACTIVE</span>
                </div>
                {sherlockLogs.map((log, idx) => (
                  <div key={idx} className="text-slate-300 leading-relaxed font-semibold">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Profile Match Results ({sherlockResults.length})</h3>
                </div>
                <div className="flex items-center gap-2.5">
                  {sherlockResults.length > 0 && (
                    <button
                      disabled={sendingTelegram["Sherlock"]}
                      onClick={() => handleSendToTelegram("Sherlock Social Identity matches", sherlockUsername, sherlockResults)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[10px] font-bold rounded-xl transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)] disabled:opacity-40"
                    >
                      {sendingTelegram["Sherlock"] ? (
                        <Loader2 className="w-3 h-3 animate-spin text-slate-950" />
                      ) : (
                        <Send className="w-3 h-3 text-slate-950" />
                      )}
                      FORWARD REPORT TO BOT
                    </button>
                  )}
                  {sherlockLoading && (
                    <span className="text-[10px] font-mono font-bold text-amber-400">Scanning Platforms... {sherlockProgress}%</span>
                  )}
                </div>
              </div>

              {sherlockResults.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-500 font-mono space-y-2">
                  <Terminal className="w-10 h-10 text-slate-700 animate-pulse" />
                  <p className="text-xs">No active scans triggered or matches discovered.</p>
                  <p className="text-[10px] text-slate-600">Enter username alias on the left and run diagnostic sweep.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[28rem] overflow-y-auto pr-1">
                  {sherlockResults.map((result, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/25 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">PLATFORM</p>
                          <h4 className="text-sm font-bold text-slate-100 font-display">{result.name}</h4>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500/20 rounded text-[9px] font-mono text-emerald-400 font-bold uppercase">FOUND</span>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[9px] font-mono text-slate-500 truncate">{result.profileUrl}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(result.profileUrl)}
                            className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg font-mono text-[9px] font-bold text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-2.5 h-2.5" /> COPY LINK
                          </button>
                          <a
                            href={result.profileUrl}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="flex-1 py-1.5 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/20 rounded-lg font-mono text-[9px] font-bold text-amber-400 flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> VISIT <ArrowRight className="w-2 h-2" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. KATANA / PHOTON CRAWLER */}
        {activeSubTab === "katana" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Globe className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Katana Site Crawler</h3>
              </div>

              <form onSubmit={handleKatanaScan} className="space-y-3 font-mono">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase font-bold">Target URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. example.com"
                      value={katanaUrl}
                      onChange={(e) => { sound.playTyping(); setKatanaUrl(e.target.value); }}
                      className="w-full bg-slate-950 border border-slate-800 text-amber-400 px-3.5 py-2.5 rounded-xl text-xs focus:border-amber-500 outline-none placeholder:text-slate-700"
                    />
                    {katanaLoading && (
                      <div className="absolute right-3.5 top-2.5">
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={katanaLoading || !katanaUrl}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                >
                  <Play className="w-3.5 h-3.5" /> RUN SPIDER CRUISE
                </button>
              </form>

              {/* Console Output logs */}
              <div className="flex-1 bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-[10px] space-y-2 overflow-y-auto max-h-56 min-h-[14rem]">
                <div className="flex items-center justify-between text-slate-500 pb-1.5 border-b border-slate-900 mb-1">
                  <span>KATANA NODE HARVESTER</span>
                  <span>COMPILING DATA</span>
                </div>
                {katanaLogs.map((log, idx) => (
                  <div key={idx} className="text-slate-300 leading-relaxed font-semibold">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4.5 h-4.5 text-cyan-400" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Discovered Entities ({filteredKatanaEndpoints.length})</h3>
                  </div>
                  {katanaEndpoints.length > 0 && (
                    <button
                      disabled={sendingTelegram["Katana"]}
                      onClick={() => handleSendToTelegram("Katana web spider crawled endpoints", katanaUrl, katanaEndpoints)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[9px] font-bold rounded-lg transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)] disabled:opacity-40"
                    >
                      {sendingTelegram["Katana"] ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-950" />
                      ) : (
                        <Send className="w-2.5 h-2.5 text-slate-950" />
                      )}
                      FORWARD REPORT
                    </button>
                  )}
                </div>
                
                {/* Filter buttons */}
                <div className="flex gap-1 bg-slate-950 border border-slate-850 p-0.5 rounded-lg text-[9px] font-mono">
                  {["all", "api", "link", "email", "script"].map(filterType => (
                    <button
                      key={filterType}
                      onClick={() => { sound.playClick(); setKatanaFilter(filterType); }}
                      className={`px-2 py-1 rounded capitalize cursor-pointer font-bold ${
                        katanaFilter === filterType 
                          ? "bg-amber-950/40 text-amber-400 border border-amber-500/25" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {filterType}
                    </button>
                  ))}
                </div>
              </div>

              {filteredKatanaEndpoints.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-500 font-mono space-y-2">
                  <Link2 className="w-10 h-10 text-slate-700 animate-pulse" />
                  <p className="text-xs">No targets explored yet.</p>
                  <p className="text-[10px] text-slate-600">Initiate Katana crawling scan on the left pane.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
                  {filteredKatanaEndpoints.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex items-center justify-between hover:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase shrink-0 ${
                          item.type === "api" 
                            ? "bg-amber-950/40 border border-amber-500/20 text-amber-400" 
                            : item.type === "email" 
                            ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400" 
                            : item.type === "script"
                            ? "bg-indigo-950/40 border border-indigo-500/20 text-indigo-400"
                            : "bg-slate-900 border border-slate-800 text-slate-400"
                        }`}>
                          {item.type}
                        </span>
                        <p className="text-xs font-mono text-slate-300 truncate font-semibold">{item.value}</p>
                      </div>

                      <button
                        onClick={() => copyToClipboard(item.value)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors cursor-pointer shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. GAU / Wayback historical Indexing */}
        {activeSubTab === "gau" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Clock className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">GAU Wayback Archives</h3>
              </div>

              <form onSubmit={handleGauScan} className="space-y-3 font-mono">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase font-bold">Target domain</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. testfire.net"
                      value={gauDomain}
                      onChange={(e) => { sound.playTyping(); setGauDomain(e.target.value); }}
                      className="w-full bg-slate-950 border border-slate-800 text-amber-400 px-3.5 py-2.5 rounded-xl text-xs focus:border-amber-500 outline-none placeholder:text-slate-700"
                    />
                    {gauLoading && (
                      <div className="absolute right-3.5 top-2.5">
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={gauLoading || !gauDomain}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                >
                  <Play className="w-3.5 h-3.5" /> HARVEST ARCHIVE ENDPOINTS
                </button>
              </form>

              {/* Console Output logs */}
              <div className="flex-1 bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-[10px] space-y-2 overflow-y-auto max-h-56 min-h-[14rem]">
                <div className="flex items-center justify-between text-slate-500 pb-1.5 border-b border-slate-900 mb-1">
                  <span>WAYBACK CDX SWEEPER</span>
                  <span>RECORDS RETRIEVED</span>
                </div>
                {gauLogs.map((log, idx) => (
                  <div key={idx} className="text-slate-300 leading-relaxed font-semibold">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4.5 h-4.5 text-amber-500" />
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Archived Endpoints ({filteredGauResults.length})</h3>
                  {gauResults.length > 0 && (
                    <button
                      disabled={sendingTelegram["GAU"]}
                      onClick={() => handleSendToTelegram("GAU Wayback archives", gauDomain, gauResults)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[9px] font-bold rounded-lg transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)] disabled:opacity-40"
                    >
                      {sendingTelegram["GAU"] ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-950" />
                      ) : (
                        <Send className="w-2.5 h-2.5 text-slate-950" />
                      )}
                      FORWARD REPORT
                    </button>
                  )}
                </div>

                {/* Filter / Search input */}
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={gauSearchQuery}
                  onChange={(e) => setGauSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-850 text-amber-400 px-3 py-1.5 rounded-lg text-[10px] font-mono focus:border-amber-500 outline-none placeholder:text-slate-700"
                />
              </div>

              {filteredGauResults.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-500 font-mono space-y-2">
                  <Clock className="w-10 h-10 text-slate-700 animate-pulse" />
                  <p className="text-xs">No historical URLs retrieved.</p>
                  <p className="text-[10px] text-slate-600">Perform Wayback endpoint indexing on target domain.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
                  {filteredGauResults.slice(0, 50).map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-slate-800 transition-colors"
                    >
                      <div className="truncate max-w-full sm:max-w-[75%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] font-mono font-bold bg-amber-950/40 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase">
                            {item.statuscode || "200"}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">{item.timestamp}</span>
                          <span className="text-[8px] font-mono text-cyan-400 truncate max-w-[80px]">{item.mimetype}</span>
                        </div>
                        <p className="text-xs font-mono text-slate-300 truncate font-semibold">{item.original}</p>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => copyToClipboard(item.original)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`https://web.archive.org/web/${item.timestamp}/${item.original}`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="p-1.5 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/20 rounded-lg text-amber-400 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {filteredGauResults.length > 50 && (
                    <p className="text-center text-[9px] font-mono text-slate-500 pt-2 font-bold uppercase">Displaying top 50 archive captures...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. GIT EXPLORER */}
        {activeSubTab === "gitexplorer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side repository exploration control */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <GitBranch className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Git repository loader</h3>
              </div>

              {/* Presets Selection */}
              <div className="space-y-1.5 font-mono">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Preconfigured Repositories</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {GIT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => { setRepoUrl(preset.url); handleGitLoad(preset.url); }}
                      className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-lg text-left text-[9px] font-semibold text-slate-300 truncate cursor-pointer uppercase hover:border-amber-500/30 transition-all"
                    >
                      {preset.name.split("/")[1]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[9px] font-mono uppercase">
                  <span className="bg-slate-900 px-2 text-slate-500 font-bold">OR LOAD CUSTOM REPO</span>
                </div>
              </div>

              {/* Repo input */}
              <div className="space-y-3 font-mono">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase font-bold">GitHub Repository URL</label>
                  <input
                    type="text"
                    placeholder="https://github.com/owner/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-amber-400 px-3.5 py-2.5 rounded-xl text-xs focus:border-amber-500 outline-none placeholder:text-slate-700"
                  />
                </div>

                <button
                  onClick={() => handleGitLoad()}
                  disabled={repoLoading || !repoUrl}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-amber-500/30 text-amber-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {repoLoading ? <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" /> : <FolderGit className="w-3.5 h-3.5 text-amber-400" />}
                  EXPLORE GIT REPO
                </button>
              </div>

              {repoError && (
                <p className="text-[10px] font-mono text-red-400 font-semibold">{repoError}</p>
              )}

              {/* Directory Node Files tree list */}
              <div className="flex-1 bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-xs flex flex-col space-y-1.5 overflow-y-auto max-h-72 min-h-[14rem]">
                <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1.5 border-b border-slate-900 mb-1 font-bold">
                  <span>DIRECTORY TREE</span>
                  <span>{currentRepoName || "NO ACTIVE REPO"}</span>
                </div>
                
                {repoFiles.length === 0 ? (
                  <p className="text-slate-600 text-[10px] text-center pt-8">Select a preset repository or enter URL above to read file nodes.</p>
                ) : (
                  repoFiles.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => handleFileClick(file)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] flex items-center gap-2 font-mono border cursor-pointer transition-colors ${
                        file.type === "dir" 
                          ? "border-transparent text-amber-500/80 hover:bg-slate-900" 
                          : selectedFileName === file.name
                          ? "bg-amber-950/20 border-amber-500/30 text-amber-400"
                          : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      {file.type === "dir" ? "📁" : "📄"}
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right side file text preview window */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4.5 h-4.5 text-cyan-400" />
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                    Script Content Viewer {selectedFileName ? `— ${selectedFileName}` : ""}
                  </h3>
                </div>

                {selectedFileContent && (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={sendingTelegram["GitExplorer"]}
                      onClick={() => handleSendToTelegram(`Git file [${selectedFileName}]`, currentRepoName, selectedFileContent)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-amber-500/20 text-amber-400 font-mono text-[9px] font-bold rounded-lg transition-all cursor-pointer disabled:opacity-40"
                    >
                      {sendingTelegram["GitExplorer"] ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-400" />
                      ) : (
                        <Send className="w-2.5 h-2.5 text-amber-400" />
                      )}
                      SEND TO BOT
                    </button>
                    <button
                      onClick={loadIntoScriptRunner}
                      className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-mono font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                    >
                      <Play className="w-2.5 h-2.5 text-slate-950" /> LOAD TO RUNNER
                    </button>
                  </div>
                )}
              </div>

              {!selectedFileContent ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-slate-500 font-mono space-y-2">
                  <Code2 className="w-10 h-10 text-slate-700 animate-pulse" />
                  <p className="text-xs">No script file loaded in viewing stage.</p>
                  <p className="text-[10px] text-slate-600">Select any file from the repo tree to preview or edit.</p>
                </div>
              ) : (
                <div className="flex-1 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex flex-col relative min-h-[22rem]">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-850 text-[10px] font-mono text-slate-500">
                    <span>SYNTAX HIGHLIGHTED CODE</span>
                    <button
                      onClick={() => copyToClipboard(selectedFileContent)}
                      className="text-slate-400 hover:text-slate-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> COPY CODE
                    </button>
                  </div>

                  <textarea
                    readOnly
                    value={selectedFileContent}
                    className="flex-1 bg-slate-950 text-slate-300 font-mono text-[10px] p-4 focus:outline-none resize-none font-semibold overflow-y-auto"
                  />
                </div>
              )}
            </div>

          </div>
        )}

        {/* 5. ULTIMATE API EXTRACTOR v6.0 */}
        {activeSubTab === "extractor" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Side: Parameters Form */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <Globe className="w-4.5 h-4.5 text-amber-400" />
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">API Extraction Panel</h3>
                </div>

                <form onSubmit={handleExtractorRun} className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1.5 uppercase font-bold">Target Address or URL</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. instagram.com or http://target.local"
                      value={extractorUrl}
                      onChange={(e) => {
                        sound.playTyping();
                        setExtractorUrl(e.target.value);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 text-amber-400 px-3.5 py-2.5 rounded-xl text-xs focus:border-amber-500 outline-none placeholder:text-slate-700 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1.5 uppercase font-bold">Crawl Depth</label>
                      <select
                        value={extractorDepth}
                        onChange={(e) => {
                          sound.playClick();
                          setExtractorDepth(Number(e.target.value));
                        }}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl focus:border-amber-500 outline-none font-semibold"
                      >
                        <option value={1}>1 (Aggressive / Fast)</option>
                        <option value={2}>2 (Standard Deep)</option>
                        <option value={3}>3 (Full Domain Crawl)</option>
                      </select>
                    </div>

                    <div className="flex flex-col justify-end pb-1.5 pl-2 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={extractorValidate}
                          onChange={(e) => {
                            sound.playClick();
                            setExtractorValidate(e.target.checked);
                          }}
                          className="accent-amber-500"
                        />
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Verify Sockets</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={extractorProxy}
                          onChange={(e) => {
                            sound.playClick();
                            setExtractorProxy(e.target.checked);
                          }}
                          className="accent-amber-500"
                        />
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Proxy Rotation</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={extractorLoading || !extractorUrl}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-black font-mono text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-amber-400/20 shadow-lg shadow-amber-950/40 transition-all uppercase"
                  >
                    {extractorLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        Analyzing Sockets...
                      </>
                    ) : (
                      "Run API Extractor"
                    )}
                  </button>
                </form>

                {/* Extractor Status Monitor Console */}
                <div className="flex-1 bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-xs flex flex-col space-y-1.5 overflow-hidden min-h-[12rem]">
                  <span className="text-[9px] text-slate-600 font-bold border-b border-slate-900 pb-1 uppercase">Extraction Node Audit Logs</span>
                  <div className="flex-1 overflow-y-auto space-y-1 font-semibold text-[10px] text-slate-400 max-h-48 pr-1">
                    {extractorLogs.length === 0 ? (
                      <p className="text-slate-700 text-center pt-8">Crawler inactive. Enter target URL to spin up auditing sandbox.</p>
                    ) : (
                      extractorLogs.map((log, idx) => {
                        const logStr = log ? String(log) : "";
                        const isError = logStr.includes("[!]");
                        const isSuccess = logStr.includes("[✓]");
                        return (
                          <p key={idx} className={isError ? "text-red-400" : isSuccess ? "text-emerald-400" : "text-slate-400"}>
                            {logStr}
                          </p>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Quick Stats Overview */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4.5 h-4.5 text-cyan-400" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Discovered API Sockets</h3>
                  </div>

                  {(extractorEndpoints.length > 0 || extractorAuthFindings.length > 0) && (
                    <button
                      disabled={sendingTelegram["API Extractor Discovery"]}
                      onClick={() => handleSendToTelegram("API Extractor Discovery", extractorUrl, { endpoints: extractorEndpoints, auth_findings: extractorAuthFindings })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)] disabled:opacity-40"
                    >
                      {sendingTelegram["API Extractor Discovery"] ? (
                        <Loader2 className="w-3 h-3 animate-spin text-slate-950" />
                      ) : (
                        <Send className="w-3 h-3 text-slate-950" />
                      )}
                      FORWARD TO TELEGRAM
                    </button>
                  )}
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Discovered APIs</span>
                    <p className="text-lg font-black text-amber-500">{extractorEndpoints.length}</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Sensitive Secrets</span>
                    <p className="text-lg font-black text-rose-500">{extractorAuthFindings.length}</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-0.5 col-span-2 sm:col-span-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Scan Status</span>
                    <p className={`text-sm font-black ${extractorLoading ? "text-amber-400 animate-pulse" : extractorEndpoints.length > 0 ? "text-emerald-400" : "text-slate-600"}`}>
                      {extractorLoading ? "CRAWLING..." : extractorEndpoints.length > 0 ? "SUCCESS" : "INACTIVE"}
                    </p>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search discovered items..."
                    value={extractorSearchQuery}
                    onChange={(e) => setExtractorSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-850 text-slate-300 px-3 py-2 rounded-xl text-xs font-mono focus:border-amber-500 outline-none placeholder:text-slate-700"
                  />
                  <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-850">
                    {["all", "rest", "graphql", "secrets"].map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          sound.playClick();
                          setExtractorFilter(f);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                          extractorFilter === f
                            ? "bg-amber-950/40 border border-amber-500/20 text-amber-400"
                            : "text-slate-500 hover:text-slate-300 border border-transparent"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results Screen */}
                <div className="flex-1 bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[11px] overflow-y-auto max-h-[19rem] min-h-[15rem] space-y-3">
                  {extractorEndpoints.length === 0 && extractorAuthFindings.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-10 text-center text-slate-600 space-y-1">
                      <Globe className="w-8 h-8 text-slate-800" />
                      <p className="text-xs font-bold text-slate-500">Workspace Empty</p>
                      <p className="text-[10px]">No API endpoints parsed or validated yet.</p>
                    </div>
                  ) : (
                    <>
                      {/* 1. Secrets and Credentials section */}
                      {(extractorFilter === "all" || extractorFilter === "secrets") && extractorAuthFindings.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] text-rose-400 font-bold tracking-wider uppercase">Extracted Secrets & Sessions ({extractorAuthFindings.length})</span>
                          <div className="space-y-1.5">
                            {extractorAuthFindings
                              .filter(f => {
                                if (!extractorSearchQuery) return true;
                                const typeLower = f && f.type ? String(f.type).toLowerCase() : "";
                                const matchLower = f && f.match ? String(f.match).toLowerCase() : "";
                                const queryLower = extractorSearchQuery.toLowerCase();
                                return typeLower.includes(queryLower) || matchLower.includes(queryLower);
                              })
                              .map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 bg-rose-950/10 border border-rose-950/30 rounded-lg hover:border-rose-500/20 transition-colors">
                                  <div>
                                    <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-bold uppercase mr-2">{item.type}</span>
                                    <span className="text-slate-300 font-semibold">{item.match}</span>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(item.match)}
                                    className="text-rose-400 hover:text-rose-300 font-bold text-[9px] cursor-pointer"
                                  >
                                    COPY
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* 2. Endpoints section */}
                      {(extractorFilter !== "secrets") && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[9px] text-amber-400 font-bold tracking-wider uppercase">Discovered API Routes</span>
                          <div className="space-y-2">
                            {extractorEndpoints
                              .filter(ep => {
                                const typeStr = ep && ep.api_type ? String(ep.api_type).toLowerCase() : "";
                                if (extractorFilter === "rest") return typeStr.includes("rest");
                                if (extractorFilter === "graphql") return typeStr.includes("graphql");
                                return true;
                              })
                              .filter(ep => {
                                if (!extractorSearchQuery) return true;
                                const urlStr = ep && ep.url ? String(ep.url).toLowerCase() : "";
                                return urlStr.includes(extractorSearchQuery.toLowerCase());
                              })
                              .map((item, idx) => {
                                const methodColors: Record<string, string> = {
                                  GET: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                  POST: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                                  WS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                                  FORM: "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                };
                                const colorClass = methodColors[item.method] || "bg-slate-900 text-slate-400 border-slate-800";

                                return (
                                  <div key={idx} className="p-3 bg-slate-950 border border-slate-850 rounded-xl hover:border-slate-700 transition-colors space-y-1.5">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase shrink-0 ${colorClass}`}>{item.method}</span>
                                        <span className="text-slate-200 font-semibold truncate break-all selection:bg-amber-500/20">{item.url}</span>
                                      </div>
                                      <button
                                        onClick={() => copyToClipboard(item.url)}
                                        className="text-slate-500 hover:text-slate-300 text-[10px] shrink-0 font-bold cursor-pointer"
                                      >
                                        COPY
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
                                      <span>Category: <b className="text-slate-400">{item.api_type}</b></span>
                                      <span>Platform: <b className="text-slate-400">{item.platform}</b></span>
                                      {item.status_code !== undefined && (
                                        <span>Status: <b className={item.status_code === 200 || item.status_code === 101 ? "text-emerald-400 font-bold" : "text-amber-500"}>{item.status_code}</b></span>
                                      )}
                                      {item.auth_required && (
                                        <span className="text-rose-400 font-bold">[!] AUTH REQUIRED</span>
                                      )}
                                    </div>
                                    {item.response_sample && (
                                      <div className="bg-slate-900 border border-slate-850 p-2 rounded-lg text-[9px] text-slate-400 font-mono select-all overflow-x-auto max-h-20">
                                        {item.response_sample}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Inline ArrowRight missing import fallback helper
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
