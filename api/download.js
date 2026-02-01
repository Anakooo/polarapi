// api/download.js
// Hébergé sur Vercel — endpoint protégé par token
// URL d'utilisation : https://polar-api.vercel.app/api/download?token=VOTRE_TOKEN&file=PolarClient-1.8.9.jar

const https = require("https");

// Le token secret — à changer régulièrement
// Dans la production, utiliser une env var Vercel : process.env.POLAR_SECRET_TOKEN
const SECRET_TOKEN = process.env.POLAR_SECRET_TOKEN;

// URL de base vers les GitHub Releases du repo polar-cdn
const GITHUB_RELEASE_BASE =
  "https://github.com/anakooo/polar-cdn/releases/latest/download/";

module.exports = async function handler(req, res) {
  const { token, file } = req.query;

  // 1. Vérifie que le token est présent et correct
  if (!token || token !== SECRET_TOKEN) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // 2. Vérifie que le fichier demandé est un JAR (sécurité basique)
  if (!file || !file.endsWith(".jar")) {
    res.status(400).json({ error: "Invalid file" });
    return;
  }

  // 3. Proxy vers GitHub Release
  const githubUrl = GITHUB_RELEASE_BASE + encodeURIComponent(file);

  try {
    const response = await fetch(githubUrl, {
      redirect: "follow", // GitHub redirige vers releases.githubusercontent.com
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "File not found on GitHub" });
      return;
    }

    // 4. Stream le fichier directement vers le client
    res.setHeader("Content-Type", "application/java-archive");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file}"`
    );

    if (response.headers.get("content-length")) {
      res.setHeader("Content-Length", response.headers.get("content-length"));
    }

    response.body.pipe(res);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
