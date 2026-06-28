import React, { useState } from "react";
import { sound } from "./AudioEngine";
import { 
  Smartphone, 
  QrCode, 
  Download, 
  Layers, 
  Chrome, 
  Compass, 
  PlusSquare, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Cpu, 
  Info,
  ChevronRight,
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";

interface MobileAppCenterProps {
  user: User;
}

export default function MobileAppCenter({ user }: MobileAppCenterProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [selectedOS, setSelectedOS] = useState<"ios" | "android" | "hybrid">("ios");
  const [simulatorScreen, setSimulatorScreen] = useState<"launch" | "home" | "terminal">("launch");

  // Get the live shared app URL dynamically or fallback to current host
  const liveUrl = window.location.origin;

  const handleCopyUrl = () => {
    sound.playClick();
    navigator.clipboard.writeText(liveUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleOSChange = (os: "ios" | "android" | "hybrid") => {
    sound.playClick();
    setSelectedOS(os);
  };

  const handleSimScreenChange = (screen: "launch" | "home" | "terminal") => {
    sound.playClick();
    setSimulatorScreen(screen);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 font-mono">
      {/* Left panel: Info & Installation Guides */}
      <div className="xl:col-span-7 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 tracking-wide uppercase">
                Jack OS Hub Mobile Port
              </h2>
              <p className="text-[10px] text-slate-400">
                Install as a progressive, distraction-free standalone application on iOS & Android
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Jack OS Hub is fully optimized for mobile devices. Using the system's PWA capability, you can run this applet directly as a native, borderless fullscreen app with offline-capable terminal commands and rapid server responses.
          </p>

          {/* Quick Connect & QR Section */}
          <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-4 flex flex-col items-center justify-center bg-slate-900 p-4 rounded-xl border border-slate-800/60">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(liveUrl)}&color=06b6d4&bgcolor=090d16`}
                alt="Jack OS QR Scan" 
                className="w-32 h-32 rounded-lg border border-cyan-500/20 bg-slate-950 p-1.5"
              />
              <span className="text-[9px] text-slate-500 mt-2 font-bold text-center">SCAN TO OPEN ON PHONE</span>
            </div>

            <div className="md:col-span-8 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-cyan-400" /> INSTANT WEB OVER-THE-AIR (OTA)
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Scan this dynamic QR code with your mobile camera or copy the secure link below to run Jack OS Hub on your iOS/Android device immediately.
              </p>

              <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-cyan-400 truncate flex-1 font-mono">
                  {liveUrl}
                </span>
                <button
                  onClick={handleCopyUrl}
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                >
                  {copiedUrl ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <a 
                  href={liveUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Installation Guides */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-mono">
            CHOOSE YOUR PLATFORM INSTALLATION WALKTHROUGH
          </h3>

          <div className="grid grid-cols-3 gap-2.5 mb-6">
            <button
              onClick={() => handleOSChange("ios")}
              className={`py-3 px-2 rounded-xl border text-xs font-bold font-mono transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                selectedOS === "ios"
                  ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-md"
                  : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800"
              }`}
            >
              <Compass className="w-4 h-4" />
              APPLE iOS (SAFARI)
            </button>

            <button
              onClick={() => handleOSChange("android")}
              className={`py-3 px-2 rounded-xl border text-xs font-bold font-mono transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                selectedOS === "android"
                  ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-md"
                  : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800"
              }`}
            >
              <Chrome className="w-4 h-4" />
              ANDROID (CHROME)
            </button>

            <button
              onClick={() => handleOSChange("hybrid")}
              className={`py-3 px-2 rounded-xl border text-xs font-bold font-mono transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                selectedOS === "hybrid"
                  ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-md"
                  : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800"
              }`}
            >
              <Code className="w-4 h-4" />
              NATIVE APK/IPA BUILD
            </button>
          </div>

          <AnimatePresence mode="wait">
            {selectedOS === "ios" && (
              <motion.div
                key="ios"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-300 leading-relaxed space-y-3">
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <p>Open <b>Safari</b> on your iPhone or iPad and navigate to the Shared App URL.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <p>Tap the <b>Share</b> button <span className="text-cyan-400">(the icon with an arrow pointing out of a box)</span> at the bottom/top of the browser screen.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <p>Scroll down the share menu list and select the <b className="text-cyan-300 flex items-center gap-1 inline-flex"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen</b> parameter option.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                    <p>Confirm the name <b>Jack OS</b> and tap <b>Add</b>. The app launcher icon will appear instantly on your device screen!</p>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedOS === "android" && (
              <motion.div
                key="android"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-300 leading-relaxed space-y-3">
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <p>Open <b>Google Chrome</b> on your Android device and access the Shared App URL.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <p>Look for an install banner at the bottom or tap the <b>three-dot menu</b> icon at the top right.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <p>Select <b className="text-cyan-300">Install App</b> or <b>Add to Home Screen</b> from the list.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                    <p>Accept the installation trigger prompts. The PWA will compile and register as a standalone app with its own process channel!</p>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedOS === "hybrid" && (
              <motion.div
                key="hybrid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-[11px] text-slate-300 leading-relaxed space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-cyan-400 mb-1 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" /> PACKAGING WITH CAPACITOR BY IONIC
                    </h4>
                    <p className="text-slate-400">
                      If you want to package this entire workspace into a native binary (.apk for Android, .ipa for iOS) for app stores, you can do so in minutes using Capacitor:
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[10px] text-emerald-400 font-mono space-y-1">
                    <p># 1. Export your code folder and install Capacitor dependencies</p>
                    <p className="text-slate-300">npm install @capacitor/core @capacitor/cli</p>
                    <p className="pt-2"># 2. Initialize Capacitor in your local repository</p>
                    <p className="text-slate-300">npx cap init "Jack OS Hub" "com.jackos.hub" --web-dir=dist</p>
                    <p className="pt-2 font-semibold"># 3. Add mobile native platforms</p>
                    <p className="text-slate-300">npm install @capacitor/android @capacitor/ios</p>
                    <p className="text-slate-300">npx cap add android</p>
                    <p className="text-slate-300">npx cap add ios</p>
                    <p className="pt-2 font-semibold"># 4. Build and sync web bundle into mobile container</p>
                    <p className="text-slate-300">npm run build</p>
                    <p className="text-slate-300">npx cap sync</p>
                  </div>

                  <div className="p-3 bg-cyan-950/15 border border-cyan-500/20 text-cyan-300 rounded-xl flex items-start gap-2 text-[10px]">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <b>Developer Note:</b> All API proxies, socket relays, and script encryption modules run within a Node.js context, fully compatible with full-stack container environments like Capacitor, Cordova, or standard WebView layouts.
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right panel: Live PWA Device Simulator */}
      <div className="xl:col-span-5 flex flex-col space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-mono self-start flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> LIVE PWA LAUNCH PREVIEW
          </h3>

          {/* Interactive device frame mock */}
          <div className="relative w-64 h-[440px] bg-slate-950 border-[6px] border-slate-800 rounded-[32px] overflow-hidden shadow-2xl shadow-cyan-950/20 flex flex-col">
            {/* Phone speaker & camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-b-xl z-20 flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-900 rounded-full"></div>
            </div>

            {/* Simulated Mobile screen content */}
            <div className="flex-1 overflow-hidden relative flex flex-col pt-4">
              <AnimatePresence mode="wait">
                {simulatorScreen === "launch" && (
                  <motion.div
                    key="launch"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
                      <img 
                        src="/src/assets/images/app_icon_pwa_1782653981605.jpg"
                        alt="Jack OS Icon"
                        className="w-12 h-12 rounded-xl object-cover" 
                      />
                    </div>
                    <h4 className="text-sm font-bold text-cyan-400 tracking-widest font-mono">
                      JACK OS HUB
                    </h4>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">
                      MOBILE INTERACTION PORT
                    </p>
                    
                    <div className="w-24 bg-slate-900 h-1 rounded-full overflow-hidden mt-6">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.8, repeat: Infinity, repeatType: "loop" }}
                        className="h-full bg-cyan-500"
                      ></motion.div>
                    </div>
                  </motion.div>
                )}

                {simulatorScreen === "home" && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950 p-4 font-mono flex flex-col"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-850 text-[8px] text-slate-500">
                      <span>LTE / WIFI</span>
                      <span>100% SECURE</span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2.5">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <span className="text-[7px] text-slate-300 mt-1 truncate w-full">CONSOLE</span>
                      </div>

                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">
                          <Layers className="w-5 h-5" />
                        </div>
                        <span className="text-[7px] text-slate-300 mt-1 truncate w-full">SCRAPERS</span>
                      </div>

                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs">
                          <Code className="w-5 h-5" />
                        </div>
                        <span className="text-[7px] text-slate-300 mt-1 truncate w-full">CRYPTER</span>
                      </div>
                    </div>

                    <div className="mt-6 bg-slate-900 border border-slate-850 p-2.5 rounded-xl text-[7px] text-slate-400 leading-normal">
                      <p className="text-cyan-400 font-bold uppercase mb-1">PWA Active Signal</p>
                      Service worker active and polling on port 3000. Full sandbox tunnels running perfectly.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Screen selection buttons mock */}
            <div className="px-4 py-3 bg-slate-900 border-t border-slate-850 flex justify-around items-center z-10">
              <button 
                onClick={() => handleSimScreenChange("launch")}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${simulatorScreen === "launch" ? "text-cyan-400 bg-slate-950" : "text-slate-500"}`}
              >
                LAUNCH
              </button>
              <button 
                onClick={() => handleSimScreenChange("home")}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${simulatorScreen === "home" ? "text-cyan-400 bg-slate-950" : "text-slate-500"}`}
              >
                DASHBOARD
              </button>
            </div>

            {/* Phone bottom bar notch */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-700 rounded-full z-20"></div>
          </div>

          <div className="mt-4 flex gap-2">
            <span className="text-[10px] bg-slate-950 border border-slate-850/80 text-slate-500 px-3 py-1 rounded-full font-bold">
              PORTRAIT RATIO: 9:16
            </span>
            <span className="text-[10px] bg-cyan-950/30 border border-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full font-bold">
              PWA ENABLED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
