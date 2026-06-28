import React, { useState } from "react";
import { sound } from "./AudioEngine";
import { Code2, ShieldAlert, Copy, Check, Download, Layers, RefreshCw, Cpu } from "lucide-react";
import { motion } from "motion/react";
import { User } from "../types";

interface ScriptPackerProps {
  user: User;
}

interface EncryptedResult {
  originalLength: number;
  encryptedLength: number;
  encryptedCode: string;
  filename: string;
}

export default function ScriptPacker({ user }: ScriptPackerProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [targetLang, setTargetLang] = useState<"python" | "javascript" | "java" | "php" | "cpp">("python");
  const [obfuscationEngine, setObfuscationEngine] = useState<"base64" | "xor" | "hex">("base64");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EncryptedResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    sound.playClick();
    setLoading(true);
    setResult(null);

    await new Promise(r => setTimeout(r, 1000)); // Simulate packer compile delay

    let encryptedCode = "";
    let fileExt = "py";

    const cleanName = (name || "obfuscated_script").replace(/\.[^/.]+$/, "");

    if (targetLang === "python") {
      fileExt = "py";
      if (obfuscationEngine === "base64") {
        const b64 = btoa(unescape(encodeURIComponent(code)));
        encryptedCode = `# Obfuscated by Jack OS Hub Crypter v1.0 [Python Base64 Payload]
import base64
_payload = b"${b64}"
exec(base64.b64decode(_payload).decode('utf-8'))`;
      } else if (obfuscationEngine === "xor") {
        const key = "JACK_OS_KEY_99";
        const xorBytes: number[] = [];
        for (let i = 0; i < code.length; i++) {
          xorBytes.push(code.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        encryptedCode = `# Obfuscated by Jack OS Hub Crypter v1.0 [Python XOR Payload]
_key = "${key}"
_bytes = [${xorBytes.join(",")}]
_decrypted = "".join(chr(b ^ ord(_key[i % len(_key)])) for i, b in enumerate(_bytes))
exec(_decrypted)`;
      } else {
        const hex = Array.from(code).map((c: string) => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
        encryptedCode = `# Obfuscated by Jack OS Hub Crypter v1.0 [Python HEX Payload]
_hex_data = "${hex}"
_payload = bytes.fromhex(_hex_data).decode('utf-8')
exec(_payload)`;
      }
    } else if (targetLang === "javascript") {
      fileExt = "js";
      if (obfuscationEngine === "base64") {
        const b64 = btoa(unescape(encodeURIComponent(code)));
        encryptedCode = `/* Obfuscated by Jack OS Hub Crypter v1.0 [JS Base64 Payload] */
const _0x4d2a = "${b64}";
eval(typeof Buffer !== 'undefined' ? Buffer.from(_0x4d2a, 'base64').toString('utf-8') : atob(_0x4d2a));`;
      } else if (obfuscationEngine === "xor") {
        const key = "JACK_OS_CRYPTO_KEY_99";
        const xorBytes: number[] = [];
        for (let i = 0; i < code.length; i++) {
          xorBytes.push(code.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        encryptedCode = `/* Obfuscated by Jack OS Hub XOR Crypter v1.0 [JS XOR Payload] */
const _0xkey = "${key}";
const _0xbytes = [${xorBytes.join(",")}];
const _0xdecoded = _0xbytes.map((b, i) => String.fromCharCode(b ^ _0xkey.charCodeAt(i % _0xkey.length))).join("");
eval(_0xdecoded);`;
      } else {
        const hex = Array.from(code).map((c: string) => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
        encryptedCode = `/* Jack OS Advance JavaScript Protection [JS HEX Payload] */
const _hex = "${hex}";
let _code = "";
for (let i = 0; i < _hex.length; i += 2) { _code += String.fromCharCode(parseInt(_hex.substr(i, 2), 16)); }
new Function(_code)();`;
      }
    } else if (targetLang === "java") {
      fileExt = "java";
      const b64 = btoa(unescape(encodeURIComponent(code)));
      encryptedCode = `/**
 * Obfuscated by Jack OS Hub Crypter v1.0 [Java Reflection Payload]
 */
import java.util.Base64;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

public class ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)} {
    public static void main(String[] args) throws Exception {
        String _payload = "${b64}";
        byte[] decoded = Base64.getDecoder().decode(_payload);
        String code = new String(decoded, "UTF-8");
        
        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine engine = manager.getEngineByName("JavaScript");
        engine.eval(code);
    }
}`;
    } else if (targetLang === "php") {
      fileExt = "php";
      const b64 = btoa(unescape(encodeURIComponent(code)));
      encryptedCode = `<?php
/**
 * Obfuscated by Jack OS Hub Crypter v1.0 [PHP Base64 Payload]
 */
$_payload = "${b64}";
eval(base64_decode($_payload));
?>`;
    } else if (targetLang === "cpp") {
      fileExt = "cpp";
      const key = 42;
      const xorBytes: number[] = [];
      for (let i = 0; i < code.length; i++) {
        xorBytes.push(code.charCodeAt(i) ^ key);
      }
      encryptedCode = `/**
 * Obfuscated by Jack OS Hub Crypter v1.0 [C++ Char Payload]
 */
#include <iostream>
#include <string>

int main() {
    unsigned char obfuscated[] = { ${xorBytes.join(", ")}, 0 };
    int key = ${key};
    std::string decrypted = "";
    for(int i = 0; obfuscated[i] != 0; ++i) {
        decrypted += (char)(obfuscated[i] ^ key);
    }
    
    // Simulate runtime evaluation
    std::cout << "Executing memory segment..." << std::endl;
    std::cout << decrypted << std::endl;
    return 0;
}`;
    }

    setResult({
      originalLength: code.length,
      encryptedLength: encryptedCode.length,
      encryptedCode,
      filename: `${cleanName}_encrypted.${fileExt}`
    });
    setLoading(false);
    sound.playSuccess();
  };

  const copyResult = () => {
    if (!result) return;
    sound.playClick();
    navigator.clipboard.writeText(result.encryptedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadFile = () => {
    if (!result) return;
    sound.playClick();
    const blob = new Blob([result.encryptedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 font-mono">
      {/* Editor Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl"></div>

        <h2 className="text-lg font-bold text-slate-100 tracking-wide flex items-center gap-2 mb-2">
          <Code2 className="w-5 h-5 text-cyan-400" />
          SCRIPT CRYPTER & PACKER
        </h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Obfuscate source files dynamically. Supports generating packed, encrypted executables across all popular target language architectures.
        </p>

        <form onSubmit={handleEncrypt} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                File Alias Name
              </label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-xs placeholder:text-slate-700"
                placeholder="protected_script"
                value={name}
                onChange={(e) => {
                  sound.playTyping();
                  setName(e.target.value);
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Target Language Format
              </label>
              <select
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2.5 rounded-xl focus:border-cyan-500 outline-none text-xs"
                value={targetLang}
                onChange={(e) => {
                  sound.playClick();
                  setTargetLang(e.target.value as any);
                }}
              >
                <option value="python">Python Script (.py)</option>
                <option value="javascript">JavaScript Script (.js)</option>
                <option value="java">Java Class File (.java)</option>
                <option value="php">PHP Code Segment (.php)</option>
                <option value="cpp">C++ Source Class (.cpp)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Source Payload
            </label>
            <textarea
              required
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-4 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-xs placeholder:text-slate-700 leading-relaxed resize-none"
              placeholder={`print("Secure system activated!")\n# Enter or paste custom code payloads here`}
              value={code}
              onChange={(e) => {
                sound.playTyping();
                setCode(e.target.value);
              }}
            />
          </div>

          {/* Engine Selector */}
          {(targetLang === "python" || targetLang === "javascript") && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                Obfuscation Algorithm Engine
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["base64", "xor", "hex"] as const).map((eng) => (
                  <button
                    key={eng}
                    type="button"
                    onClick={() => { sound.playClick(); setObfuscationEngine(eng); }}
                    className={`py-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      obfuscationEngine === eng
                        ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {eng.toUpperCase()} ENG
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code}
            className="w-full bg-cyan-600 hover:bg-cyan-500 cursor-pointer disabled:opacity-50 text-slate-100 text-xs font-bold py-3 rounded-xl border border-cyan-400/30 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> ENCRYPTING BINARIES...
              </>
            ) : (
              "OBFUSCATE & BUILD SOURCE FILE"
            )}
          </button>
        </form>
      </div>

      {/* Output Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
        {result ? (
          <div className="h-full flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/20 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">OBFUSCATION COMPLETED</h3>
                  <p className="text-[10px] text-slate-400">Byte compilation generated successfully</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-[10px] text-slate-400 mb-4">
                <div>
                  <p className="uppercase text-[9px] text-slate-500">Source Size</p>
                  <p className="text-sm font-bold text-slate-300 mt-0.5">{result.originalLength} Chars</p>
                </div>
                <div>
                  <p className="uppercase text-[9px] text-slate-500">Obfuscated Size</p>
                  <p className="text-sm font-bold text-cyan-400 mt-0.5">{result.encryptedLength} Chars</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Encrypted Source Code Output ({result.filename})
                </label>
                <div className="relative">
                  <pre className="w-full max-h-56 overflow-y-auto bg-slate-950 text-[11px] text-emerald-400/90 p-4 rounded-xl border border-slate-850 leading-relaxed break-all select-all scrollbar-thin">
                    {result.encryptedCode}
                  </pre>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={copyResult}
                      className="p-1.5 bg-slate-900/95 border border-slate-850 rounded hover:bg-slate-800 transition-colors cursor-pointer text-slate-400 hover:text-slate-200"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={downloadFile}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 cursor-pointer text-slate-100 text-xs font-bold rounded-xl border border-emerald-400/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" /> DOWNLOAD SECURED CODE
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4 text-slate-600">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Awaiting crypter signal</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-relaxed">
              Once built, compatible structures wrapping base64 reflections or custom encryption algorithms will populate this terminal cleanly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
