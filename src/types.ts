export interface User {
  username: string;
  email: string;
  telegramBotToken: string;
  telegramChatId: string;
}

export interface AppMetadata {
  id: string;
  name: string;
  icon: string;
  desc: string;
  category: "utility" | "security" | "crypto" | "development";
}

export interface ExtractedData {
  title: string;
  description: string;
  url: string;
  emails: string[];
  phones: string[];
  links: string[];
  scripts: string[];
  timestamp: string;
}

export interface ObfuscatedScriptResult {
  originalLength: number;
  encryptedLength: number;
  encryptedCode: string;
  filename: string;
}

export interface ScanResult {
  port: number;
  status: "OPEN" | "CLOSED";
  service: string;
}
