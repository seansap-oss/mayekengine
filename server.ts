import express from "express";
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

  app.use(express.json());

  // API routes
  app.get("/api/v1/predict", (req, res) => {
    const q = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 5;
    if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });
    
    const predictions = engine.predict(q, limit);
    res.json({ query: q, predictions });
  });

  app.post("/api/v1/transliterate", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text body" });
    
    const words = text.split(" ");
    const results = words.map((w: string) => {
        const pred = engine.predict(w, 1);
        return pred.length > 0 ? pred[0].standardRoman : w;
    });

    res.json({ original: text, standardized: results.join(" ") });
  });

  app.post("/api/v1/words/suggest", async (req, res) => {
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
