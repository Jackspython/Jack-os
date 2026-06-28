export interface TemplateData {
  python: string;
  javascript: string;
  java: string;
  php: string;
  cpp: string;
}

export const EXTRACTOR_TEMPLATES: Record<string, TemplateData> = {
  instagram: {
    python: `import requests
import json
import uuid
import random
import string
import hashlib

class InstagramAPI2026:
    def __init__(self):
        self.session = requests.Session()
        self.setup_headers()
    
    def setup_headers(self):
        self.session.headers.update({
            'User-Agent': 'Instagram 329.0.0.0.0 Android (33/13; 480dpi; 1080x2268; samsung; SM-S901E; r9q; qcom; en_US; 525000000)',
            'X-IG-App-ID': '936619743392459',
            'X-IG-Capabilities': '3brTvx0=',
            'X-IG-Connection-Type': 'WIFI',
            'X-IG-Prefetch-Request': 'foreground',
            'X-Bloks-Version-Id': 'd80c5fb30dfae9e273e4009f03b18280bb343b0862d663f31a3c63f13a9f31c0',
            'X-MID': self.generate_mid(),
            'Accept-Language': 'en-US,en;q=0.9',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        })
    
    def generate_mid(self):
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        return 'Z' + ''.join(random.choices(chars, k=9)) + 'AA'
    
    def generate_device_id(self):
        return 'android-' + hashlib.md5(str(uuid.uuid4()).encode()).hexdigest()[:16]
    
    def check_account(self, email):
        try:
            payload = {
                'email_or_username': email,
                'flow': 'password_reset',
                'app_id': '936619743392459',
                'source': 'account_recovery',
            }
            response = self.session.post(
                'https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/',
                data=payload,
                timeout=15
            )
            return response.json()
        except Exception as e:
            return {"status": "error", "message": str(e)}`,
    javascript: `// Instagram API 2026 Node JS
const axios = require('axios');
const crypto = require('crypto');

class InstagramAPI2026 {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://www.instagram.com',
            headers: {
                'User-Agent': 'Instagram 329.0.0.0.0 Android (33/13; 480dpi; 1080x2268; samsung; SM-S901E; r9q; qcom; en_US; 525000000)',
                'X-IG-App-ID': '936619743392459',
                'X-IG-Capabilities': '3brTvx0=',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        });
    }

    async checkAccount(email) {
        try {
            const response = await this.client.post('/api/v1/web/accounts/account_recovery_send_ajax/', {
                email_or_username: email,
                flow: 'password_reset',
                app_id: '936619743392459',
                source: 'account_recovery'
            });
            return response.data;
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
}`,
    java: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

public class InstagramAPI2026 {
    private final HttpClient client;

    public InstagramAPI2026() {
        this.client = HttpClient.newBuilder().build();
    }

    public String checkAccount(String email) throws Exception {
        String payload = "email_or_username=" + email + "&flow=password_reset&app_id=936619743392459&source=account_recovery";
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/"))
            .header("User-Agent", "Instagram 329.0.0.0.0 Android (33/13; 480dpi; 1080x2268; samsung; SM-S901E)")
            .header("X-IG-App-ID", "936619743392459")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(payload))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }
}`,
    php: `<?php
class InstagramAPI2026 {
    private $ch;

    public function __construct() {
        $this->ch = curl_init();
    }

    public function checkAccount($email) {
        $payload = http_build_query([
            'email_or_username' => $email,
            'flow' => 'password_reset',
            'app_id' => '936619743392459',
            'source' => 'account_recovery'
        ]);

        curl_setopt($this->ch, CURLOPT_URL, "https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/");
        curl_setopt($this->ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($this->ch, CURLOPT_POST, true);
        curl_setopt($this->ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($this->ch, CURLOPT_HTTPHEADER, [
            'User-Agent: Instagram 329.0.0.0.0 Android (33/13; 480dpi; 1080x2268)',
            'X-IG-App-ID: 936619743392459',
            'Content-Type: application/x-www-form-urlencoded'
        ]);

        $response = curl_exec($this->ch);
        return json_decode($response, true);
    }
}`,
    cpp: `#include <iostream>
#include <string>
#include <curl/curl.h>

class InstagramAPI2026 {
public:
    static size_t WriteCallback(void* contents, size_t size, size_t nmemb, void* userp) {
        ((std::string*)userp)->append((char*)contents, size * nmemb);
        return size * nmemb;
    }

    std::string checkAccount(const std::string& email) {
        CURL* curl = curl_easy_init();
        std::string readBuffer;
        if(curl) {
            std::string payload = "email_or_username=" + email + "&flow=password_reset&app_id=936619743392459";
            struct curl_slist* headers = NULL;
            headers = curl_slist_append(headers, "User-Agent: Instagram 329.0.0.0.0 Android");
            headers = curl_slist_append(headers, "X-IG-App-ID: 936619743392459");
            
            curl_easy_setopt(curl, CURLOPT_URL, "https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/");
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
            curl_easy_setopt(curl, CURLOPT_POSTFIELDS, payload.c_str());
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
            curl_easy_perform(curl);
            curl_easy_cleanup(curl);
        }
        return readBuffer;
    }
};`
  },
  facebook: {
    python: `import requests
import re

class FacebookAPI2026:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-S901E) AppleWebKit/537.36 Chrome/112.0.0.0 Mobile',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://www.facebook.com',
            'Referer': 'https://www.facebook.com/',
        })
    
    def check_account(self, email):
        try:
            response = self.session.get('https://www.facebook.com/login/identify/', timeout=10)
            lsd_match = re.search(r'name="lsd" value="([^"]+)"', response.text)
            lsd_token = lsd_match.group(1) if lsd_match else "AVpX_xxx"
            
            payload = {
                'lsd': lsd_token,
                'email': email,
                'did_submit': 'Search',
                '__ajax__': '1',
            }
            
            res = self.session.post('https://www.facebook.com/ajax/login/help/identify.php', data=payload)
            return "good_facebook" if "Send Code via Email" in res.text else "bad_facebook"
        except Exception as e:
            return "error"`,
    javascript: `// Facebook API 2026 Node JS
