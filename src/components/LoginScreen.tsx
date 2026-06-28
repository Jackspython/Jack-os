import React, { useState } from "react";
import { sound } from "./AudioEngine";
import { Shield, KeyRound, Mail, User, Terminal, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setError("");
    setLoading(true);

    const url = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister ? { username, password, email } : { username, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      sound.playAccessGranted();
      
      // Save session
      localStorage.setItem("jack_os_user", JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      sound.playError();
      setError(err.message || "Something went wrong. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    sound.playAccessGranted();
    const guestUser = {
      username: "Guest_User_" + Math.floor(1000 + Math.random() * 9000),
      email: "guest@jackoshub.io",
      telegramBotToken: "",
      telegramChatId: ""
    };
    localStorage.setItem("jack_os_user", JSON.stringify(guestUser));
    onLoginSuccess(guestUser);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 overflow-hidden relative font-sans select-none">
      {/* Visual background grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
      
      {/* Decorative neon circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.07)] backdrop-blur-md p-8 relative overflow-hidden"
      >
        {/* Glow Line Indicator */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

        {/* Brand logo header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center mb-4 relative group">
            <Shield className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-2xl bg-cyan-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-slate-100 font-mono">JACK OS HUB v1.0</h1>
          <p className="text-xs text-cyan-500/80 font-mono mt-1">SECURE ACCESS GATEWAY</p>
        </div>

        {/* Info panel */}
        <div className="mb-6 p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-center">
          <p className="text-xs text-slate-300 font-mono flex items-center justify-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            SYSTEM MONITORED BY TELEGRAM ACTIVE BOT
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-xl font-mono"
          >
            ❌ ERROR: {error}
          </motion.div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-3 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm font-mono placeholder:text-slate-600"
                placeholder="Enter username"
                value={username}
                onChange={(e) => {
                  sound.playTyping();
                  setUsername(e.target.value);
                }}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-3 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm font-mono placeholder:text-slate-600"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    sound.playTyping();
                    setEmail(e.target.value);
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
              Security Key / Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-10 py-3 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm font-mono placeholder:text-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  sound.playTyping();
                  setPassword(e.target.value);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowPassword(!showPassword);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-100 font-mono font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-950/40 hover:shadow-cyan-500/10 border border-cyan-500/30 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 cursor-pointer text-sm mt-6"
          >
            {loading ? "PROCESSING COMMAND..." : isRegister ? "REGISTER AGENT" : "LOG IN / START SESSION"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Selector Toggle */}
        <div className="mt-6 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              sound.playClick();
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
          >
            {isRegister ? "Already registered? Sign In" : "Need credentials? Sign Up"}
          </button>
          
          <button
            onClick={handleGuestMode}
            className="text-slate-500 hover:text-slate-400 font-mono transition-colors border-b border-dashed border-slate-700 hover:border-slate-500"
          >
            Skip (Guest Sandbox)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
