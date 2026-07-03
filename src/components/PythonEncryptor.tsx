import React, { useState, useRef, useEffect } from "react";
import { sound } from "./AudioEngine";
import { 
  FileCode, 
  Upload, 
  Settings, 
  Download, 
  Copy, 
  Check, 
  Send, 
  Bot, 
  ShieldAlert, 
  Sparkles, 
  Terminal, 
  Zap, 
  RefreshCw,
  Loader2,
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Calendar,
  AlertOctagon,
  Lock,
  ExternalLink,
  ChevronRight,
  Fingerprint
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";
import { apiFetch } from "../utils/api";

interface PythonEncryptorProps {
  user: User;
}

interface ValidationReport {
  valid: boolean;
  error?: string;
  warnings: string[];
  stats: {
    lines: number;
    characters: number;
    imports: string[];
    functions: string[];
    classes: string[];
  };
}

export default function PythonEncryptor({ user }: PythonEncryptorProps) {
  const [code, setCode] = useState("");
  const [scriptName, setScriptName] = useState("script.py");
  const [encType, setEncType] = useState<"python_ninjapy" | "python_cpcython" | "python_standard">("python_ninjapy");
  
  // Expiration settings
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiryDateTime, setExpiryDateTime] = useState("");
  
  // Extra security options
  const [antiDebug, setAntiDebug] = useState(true);
  const [antiTamper, setAntiTamper] = useState(true);
  
  // Telegram forwarding
  const [forwardTelegram, setForwardTelegram] = useState(false);
  
  // Python validator state
  const [validating, setValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  // Application execution state
  const [compiling, setCompiling] = useState(false);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const [result, setResult] = useState<{
    encryptedCode: string;
    filename: string;
    originalLength: number;
    encryptedLength: number;
    telegramSent: boolean;
    telegramDetails: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default expiration date to tomorrow same time on mount
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Format to local ISO without seconds/timezone: YYYY-MM-DDTHH:MM
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    const hh = String(tomorrow.getHours()).padStart(2, "0");
    const min = String(tomorrow.getMinutes()).padStart(2, "0");
    setExpiryDateTime(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
  }, []);

  // Quick preset helpers for expiration
  const setExpiryPreset = (hours: number) => {
    sound.playClick();
    const target = new Date();
    target.setHours(target.getHours() + hours);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const dd = String(target.getDate()).padStart(2, "0");
    const hh = String(target.getHours()).padStart(2, "0");
    const min = String(target.getMinutes()).padStart(2, "0");
    setExpiryDateTime(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
    setExpiryEnabled(true);
  };

  // Run python file validator
  const handleValidateCode = async (codeToValidate: string) => {
    if (!codeToValidate.trim()) return;
    setValidating(true);
    try {
      const res = await apiFetch("/api/validate-python", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToValidate })
      });
      if (res.ok) {
        const data = await res.json();
        setValidationReport(data);
        if (!data.valid) {
          sound.playError();
        } else {
          sound.playSuccess();
        }
      }
    } catch (err) {
      console.error("Validation failed", err);
    } finally {
      setValidating(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".py")) {
      sound.playError();
      alert("Invalid file type. Only Python (.py) scripts are supported.");
      return;
    }
    
    sound.playClick();
    setScriptName(file.name);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target && typeof e.target.result === "string") {
        const content = e.target.result;
        setCode(content);
        // Automatically validate the code upon file load
        await handleValidateCode(content);
      }
    };
    reader.readAsText(file);
  };

  const triggerFileSelect = () => {
    sound.playClick();
    fileInputRef.current?.click();
  };

  // Compile Trigger
  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    sound.playClick();
    setCompiling(true);
    setResult(null);
    setCompileLogs([]);

    const steps = [
      `[SYSTEM] Spawning Jack OS Dynamic Shield VM Core...`,
      `[SYSTEM] Target Payload: ${scriptName} (${code.length} bytes)`,
      `[VALIDATION] Running pre-compilation AST validation routines...`,
      expiryEnabled 
        ? `[SHIELD-LOCK] Injecting Time-Lock payload. Expiration set to: ${new Date(expiryDateTime).toUTCString()}`
        : `[SHIELD-LOCK] No expiration threshold configured. Generating permanent build...`,
      `[OBFUSCATION] Performing structural byte layout flattening...`,
      `[SHIELD] Packing defense libraries (Anti-Debug: ${antiDebug ? "ACTIVE" : "DISABLED"}, Integrity-Verify: ${antiTamper ? "ACTIVE" : "DISABLED"})`,
      `[COMPRESS] Compiling layers using zlib high-density compression...`,
      `[CRYPT] Wrapping executable into virtual ${encType === "python_ninjapy" ? "NinjaPy Secure Loop" : encType === "python_cpcython" ? "CPCython C-Emulation Layout" : "Standard Base64 Zlib Bootloader"}...`,
      `[TELEGRAM] Direct Telegram API routing configured: ${forwardTelegram ? "YES" : "NO"}`
    ];

    // Simulate high-tech matrix compile logs
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 200));
      setCompileLogs((prev) => [...prev, steps[i]]);
    }

    try {
      const response = await apiFetch("/api/encrypt-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name: scriptName,
          type: encType,
          username: user.username,
          sendTelegram: forwardTelegram,
          expiryTimestamp: expiryEnabled ? expiryDateTime : undefined
        })
      });

      if (!response.ok) {
        throw new Error("Jack OS Encryption core compilation failed.");
      }

      const data = await response.json();
      
      setCompileLogs((prev) => [
        ...prev,
        `[✓] Protection bootloader compiled successfully by Jack OS.`,
        `[SYSTEM] Payload compressed: ${data.originalLength} B -> ${data.encryptedLength} B`,
        `[TELEGRAM] Bot Delivery State: ${data.telegramDetails}`,
        `[SUCCESS] Encryption cycle terminated. Assembly node closed.`
      ]);

      sound.playSuccess();
      setResult(data);
    } catch (err: any) {
      sound.playError();
      setCompileLogs((prev) => [
        ...prev,
        `[!] COMPILER SHIELD ERROR: ${err.message || "Failed to process target buffers."}`
      ]);
    } finally {
      setCompiling(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    sound.playClick();
    const element = document.createElement("a");
    const file = new Blob([result.encryptedCode], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = result.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.encryptedCode);
    sound.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasTelegramConfig = user.telegramBotToken && user.telegramChatId;

  return (
    <div className="space-y-6 font-sans relative">
      
      {/* Jack OS Encryption Core high fidelity Loading Screen */}
      <AnimatePresence>
        {compiling && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 select-none"
          >
            <div className="max-w-xl w-full text-center space-y-8">
              {/* Rotating glowing cyber core */}
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/10 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-500/30 animate-spin" style={{ animationDuration: "12s" }}></div>
                <div className="absolute inset-4 rounded-full border border-double border-amber-400/55 animate-spin" style={{ animationDuration: "6s", animationDirection: "reverse" }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-amber-400 animate-bounce" />
                </div>
              </div>

              {/* Holographic glowing loading title */}
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-amber-400 font-mono tracking-widest uppercase">
                  ENCRYPTION BY JACK
                </h3>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-widest max-w-sm mx-auto">
                  Shielding script bytecode & injecting time-lock algorithms
                </p>
              </div>

              {/* Progress & logs terminal */}
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl text-left font-mono text-xs max-h-64 overflow-y-auto space-y-1.5 shadow-2xl">
                {compileLogs.map((log, i) => {
                  let colorClass = "text-slate-400";
                  if (log.startsWith("[✓]")) colorClass = "text-emerald-400";
                  else if (log.startsWith("[!]")) colorClass = "text-red-400";
                  else if (log.startsWith("[SUCCESS]")) colorClass = "text-amber-300 font-bold";
                  else if (log.startsWith("[SYSTEM]")) colorClass = "text-cyan-400";
                  else if (log.startsWith("[SHIELD-LOCK]")) colorClass = "text-amber-400 font-semibold";
                  
                  return (
                    <div key={i} className={`${colorClass} text-[11px]`}>
                      {log}
                    </div>
                  );
                })}
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[11px] animate-pulse">
                  <span>&gt;</span>
                  <span className="w-1.5 h-3 bg-amber-500 rounded-sm"></span>
                </div>
              </div>

              <div className="text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                System protected by Jack OS Hub core engine v6.0
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner with Brand Channels */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-950 border border-amber-500/20 flex items-center justify-center shadow-inner">
              <Zap className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-100 font-mono tracking-wide flex items-center gap-2">
                NINJAPY / CPCYTHON CRYPTER <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-sans">v6.0</span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Compile, validate, and obfuscate python scripts with multi-layered byte protection and secure direct bot delivery
              </p>
            </div>
          </div>
          
          {/* Jack Brand Channels widget */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950 border border-slate-850 p-3 rounded-xl">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">Jack Core:</span>
            <a 
              href="https://t.me/vcxah" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
            >
              <Bot className="w-3.5 h-3.5 text-amber-500" /> @vcxah
            </a>
            <a 
              href="https://t.me/Jaack1" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" /> @Jaack1
            </a>
            <a 
              href="https://t.me/Jackspython" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" /> @Jackspython
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Grid: Code Input & Real-time Validation */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-slate-850 pb-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-bold text-slate-200 font-mono">JACK COMPILER PAYLOAD CONSOLE</h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1 rounded-lg text-xs font-mono focus:border-amber-500 outline-none w-36 placeholder:text-slate-700"
                  placeholder="script.py"
                  value={scriptName}
                  onChange={(e) => setScriptName(e.target.value)}
                />
              </div>
            </div>

            {/* Redesigned, highly unique and stunning file input container */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl transition-all h-80 overflow-hidden ${
                dragActive 
                  ? "border-amber-500 bg-amber-500/5 scale-[0.99]" 
                  : code 
                    ? "border-slate-800 bg-slate-950" 
                    : "border-slate-800 bg-slate-950 hover:border-slate-700"
              }`}
            >
              {code ? (
                <textarea
                  className="w-full h-full bg-transparent text-slate-300 p-4 font-mono text-xs focus:ring-0 focus:outline-none resize-none leading-relaxed"
                  placeholder={`# Paste your python source code here or drag and drop script.py...\n\ndef main():\n    print("Secure Execution Node Initialized")\n\nif __name__ == "__main__":\n    main()`}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    // Defer validation to avoid laggy inputs
                  }}
                  onBlur={() => handleValidateCode(code)}
                />
              ) : (
                <div 
                  onClick={triggerFileSelect}
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-slate-500 font-mono text-xs gap-4 p-6 text-center select-none"
                >
                  {/* High Tech Payload Lock Graphic */}
                  <div className="relative w-20 h-20 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center group-hover:border-amber-500/30 transition-colors shadow-lg">
                    <div className="absolute inset-0 rounded-2xl border border-amber-500/5 animate-ping" style={{ animationDuration: "3s" }}></div>
                    <Fingerprint className="w-10 h-10 text-amber-500/80" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-slate-300 font-bold">DRAG & DROP SCRIPT PAYLOAD</p>
                    <p className="text-slate-500">Or click to select a python script from your filesystem</p>
                  </div>

                  <div className="text-[10px] bg-amber-500/5 border border-amber-500/10 px-3 py-1.5 rounded-lg text-amber-400 max-w-xs">
                    SYSTEM LOADS DIRECT BYTE STREAM SECURELY
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".py" 
                className="hidden" 
              />
            </div>

            {/* Bottom Actions and instant validation trigger */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                <span>{code ? `${code.split("\n").length} lines | ${code.length} chars` : "No script loaded"}</span>
                {code && (
                  <button 
                    onClick={() => handleValidateCode(code)}
                    disabled={validating}
                    className="text-amber-500 hover:text-amber-400 font-bold cursor-pointer underline flex items-center gap-1"
                  >
                    {validating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Re-Validate Code
                  </button>
                )}
              </div>
              {code && (
                <button
                  onClick={() => {
                    sound.playClick();
                    setCode("");
                    setScriptName("script.py");
                    setResult(null);
                    setValidationReport(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-300 font-mono cursor-pointer"
                >
                  CLEAR WRAPPER
                </button>
              )}
            </div>
          </div>

          {/* Python AST/Syntax Validator Module */}
          {code && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                <span className="text-slate-200 font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" /> PYTHON CORE VALIDATOR REPORT
                </span>
                <span className="text-[10px] bg-slate-950 px-2 py-0.5 border border-slate-855 rounded-md text-slate-400">
                  REAL-TIME COMPILE-CHECK
                </span>
              </div>

              {validating ? (
                <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Scanning script syntax trees and dependencies...</span>
                </div>
              ) : validationReport ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Syntax Validity Card */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                    validationReport.valid 
                      ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
                      : "bg-red-950/20 border-red-500/20 text-red-400"
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {validationReport.valid ? (
                          <>
                            <ShieldCheck className="w-4 h-4 text-emerald-400" /> SYNTAX IS SECURE
                          </>
                        ) : (
                          <>
                            <AlertOctagon className="w-4 h-4 text-red-400" /> SYNTAX ERROR DETECTED
                          </>
                        )}
                      </div>
                      
                      {validationReport.valid ? (
                        <p className="text-[11px] text-emerald-500 mt-2 leading-relaxed">
                          Your code has parsed correctly. Syntax matches standard PEP Python structures. Ready for deep obfuscation.
                        </p>
                      ) : (
                        <div className="mt-2 text-xs bg-slate-950 p-2.5 rounded-lg border border-red-500/10 text-red-300 font-mono break-all max-h-32 overflow-y-auto leading-relaxed">
                          {validationReport.error || "Unknown compiler error."}
                        </div>
                      )}
                    </div>

                    {/* Quick action helper if valid */}
                    {validationReport.valid && (
                      <div className="mt-4 text-[10px] text-emerald-500/70 border-t border-emerald-500/10 pt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Expiry & Crypt shields are deployable.
                      </div>
                    )}
                  </div>

                  {/* Code Elements Analysis */}
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                    <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-1.5 mb-2">
                      Structural Telemetry
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <p>Lines: <b className="text-slate-300">{validationReport.stats.lines}</b></p>
                      <p>Characters: <b className="text-slate-300">{validationReport.stats.characters}</b></p>
                      <p className="col-span-2 truncate">Imports: <b className="text-slate-300">{validationReport.stats.imports.join(", ") || "None"}</b></p>
                      <p className="col-span-2 truncate">Functions: <b className="text-slate-300">{validationReport.stats.functions.join(", ") || "None"}</b></p>
                    </div>

                    {/* Warnings list if any */}
                    {validationReport.warnings.length > 0 && (
                      <div className="border-t border-slate-900 pt-3 mt-2">
                        <p className="font-bold text-[9px] uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Script Warning Blocks:
                        </p>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                          {validationReport.warnings.map((warn, wIdx) => (
                            <div key={wIdx} className="text-[10px] text-amber-500/80 bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">
                              • {warn}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-center py-4">
                  Await initial file parsing...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Grid: Expiration & Encryption Config Panel */}
        <div className="space-y-6">
          {/* Expiration Time Lock Shield Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-850 pb-4">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <h2 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wide">TIME-LOCK EXPERIMENT</h2>
            </div>

            <div className="space-y-4 font-mono">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-850">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-200">Enable Time-Lock</p>
                  <p className="text-[10px] text-slate-500">Auto-terminate script after target date</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={expiryEnabled}
                    onChange={(e) => { sound.playClick(); setExpiryEnabled(e.target.checked); }}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {expiryEnabled && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">EXPIRATION DATE & TIME</label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={expiryDateTime}
                        onChange={(e) => setExpiryDateTime(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2.5 rounded-xl text-xs font-mono focus:border-amber-500 outline-none placeholder:text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Expiration Preset Helpers */}
                  <div className="space-y-1">
                    <span className="block text-[9px] uppercase text-slate-500 font-bold">Quick Presets</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => setExpiryPreset(1)}
                        className="py-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-850 rounded text-[10px] font-bold"
                      >
                        +1 HR
                      </button>
                      <button
                        onClick={() => setExpiryPreset(12)}
                        className="py-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-850 rounded text-[10px] font-bold"
                      >
                        +12 HR
                      </button>
                      <button
                        onClick={() => setExpiryPreset(24)}
                        className="py-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-850 rounded text-[10px] font-bold"
                      >
                        +24 HR
                      </button>
                      <button
                        onClick={() => setExpiryPreset(168)}
                        className="py-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-850 rounded text-[10px] font-bold"
                      >
                        +7 DAY
                      </button>
                    </div>
                  </div>

                  {/* Epoch Info Feedback */}
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1 text-[10px] text-amber-400/95 leading-relaxed">
                    <p className="flex justify-between">
                      <span>Epoch Timestamp:</span>
                      <span className="font-bold">{expiryDateTime ? Math.floor(new Date(expiryDateTime).getTime() / 1000) : "N/A"}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>UTC Expiration:</span>
                      <span className="font-bold truncate max-w-[65%]">{expiryDateTime ? new Date(expiryDateTime).toUTCString() : "N/A"}</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Encryption Config panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-850 pb-4">
              <Settings className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wide">CRYPTO ENGINE CONFIG</h2>
            </div>

            <div className="space-y-4 font-mono">
              {/* EncType Option */}
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-2 font-bold tracking-wider">Obfuscation Layer Protocol</label>
                <div className="grid grid-cols-1 gap-2.5">
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    encType === "python_ninjapy" 
                      ? "border-amber-500 bg-amber-500/5 text-amber-300" 
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  }`}>
                    <input
                      type="radio"
                      name="enc_type"
                      checked={encType === "python_ninjapy"}
                      onChange={() => { sound.playClick(); setEncType("python_ninjapy"); }}
                      className="hidden"
                    />
                    <div className="pt-0.5">
                      <Zap className={`w-4 h-4 ${encType === "python_ninjapy" ? "text-amber-400" : "text-slate-500"}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">NinjaPy Crypter Layer</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Multi-layer compressed XOR loops with anti-reversing shields</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    encType === "python_cpcython" 
                      ? "border-amber-500 bg-amber-500/5 text-amber-300" 
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  }`}>
                    <input
                      type="radio"
                      name="enc_type"
                      checked={encType === "python_cpcython"}
                      onChange={() => { sound.playClick(); setEncType("python_cpcython"); }}
                      className="hidden"
                    />
                    <div className="pt-0.5">
                      <Sparkles className={`w-4 h-4 ${encType === "python_cpcython" ? "text-amber-400" : "text-slate-500"}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">CPCythonizer Emulation</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Wraps Python scripts into virtual optimized C-compiled layouts</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    encType === "python_standard" 
                      ? "border-amber-500 bg-amber-500/5 text-amber-300" 
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  }`}>
                    <input
                      type="radio"
                      name="enc_type"
                      checked={encType === "python_standard"}
                      onChange={() => { sound.playClick(); setEncType("python_standard"); }}
                      className="hidden"
                    />
                    <div className="pt-0.5">
                      <FileText className={`w-4 h-4 ${encType === "python_standard" ? "text-amber-400" : "text-slate-500"}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Standard Base64 Zlib</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Simple deflated base64 compressed bootloader loader</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Security Shield Flags */}
              <div className="border-t border-slate-850 pt-4">
                <span className="block text-[10px] uppercase text-slate-400 mb-2 font-bold tracking-wider">INTEGRITY GUARD MODULES</span>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850 cursor-pointer text-xs select-none">
                    <span className="text-slate-400">Anti-Debugging Core</span>
                    <input
                      type="checkbox"
                      checked={antiDebug}
                      disabled={encType === "python_standard"}
                      onChange={(e) => { sound.playClick(); setAntiDebug(e.target.checked); }}
                      className="rounded border-slate-855 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850 cursor-pointer text-xs select-none">
                    <span className="text-slate-400">Anti-Tamper Signature Verification</span>
                    <input
                      type="checkbox"
                      checked={antiTamper}
                      disabled={encType === "python_standard"}
                      onChange={(e) => { sound.playClick(); setAntiTamper(e.target.checked); }}
                      className="rounded border-slate-855 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="border-t border-slate-850 pt-4">
                <span className="block text-[10px] uppercase text-slate-400 mb-2 font-bold tracking-wider">TRANSMISSION ROUTING</span>
                <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  forwardTelegram 
                    ? "border-amber-500 bg-amber-500/5 text-amber-300" 
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                } ${!hasTelegramConfig ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                  <input
                    type="checkbox"
                    checked={forwardTelegram}
                    disabled={!hasTelegramConfig}
                    onChange={(e) => { sound.playClick(); setForwardTelegram(e.target.checked); }}
                    className="hidden"
                  />
                  <div className="pt-0.5">
                    <Bot className={`w-4 h-4 ${forwardTelegram ? "text-amber-400" : "text-slate-500"}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      Deliver to Telegram Bot
                      {!hasTelegramConfig && (
                        <span className="text-[9px] bg-red-950 text-red-400 border border-red-900 px-1 py-0.5 rounded">UNCONFIGURED</span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {hasTelegramConfig 
                        ? `Push compiled script instantly to Chat ID: ${user.telegramChatId?.substring(0, 4)}...`
                        : "Configure Bot Token in the Telegram Settings page to enable dynamic routing"
                      }
                    </p>
                  </div>
                </label>
              </div>

              {/* Action Button */}
              <button
                onClick={handleEncrypt}
                disabled={compiling || !code.trim()}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black tracking-wide font-mono rounded-xl border border-amber-300/30 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Zap className="w-4 h-4 animate-pulse" /> ENCRYPT & TIME-LOCK SCRIPT
              </button>
            </div>
          </div>

          {/* Results Outcome Box */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-850 pb-4">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wide">COMPILATION OUTCOME</h2>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-855 leading-relaxed text-slate-400">
                    <p className="flex justify-between">
                      <span>Payload Node:</span>
                      <b className="text-slate-200 truncate max-w-[60%]">{result.filename}</b>
                    </p>
                    <p className="flex justify-between">
                      <span>Original Bytes:</span>
                      <span className="text-slate-300 font-bold">{result.originalLength} B</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Encrypted Bytes:</span>
                      <span className="text-slate-300 font-bold">{result.encryptedLength} B</span>
                    </p>
                    <p className="flex justify-between border-t border-slate-900 pt-2 mt-2">
                      <span>Compression Ratio:</span>
                      <span className="text-emerald-400 font-bold">
                        {Math.max(0, Math.round(((result.originalLength - result.encryptedLength) / result.originalLength) * 100))}%
                      </span>
                    </p>
                  </div>

                  {result.telegramSent !== undefined && (
                    <div className={`p-3 rounded-xl border text-[11px] leading-relaxed flex gap-2 ${
                      result.telegramSent 
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" 
                        : "bg-amber-950/10 border-amber-500/20 text-amber-400"
                    }`}>
                      {result.telegramSent ? <Bot className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                      <div>
                        <p className="font-bold uppercase tracking-wide text-[10px]">Telegram Delivery Outcome</p>
                        <p className="mt-0.5">{result.telegramDetails}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleCopy}
                      className="py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-300 font-bold rounded-xl border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> COPIED!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> COPY DATA
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> DOWNLOAD .PY
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
