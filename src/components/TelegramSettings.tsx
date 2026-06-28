import React, { useState } from "react";
import { sound } from "./AudioEngine";
import { Send, Bot, Check, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { User } from "../types";

interface TelegramSettingsProps {
  user: User;
  onUpdateUser: (updated: User) => void;
}

export default function TelegramSettings({ user, onUpdateUser }: TelegramSettingsProps) {
  const [botToken, setBotToken] = useState(user.telegramBotToken || "");
  const [chatId, setChatId] = useState(user.telegramChatId || "");
  const [testMessage, setTestMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/auth/update-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          telegramBotToken: botToken,
          telegramChatId: chatId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      sound.playSuccess();
      onUpdateUser(data.user);
      setStatus({ type: "success", message: "Bot configurations saved securely!" });
    } catch (err: any) {
      sound.playError();
      setStatus({ type: "error", message: err.message || "Failed to save details" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestBot = async () => {
    if (!botToken || !chatId) {
      sound.playError();
      setStatus({ type: "error", message: "Please enter Bot Token and Chat ID first." });
      return;
    }

    sound.playClick();
    setTesting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: botToken,
          chatId,
          message: testMessage || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        sound.playSuccess();
        setStatus({ type: "success", message: "Success! Check your Telegram channel for the message." });
      } else {
        throw new Error("Telegram API returned non-ok response. Verify credentials.");
      }
    } catch (err: any) {
      sound.playError();
      setStatus({ type: "error", message: err.message || "Test connection failed." });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide">PRIVATE TELEGRAM BOT INTEGRATION</h2>
          <p className="text-xs text-slate-400 font-mono">Push scraped/extracted datasets and runner logs to your own chat channel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSave} className="lg:col-span-3 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
              Private Telegram Bot Token
            </label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-xs font-mono placeholder:text-slate-700"
              placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              value={botToken}
              onChange={(e) => {
                sound.playTyping();
                setBotToken(e.target.value);
              }}
            />
            <p className="text-[10px] text-slate-500 font-mono mt-1">Get this token by messaging @BotFather on Telegram</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
              Your Telegram Chat ID
            </label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-xs font-mono placeholder:text-slate-700"
              placeholder="e.g. 5610762471"
              value={chatId}
              onChange={(e) => {
                sound.playTyping();
                setChatId(e.target.value);
              }}
            />
            <p className="text-[10px] text-slate-500 font-mono mt-1">Obtain your unique Chat ID using @userinfobot or @GetChatID_Bot</p>
          </div>

          {status.type && (
            <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
              status.type === "success" 
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" 
                : "bg-red-950/20 border-red-500/30 text-red-300"
            }`}>
              {status.type === "success" ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
              {status.message}
            </div>
          )}

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-100 font-mono text-xs font-bold rounded-xl border border-cyan-400/30 cursor-pointer transition-colors"
            >
              {saving ? "SAVING CONFIGS..." : "SAVE CONFIGURATIONS"}
            </button>
            
            <button
              type="button"
              onClick={handleTestBot}
              disabled={testing}
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-cyan-400 font-mono text-xs font-bold rounded-xl border border-cyan-500/20 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              TEST INTEGRATION
            </button>
          </div>
        </form>

        <div className="lg:col-span-2 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider mb-2.5">Send a test notification</h3>
            <textarea
              rows={3}
              className="w-full bg-slate-950 border border-slate-800/80 text-slate-200 p-3 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-xs font-mono placeholder:text-slate-700 resize-none"
              placeholder="Type anything here to test connection..."
              value={testMessage}
              onChange={(e) => {
                sound.playTyping();
                setTestMessage(e.target.value);
              }}
            />
          </div>

          <div className="mt-4 p-3.5 bg-cyan-950/10 rounded-xl border border-cyan-500/5">
            <h4 className="text-[11px] font-bold text-cyan-400 font-mono mb-1">AUTOMATED RELAYS</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
              Once configured, the app will auto-transmit extracted lists, IP port scanner matches, and runtime multi-script runner results to this feed dynamically!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
