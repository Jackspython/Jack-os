export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Check localStorage for any custom set API Server URL (e.g. from mobile configuration)
  const savedUrl = localStorage.getItem("jack_os_api_server_url");
  if (savedUrl) {
    return `${savedUrl.replace(/\/+$/, "")}${cleanPath}`;
  }

  const origin = window.location.origin;

  // Detect WebView context
  const isWebview =
    window.location.protocol === "file:" ||
    window.location.protocol === "capacitor:" ||
    window.location.protocol === "ionic:" ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    !origin.startsWith("http");

  if (isWebview) {
    // The deployed backend server domain
    const productionFallback = "https://ais-pre-wxfip43a7ukx4nv7cnckob-368257013395.asia-east1.run.app";
    return `${productionFallback}${cleanPath}`;
  }

  return `${origin}${cleanPath}`;
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  const response = await fetch(url, options);

  // Override response.json to make it extremely bulletproof against DOCTYPE HTML errors
  const originalJson = response.json.bind(response);
  response.json = async () => {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      const trimmed = text.trim();
      if (trimmed.startsWith("<") || trimmed.toLowerCase().includes("<!doctype")) {
        throw new Error(
          "API Server Connection Error: Received HTML instead of JSON. " +
          "This usually happens when your backend server.ts is offline, " +
          "or when the API URL points to a static host (like Netlify/Vercel/GitHub Pages) " +
          "without a running backend server. Ensure you have configured a valid live API Server URL."
        );
      }
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid API response format (expected JSON but received raw response): ${text.substring(0, 150)}...`);
      }
    }
    
    // Safely parse JSON
    try {
      return await originalJson();
    } catch (e: any) {
      // Fallback text check
      try {
        const text = await response.text();
        if (text.trim().startsWith("<") || text.toLowerCase().includes("<!doctype")) {
          throw new Error("API Server Connection Error: Received HTML template instead of a JSON response.");
        }
        return JSON.parse(text);
      } catch (innerErr) {
        throw new Error(`JSON Syntax Error: ${e.message || "failed to parse API response"}`);
      }
    }
  };

  return response;
}

