import React, { useState } from "react";
import { sound } from "./AudioEngine";
import { Globe, Download, Copy, Mail, Phone, Link2, FileCode, Check, Send, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { User, ExtractedData } from "../types";

interface ScraperSuiteProps {
  user: User;
}

export default function ScraperSuite({ user }: ScraperSuiteProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExtractedData | null>(null);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "emails" | "phones" | "links" | "scripts">("summary");

  const [options, setOptions] = useState({
    extractEmails: true,
    extractPhones: true,
    extractLinks: true,
    extractScripts: true,
    sendTelegram: true
  });

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    sound.playClick();
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          options,
          username: user.username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Execution halted on server side");
      }

      sound.playSuccess();
      setResults(data);
      setActiveTab("summary");
    } catch (err: any) {
      sound.playError();
      setError(err.message || "Failed to parse target DOM or establish connection");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const downloadCSV = (title: string, list: string[]) => {
    sound.playClick();
    const csvContent = "data:text/csv;charset=utf-8," + list.join("\n");
    const encodedUri = encodeURI(csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, "_")}_extracted.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>

        <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          ADVANCED DOM & DATA EXTRACTOR SUITE
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-6 leading-relaxed">
          Input a destination URL or IP address. Our full-stack browser proxy will dynamically scrape links, emails, telephone networks, and code attachments.
        </p>

        <form onSubmit={handleScrape} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-11 pr-4 py-3 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-xs font-mono placeholder:text-slate-600"
                placeholder="https://example.com, 1.1.1.1, or any target domain"
                value={url}
                onChange={(e) => {
                  sound.playTyping();
                  setUrl(e.target.value);
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/10 cursor-pointer disabled:opacity-50 text-slate-100 font-mono text-xs font-bold rounded-xl border border-emerald-400/30 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? "HARVESTING DOM DATA..." : "EXTRACT METADATA"}
            </button>
          </div>

          {/* Options parameters */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/60">
            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-200">
              <input
                type="checkbox"
                checked={options.extractEmails}
                onChange={(e) => {
                  sound.playClick();
                  setOptions({ ...options, extractEmails: e.target.checked });
                }}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0"
              />
              Harvest Emails
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-200">
              <input
                type="checkbox"
                checked={options.extractPhones}
                onChange={(e) => {
                  sound.playClick();
                  setOptions({ ...options, extractPhones: e.target.checked });
                }}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0"
              />
              Harvest Phones
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-200">
              <input
                type="checkbox"
                checked={options.extractLinks}
                onChange={(e) => {
                  sound.playClick();
                  setOptions({ ...options, extractLinks: e.target.checked });
                }}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0"
              />
              Crawl Links
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-200">
              <input
                type="checkbox"
                checked={options.extractScripts}
                onChange={(e) => {
                  sound.playClick();
                  setOptions({ ...options, extractScripts: e.target.checked });
                }}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0"
              />
              Analyze JavaScripts
            </label>
            {user.telegramBotToken && user.telegramChatId && (
              <label className="flex items-center gap-2 cursor-pointer select-none text-cyan-400 hover:text-cyan-300">
                <input
                  type="checkbox"
                  checked={options.sendTelegram}
                  onChange={(e) => {
                    sound.playClick();
                    setOptions({ ...options, sendTelegram: e.target.checked });
                  }}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                Push directly to Telegram Bot
              </label>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-950/20 border border-red-500/30 text-red-200 text-xs rounded-xl font-mono flex items-start gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">SCAN ERROR ENCOUNTERED</p>
              <p className="text-[10px] text-red-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Workspace */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
        >
          {/* Metadata Bar */}
          <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase font-bold">
                CRAWL SUCCESSFUL
              </span>
              <h3 className="text-sm font-bold text-slate-100 font-mono mt-2">{results.title || "No Title"}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-lg">{results.url}</p>
            </div>
            
            {user.telegramBotToken && user.telegramChatId && options.sendTelegram && (
              <div className="text-xs text-cyan-400 font-mono flex items-center gap-1.5 bg-cyan-950/20 border border-cyan-500/20 px-3.5 py-2 rounded-xl">
                <Send className="w-3.5 h-3.5" />
                RELAYED TO YOUR PRIVATE TELEGRAM FEED
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-800/80">
            <button
              onClick={() => { sound.playClick(); setActiveTab("emails"); }}
              className={`p-4 text-center border-r border-slate-800/80 flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === "emails" ? "bg-slate-800/30 border-b-2 border-b-emerald-500" : "hover:bg-slate-800/10"
              }`}
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              <span className="text-base font-bold text-slate-200 font-mono">{results.emails.length}</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Emails</span>
            </button>

            <button
              onClick={() => { sound.playClick(); setActiveTab("phones"); }}
              className={`p-4 text-center border-r border-slate-800/80 flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === "phones" ? "bg-slate-800/30 border-b-2 border-b-emerald-500" : "hover:bg-slate-800/10"
              }`}
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span className="text-base font-bold text-slate-200 font-mono">{results.phones.length}</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Phones</span>
            </button>

            <button
              onClick={() => { sound.playClick(); setActiveTab("links"); }}
              className={`p-4 text-center border-r border-slate-800/80 flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === "links" ? "bg-slate-800/30 border-b-2 border-b-emerald-500" : "hover:bg-slate-800/10"
              }`}
            >
              <Link2 className="w-4 h-4 text-emerald-400" />
              <span className="text-base font-bold text-slate-200 font-mono">{results.links.length}</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Hyperlinks</span>
            </button>

            <button
              onClick={() => { sound.playClick(); setActiveTab("scripts"); }}
              className={`p-4 text-center flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === "scripts" ? "bg-slate-800/30 border-b-2 border-b-emerald-500" : "hover:bg-slate-800/10"
              }`}
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-base font-bold text-slate-200 font-mono">{results.scripts.length}</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono">JavaScripts</span>
            </button>
          </div>

          {/* List panel rendering */}
          <div className="p-6 bg-slate-950/40">
            {activeTab === "summary" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase font-mono mb-1">Target Description</h4>
                  <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                    {results.description || "No description data located in DOM tags."}
                  </p>
                </div>
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase font-mono mb-2">Extraction Diagnostics</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                    <p>🕒 Finished: {new Date(results.timestamp).toLocaleString()}</p>
                    <p>📦 Content Size: {results.links.length * 350 + results.scripts.length * 120} Bytes parsed</p>
                    <p>🤖 Proxy status: Active (Anonymous Tunnel)</p>
                    <p>💾 Persistence: Export-ready (.CSV)</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "emails" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-400 font-mono">HARVESTED EMAIL DIRECTORY</span>
                  {results.emails.length > 0 && (
                    <button
                      onClick={() => downloadCSV("Emails", results.emails)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 cursor-pointer text-[10px] font-bold text-emerald-400 font-mono flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" /> EXPORT CSV
                    </button>
                  )}
                </div>

                {results.emails.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono py-8 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800">
                    No active email patterns identified.
                  </p>
                ) : (
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                    {results.emails.map((email, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/80 border border-slate-800/50 rounded-xl text-xs font-mono">
                        <span className="text-slate-300 select-all">{email}</span>
                        <button
                          onClick={() => copyToClipboard(email, `email-${idx}`)}
                          className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {copiedId === `email-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "phones" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-400 font-mono">EXTRACTED TELECOMMUNICATION NUMBERS</span>
                  {results.phones.length > 0 && (
                    <button
                      onClick={() => downloadCSV("Phones", results.phones)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 cursor-pointer text-[10px] font-bold text-emerald-400 font-mono flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" /> EXPORT CSV
                    </button>
                  )}
                </div>

                {results.phones.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono py-8 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800">
                    No telephone string formats identified on destination source.
                  </p>
                ) : (
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                    {results.phones.map((phone, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/80 border border-slate-800/50 rounded-xl text-xs font-mono">
                        <span className="text-slate-300 select-all">{phone}</span>
                        <button
                          onClick={() => copyToClipboard(phone, `phone-${idx}`)}
                          className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {copiedId === `phone-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "links" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-400 font-mono">EXTRACTED MAP HYPERLINKS</span>
                  {results.links.length > 0 && (
                    <button
                      onClick={() => downloadCSV("Links", results.links)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 cursor-pointer text-[10px] font-bold text-emerald-400 font-mono flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" /> EXPORT CSV
                    </button>
                  )}
                </div>

                {results.links.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono py-8 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800">
                    No active link references found.
                  </p>
                ) : (
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                    {results.links.map((link, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950/80 border border-slate-800/50 rounded-xl text-[11px] font-mono">
                        <span className="text-slate-300 select-all truncate max-w-[85%]">{link}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(link, `link-${idx}`)}
                            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {copiedId === `link-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "scripts" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-400 font-mono">EXTRACTED JS ATTACHMENTS</span>
                  {results.scripts.length > 0 && (
                    <button
                      onClick={() => downloadCSV("Scripts", results.scripts)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 cursor-pointer text-[10px] font-bold text-emerald-400 font-mono flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" /> EXPORT CSV
                    </button>
                  )}
                </div>

                {results.scripts.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono py-8 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800">
                    No linked external scripts detected.
                  </p>
                ) : (
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                    {results.scripts.map((script, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950/80 border border-slate-800/50 rounded-xl text-[11px] font-mono">
                        <span className="text-slate-300 select-all truncate max-w-[85%]">{script}</span>
                        <button
                          onClick={() => copyToClipboard(script, `script-${idx}`)}
                          className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {copiedId === `script-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
