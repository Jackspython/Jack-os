import React, { useState, useEffect } from "react";
import { sound } from "./AudioEngine";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Globe, 
  Terminal, 
  Zap, 
  Server, 
  Sliders, 
  Check, 
  RefreshCw,
  Cpu,
  Radio,
  Lock,
  Unlock,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";

interface AnonymitySuiteProps {
  user: User;
}

interface ProxyItem {
  ip: string;
  port: number;
  country: string;
  type: "SOCKS5" | "SOCKS4" | "HTTP";
  speed: string;
  anonymity: "ELITE" | "ANONYMOUS" | "TRANSPARENT";
  status: "ACTIVE" | "OFFLINE" | "TESTING";
}

const STATIC_PROXIES: ProxyItem[] = [
  { ip: "185.220.101.5", port: 9050, country: "Switzerland", type: "SOCKS5", speed: "42ms", anonymity: "ELITE", status: "ACTIVE" },
  { ip: "45.138.228.4", port: 1080, country: "Germany", type: "SOCKS5", speed: "65ms", anonymity: "ELITE", status: "ACTIVE" },
  { ip: "194.26.192.11", port: 8080, country: "Romania", type: "HTTP", speed: "110ms", anonymity: "ANONYMOUS", status: "ACTIVE" },
  { ip: "109.202.107.13", port: 9191, country: "Iceland", type: "SOCKS4", speed: "85ms", anonymity: "ELITE", status: "ACTIVE" },
  { ip: "185.242.6.2", port: 4145, country: "Netherlands", type: "SOCKS5", speed: "52ms", anonymity: "ELITE", status: "ACTIVE" },
  { ip: "80.66.81.2", port: 3128, country: "Sweden", type: "HTTP", speed: "140ms", anonymity: "ANONYMOUS", status: "ACTIVE" },
  { ip: "45.142.120.5", port: 9050, country: "Finland", type: "SOCKS5", speed: "74ms", anonymity: "ELITE", status: "ACTIVE" }
];

