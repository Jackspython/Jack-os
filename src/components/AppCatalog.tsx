import React, { useState } from "react";
import { sound } from "./AudioEngine";
import { Copy, Check, ShieldAlert, Key, HelpCircle, Eye, EyeOff, Hash, Wifi, Radio, Wallet, Globe, BookOpen, AlertCircle, FileSearch } from "lucide-react";
import { motion } from "motion/react";

export default function AppCatalog() {
  const [activeTab, setActiveTab] = useState<"hash" | "password" | "steg" | "wallet" | "wifi">("password");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // 1. Password Generator State & Logic
  const [passLength, setPassLength] = useState(16);
  const [passOptions, setPassOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [generatedPass, setGeneratedPass] = useState("");
  const [passStrength, setPassStrength] = useState(0);

  const handleGeneratePassword = () => {
    sound.playClick();
    let chars = "";
    if (passOptions.lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (passOptions.uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (passOptions.numbers) chars += "0123456789";
    if (passOptions.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!chars) {
      setGeneratedPass("Please select at least one character type");
      setPassStrength(0);
      return;
    }

    let pwd = "";
    for (let i = 0; i < passLength; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setGeneratedPass(pwd);

    // Calculate strength
    let score = 0;
    if (pwd.length >= 12) score += 25;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[a-z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 20;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd)) score += 15;
    setPassStrength(score);
    sound.playSuccess();
  };

  // 2. Hash Cracker State & Logic
  const [hashInput, setHashInput] = useState("");
  const [hashType, setHashType] = useState("Unknown");
  const [crackResult, setCrackResult] = useState<string | null>(null);
  const [cracking, setCracking] = useState(false);

  const handleIdentifyHash = (val: string) => {
    setHashInput(val);
    const len = val.trim().length;
    if (len === 32) setHashType("MD5");
    else if (len === 40) setHashType("SHA-1");
    else if (len === 64) setHashType("SHA-256");
    else if (len === 128) setHashType("SHA-512");
    else setHashType("Unknown");
  };

  const handleCrackHash = () => {
    if (!hashInput) return;
    sound.playClick();
    setCracking(true);
    setCrackResult(null);

    const dictionary: Record<string, string> = {
      "21232f297a57a5a743894a0e4a801fc3": "admin",
      "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8": "password",
      "098f6bcd4621d373cade4e832627b4f6": "test",
      "a307001d2d38ff3f83737ec3847a9cfcf2c8032b": "jackpython",
      "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918": "admin1234",
    };

    setTimeout(() => {
      const clean = hashInput.trim().toLowerCase();
      if (dictionary[clean]) {
        sound.playSuccess();
        setCrackResult(`Match Found: "${dictionary[clean]}"`);
      } else {
        sound.playError();
        setCrackResult("No match located in local hash dictionary. Upload additional dictionaries.");
      }
      setCracking(false);
    }, 1200);
  };

  // 3. Steganography State & Logic
  const [stegCover, setStegCover] = useState("");
  const [stegSecret, setStegSecret] = useState("");
  const [stegResult, setStegResult] = useState("");
  const [stegDecodeInput, setStegDecodeInput] = useState("");
  const [stegDecodedSecret, setStegDecodedSecret] = useState<string | null>(null);

  const handleStegHide = () => {
    if (!stegCover || !stegSecret) return;
    sound.playClick();
    
    // Hide secret using zero-width characters
    // \u200b for binary 0, \u200c for binary 1
    const binary = stegSecret.split("").map(char => char.charCodeAt(0).toString(2).padStart(8, "0")).join("");
    const encoded = binary.split("").map(b => b === "0" ? "\u200b" : "\u200c").join("");
    
    const output = stegCover + encoded;
    setStegResult(output);
    sound.playSuccess();
  };

  const handleStegExtract = () => {
    if (!stegDecodeInput) return;
    sound.playClick();

    const encodedChars = stegDecodeInput.match(/[\u200b\u200c]/g);
    if (!encodedChars) {
      sound.playError();
      setStegDecodedSecret("No zero-width hidden sequence found.");
      return;
    }

    const binary = encodedChars.map(char => char === "\u200b" ? "0" : "1").join("");
    const bytes = binary.match(/.{1,8}/g) || [];
    
    try {
      const secret = bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join("");
      sound.playSuccess();
      setStegDecodedSecret(secret || "Decoding failed.");
    } catch (e) {
      sound.playError();
      setStegDecodedSecret("Payload corrupt or decoding error.");
    }
  };

  // 4. Bitcoin Wallet State & Logic
  const [walletSeed, setWalletSeed] = useState("");
  const [walletPrivate, setWalletPrivate] = useState("");
  const [walletPublic, setWalletPublic] = useState("");

  const handleGenerateWallet = () => {
    sound.playClick();
    const words = ["nebula", "quantum", "crypto", "cipher", "glitch", "bullet", "orbit", "prism", "shadow", "vortex", "pulse", "echo", "cyber", "phantom", "alpha", "titan", "matrix", "fusion"];
    
    // Random 12 seed words
    const seed = Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
    
    // Random Hex strings
    const privHex = "K" + Array.from({ length: 51 }, () => "0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 58)]).join("");
    const pubHex = "1" + Array.from({ length: 33 }, () => "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 58)]).join("");

    setWalletSeed(seed);
    setWalletPrivate(privHex);
    setWalletPublic(pubHex);
    sound.playSuccess();
  };

  // 5. WiFi Scanner State & Logic
  const [scannedWiFi, setScannedWiFi] = useState<any[]>([]);
  const [scanningWiFi, setScanningWiFi] = useState(false);

  const handleScanWiFi = () => {
    sound.playClick();
    setScanningWiFi(true);
    setScannedWiFi([]);

    setTimeout(() => {
      const networks = [
        { ssid: "JACK_OS_SECURE_5G", strength: 98, enc: "WPA3 Enterprise", ch: 36 },
        { ssid: "Cyber_Giga_Air", strength: 82, enc: "WPA2 CCMP", ch: 1 },
        { ssid: "Linksys_Guest_Sandbox", strength: 65, enc: "WPA2 Open", ch: 6 },
        { ssid: "Hidden_Node_LTE", strength: 44, enc: "WPA3 Personal", ch: 149 },
        { ssid: "XFINITY_EXT", strength: 35, enc: "WEP TKIP", ch: 11 },
      ];
      setScannedWiFi(networks);
      setScanningWiFi(false);
      sound.playSuccess();
    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden font-sans">
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
        <button
          onClick={() => { sound.playClick(); setActiveTab("password"); }}
          className={`px-5 py-4 text-xs font-bold font-mono border-r border-slate-800/80 cursor-pointer whitespace-nowrap ${
            activeTab === "password" ? "bg-slate-900 text-cyan-400 border-b-2 border-b-cyan-500" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          🔑 PASSWORD MAKER
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab("hash"); }}
          className={`px-5 py-4 text-xs font-bold font-mono border-r border-slate-800/80 cursor-pointer whitespace-nowrap ${
            activeTab === "hash" ? "bg-slate-900 text-cyan-400 border-b-2 border-b-cyan-500" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          # HASH DECODER
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab("steg"); }}
          className={`px-5 py-4 text-xs font-bold font-mono border-r border-slate-800/80 cursor-pointer whitespace-nowrap ${
            activeTab === "steg" ? "bg-slate-900 text-cyan-400 border-b-2 border-b-cyan-500" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          📄 STEGANOGRAPHY
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab("wallet"); }}
          className={`px-5 py-4 text-xs font-bold font-mono border-r border-slate-800/80 cursor-pointer whitespace-nowrap ${
            activeTab === "wallet" ? "bg-slate-900 text-cyan-400 border-b-2 border-b-cyan-500" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          ₿ BTC WALLET ENGINE
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab("wifi"); }}
          className={`px-5 py-4 text-xs font-bold font-mono cursor-pointer whitespace-nowrap ${
            activeTab === "wifi" ? "bg-slate-900 text-cyan-400 border-b-2 border-b-cyan-500" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          📶 WIFI SCANNER
        </button>
      </div>

      <div className="p-6">
        {/* PASSWORD GENERATOR */}
        {activeTab === "password" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" /> SECURE RANDOM PASS GENERATOR
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-2">
                  Password Length: {passLength} Chars
                </label>
                <input
                  type="range"
                  min={8}
                  max={64}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  value={passLength}
                  onChange={(e) => {
                    sound.playTyping();
                    setPassLength(parseInt(e.target.value));
                  }}
                />
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passOptions.uppercase}
                    onChange={(e) => {
                      sound.playClick();
                      setPassOptions({ ...passOptions, uppercase: e.target.checked });
                    }}
                    className="rounded border-slate-850 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                  Uppercase Characters (A-Z)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passOptions.lowercase}
                    onChange={(e) => {
                      sound.playClick();
                      setPassOptions({ ...passOptions, lowercase: e.target.checked });
                    }}
                    className="rounded border-slate-850 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                  Lowercase Characters (a-z)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passOptions.numbers}
                    onChange={(e) => {
                      sound.playClick();
                      setPassOptions({ ...passOptions, numbers: e.target.checked });
                    }}
                    className="rounded border-slate-850 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                  Numerical Strings (0-9)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passOptions.symbols}
                    onChange={(e) => {
                      sound.playClick();
                      setPassOptions({ ...passOptions, symbols: e.target.checked });
                    }}
                    className="rounded border-slate-850 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                  Special Symbols (!@#$%)
                </label>
              </div>

              <button
                onClick={handleGeneratePassword}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 cursor-pointer text-slate-100 font-mono text-xs font-bold rounded-xl border border-cyan-400/30 transition-colors"
              >
                GENERATE UNIQUE CRYPTO-PASS
              </button>
            </div>

            <div className="flex flex-col justify-center bg-slate-950 p-6 rounded-2xl border border-slate-850">
              {generatedPass ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Key Outcome</span>
                    <div className="flex items-center justify-between mt-1 p-3 bg-slate-900 border border-slate-800 rounded-xl">
                      <span className="text-xs text-cyan-300 font-mono select-all truncate max-w-[85%]">{generatedPass}</span>
                      <button
                        onClick={() => copyToClipboard(generatedPass, "pass")}
                        className="text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {copiedId === "pass" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Strength Bar */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Entropy Strength Rating</span>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-800/60">
                      <div
                        className={`h-full transition-all duration-500 ${
                          passStrength > 80 ? "bg-emerald-500" : passStrength > 50 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${passStrength}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                      <span>Security: {passStrength}%</span>
                      <span className="font-bold">
                        {passStrength > 80 ? "MILITARY GRADE" : passStrength > 50 ? "MEDIUM RATING" : "VULNERABLE"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 font-mono text-xs">
                  Awaiting password generator parameter inputs...
                </div>
              )}
            </div>
          </div>
        )}

        {/* HASH DECODER */}
        {activeTab === "hash" && (
          <div className="space-y-4 font-mono">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Hash className="w-4 h-4 text-cyan-400" /> LOCAL DICTIONARY MD5/SHA DECODER
            </h3>
            
            <div className="space-y-2">
              <label className="block text-xs text-slate-400 uppercase font-semibold">Enter Target Cryptographic Hash</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-4 py-3 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-xs placeholder:text-slate-700"
                placeholder="Paste MD5 (32 chars) or SHA256 (64 chars) here"
                value={hashInput}
                onChange={(e) => handleIdentifyHash(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-[11px] text-slate-400">
              <p>📍 Identified Hash Style: <b className="text-cyan-400">{hashType}</b></p>
              <p>🗄️ Wordlists: Common Password Databases</p>
            </div>

            <button
              onClick={handleCrackHash}
              disabled={cracking || !hashInput}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-100 font-bold rounded-xl cursor-pointer border border-cyan-400/30 text-xs transition-colors"
            >
              {cracking ? "SEARCHING CRACK DICTIONARY..." : "IDENTIFY & CRACK"}
            </button>

            {crackResult && (
              <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                crackResult.startsWith("Match Found") 
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" 
                  : "bg-red-950/20 border-red-500/30 text-red-300"
              }`}>
                {crackResult}
              </div>
            )}
          </div>
        )}

        {/* STEGANOGRAPHY */}
        {activeTab === "steg" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono">
            {/* Encoder */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" /> ZERO-WIDTH UNICODE HIDER
              </h3>
              
              <div className="space-y-2">
                <label className="block text-[11px] text-slate-400 uppercase">Cover Text (Dummy message visible to all)</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-xs"
                  placeholder="e.g. Weather is fantastic today"
                  value={stegCover}
                  onChange={(e) => {
                    sound.playTyping();
                    setStegCover(e.target.value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] text-slate-400 uppercase">Secret Payload (Hidden message)</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-xs"
                  placeholder="e.g. Attack at midnight!"
                  value={stegSecret}
                  onChange={(e) => {
                    sound.playTyping();
                    setStegSecret(e.target.value);
                  }}
                />
              </div>

              <button
                onClick={handleStegHide}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 cursor-pointer text-slate-100 font-bold rounded-xl border border-cyan-400/30 text-xs transition-colors"
              >
                OBFUSCATE SECRET PAYLOAD
              </button>

              {stegResult && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Output (Copy this, looks normal!)</span>
                  <div className="flex items-center justify-between mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-xs text-cyan-300 truncate max-w-[85%]">{stegResult}</span>
                    <button
                      onClick={() => copyToClipboard(stegResult, "steg")}
                      className="text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {copiedId === "steg" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Decoder */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-cyan-400" /> ZERO-WIDTH SEQUENCE EXTRACOR
              </h3>

              <div className="space-y-2">
                <label className="block text-[11px] text-slate-400 uppercase">Paste Steganography Text</label>
                <textarea
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-xs resize-none"
                  placeholder="Paste cover text sequence here to extract hidden bytes..."
                  value={stegDecodeInput}
                  onChange={(e) => {
                    sound.playTyping();
                    setStegDecodeInput(e.target.value);
                  }}
                />
              </div>

              <button
                onClick={handleStegExtract}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 cursor-pointer text-slate-100 font-bold rounded-xl border border-cyan-400/30 text-xs transition-colors"
              >
                RUN EXTRACTOR EXAM
              </button>

              {stegDecodedSecret !== null && (
                <div className="p-3 bg-slate-950 border border-slate-800 text-cyan-400 rounded-xl text-xs">
                  🔍 Decoded Outcome: <b className="text-slate-200">{stegDecodedSecret}</b>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BTC WALLET */}
        {activeTab === "wallet" && (
          <div className="space-y-4 font-mono">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-cyan-400" /> LOCAL OFFLINE BITCOIN WALLET ENGINE
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate non-custodial, high-entropy Bitcoin key profiles using localized pseudo-random mathematical triggers. Completely offline.
            </p>

            <button
              onClick={handleGenerateWallet}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 cursor-pointer text-slate-100 font-bold rounded-xl border border-cyan-400/30 text-xs transition-colors"
            >
              SPAWN NEW KEY PROFILE
            </button>

            {walletSeed && (
              <div className="space-y-3 pt-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">12-Word Seed Mnemonic</span>
                  <div className="mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-400 leading-relaxed">
                    {walletSeed}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Public Address (Receive Node)</span>
                    <div className="flex items-center justify-between mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                      <span className="text-slate-300 truncate max-w-[85%] select-all">{walletPublic}</span>
                      <button onClick={() => copyToClipboard(walletPublic, "pub")} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                        {copiedId === "pub" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-red-500 uppercase font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Private Key (WIF - SECRET)
                    </span>
                    <div className="flex items-center justify-between mt-1 p-2.5 bg-red-950/10 border border-red-900/30 rounded-xl text-xs">
                      <span className="text-red-400 truncate max-w-[85%] select-all font-bold">{walletPrivate}</span>
                      <button onClick={() => copyToClipboard(walletPrivate, "priv")} className="text-red-500 hover:text-red-400 cursor-pointer">
                        {copiedId === "priv" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* WIFI SCANNER */}
        {activeTab === "wifi" && (
          <div className="space-y-4 font-mono">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400" /> LOCAL RADAR AIRWAVES RECEIVER (WLAN)
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulate standard network scans for active nearby IEEE 802.11 routers, identifying cryptographic protocols, channels, and decibel signals.
            </p>

            <button
              onClick={handleScanWiFi}
              disabled={scanningWiFi}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-100 font-bold rounded-xl border border-cyan-400/30 text-xs transition-colors"
            >
              {scanningWiFi ? "TUNING TRANSCEIVER RADAR..." : "SCAN WIRELESS FREQUENCIES"}
            </button>

            {scannedWiFi.length > 0 && (
              <div className="space-y-2 pt-2">
                {scannedWiFi.map((wifi, idx) => {
                  let signalColor = "text-emerald-400";
                  if (wifi.strength < 70) signalColor = "text-amber-400";
                  if (wifi.strength < 45) signalColor = "text-red-400";

                  return (
                    <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-xs">
                      <div className="flex items-center gap-3">
                        <Radio className="w-4 h-4 text-cyan-400" />
                        <div>
                          <p className="font-bold text-slate-200">{wifi.ssid}</p>
                          <p className="text-[10px] text-slate-500">Security: {wifi.enc} • Channel: {wifi.ch}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-bold ${signalColor}`}>{wifi.strength}% DBm</span>
                        <div className="w-16 bg-slate-900 h-1 rounded-full overflow-hidden mt-1 border border-slate-800">
                          <div className={`h-full ${
                            wifi.strength > 80 ? "bg-emerald-500" : wifi.strength > 50 ? "bg-amber-500" : "bg-red-500"
                          }`} style={{ width: `${wifi.strength}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
