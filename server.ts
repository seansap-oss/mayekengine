import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { PredictiveEngine, WordEntry } from "./src/lib/predictive-engine";
import { prisma } from "./src/lib/prisma";

const mockData: WordEntry[] = [
  { id: "1", standardRoman: "paba", meiteiMayek: "ꯄꯥꯕ", englishTranslation: "to read", frequencyScore: 98 },
  { id: "2", standardRoman: "thaba", meiteiMayek: "ꯊꯥꯕ", englishTranslation: "to place", frequencyScore: 90 },
];

const engine = new PredictiveEngine(mockData);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mayek-admin-secret";

  type Lead = {
    id: number;
    name: string;
    phone: string;
    requirements: string;
    createdAt: string;
  };

  const leads: Lead[] = [];
  const apiKeys = [
    { key: "demo-key-123", owner: "Mayek Store", createdAt: new Date().toISOString(), usage: 0 },
  ];
  const usageCounts: Record<string, number> = {
    "/api/v1/predict": 0,
    "/api/v1/transliterate": 0,
    "/api/v1/translate": 0,
    "/api/v1/words/suggest": 0,
    "/api/v1/leads": 0,
    "/api/v1/ask": 0,
  };

  const englishToRomanMap: Record<string, string> = {
    hello: "nao",
    read: "paba",
    place: "thaba",
    girl: "nupi",
    house: "yum",
    food: "cha",
    water: "ima",
    friend: "khongchatpa",
    love: "thabak",
    story: "phajabi",
    work: "nao-tak",
    learn: "paba",
    speak: "pham",
    today: "adi",
    tomorrow: "machan",
    good: "nupi",
  };

  const translateEnglishToRoman = (text: string) => {
    const tokens = text.split(/(\s+|[.,!?;:\-()"'])/g);
    return tokens
      .map((token) => {
        if (!token.trim()) return token;
        if (/^\s+$/.test(token) || /^[.,!?;:\-()"']$/.test(token)) return token;

        const key = token.toLowerCase();
        const mapped = englishToRomanMap[key];
        if (mapped) return mapped;

        const normalized = key
          .replace(/ph/g, "f")
          .replace(/th/g, "th")
          .replace(/sh/g, "sh")
          .replace(/ch/g, "ch")
          .replace(/ng/g, "ng")
          .replace(/kh/g, "kh")
          .replace(/rr/g, "r")
          .replace(/ee/g, "i")
          .replace(/oo/g, "u")
          .replace(/ou/g, "u")
          .replace(/au/g, "o")
          .replace(/ow/g, "o")
          .replace(/qu/g, "k")
          .replace(/ck/g, "k")
          .replace(/y(?=[aeiou])/g, "y")
          .replace(/[^a-z]/g, "");

        return normalized || token;
      })
      .join("");
  };

  const recordApiUsage = (route: string) => {
    if (usageCounts[route] !== undefined) {
      usageCounts[route] += 1;
    }
  };

  const buildAdminHtml = () => {
    const leadsMarkup = leads
      .map(
        (lead) =>
          `<tr><td>${lead.id}</td><td>${lead.name}</td><td>${lead.phone}</td><td>${lead.requirements}</td><td>${lead.createdAt}</td></tr>`
      )
      .join("");

    const apiKeyMarkup = apiKeys
      .map(
        (key) =>
          `<tr><td>${key.key}</td><td>${key.owner}</td><td>${key.usage}</td><td>${key.createdAt}</td></tr>`
      )
      .join("");

    const metricsMarkup = Object.entries(usageCounts)
      .map(([route, count]) => `<tr><td>${route}</td><td>${count}</td></tr>`)
      .join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MayekEngine Admin</title>
  <style>body{font-family:system-ui, sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:24px}h1{margin-top:0}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{padding:10px;border:1px solid #334155;text-align:left}th{background:#1e293b}section{margin-top:24px;padding:16px;border:1px solid #334155;border-radius:16px;background:#111827}</style>
</head>
<body>
  <h1>MayekEngine Admin Panel</h1>
  <p>Live usage metrics, collected leads, and API key status.</p>
  <section>
    <h2>API Usage</h2>
    <table><thead><tr><th>Route</th><th>Count</th></tr></thead><tbody>${metricsMarkup}</tbody></table>
  </section>
  <section>
    <h2>Collected Leads</h2>
    <table><thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Requirements</th><th>Created At</th></tr></thead><tbody>${leadsMarkup}</tbody></table>
  </section>
  <section>
    <h2>API Keys</h2>
    <table><thead><tr><th>Key</th><th>Owner</th><th>Usage</th><th>Created At</th></tr></thead><tbody>${apiKeyMarkup}</tbody></table>
  </section>
</body>
</html>`;
  };

  const requireAdminAuth = (req: express.Request, res: express.Response) => {
    const password = String(req.query.password || req.headers["x-admin-password"] || "");
    return password === ADMIN_PASSWORD;
  };

  app.get("/api/v1/predict", (req, res) => {
    recordApiUsage("/api/v1/predict");
    const q = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 5;
    if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });
    
    const predictions = engine.predict(q, limit);
    res.json({ query: q, predictions });
  });

  app.post("/api/v1/transliterate", async (req, res) => {
    recordApiUsage("/api/v1/transliterate");
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text body" });
    
    const words = text.split(" ");
    const results = words.map((w: string) => {
        const pred = engine.predict(w, 1);
        return pred.length > 0 ? pred[0].standardRoman : w;
    });

    res.json({ original: text, standardized: results.join(" ") });
  });

  app.post("/api/v1/translate", async (req, res) => {
    recordApiUsage("/api/v1/translate");
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text body" });

    const translation = translateEnglishToRoman(String(text));
    res.json({ original: text, translation });
  });

  app.post("/api/v1/leads", async (req, res) => {
    recordApiUsage("/api/v1/leads");
    const { name, phone, requirements } = req.body;
    if (!name || !phone || !requirements) {
      return res.status(400).json({ error: "Missing lead information" });
    }
    const id = leads.length + 1;
    leads.push({ id, name, phone, requirements, createdAt: new Date().toISOString() });
    res.json({ status: "success", message: "Lead captured", leadId: id });
  });

  app.post("/api/v1/ask", async (req, res) => {
    recordApiUsage("/api/v1/ask");
    const { name, phone, requirements } = req.body;
    if (!name || !phone || !requirements) {
      return res.status(400).json({ error: "Missing ask AI payload" });
    }
    const id = leads.length + 1;
    leads.push({ id, name, phone, requirements, createdAt: new Date().toISOString() });
 
    const reply = `Thanks ${name}, we received your request and will prepare a custom quote for: ${requirements}. We will reach out to ${phone} shortly.`;
    res.json({ status: "success", reply });
  });

  app.get("/download-app", (req, res) => {
    const apkPath = path.resolve(process.cwd(), "mobile-ime", "example", "build", "app", "outputs", "flutter-apk", "app-debug.apk");
    if (fs.existsSync(apkPath)) {
      return res.download(apkPath, "MeiteiRoman-app-debug.apk");
    }
    res.status(404).send("APK not found. Build the mobile IME debug APK first.");
  });

  app.get("/api/v1/admin/metrics", (req, res) => {
    if (!requireAdminAuth(req, res)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({ usageCounts, leads, apiKeys });
  });

  app.get("/admin", (req, res) => {
    if (!requireAdminAuth(req, res)) {
      return res.send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Admin Login</title><style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}form{background:#111827;padding:24px;border-radius:18px;box-shadow:0 24px 80px rgba(15,23,42,.5)}input,button{width:100%;margin-top:12px;padding:12px;border-radius:12px;border:1px solid #334155;background:#0f172a;color:#e2e8f0}button{background:#0ea5e9;border:none;color:#fff;cursor:pointer}</style></head><body><form method="GET" action="/admin"><h1>Admin Login</h1><input type="password" name="password" placeholder="Admin Password" required/><button type="submit">Enter Admin</button></form></body></html>`);
    }
    res.send(buildAdminHtml());
  });

  app.post("/admin", (req, res) => {
    if (!requireAdminAuth(req, res)) {
      return res.status(401).send("Unauthorized");
    }
    res.send(buildAdminHtml());
  });

  app.post("/api/v1/words/suggest", async (req, res) => {
    recordApiUsage("/api/v1/words/suggest");
    const { standardRoman, meiteiMayek, englishTranslation } = req.body;
    if (!standardRoman || !meiteiMayek || !englishTranslation) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    try {
        await prisma.wordEntry.create({
            data: {
                standardRoman,
                meiteiMayek,
                englishTranslation,
                partOfSpeech: "Noun",
                verificationStatus: "Pending"
            }
        });
        res.json({ status: "success", message: "Suggestion submitted" });
    } catch (e) {
        res.status(500).json({ error: "Failed to submit" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
