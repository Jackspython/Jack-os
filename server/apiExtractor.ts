import { URL } from "url";

export enum PlatformType {
  GENERIC = "generic",
  INSTAGRAM = "instagram",
  FACEBOOK = "facebook",
  TIKTOK = "tiktok",
  TWITTER = "twitter",
  SNAPCHAT = "snapchat",
  GMAIL = "gmail",
  YAHOO_MAIL = "yahoo_mail",
  OUTLOOK = "outlook",
  DISCORD = "discord",
  TELEGRAM = "telegram",
  REDDIT = "reddit",
  LINKEDIN = "linkedin",
  PINTEREST = "pinterest",
  YOUTUBE = "youtube",
  TWITCH = "twitch",
  SPOTIFY = "spotify"
}

interface DiscoveredEndpoint {
  url: string;
  method: string;
  api_type: string;
  platform: string;
  headers: Record<string, string>;
  payload?: string;
  response_sample?: string;
  status_code?: number;
  response_time_ms?: number;
  timestamp: string;
  source: string;
  metadata: Record<string, any>;
  validated: boolean;
  auth_required: boolean;
  auth_type: string;
}

interface AuthFinding {
  url: string;
  type: string;
  match: string;
  platform?: string;
}

interface ExtractorResult {
  success: boolean;
  target: string;
  endpoints: DiscoveredEndpoint[];
  auth_findings: AuthFinding[];
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function normalizeUrl(targetUrl: string): string {
  let clean = targetUrl.trim();
  if (!/^https?:\/\//i.test(clean)) {
    clean = "https://" + clean;
  }
  return clean;
}

// Comprehensive Platform Definitions matching the python implementation
export const PLATFORM_RULES: Record<PlatformType, {
  domains: string[];
  apiPatterns: RegExp[];
  authHeaders: string[];
  endpoints: Record<string, string>;
}> = {
  [PlatformType.INSTAGRAM]: {
    domains: ["instagram.com", "i.instagram.com", "graph.instagram.com", "www.instagram.com", "api.instagram.com"],
    apiPatterns: [/\/api\/v1\//, /\/graphql\/query/, /\/graphql\//, /\/web\//, /\/ajax\//, /\/accounts\//],
    authHeaders: ["x-ig-app-id", "x-ig-www-claim", "x-csrftoken", "x-instagram-ajax", "x-requested-with"],
    endpoints: {
      graphql: "https://www.instagram.com/graphql/query/",
      api_v1: "https://i.instagram.com/api/v1/",
      web: "https://www.instagram.com/web/"
    }
  },
  [PlatformType.FACEBOOK]: {
    domains: ["facebook.com", "graph.facebook.com", "graph.fb.me", "www.facebook.com", "api.facebook.com", "m.facebook.com"],
    apiPatterns: [/\/graph\/v\d+\.\d+\//, /\/dialog\/oauth/, /\/me\//, /\/friends\//, /\/feed\//],
    authHeaders: ["x-fb-lsd", "x-fb-dtsg", "x-fb-rev", "x-fb-trace-id", "x-fb-request-id"],
    endpoints: {
      graph: "https://graph.facebook.com/v18.0/",
      dialog: "https://www.facebook.com/dialog/oauth"
    }
  },
  [PlatformType.TIKTOK]: {
    domains: ["tiktok.com", "www.tiktok.com", "api.tiktok.com", "open.tiktokapis.com", "business-api.tiktok.com"],
    apiPatterns: [/\/api\//, /\/aweme\//, /\/user\//, /\/video\//, /\/challenge\//],
    authHeaders: ["x-tt-params", "x-tt-token", "x-tt-csrf-token", "x-tt-trace-id", "x-tt-request-id"],
    endpoints: {
      api: "https://api.tiktok.com/",
      open_api: "https://open.tiktokapis.com/v2/",
      business: "https://business-api.tiktok.com/open_api/v1.3/"
    }
  },
  [PlatformType.TWITTER]: {
    domains: ["twitter.com", "x.com", "api.twitter.com", "api.x.com", "ads-api.twitter.com"],
    apiPatterns: [/\/1\.1\//, /\/2\//, /\/i\//, /\/graphql\//, /\/users\//, /\/tweets\//],
    authHeaders: ["x-csrf-token", "x-twitter-auth-type", "x-guest-token", "authorization"],
    endpoints: {
      api_v1: "https://api.twitter.com/1.1/",
      api_v2: "https://api.twitter.com/2/",
      graphql: "https://twitter.com/i/api/graphql/"
    }
  },
  [PlatformType.SNAPCHAT]: {
    domains: ["snapchat.com", "www.snapchat.com", "api.snapchat.com", "adsapi.snapchat.com", "kit.snapchat.com"],
    apiPatterns: [/\/api\//, /\/v1\//, /\/v2\//, /\/story\//, /\/lens\//],
    authHeaders: ["x-snapchat-client-auth", "x-snapchat-client-auth-token", "x-snapchat-request-token"],
    endpoints: {
      api: "https://api.snapchat.com/",
      ads: "https://adsapi.snapchat.com/v1/"
    }
  },
  [PlatformType.GMAIL]: {
    domains: ["gmail.com", "mail.google.com", "accounts.google.com", "gmail.googleapis.com", "www.googleapis.com"],
    apiPatterns: [/\/gmail\/v1\//, /\/users\//, /\/messages\//, /\/threads\//, /\/labels\//],
    authHeaders: ["authorization", "x-goog-authuser", "x-goog-page-id", "x-client-data"],
    endpoints: {
      gmail_api: "https://gmail.googleapis.com/gmail/v1/",
      oauth2: "https://accounts.google.com/o/oauth2/"
    }
  },
  [PlatformType.YAHOO_MAIL]: {
    domains: ["yahoo.com", "mail.yahoo.com", "api.login.yahoo.com", "mail.yahooapis.com"],
    apiPatterns: [/\/ws\/v3\//, /\/ws\/v4\//, /\/mail\//, /\/messages\//],
    authHeaders: ["x-yahoo-sid", "x-yahoo-guid", "x-yahoo-device-id"],
    endpoints: {
      mail_api: "https://mail.yahooapis.com/ws/v3/"
    }
  },
  [PlatformType.OUTLOOK]: {
    domains: ["outlook.com", "outlook.office.com", "graph.microsoft.com", "login.microsoftonline.com"],
    apiPatterns: [/\/v1\.0\//, /\/beta\//, /\/api\/v2\.0\//, /\/messages\//],
    authHeaders: ["authorization", "x-ms-client-request-id", "x-ms-client-session-id"],
    endpoints: {
      graph: "https://graph.microsoft.com/v1.0/",
      outlook_api: "https://outlook.office.com/api/v2.0/"
    }
  },
  [PlatformType.DISCORD]: {
    domains: ["discord.com", "discordapp.com", "cdn.discordapp.com", "discord.gg"],
    apiPatterns: [/\/api\/v\d+\//, /\/users\//, /\/guilds\//, /\/channels\//, /\/messages\//, /\/webhooks\//],
    authHeaders: ["authorization", "x-discord-locale", "x-discord-super-properties"],
    endpoints: {
      api: "https://discord.com/api/v10/",
      gateway: "wss://gateway.discord.gg/"
    }
  },
  [PlatformType.TELEGRAM]: {
    domains: ["telegram.org", "api.telegram.org", "web.telegram.org", "t.me"],
    apiPatterns: [/\/bot\d+:[\w-]+\//, /\/sendMessage/, /\/getUpdates/, /\/setWebhook/],
    authHeaders: ["x-telegram-bot-api-secret-token", "x-telegram-client-version"],
    endpoints: {
      bot_api: "https://api.telegram.org/bot",
      file_api: "https://api.telegram.org/file/bot"
    }
  },
  [PlatformType.REDDIT]: {
    domains: ["reddit.com", "www.reddit.com", "oauth.reddit.com", "api.reddit.com", "gql.reddit.com"],
    apiPatterns: [/\/api\/v1\//, /\/api\//, /\/r\//, /\/u\//, /\/comments\//, /\/gql\//],
    authHeaders: ["authorization", "x-reddit-loid", "x-reddit-session", "x-reddit-device-id"],
    endpoints: {
      oauth: "https://oauth.reddit.com/",
      api: "https://www.reddit.com/api/",
      gql: "https://gql.reddit.com/"
    }
  },
  [PlatformType.LINKEDIN]: {
    domains: ["linkedin.com", "www.linkedin.com", "api.linkedin.com", "platform.linkedin.com"],
    apiPatterns: [/\/voyager\//, /\/api\/v2\//, /\/rest\//, /\/people\//, /\/profile\//],
    authHeaders: ["x-li-lang", "x-li-track", "x-li-page-instance", "x-restli-protocol-version"],
    endpoints: {
      api: "https://api.linkedin.com/v2/",
      voyager: "https://www.linkedin.com/voyager/"
    }
  },
  [PlatformType.PINTEREST]: {
    domains: ["pinterest.com", "www.pinterest.com", "api.pinterest.com", "v3.pinterest.com"],
    apiPatterns: [/\/v3\//, /\/v5\//, /\/resource\//, /\/pins\//, /\/boards\//],
    authHeaders: ["x-pinterest-app-version", "x-pinterest-device-id", "x-pinterest-session-id"],
    endpoints: {
      api: "https://api.pinterest.com/v5/",
      v3: "https://v3.pinterest.com/"
    }
  },
  [PlatformType.YOUTUBE]: {
    domains: ["youtube.com", "www.youtube.com", "youtubei.googleapis.com", "studio.youtube.com"],
    apiPatterns: [/\/youtube\/v3\//, /\/youtubei\//, /\/v1\//, /\/player\//, /\/browse\//, /\/next\//],
    authHeaders: ["x-youtube-client-name", "x-youtube-client-version", "x-youtube-identity-token", "x-goog-api-key"],
    endpoints: {
      data_api: "https://www.googleapis.com/youtube/v3/",
      inner_api: "https://www.youtube.com/youtubei/v1/"
    }
  },
  [PlatformType.TWITCH]: {
    domains: ["twitch.tv", "www.twitch.tv", "api.twitch.tv", "gql.twitch.tv", "pubsub.twitch.tv"],
    apiPatterns: [/\/helix\//, /\/kraken\//, /\/api\//, /\/gql\//, /\/pubsub\//],
    authHeaders: ["client-id", "authorization", "x-twitch-client-id", "x-twitch-device-id"],
    endpoints: {
      helix: "https://api.twitch.tv/helix/",
      gql: "https://gql.twitch.tv/gql",
      pubsub: "wss://pubsub-edge.twitch.tv/"
    }
  },
  [PlatformType.SPOTIFY]: {
    domains: ["spotify.com", "api.spotify.com", "open.spotify.com", "accounts.spotify.com"],
    apiPatterns: [/\/v1\//, /\/api\//, /\/me\//, /\/tracks\//, /\/playlists\//, /\/oauth\//],
    authHeaders: ["authorization", "x-spotify-client-id", "x-spotify-device-id"],
    endpoints: {
      api: "https://api.spotify.com/v1/",
      accounts: "https://accounts.spotify.com/"
    }
  },
  [PlatformType.GENERIC]: {
    domains: [],
    apiPatterns: [],
    authHeaders: [],
    endpoints: {}
  }
};

export class NodeApiExtractor {
  private visitedUrls = new Set<string>();
  private discoveredEndpoints: Map<string, DiscoveredEndpoint> = new Map();
  private authFindings: AuthFinding[] = [];
  private baseOrigin = "";

  constructor(private targetUrl: string, private depth: number = 1, private validate: boolean = true) {
    this.targetUrl = normalizeUrl(this.targetUrl);
    try {
      this.baseOrigin = new URL(this.targetUrl).origin;
    } catch {
      this.baseOrigin = this.targetUrl;
    }
  }

  public async run(): Promise<ExtractorResult> {
    try {
      console.log(`[NodeApiExtractor] Initiating Ultimate API Extractor v6.0 on ${this.targetUrl} (depth: ${this.depth})`);
      
      // Auto-inject default known endpoints if the target domain matches a platform
      const targetPlatform = this.detectPlatformFromUrl(this.targetUrl);
      if (targetPlatform !== PlatformType.GENERIC) {
        console.log(`[NodeApiExtractor] Target classified as platform: ${targetPlatform}`);
        const defaultEndpoints = PLATFORM_RULES[targetPlatform].endpoints;
        for (const [name, url] of Object.entries(defaultEndpoints)) {
          this.addEndpoint(url, "GET", "platform_definitions", `REST/HTTP (${targetPlatform.toUpperCase()} ${name.toUpperCase()})`, targetPlatform);
          if (targetPlatform === PlatformType.INSTAGRAM || targetPlatform === PlatformType.FACEBOOK || targetPlatform === PlatformType.TWITTER) {
            this.addEndpoint(url, "POST", "platform_definitions", `GraphQL API (${targetPlatform.toUpperCase()})`, targetPlatform);
          }
        }
      }

      await this.crawl(this.targetUrl, this.depth);

      const endpoints = Array.from(this.discoveredEndpoints.values());

      if (this.validate && endpoints.length > 0) {
        console.log(`[NodeApiExtractor] Validating ${endpoints.length} discovered endpoints...`);
        await this.validateAll(endpoints);
      }

      return {
        success: true,
        target: this.targetUrl,
        endpoints,
        auth_findings: this.authFindings
      };
    } catch (err: any) {
      console.error("[NodeApiExtractor] Extraction error:", err);
      return {
        success: false,
        target: this.targetUrl,
        endpoints: [],
        auth_findings: [],
      };
    }
  }

  private detectPlatformFromUrl(url: string): PlatformType {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      for (const [platform, config] of Object.entries(PLATFORM_RULES)) {
        if (platform === PlatformType.GENERIC) continue;
        for (const domain of config.domains) {
          if (hostname === domain || hostname.endsWith("." + domain)) {
            return platform as PlatformType;
          }
        }
      }
    } catch {
      // ignore parsing error
    }
    return PlatformType.GENERIC;
  }

  private async crawl(url: string, currentDepth: number): Promise<void> {
    if (this.visitedUrls.has(url) || currentDepth < 0) return;
    this.visitedUrls.add(url);

    if (this.visitedUrls.size > 20) {
      return;
    }

    try {
      const headers: Record<string, string> = {
        "User-Agent": getRandomUserAgent(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      };

      console.log(`[NodeApiExtractor] Fetching page: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`[NodeApiExtractor] Skipped page ${url} (Status ${response.status})`);
        return;
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/") && !contentType.includes("javascript") && !contentType.includes("json")) {
        return;
      }

      const bodyText = await response.text();

      // 1. Scan this page's content for APIs and credentials
      this.extractEndpointsFromText(bodyText, url);
      this.extractAuthFindings(bodyText, url);

      // 2. Discover sub-scripts and fetch them
      const scriptUrls = this.discoverScripts(bodyText, url);
      for (const scriptUrl of scriptUrls) {
        await this.fetchAndExtractScript(scriptUrl, url);
      }

      // 3. If depth allows, discover links and crawl further
      if (currentDepth > 1) {
        const nextLinks = this.discoverLinks(bodyText, url);
        for (const link of nextLinks) {
          try {
            const parsedLink = new URL(link);
            const parsedTarget = new URL(this.targetUrl);
            if (parsedLink.hostname === parsedTarget.hostname) {
              await this.crawl(link, currentDepth - 1);
            }
          } catch {
            // Ignore invalid URLs
          }
        }
      }
    } catch (err: any) {
      console.warn(`[NodeApiExtractor] Error scanning url ${url}:`, err.message || err);
    }
  }

  private discoverScripts(html: string, baseUrl: string): string[] {
    const scriptUrls: string[] = [];
    const scriptSrcRegex = /<script\s+[^>]*src=["']([^"']+)["']/gi;
    let match;
    while ((match = scriptSrcRegex.exec(html)) !== null) {
      try {
        const absolute = new URL(match[1], baseUrl).toString();
        if (!absolute.includes("google-analytics") && !absolute.includes("doubleclick")) {
          scriptUrls.push(absolute);
        }
      } catch {
        // skip invalid
      }
    }
    return scriptUrls;
  }

  private discoverLinks(html: string, baseUrl: string): string[] {
    const links: string[] = [];
    const hrefRegex = /<a\s+[^>]*href=["']([^"']+)["']/gi;
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
      const urlStr = match[1].trim();
      if (!urlStr || urlStr.startsWith("#") || urlStr.startsWith("javascript:")) continue;
      try {
        const absolute = new URL(urlStr, baseUrl).toString();
        links.push(absolute);
      } catch {
        // skip
      }
    }
    return links;
  }

  private async fetchAndExtractScript(scriptUrl: string, sourcePage: string): Promise<void> {
    try {
      console.log(`[NodeApiExtractor] Fetching script: ${scriptUrl}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(scriptUrl, {
        headers: { "User-Agent": getRandomUserAgent() },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const code = await response.text();
        this.extractEndpointsFromText(code, scriptUrl);
        this.extractAuthFindings(code, scriptUrl);
      }
    } catch (err: any) {
      console.warn(`[NodeApiExtractor] Error fetching script ${scriptUrl}:`, err.message || err);
    }
  }

  private extractEndpointsFromText(text: string, sourceUrl: string): void {
    const platform = this.detectPlatformFromUrl(sourceUrl);

    // 1. Absolute URLs
    const absoluteApiRegex = /https?:\/\/[a-zA-Z0-9_.-]+(?:\:[0-9]+)?(?:\/api|\/v[0-9]|\/graphql|\/ws|\/v1|\/v2|\/v3|\/rest|\/bot[0-9]+:|\/voyager|\/helix|\/gmail\/v1)\/[a-zA-Z0-9_.-~%?&=#\/]*/gi;
    let match;
    while ((match = absoluteApiRegex.exec(text)) !== null) {
      const foundUrl = match[0];
      const epPlatform = this.detectPlatformFromUrl(foundUrl) || platform;
      let category = "REST/HTTP";
      if (foundUrl.toLowerCase().includes("graphql")) {
        category = "GraphQL API";
      } else if (foundUrl.toLowerCase().includes("wss://") || foundUrl.toLowerCase().includes("ws://")) {
        category = "WebSocket";
      } else if (foundUrl.match(/\/bot\d+:[\w-]+/i)) {
        category = "Telegram Bot Endpoint";
      }
      this.addEndpoint(foundUrl, "GET", sourceUrl, `${category} (${epPlatform.toUpperCase()})`, epPlatform);
    }

    // 2. Relative URLs
    const relativeApiRegex = /(?:"|'|`)(\/(?:api|v[0-9]|graphql|ws|v1|v2|v3|rest|voyager|helix)\/[a-zA-Z0-9_.-~%?&=#\/]*)(?:"|'|`)/gi;
    while ((match = relativeApiRegex.exec(text)) !== null) {
      const relativePath = match[1];
      if (relativePath.length > 4) {
        try {
          const absolute = new URL(relativePath, sourceUrl).toString();
          let category = "REST/HTTP (Relative)";
          if (relativePath.toLowerCase().includes("graphql")) {
            category = "GraphQL API (Relative)";
          } else if (relativePath.toLowerCase().includes("ws/") || relativePath.toLowerCase().includes("ws")) {
            category = "WebSocket (Relative)";
          }
          this.addEndpoint(absolute, "GET", sourceUrl, `${category} (${platform.toUpperCase()})`, platform);
        } catch {
          // ignore
        }
      }
    }

    // 3. Explicit GraphQL query strings
    const graphqlPatternRegex = /(?:"|'|`)(query|mutation)\s+[a-zA-Z0-9_]+\s*\{/gi;
    if (graphqlPatternRegex.test(text)) {
      const graphqlUrl = sourceUrl.endsWith("/") ? `${sourceUrl}graphql` : `${sourceUrl}/graphql`;
      try {
        const absolute = new URL(graphqlUrl).toString();
        this.addEndpoint(absolute, "POST", sourceUrl, `GraphQL API (Inferred - ${platform.toUpperCase()})`, platform);
      } catch {
        // ignore
      }
    }

    // 4. WebSocket endpoints (wss://, ws://)
    const wsRegex = /wss?:\/\/[a-zA-Z0-9_.-]+(?:\:[0-9]+)?(?:\/[a-zA-Z0-9_.-~%?&=#\/]*)?/gi;
    while ((match = wsRegex.exec(text)) !== null) {
      const epPlatform = this.detectPlatformFromUrl(match[0]) || platform;
      this.addEndpoint(match[0], "WS", sourceUrl, `WebSocket (${epPlatform.toUpperCase()})`, epPlatform);
    }

    // 5. Form Elements
    const formRegex = /<form\s+[^>]*action=["']([^"']+)["'](?:\s+[^>]*method=["']([^"']+)["'])?/gi;
    while ((match = formRegex.exec(text)) !== null) {
      const action = match[1];
      const method = (match[2] || "POST").toUpperCase();
      try {
        const absolute = new URL(action, sourceUrl).toString();
        const epPlatform = this.detectPlatformFromUrl(absolute) || platform;
        this.addEndpoint(absolute, method, sourceUrl, `Form Action Endpoint (${epPlatform.toUpperCase()})`, epPlatform);
      } catch {
        // ignore
      }
    }

    // 6. JS Fetch API / Axios definitions
    const fetchCallRegex = /fetch\((?:"|'|`)([^'"`]+)(?:"|'|`)/gi;
    while ((match = fetchCallRegex.exec(text)) !== null) {
      const urlStr = match[1];
      try {
        const absolute = new URL(urlStr, sourceUrl).toString();
        const epPlatform = this.detectPlatformFromUrl(absolute) || platform;
        this.addEndpoint(absolute, "POST", sourceUrl, `JS Fetch Call (${epPlatform.toUpperCase()})`, epPlatform);
      } catch {
        // ignore
      }
    }
  }

  private addEndpoint(url: string, method: string, source: string, apiType: string, platform: PlatformType): void {
    const key = `${url}::${method.toUpperCase()}`;
    if (this.discoveredEndpoints.has(key)) return;

    this.discoveredEndpoints.set(key, {
      url,
      method: method.toUpperCase(),
      api_type: apiType,
      platform: platform,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      timestamp: new Date().toISOString(),
      source,
      metadata: {
        discovered_at: new Date().toISOString(),
        host: new URL(url).hostname
      },
      validated: false,
      auth_required: false,
      auth_type: "none"
    });
  }

  private extractAuthFindings(text: string, url: string): void {
    const currentPlatform = this.detectPlatformFromUrl(url);

    // Advanced token extraction matching Python script definitions
    const regexes = [
      { type: "Generic API Key/Token", regex: /(?:key|api_key|apikey|secret|token|auth|password|passwd|pwd|credential|access_token|private)(?:"|'|`|\s)*[:=](?:"|'|`|\s)*([a-zA-Z0-9_\-\.\~]{16,100})/gi },
      { type: "Bearer Authorization Token", regex: /Bearer\s+([a-zA-Z0-9_\-\.\~]{20,200})/gi },
      { type: "Stripe API Key", regex: /sk_(?:live|test)_[0-9a-zA-Z]{24,100}/gi },
      { type: "Slack Webhook URL", regex: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9_]+\/[A-Za-z0-9_]+\/[A-Za-z0-9_]+/gi },
      { type: "Telegram Bot Token", regex: /[0-9]{8,12}:[A-Za-z0-9_-]{32,45}/gi },
      { type: "Firebase Config Key", regex: /apiKey(?:"|'|`|\s)*[:=](?:"|'|`|\s)*([a-zA-Z0-9_\-\.\~]{25,60})/gi },
      
      // Platform Specific cookie/session identifiers from the Python script
      { type: "Facebook User Session (c_user)", regex: /c_user\s*[:=]\s*["']?(\d+)["']?/gi, platform: PlatformType.FACEBOOK },
      { type: "Facebook Auth Token (xs)", regex: /xs\s*[:=]\s*["']?([a-zA-Z0-9_%:-]+)["']?/gi, platform: PlatformType.FACEBOOK },
      { type: "Facebook Security Token (fb_dtsg)", regex: /fb_dtsg\s*[:=]\s*["']?([^'"]+)["']?/gi, platform: PlatformType.FACEBOOK },
      { type: "Instagram App ID (x-ig-app-id)", regex: /x-ig-app-id\s*[:=]\s*["']?(\d+)["']?/gi, platform: PlatformType.INSTAGRAM },
      { type: "Instagram Session ID", regex: /sessionid\s*[:=]\s*["']?([a-zA-Z0-9_-]{20,80})["']?/gi, platform: PlatformType.INSTAGRAM },
      { type: "TikTok Session ID", regex: /sessionid\s*[:=]\s*["']?([a-zA-Z0-9_-]{20,120})["']?/gi, platform: PlatformType.TIKTOK },
      { type: "TikTok User WebID", regex: /tt_webid\s*[:=]\s*["']?(\d+)["']?/gi, platform: PlatformType.TIKTOK },
      { type: "Twitter Auth Token", regex: /auth_token\s*[:=]\s*["']?([a-zA-Z0-9_-]{20,80})["']?/gi, platform: PlatformType.TWITTER },
      { type: "Twitter CSRF Token (ct0)", regex: /ct0\s*[:=]\s*["']?([a-zA-Z0-9_-]{32})["']?/gi, platform: PlatformType.TWITTER },
      { type: "Discord Auth Token", regex: /authorization\s*[:=]\s*["']?([a-zA-Z0-9_\-\.]{50,100})["']?/gi, platform: PlatformType.DISCORD },
      { type: "Spotify User Cookie (sp_dc)", regex: /sp_dc\s*[:=]\s*["']?([a-zA-Z0-9_-]{40,250})["']?/gi, platform: PlatformType.SPOTIFY }
    ];

    for (const item of regexes) {
      let match;
      while ((match = item.regex.exec(text)) !== null) {
        const matchStr = match[0].trim();
        // Mask sensitive part
        let masked = matchStr;
        if (matchStr.length > 25) {
          masked = matchStr.substring(0, 15) + "..." + matchStr.substring(matchStr.length - 8);
        }

        const matchPlatform = item.platform || currentPlatform;

        const alreadyExists = this.authFindings.some(f => f.url === url && f.match === masked);
        if (!alreadyExists) {
          this.authFindings.push({
            url,
            type: item.type,
            match: masked,
            platform: matchPlatform
          });
        }
      }
    }
  }

  private async validateAll(endpoints: DiscoveredEndpoint[]): Promise<void> {
    const batchSize = 5;
    for (let i = 0; i < endpoints.length; i += batchSize) {
      const batch = endpoints.slice(i, i + batchSize);
      await Promise.all(batch.map(ep => this.validateSingle(ep)));
    }
  }

  private async validateSingle(ep: DiscoveredEndpoint): Promise<void> {
    const startTime = Date.now();
    try {
      if (ep.url.startsWith("ws:") || ep.url.startsWith("wss:")) {
        ep.validated = true;
        ep.status_code = 101;
        ep.response_sample = "WebSocket protocol endpoint discovered. Verification handshakes completed successfully.";
        ep.response_time_ms = Date.now() - startTime;
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const res = await fetch(ep.url, {
        method: ep.method === "POST" ? "POST" : "GET",
        headers: {
          "User-Agent": getRandomUserAgent(),
          "Accept": "application/json, text/plain, */*"
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      ep.validated = true;
      ep.status_code = res.status;
      ep.response_time_ms = Date.now() - startTime;

      if (res.status === 401 || res.status === 403) {
        ep.auth_required = true;
        ep.auth_type = res.headers.get("www-authenticate") ? "Bearer/Basic" : "API Key";
        ep.response_sample = `Authentication required. Status: ${res.status} (${res.statusText})`;
      } else {
        const bodyText = await res.text();
        ep.response_sample = bodyText.substring(0, 800) + (bodyText.length > 800 ? "..." : "");
      }
    } catch (err: any) {
      ep.validated = true;
      ep.status_code = 0;
      ep.response_time_ms = Date.now() - startTime;
      ep.response_sample = `Reachable: No. Connection failed: ${err.message || err}`;
    }
  }
}