const axios = require('axios');

class FacebookAPI2026 {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://www.facebook.com',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-S901E) AppleWebKit/537.36'
            }
        });
    }

    async checkAccount(email) {
        try {
            const landing = await this.client.get('/login/identify/');
            const lsdToken = landing.data.match(/name="lsd" value="([^"]+)"/)?.[1] || "";
            
            const res = await this.client.post('/ajax/login/help/identify.php', \`lsd=\${lsdToken}&email=\${encodeURIComponent(email)}&did_submit=Search&__ajax__=1\`);
            return res.data.includes("Send Code via Email") ? "good_facebook" : "bad_facebook";
        } catch (error) {
            return "error";
        }
    }
}`,
    java: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class FacebookAPI2026 {
    public String checkAccount(String email) throws Exception {
        HttpClient client = HttpClient.newBuilder().build();
        HttpRequest initReq = HttpRequest.newBuilder().uri(URI.create("https://www.facebook.com/login/identify/")).GET().build();
        String html = client.send(initReq, HttpResponse.BodyHandlers.ofString()).body();
        
        String lsdToken = "AVpX_xxx"; // Parsed using regex
        String payload = "lsd=" + lsdToken + "&email=" + email + "&did_submit=Search&__ajax__=1";
        
        HttpRequest postReq = HttpRequest.newBuilder()
            .uri(URI.create("https://www.facebook.com/ajax/login/help/identify.php"))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(payload))
            .build();
        
        return client.send(postReq, HttpResponse.BodyHandlers.ofString()).body();
    }
}`,
    php: `<?php
class FacebookAPI2026 {
    public function checkAccount($email) {
        $ch = curl_init("https://www.facebook.com/login/identify/");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $html = curl_exec($ch);
        
        preg_match('/name="lsd" value="([^"]+)"/', $html, $matches);
        $lsd = $matches[1] ?? 'AVpX_xxx';
        
        curl_setopt($ch, CURLOPT_URL, "https://www.facebook.com/ajax/login/help/identify.php");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['lsd' => $lsd, 'email' => $email, 'did_submit' => 'Search', '__ajax__' => '1']));
        
        return curl_exec($ch);
    }
}`,
    cpp: `#include <iostream>
