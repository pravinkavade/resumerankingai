import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import authRoutes from "./server/routes/authRoutes.js";
import jobRoutes from "./server/routes/jobRoutes.js";
import candidateRoutes from "./server/routes/candidateRoutes.js";
import matchRoutes from "./server/routes/matchRoutes.js";
import analyticsRoutes from "./server/routes/analyticsRoutes.js";
import { ai } from "./server/gemini.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === "production";

  // Body parsing middleware
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/jobs", jobRoutes);
  app.use("/api/candidates", candidateRoutes);
  app.use("/api/match", matchRoutes);
  app.use("/api/applications", matchRoutes);
  app.use("/api/analytics", analyticsRoutes);

  // Health and System Diagnostics
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "healthy",
      service: "TalentRank AI - Resume Screening & Candidate Ranking System",
      timestamp: new Date().toISOString(),
      geminiConfigured: !!ai,
      model: "gemini-3.8-flash",
    });
  });

  if (!isProd) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 TalentRank AI Server active on http://0.0.0.0:${PORT}`);
    console.log(`🤖 Gemini 3.8 Flash Engine: ${ai ? "Enabled (Live)" : "Heuristic Fallback Mode (Set GEMINI_API_KEY)"}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