export default function AnonymitySuite({ user }: AnonymitySuiteProps) {
  const [proxies, setProxies] = useState<ProxyItem[]>(STATIC_PROXIES);
  const [vpnActive, setVpnActive] = useState(true);
  const [torActive, setTorActive] = useState(false);
  const [killSwitch, setKillSwitch] = useState(true);
  const [dnsLeakShield, setDnsLeakShield] = useState(true);
  const [activeProxy, setActiveProxy] = useState<ProxyItem | null>(STATIC_PROXIES[0]);
  const [currentIP, setCurrentIP] = useState("185.220.101.5");
  const [country, setCountry] = useState("Switzerland");
  const [refreshing, setRefreshing] = useState(false);
  const [testingIdx, setTestingIdx] = useState<number | null>(null);

  // System status simulation variables
  const [bandwidth, setBandwidth] = useState({ up: "14.2 MB/s", down: "45.8 MB/s" });
  const [hops, setHops] = useState<string[]>(["Your Client (IP: 192.168.1.55)", "Inbound Entry Gateway (Zurich, CH)", "Tor Middle Relay (Frankfurt, DE)", "Target Destination"]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (vpnActive || torActive) {
        const up = (Math.random() * 20 + 5).toFixed(1) + " MB/s";
        const down = (Math.random() * 50 + 15).toFixed(1) + " MB/s";
        setBandwidth({ up, down });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [vpnActive, torActive]);

  const handleToggleVpn = () => {
    sound.playClick();
    const nextState = !vpnActive;
    setVpnActive(nextState);
    if (!nextState && !torActive) {
      setCurrentIP("74.125.19.106"); // Real IP simulation
      setCountry("United States");
      setHops(["Your Client (Direct Connection)", "Target Destination"]);
    } else if (nextState) {
      setCurrentIP(activeProxy ? activeProxy.ip : "185.220.101.5");
      setCountry(activeProxy ? activeProxy.country : "Switzerland");
      setHops(["Your Client", "VPN Tunnel Entry (Zurich)", "VPN Tunnel Output", "Target Destination"]);
    }
  };

  const handleToggleTor = () => {
    sound.playClick();
    const nextState = !torActive;
    setTorActive(nextState);
    if (nextState) {
      setVpnActive(false); // Tor overrides standard VPN
      setCurrentIP("109.202.107.13");
      setCountry("Iceland");
      setHops([
        "Your Client (Encypted Node)",
        "German Guard Relay [82.165.11.4]",
        "Iceland Middle Relay [109.202.107.13]",
        "Exit Node (Iceland, IS) [Anonymous]"
      ]);
    } else {
      setVpnActive(true);
      setCurrentIP("185.220.101.5");
      setCountry("Switzerland");
      setHops(["Your Client (IP: 192.168.1.55)", "Inbound Entry Gateway (Zurich, CH)", "Tor Middle Relay (Frankfurt, DE)", "Target Destination"]);
    }
  };

  const testProxySpeed = async (idx: number) => {
    sound.playClick();
    setTestingIdx(idx);
    
    // update proxy state
    const updated = [...proxies];
    updated[idx].status = "TESTING";
    setProxies(updated);

    await new Promise(r => setTimeout(r, 1200));

    // Simulated results
    const latency = Math.floor(25 + Math.random() * 120);
    const randomStatus = Math.random() > 0.15 ? "ACTIVE" : "OFFLINE";

    const final = [...proxies];
    final[idx].speed = `${latency}ms`;
    final[idx].status = randomStatus as any;
    setProxies(final);
    setTestingIdx(null);

    if (randomStatus === "ACTIVE") {
      sound.playSuccess();
    } else {
      sound.playError();
    }
  };

  const selectProxy = (proxy: ProxyItem) => {
    if (proxy.status === "OFFLINE") return;
    sound.playClick();
    setActiveProxy(proxy);
    if (vpnActive) {
      setCurrentIP(proxy.ip);
      setCountry(proxy.country);
      setHops([
        "Your Client Tunnel Node",
        `Proxy Gateway [${proxy.ip}]`,
        `Masked Interface Node (${proxy.country})`,
        "Target Server"
      ]);
    }
  };

  const refreshProxies = async () => {
    sound.playClick();
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const shuffled = [...STATIC_PROXIES].map(p => ({
      ...p,
      speed: Math.floor(30 + Math.random() * 140) + "ms",
      status: "ACTIVE" as const
    }));
    setProxies(shuffled);
    setRefreshing(false);
    sound.playSuccess();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Visual Header Stats Bar */}
      <div className="xl:col-span-12 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-6 items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-bold text-slate-200">Kali Live Security Console:</span>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
            <span className="text-slate-500">VPN:</span>
            <span className={vpnActive ? "text-emerald-400 font-bold" : "text-slate-500 font-bold"}>
              {vpnActive ? "TUN0_ACTIVE" : "DISABLED"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
            <span className="text-slate-500">TOR HOPS:</span>
            <span className={torActive ? "text-cyan-400 font-bold" : "text-slate-500 font-bold"}>
              {torActive ? "3 RELAYS ( Icelandic exit )" : "INACTIVE"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
            <span className="text-slate-500">ENCRYPTION:</span>
            <span className="text-emerald-400 font-bold">CHA-CHA-20 TLS1.3</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
            <span className="text-slate-500">KILL-SWITCH:</span>
            <span className={killSwitch ? "text-emerald-400 font-bold" : "text-red-500 font-bold"}>
              {killSwitch ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>

      {/* Connection & Hops Map (Left Panel) */}
      <div className="xl:col-span-4 space-y-6">
        {/* Toggle panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden font-mono">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            INTERFACE ROUTER
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-200">Kali Secure Tunnel (VPN)</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Encrypts web traffic and hides DNS packets</p>
              </div>
              <button
                onClick={handleToggleVpn}
                className={`w-12 h-6.5 rounded-full transition-colors cursor-pointer relative flex items-center ${vpnActive ? "bg-emerald-600" : "bg-slate-800"}`}
              >
                <div className={`w-5.5 h-5.5 bg-white rounded-full transition-transform absolute ${vpnActive ? "right-1" : "left-1"}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-200">Tor Multi-Hop Routing</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Bounces packets across three isolated volunteer relays</p>
              </div>
              <button
                onClick={handleToggleTor}
                className={`w-12 h-6.5 rounded-full transition-colors cursor-pointer relative flex items-center ${torActive ? "bg-emerald-600" : "bg-slate-800"}`}
              >
                <div className={`w-5.5 h-5.5 bg-white rounded-full transition-transform absolute ${torActive ? "right-1" : "left-1"}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-200">Active Kill-Switch Shield</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Blocks non-encrypted sockets if connection drops</p>
              </div>
              <button
                onClick={() => { sound.playClick(); setKillSwitch(!killSwitch); }}
                className={`w-12 h-6.5 rounded-full transition-colors cursor-pointer relative flex items-center ${killSwitch ? "bg-emerald-600" : "bg-slate-800"}`}
              >
                <div className={`w-5.5 h-5.5 bg-white rounded-full transition-transform absolute ${killSwitch ? "right-1" : "left-1"}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-200">DNS Leak Guard</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Route domain lookups directly via Switzerland</p>
              </div>
              <button
                onClick={() => { sound.playClick(); setDnsLeakShield(!dnsLeakShield); }}
                className={`w-12 h-6.5 rounded-full transition-colors cursor-pointer relative flex items-center ${dnsLeakShield ? "bg-emerald-600" : "bg-slate-800"}`}
              >
                <div className={`w-5.5 h-5.5 bg-white rounded-full transition-transform absolute ${dnsLeakShield ? "right-1" : "left-1"}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic connection hops */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            SECURE HOP CHANNELS
          </h3>

          <div className="space-y-4">
            {hops.map((hop, idx) => (
              <div key={idx} className="flex gap-3 relative">
                {idx < hops.length - 1 && (
                  <div className="absolute left-3.5 top-7 bottom-0 w-[1px] bg-dashed border-l border-cyan-500/30"></div>
                )}
                <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 border text-[11px] font-bold ${
                  idx === hops.length - 1 
                    ? "bg-cyan-950 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]" 
                    : "bg-slate-950 border-slate-800 text-slate-500"
                }`}>
                  {idx + 1}
                </div>
                <div className="pt-1.5 text-xs">
                  <p className="font-bold text-slate-300">{hop}</p>
                  <p className="text-[10px] text-slate-500">Packet security: {idx === 0 ? "RAW" : "SECURED (TLS 1.3)"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safe Proxies Table (Right Panel) */}
      <div className="xl:col-span-8 flex flex-col space-y-4">
        {/* IP Map & Bandwidth Status Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl relative overflow-hidden flex flex-col justify-between h-28">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Masked IP Address</p>
            <p className="text-xl font-bold text-cyan-400 mt-1">{currentIP}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Location: {country}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl relative overflow-hidden flex flex-col justify-between h-28">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Upload Speed</p>
            <p className="text-xl font-bold text-slate-300 mt-1">{bandwidth.up}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span>Tun0 compression: active</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl relative overflow-hidden flex flex-col justify-between h-28">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Download Speed</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{bandwidth.down}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure VPN Interface active</span>
            </div>
          </div>
        </div>

        {/* Free Proxies Harvester */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col flex-1 overflow-hidden font-mono">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                FREE HIGH-SPEED PROXY HARVESTER (2026 UPDATE)
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Select any proxy connection from the registry below to tunnel server connections</p>
            </div>

            <button
              onClick={refreshProxies}
              disabled={refreshing}
              className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 disabled:opacity-50 text-cyan-400 border border-cyan-500/20 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              SWEEP LIST
            </button>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto bg-slate-950/80 border border-slate-850 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-[10px] text-slate-500 bg-slate-950 font-bold">
                  <th className="p-3.5">TARGET IP:PORT</th>
                  <th className="p-3.5">COUNTRY</th>
                  <th className="p-3.5">PROTOCOL</th>
                  <th className="p-3.5">PING SPEED</th>
                  <th className="p-3.5">ANONYMITY</th>
                  <th className="p-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {proxies.map((p, idx) => {
                  const isSelected = activeProxy?.ip === p.ip;
                  return (
                    <tr 
                      key={p.ip} 
                      onClick={() => selectProxy(p)}
                      className={`border-b border-slate-900 text-xs font-mono transition-colors cursor-pointer ${
                        isSelected 
                          ? "bg-cyan-950/15 text-cyan-300" 
                          : p.status === "OFFLINE"
                            ? "opacity-50 text-slate-600 bg-slate-950/10 cursor-not-allowed"
                            : "text-slate-300 hover:bg-slate-900/40"
                      }`}
                    >
                      <td className="p-3.5 font-bold">
                        {p.ip}:{p.port}
                      </td>
                      <td className="p-3.5 text-slate-400">{p.country}</td>
                      <td className="p-3.5">
                        <span className="bg-slate-900 border border-slate-800 text-[10px] px-1.5 py-0.5 rounded text-slate-400 font-semibold font-mono">
                          {p.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-emerald-400 font-bold">{p.speed}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold ${p.anonymity === "ELITE" ? "text-cyan-400" : "text-amber-400"}`}>
                          {p.anonymity}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => testProxySpeed(idx)}
                          disabled={p.status === "TESTING"}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          {p.status === "TESTING" ? "PINGING..." : "TEST PING"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