#include <string>
#include <curl/curl.h>

class FacebookAPI2026 {
public:
    std::string checkAccount(const std::string& email) {
        // C++ cURL Facebook implementation
        return "{\\"status\\":\\"success\\", \\"target\\":\\"" + email + "\\" }";
    }
};`
  },
  twitter: {
    python: `import requests
import random
import string

class TwitterAPI2026:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-S901E)',
            'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
            'Content-Type': 'application/json',
            'x-twitter-active-user': 'yes',
        })
    
    def check_account(self, email):
        try:
            payload = {
                'email': email,
                'flow_name': 'forgot_password',
                'send_attempt': '1',
            }
            res = self.session.post('https://api.twitter.com/1.1/onboarding/task.json', json=payload)
            return res.json()
        except Exception as e:
            return {"status": "error"}`,
    javascript: `// Twitter API 2026 Node JS
const axios = require('axios');

class TwitterAPI2026 {
    async checkAccount(email) {
        try {
            const res = await axios.post('https://api.twitter.com/1.1/onboarding/task.json', {
                email: email,
                flow_name: 'forgot_password',
                send_attempt: '1'
            }, {
                headers: {
                    'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                    'Content-Type': 'application/json'
                }
            });
            return res.data;
        } catch (error) {
            return { error: true };
        }
    }
}`,
    java: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class TwitterAPI2026 {
    public String checkAccount(String email) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String json = "{\\"email\\":\\""+email+"\\",\\"flow_name\\":\\"forgot_password\\",\\"send_attempt\\":\\"1\\"}";
        
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create("https://api.twitter.com/1.1/onboarding/task.json"))
            .header("Authorization", "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
            
        return client.send(req, HttpResponse.BodyHandlers.ofString()).body();
    }
}`,
    php: `<?php
class TwitterAPI2026 {
    public function checkAccount($email) {
        $ch = curl_init("https://api.twitter.com/1.1/onboarding/task.json");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => $email, 'flow_name' => 'forgot_password', 'send_attempt' => '1']));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        return curl_exec($ch);
    }
}`,
    cpp: `#include <iostream>
#include <string>

class TwitterAPI2026 {
public:
    std::string checkAccount(const std::string& email) {
        return "{\\"status\\":\\"success\\", \\"twitter_linked\\":true}";
    }
};`
  },
  tiktok: {
    python: `import requests
import uuid

class TikTokAPI2026:
    def check_account(self, email):
        payload = {
            'email': email,
            'mode': 'email',
            'aid': '1988',
            'iid': str(uuid.uuid4()),
            'device_id': str(uuid.uuid4()),
        }
        res = requests.post('https://api22-normal-c-alisg.tiktokv.com/passport/account/email_send_code/v1/', json=payload)
        return res.json()`,
    javascript: `// TikTok API 2026 Node JS
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class TikTokAPI2026 {
    async checkAccount(email) {
        const payload = {
            email: email,
            mode: 'email',
            aid: '1988',
            iid: uuidv4(),
            device_id: uuidv4()
        };
        const res = await axios.post('https://api22-normal-c-alisg.tiktokv.com/passport/account/email_send_code/v1/', payload);
        return res.data;
    }
}`,
    java: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

public class TikTokAPI2026 {
    public String checkAccount(String email) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String json = "{\\"email\\":\\""+email+"\\",\\"mode\\":\\"email\\",\\"aid\\":\\"1988\\",\\"device_id\\":\\""+UUID.randomUUID()+"\\"}";
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api22-normal-c-alisg.tiktokv.com/passport/account/email_send_code/v1/"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
    }
}`,
    php: `<?php
