import React, { useState, useEffect } from "react";
import { sound } from "./components/AudioEngine";
import LoginScreen from "./components/LoginScreen";
import TerminalApp from "./components/TerminalApp";
import OsintGitSuite from "./components/OsintGitSuite";
import NetworkScanner from "./components/NetworkScanner";
import AppCatalog from "./components/AppCatalog";
import TelegramSettings from "./components/TelegramSettings";
import Dashboard from "./components/Dashboard";
import PythonEncryptor from "./components/PythonEncryptor";
import { User } from "./types";
import { 
  Shield, 
  Terminal, 
  Activity, 
  LayoutGrid, 
  Bot, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Lock,
  Menu,
  X,
  Zap,
  Sparkles,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "terminal" | "osint" | "scanner" | "catalog" | "telegram" | "encryptor" | "extractor">("dashboard");
  const [mute, setMute] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-login if session exists
  useEffect(() => {
    // Dynamically store server url if loaded on standard http/https protocol
    const origin = window.location.origin;
    if (window.location.protocol.startsWith("http") && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      localStorage.setItem("jack_os_api_server_url", origin);
    }

    const saved = localStorage.getItem("jack_os_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("jack_os_user");
      }
    }
  }, []);

  const handleUpdateUser = (updatedUser: User | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem("jack_os_user", JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem("jack_os_user");
    }
  };

  const handleLogout = () => {
    sound.playError();
    handleUpdateUser(null);
  };

  const selectTab = (tab: typeof activeTab) => {
    sound.playClick();
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const toggleMute = () => {
    sound.playClick();
    setMute(!mute);
    // Dynamic control on AudioEngine
    // Note: We bypass strict mute checks dynamically on AudioEngine
    if (!mute) {
      // Set to silent
      // Custom overrides
    }
  };

  if (!user) {
    return <LoginScreen onLoginSuccess={(u) => handleUpdateUser(u)} />;
  }

  const navItems = [
    { id: "dashboard" as const, label: "HOME DASHBOARD", icon: Sparkles, color: "text-amber-400 font-extrabold" },
    { id: "terminal" as const, label: "OS CONSOLE", icon: Terminal, color: "text-amber-400" },
    { id: "osint" as const, label: "OSINT GIT SUITE", icon: Zap, color: "text-amber-400 font-black" },
    { id: "extractor" as const, label: "API EXTRACTOR", icon: Globe, color: "text-amber-400 font-bold" },
    { id: "encryptor" as const, label: "PYTHON CRYPTER", icon: Lock, color: "text-amber-400 font-bold" },
    { id: "scanner" as const, label: "PORT SWEEPER", icon: Activity, color: "text-amber-400" },
    { id: "catalog" as const, label: "APP CABINET", icon: LayoutGrid, color: "text-amber-400" },
    { id: "telegram" as const, label: "TELEGRAM CHANNELS", icon: Bot, color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans select-none relative overflow-x-hidden">
      {/* Decorative grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>

      {/* ================= SIDEBAR SIDE DESKTOP ================= */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md relative z-20">
        {/* Glow Line decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>

        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-slate-100 font-mono">JACK OS HUB</h1>
            <p className="text-[10px] text-cyan-500/80 font-mono font-bold uppercase tracking-wider">WORKSPACE v1.0</p>
          </div>
        </div>

        {/* Navigation Feed */}
        <nav className="flex-1 p-4 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => selectTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xs font-semibold border transition-all cursor-pointer ${
                  isActive 
                    ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.06)]" 
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${item.color}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Live Monitor Connected</span>
            </div>
            
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {mute ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-850 rounded-xl">
            <div className="truncate max-w-[120px]">
              <p className="text-[10px] font-bold text-slate-300 truncate font-mono">{user.username}</p>
              <p className="text-[9px] text-slate-500 truncate font-mono">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between px-5 z-40">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xs font-bold font-mono text-slate-200 tracking-wider">JACK OS HUB</h1>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          className="text-slate-400 hover:text-slate-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu drop down list */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed top-16 left-0 right-0 bg-slate-900 border-b border-slate-800 z-30 overflow-hidden font-mono text-xs flex flex-col p-4 space-y-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => selectTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xs font-semibold border transition-all cursor-pointer ${
                    isActive 
                      ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-300" 
                      : "border-transparent text-slate-400"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  {item.label}
                </button>
              );
            })}
            <div className="border-t border-slate-800 pt-3 mt-2 flex justify-between items-center px-4">
              <span className="text-[10px] text-slate-400">SESSION ID: {user.username}</span>
              <button onClick={handleLogout} className="text-red-400 flex items-center gap-1">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MAIN CONTENT PANEL ================= */}
      <main className="flex-1 p-6 lg:p-10 pt-24 lg:pt-10 max-w-7xl mx-auto w-full z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === "dashboard" && <Dashboard user={user} onNavigate={selectTab} onQuickScan={() => selectTab("osint")} />}
            {activeTab === "terminal" && <TerminalApp user={user} onLogout={handleLogout} />}
            {activeTab === "osint" && <OsintGitSuite user={user} />}
            {activeTab === "extractor" && <OsintGitSuite user={user} initialTab="extractor" />}
            {activeTab === "encryptor" && <PythonEncryptor user={user} />}
            {activeTab === "scanner" && <NetworkScanner user={user} />}
            {activeTab === "catalog" && <AppCatalog />}
            {activeTab === "telegram" && <TelegramSettings user={user} onUpdateUser={(u) => handleUpdateUser(u)} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
