import React, { useState, useEffect } from "react";
import { sound } from "./AudioEngine";
import { 
  Shield, 
  KeyRound, 
  Mail, 
  User, 
  Terminal, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Cpu, 
  Bot, 
  Send, 
  Lock, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  LockKeyhole,
  Settings,
  Globe,
  Wifi,
  WifiOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiFetch } from "../utils/api";

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  // Boot system loader
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootText, setBootText] = useState("Initializing sandbox kernel...");

  // Auth tabs: "signin" | "register" | "password_reset"
  const [authMode, setAuthMode] = useState<"signin" | "register" | "password_reset">("signin");
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Common Fields
  const [showPassword, setShowPassword] = useState(false);

  // Mode 1: Sign In Fields
  const [signinUsername, setSigninUsername] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  // Mode 2: Register Fields
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regBotToken, setRegBotToken] = useState("");
  const [regChatId, setRegChatId] = useState("");
  const [regCodeSent, setRegCodeSent] = useState(false);
  const [regOtp, setRegOtp] = useState("");

  // Mode 3: OTP Login Fields
  const [loginBotToken, setLoginBotToken] = useState("");
  const [loginChatId, setLoginChatId] = useState("");
  const [loginCodeSent, setLoginCodeSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState("");

  // Mode 4: Password Reset Fields
  const [resetBotToken, setResetBotToken] = useState("");
  const [resetChatId, setResetChatId] = useState("");
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");

  // Mode 5: API Connection Settings
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiServerInput, setApiServerInput] = useState(() => {
    return localStorage.getItem("jack_os_api_server_url") || "";
  });
  const [apiTesting, setApiTesting] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<"success" | "error" | "">("");
  const [apiTestMessage, setApiTestMessage] = useState("");

  // Simulated Boot sequence
  useEffect(() => {
    const steps = [
      { progress: 12, text: "Loading cybernetic core modules..." },
      { progress: 28, text: "Verifying local asset cache & memory tables..." },
      { progress: 45, text: "Checking live website for hot-updates (OTA)..." },
      { progress: 62, text: "Over-the-air sync: Complete. App is up to date!" },
      { progress: 80, text: "Testing API gateway connection and tokens..." },
      { progress: 92, text: "Initializing Telegram Bot messaging tunnel..." },
      { progress: 100, text: "System authorized. Sandbox environment live!" },
    ];
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setBootProgress(steps[stepIndex].progress);
        setBootText(steps[stepIndex].text);
        stepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setBooting(false);
          sound.playAccessGranted();
        }, 500);
      }
    }, 450);
    return () => clearInterval(interval);
  }, []);

  // API Gateway configuration helper
  const handleTestAndSaveApi = async () => {
    sound.playClick();
    setApiTesting(true);
    setApiTestResult("");
    setApiTestMessage("");

    const targetUrl = apiServerInput.trim().replace(/\/+$/, "");
    if (!targetUrl) {
      setApiTesting(false);
      setApiTestResult("error");
      setApiTestMessage("API Server URL cannot be empty. Click Reset to revert to default settings.");
      sound.playError();
      return;
    }

    try {
      const res = await fetch(`${targetUrl}/api/health`, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        if (text.trim().startsWith("<") || text.toLowerCase().includes("<!doctype")) {
          setApiTesting(false);
          setApiTestResult("error");
          setApiTestMessage("HTML Response Detected: The API URL returned HTML instead of JSON. Ensure your server.ts backend is running and you are not pointing to a static hosting directory.");
          sound.playError();
          return;
        }
      }

      const data = await res.json();
      if (data && (data.status === "ok" || data.success)) {
        setApiTesting(false);
        setApiTestResult("success");
        setApiTestMessage("Connection established successfully! Server is online and saved.");
        localStorage.setItem("jack_os_api_server_url", targetUrl);
        sound.playSuccess();
      } else {
        setApiTesting(false);
        setApiTestResult("error");
        setApiTestMessage("Invalid response payload from API health check endpoint.");
        sound.playError();
      }
    } catch (err: any) {
      setApiTesting(false);
      setApiTestResult("error");
      setApiTestMessage(err.message || "Network request failed. Ensure server is running and CORS is enabled.");
      sound.playError();
    }
  };

  const handleResetApiUrl = () => {
    sound.playClick();
    localStorage.removeItem("jack_os_api_server_url");
    setApiServerInput("");
    setApiTestResult("success");
    setApiTestMessage("Reset to default system server.");
    sound.playSuccess();
  };

  // Standard username + password Sign In
  const handleStandardSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: signinUsername, password: signinPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid username or password");
      }

      sound.playAccessGranted();
      localStorage.setItem("jack_os_user", JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      sound.playError();
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // Register: Step 1 (Send Code to Bot)
  const handleRegisterSendCode = async () => {
    if (!regUsername || !regPassword || !regEmail || !regBotToken || !regChatId) {
      sound.playError();
      setError("Please fill out all registration fields before requesting verification code.");
      return;
    }

    sound.playClick();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await apiFetch("/api/auth/telegram-register-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          password: regPassword,
          email: regEmail,
          telegramBotToken: regBotToken,
          telegramChatId: regChatId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to dispatch registration code.");
      }

      sound.playSuccess();
      setRegCodeSent(true);
      setSuccessMsg("Success! Verification code dispatched to your custom Telegram Bot. Please enter the code below.");
    } catch (err: any) {
      sound.playError();
      setError(err.message || "Failed to trigger registration code.");
    } finally {
      setLoading(false);
    }
  };

  // Register: Step 2 (Verify & Create Account)
  const handleRegisterVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOtp) return;

    sound.playClick();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await apiFetch("/api/auth/telegram-register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramBotToken: regBotToken,
          telegramChatId: regChatId,
          code: regOtp
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify registration code.");
      }

      sound.playAccessGranted();
      localStorage.setItem("jack_os_user", JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      sound.playError();
      setError(err.message || "Registration verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Login: Step 1 (Send Login OTP to Bot)
  const handleOtpLoginRequest = async () => {
    if (!loginBotToken || !loginChatId) {
      sound.playError();
      setError("Please input both Telegram Bot Token and Chat ID to request access.");
      return;
    }

    sound.playClick();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await apiFetch("/api/auth/telegram-login-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramBotToken: loginBotToken,
          telegramChatId: loginChatId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to trigger OTP login.");
      }

      sound.playSuccess();
      setLoginCodeSent(true);
      setSuccessMsg("System validation code has been sent to your Telegram Bot!");
    } catch (err: any) {
      sound.playError();
      setError(err.message || "Failed to initiate Bot OTP session.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Login: Step 2 (Verify & Enter Session)
  const handleOtpLoginVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginOtp) return;

    sound.playClick();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await apiFetch("/api/auth/telegram-login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramBotToken: loginBotToken,
          telegramChatId: loginChatId,
          code: loginOtp
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "OTP code verification failed");
      }

      sound.playAccessGranted();
      localStorage.setItem("jack_os_user", JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      sound.playError();
      setError(err.message || "Security OTP rejected by core shell.");
    } finally {
      setLoading(false);
    }
  };

  // Password Reset: Step 1 (Send Reset Key to Bot)
  const handlePasswordResetRequest = async () => {
    if (!resetBotToken || !resetChatId) {
      sound.playError();
      setError("Both Telegram Bot Token and Chat ID are required to find your account registry.");
      return;
    }

    sound.playClick();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await apiFetch("/api/auth/telegram-reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramBotToken: resetBotToken,
          telegramChatId: resetChatId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not retrieve password reset authorization.");
      }

      sound.playSuccess();
      setResetCodeSent(true);
      setSuccessMsg("Credentials reset token has been dispatched successfully to your Telegram Bot!");
    } catch (err: any) {
      sound.playError();
      setError(err.message || "Failed to contact Bot gateway.");
    } finally {
      setLoading(false);
    }
  };

  // Password Reset: Step 2 (Verify Code & Save New Password)
  const handlePasswordResetVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp || !resetNewPassword) return;

    sound.playClick();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await apiFetch("/api/auth/telegram-reset-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramBotToken: resetBotToken,
          telegramChatId: resetChatId,
          code: resetOtp,
          newPassword: resetNewPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification rejected.");
      }

      sound.playSuccess();
      setSuccessMsg("Success! Security password successfully updated. Please sign in using your updated password.");
      setAuthMode("signin");
      
      // Clean up fields
      setResetBotToken("");
      setResetChatId("");
      setResetCodeSent(false);
      setResetOtp("");
      setResetNewPassword("");
    } catch (err: any) {
      sound.playError();
      setError(err.message || "Reset token rejected by database.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    sound.playAccessGranted();
    const guestUser = {
      username: "Guest_" + Math.floor(1000 + Math.random() * 9000),
      email: "guest@jackoshub.io",
      telegramBotToken: "",
      telegramChatId: ""
    };
    localStorage.setItem("jack_os_user", JSON.stringify(guestUser));
    onLoginSuccess(guestUser);
  };

  const clearMessages = () => {
    setError("");
    setSuccessMsg("");
  };

  // RENDER 1: BOOTING LOADER SCREEN
  if (booting) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-6 relative font-mono select-none">
        <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
        <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-md relative text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center mx-auto relative animate-pulse">
            <Cpu className="w-8 h-8 text-cyan-400" />
            <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-md"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-slate-100">JACK OS v4.0</h1>
            <p className="text-[10px] text-cyan-500 uppercase tracking-widest mt-1">Booting Secure Shell</p>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800 overflow-hidden">
              <motion.div 
                className="bg-cyan-500 h-full rounded-full" 
                animate={{ width: `${bootProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span className="truncate">{bootText}</span>
              <span>{bootProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER 2: AUTHENTICATION CONTAINER
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 overflow-y-auto relative font-sans select-none py-12">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
      
      {/* Ambient glowing backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.06)] backdrop-blur-md p-8 relative"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center mb-3 relative group">
            <Shield className="w-7 h-7 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-xl font-extrabold tracking-wider text-slate-100 font-mono">JACK OS HUB v4.0</h1>
          <p className="text-[10px] text-cyan-500/80 font-mono tracking-widest mt-0.5">TELEGRAM BOT AUTHSHELL</p>
        </div>

        {/* Dynamic Segmented Mode Switcher */}
        <div className="flex bg-slate-950/80 border border-slate-850 p-1 rounded-xl mb-6 font-mono text-[9px] font-bold">
          <button
            onClick={() => { sound.playClick(); setAuthMode("signin"); clearMessages(); }}
            className={`flex-1 py-2 rounded-lg text-center cursor-pointer transition-all ${
              authMode === "signin" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => { sound.playClick(); setAuthMode("register"); clearMessages(); }}
            className={`flex-1 py-2 rounded-lg text-center cursor-pointer transition-all ${
              authMode === "register" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            REGISTER (BOT)
          </button>
          <button
            onClick={() => { sound.playClick(); setAuthMode("password_reset"); clearMessages(); }}
            className={`flex-1 py-2 rounded-lg text-center cursor-pointer transition-all ${
              authMode === "password_reset" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            RESET PASSWORD
          </button>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="mb-5 p-3 bg-red-950/40 border border-red-500/20 text-red-300 text-xs rounded-xl font-mono flex gap-2 items-start text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl font-mono flex gap-2 items-start text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* VIEW 1: STANDARD PASSWORD SIGN IN */}
        {authMode === "signin" && (
          <form onSubmit={handleStandardSignIn} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-cyan-500 outline-none text-xs font-mono placeholder:text-slate-700"
                  placeholder="e.g. cyber_agent"
                  value={signinUsername}
                  onChange={(e) => { sound.playTyping(); setSigninUsername(e.target.value); }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 pl-10 pr-10 py-2.5 rounded-xl focus:border-cyan-500 outline-none text-xs font-mono placeholder:text-slate-700"
                  placeholder="••••••••"
                  value={signinPassword}
                  onChange={(e) => { sound.playTyping(); setSigninPassword(e.target.value); }}
                />
                <button
                  type="button"
                  onClick={() => { sound.playClick(); setShowPassword(!showPassword); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-100 font-mono font-bold text-xs py-3 px-4 rounded-xl shadow-lg border border-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer uppercase mt-6"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "SECURE ENTRY"}
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAuthMode("password_reset");
                  clearMessages();
                }}
                className="text-xs text-slate-500 hover:text-cyan-400 font-mono transition-colors border-b border-dashed border-slate-800 hover:border-cyan-500/40 cursor-pointer"
              >
                Forgot Password? Reset via Telegram Bot
              </button>
            </div>
          </form>
        )}

        {/* VIEW 2: REGISTER VIA TELEGRAM BOT VERIFICATION */}
        {authMode === "register" && (
          <div className="space-y-4 text-left font-mono">
            <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-xl">
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">BOT-VERIFIED REGISTER</p>
              <p className="text-[9px] text-slate-400 leading-relaxed">
                Provide your custom Bot Token and Chat ID. We will route a 6-digit creation key to your Telegram Bot to finalize registration.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Agent Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    disabled={regCodeSent}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 pl-8.5 pr-3 py-2 rounded-xl focus:border-cyan-500 outline-none text-[11px] placeholder:text-slate-800"
                    placeholder="agent_X"
                    value={regUsername}
                    onChange={(e) => { sound.playTyping(); setRegUsername(e.target.value); }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="email"
                    disabled={regCodeSent}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 pl-8.5 pr-3 py-2 rounded-xl focus:border-cyan-500 outline-none text-[11px] placeholder:text-slate-800"
                    placeholder="X@domain.com"
                    value={regEmail}
                    onChange={(e) => { sound.playTyping(); setRegEmail(e.target.value); }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Registry Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  disabled={regCodeSent}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 pl-10 pr-4 py-2 rounded-xl focus:border-cyan-500 outline-none text-xs placeholder:text-slate-800"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => { sound.playTyping(); setRegPassword(e.target.value); }}
                />
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-3 space-y-3">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Telegram Bot Token
                </label>
                <input
                  type="text"
                  disabled={regCodeSent}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-3.5 py-2 rounded-xl focus:border-cyan-500 outline-none text-xs font-mono placeholder:text-slate-800"
                  placeholder="e.g. 123456789:ABCdefGhI..."
                  value={regBotToken}
                  onChange={(e) => { sound.playTyping(); setRegBotToken(e.target.value); }}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Telegram Chat ID
                </label>
                <input
                  type="text"
                  disabled={regCodeSent}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-3.5 py-2 rounded-xl focus:border-cyan-500 outline-none text-xs font-mono placeholder:text-slate-800"
                  placeholder="e.g. 987654321"
                  value={regChatId}
                  onChange={(e) => { sound.playTyping(); setRegChatId(e.target.value); }}
                />
              </div>
            </div>

            {!regCodeSent ? (
              <button
                type="button"
                onClick={handleRegisterSendCode}
                disabled={loading}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-cyan-400 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex justify-center items-center gap-2 mt-2"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-4 h-4" />}
                DISPATCH REGISTRATION CODE
              </button>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Enter Registration Code
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-extrabold text-center px-4 py-2.5 rounded-lg outline-none tracking-widest text-sm focus:border-emerald-500"
                      placeholder="e.g. 948123"
                      value={regOtp}
                      onChange={(e) => { sound.playTyping(); setRegOtp(e.target.value); }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleRegisterVerify}
                      disabled={loading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      {loading ? "VERIFYING..." : "CONFIRM & REGISTER"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegCodeSent(false)}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      EDIT FIELDS
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: OTP LOGIN FLOW REMOVED */}

        {/* VIEW 4: PASSWORD RESET FLOW */}
        {authMode === "password_reset" && (
          <div className="space-y-4 text-left font-mono">
            <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-xl">
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">BOT-AUTHORIZED CREDENTIAL RESET</p>
              <p className="text-[9px] text-slate-400 leading-relaxed">
                Lost your password? Provide your registered Bot Token and Chat ID. We will send a security override key to authorization servers.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Telegram Bot Token
                </label>
                <input
                  type="text"
                  disabled={resetCodeSent}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-3.5 py-2.5 rounded-xl focus:border-cyan-500 outline-none text-xs font-mono placeholder:text-slate-800"
                  placeholder="e.g. 123456789:ABCdefGhI..."
                  value={resetBotToken}
                  onChange={(e) => { sound.playTyping(); setResetBotToken(e.target.value); }}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Telegram Chat ID
                </label>
                <input
                  type="text"
                  disabled={resetCodeSent}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-3.5 py-2.5 rounded-xl focus:border-cyan-500 outline-none text-xs font-mono placeholder:text-slate-800"
                  placeholder="e.g. 987654321"
                  value={resetChatId}
                  onChange={(e) => { sound.playTyping(); setResetChatId(e.target.value); }}
                />
              </div>
            </div>

            {!resetCodeSent ? (
              <button
                type="button"
                onClick={handlePasswordResetRequest}
                disabled={loading}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-cyan-400 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex justify-center items-center gap-2 mt-2"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-4 h-4" />}
                DISPATCH RESET TOKEN
              </button>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Enter Reset Code (Received on Bot)
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-extrabold text-center px-4 py-2.5 rounded-lg outline-none tracking-widest text-sm focus:border-emerald-500"
                      placeholder="e.g. 194823"
                      value={resetOtp}
                      onChange={(e) => { sound.playTyping(); setResetOtp(e.target.value); }}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      New Secure Password
                    </label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="password"
                        required
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-8.5 pr-4 py-2 rounded-xl focus:border-cyan-500 outline-none text-xs placeholder:text-slate-800"
                        placeholder="••••••••"
                        value={resetNewPassword}
                        onChange={(e) => { sound.playTyping(); setResetNewPassword(e.target.value); }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handlePasswordResetVerify}
                      disabled={loading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      {loading ? "SAVING..." : "UPDATE SECURITY KEY"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetCodeSent(false)}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      BACK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Connection Gateway Panel Toggle */}
        <div className="mt-6 pt-5 border-t border-slate-900/60 font-mono text-xs">
          <button
            type="button"
            onClick={() => { sound.playClick(); setShowApiSettings(!showApiSettings); }}
            className="flex items-center gap-2 mx-auto text-[10px] text-cyan-500/70 hover:text-cyan-400 transition-colors uppercase tracking-wider font-bold cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 animate-spin-slow" />
            {showApiSettings ? "Hide Server Gateway Settings" : "Configure Mobile API Server Gateway"}
          </button>

          <AnimatePresence>
            {showApiSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-4 text-left"
              >
                <div className="p-4 bg-slate-950 border border-slate-900/80 rounded-xl space-y-3.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-[9px] tracking-wider">
                    <Globe className="w-3.5 h-3.5" /> API Server Connection Configuration
                  </div>
                  <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
                    Android apps running on <code>file://</code> or <code>http://localhost</code> require a live API endpoint to process logins and scrape operations. If you are using an Android Studio emulator, use <code>http://10.0.2.2:3000</code> to connect to your host computer.
                  </p>

                  <div className="space-y-2 font-mono">
                    <label className="block text-[8px] font-bold text-slate-500 uppercase">
                      API Server Gateway Domain
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        className="flex-1 bg-slate-900 border border-slate-850 text-slate-200 px-3 py-2 rounded-lg text-[11px] font-mono focus:border-cyan-500 outline-none placeholder:text-slate-700"
                        placeholder="e.g. http://10.0.2.2:3000 or https://yourdomain.com"
                        value={apiServerInput}
                        onChange={(e) => setApiServerInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleTestAndSaveApi}
                        disabled={apiTesting}
                        className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-100 font-bold rounded-lg text-[10px] uppercase transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {apiTesting ? "Testing..." : "Test & Save"}
                      </button>
                      {localStorage.getItem("jack_os_api_server_url") && (
                        <button
                          type="button"
                          onClick={handleResetApiUrl}
                          className="px-2.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] uppercase transition-colors cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {apiTestResult && (
                    <div className={`p-2.5 rounded-lg border text-[10px] leading-relaxed flex items-start gap-2 font-mono ${
                      apiTestResult === "success" 
                        ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-red-950/10 border-red-500/20 text-red-400"
                    }`}>
                      {apiTestResult === "success" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold block uppercase tracking-wider text-[8px] mb-0.5">
                          {apiTestResult === "success" ? "Connection Verified" : "Verification Failed"}
                        </span>
                        {apiTestMessage}
                      </div>
                    </div>
                  )}

                  <div className="p-2 bg-slate-900/40 rounded-lg text-[9px] text-slate-500 text-center font-mono">
                    Current active endpoint: <code className="text-slate-300 font-semibold">{localStorage.getItem("jack_os_api_server_url") || "Default Cloud Gateway"}</code>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Footer Controls */}
        <div className="mt-8 text-center text-[10px] text-slate-500 font-mono">
          <span>Protected by Telegram Bot OTP Authentication Security Shell</span>
        </div>
      </motion.div>
    </div>
  );
}