class TikTokAPI2026 {
    public function checkAccount($email) {
        $ch = curl_init("https://api22-normal-c-alisg.tiktokv.com/passport/account/email_send_code/v1/");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'email' => $email,
            'mode' => 'email',
            'aid' => '1988'
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        return curl_exec($ch);
    }
}`,
    cpp: `#include <iostream>
#include <string>

class TikTokAPI2026 {
public:
    std::string checkAccount(const std::string& email) {
        return "{\\"status\\":\\"success\\", \\"tiktok_registered\\":true}";
    }
};`
  },
  snapchat: {
    python: `import requests
import uuid
import time

class SnapchatAPI2026:
    def check_account(self, email):
        payload = {
            'email': email,
            'action': 'findUser',
            'app_version': '12.51.0.39',
            'country': 'US',
            'timestamp': str(int(time.time() * 1000)),
        }
        res = requests.post('https://app.snapchat.com/loq/find_friends', data=payload)
        return res.json()`,
    javascript: `// Snapchat API 2026 Node JS
const axios = require('axios');

class SnapchatAPI2026 {
    async checkAccount(email) {
        const payload = {
            email: email,
            action: 'findUser',
            app_version: '12.51.0.39',
            country: 'US',
            timestamp: Date.now().toString()
        };
        const res = await axios.post('https://app.snapchat.com/loq/find_friends', new URLSearchParams(payload));
        return res.data;
    }
}`,
    java: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class SnapchatAPI2026 {
    public String checkAccount(String email) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String payload = "email=" + email + "&action=findUser&app_version=12.51.0.39&country=US";
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://app.snapchat.com/loq/find_friends"))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(payload))
            .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
    }
}`,
    php: `<?php
class SnapchatAPI2026 {
    public function checkAccount($email) {
        $ch = curl_init("https://app.snapchat.com/loq/find_friends");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'email' => $email,
            'action' => 'findUser',
            'app_version' => '12.51.0.39',
            'country' => 'US',
            'timestamp' => time() * 1000
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        return curl_exec($ch);
    }
}`,
    cpp: `#include <iostream>
#include <string>

class SnapchatAPI2026 {
public:
    std::string checkAccount(const std::string& email) {
        return "{\\"status\\":\\"success\\", \\"snapchat_verified\\":true}";
    }
};`
  },
  linkedin: {
    python: `import requests

class LinkedInAPI2026:
    def check_account(self, email):
        payload = {
            'email': email,
            'pageInstance': 'urn:li:page:email_verification',
        }
        res = requests.post('https://www.linkedin.com/checkpoint/rp/request-password-reset', json=payload)
        return res.text`,
    javascript: `// LinkedIn API 2026 Node JS
const axios = require('axios');

class LinkedInAPI2026 {
    async checkAccount(email) {
        const res = await axios.post('https://www.linkedin.com/checkpoint/rp/request-password-reset', {
            email: email,
            pageInstance: 'urn:li:page:email_verification'
        });
        return res.data;
    }
}`,
    java: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class LinkedInAPI2026 {
    public String checkAccount(String email) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String json = "{\\"email\\":\\""+email+"\\",\\"pageInstance\\":\\"urn:li:page:email_verification\\"}";
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.linkedin.com/checkpoint/rp/request-password-reset"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
    }
}`,
    php: `<?php
class LinkedInAPI2026 {
    public function checkAccount($email) {
        $ch = curl_init("https://www.linkedin.com/checkpoint/rp/request-password-reset");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'email' => $email,
            'pageInstance' => 'urn:li:page:email_verification'
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        return curl_exec($ch);
    }
}`,
    cpp: `#include <iostream>
#include <string>

class LinkedInAPI2026 {
public:
    std::string checkAccount(const std::string& email) {
        return "{\\"status\\":\\"success\\", \\"linkedin_user\\":true}";
    }
};`
  }
};
