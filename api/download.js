// api/download.js

const https = require("https");
const SECRET_TOKEN = process.env.POLAR_SECRET_TOKEN;
const GITHUB_RELEASE_BASE =
  "https://github.com/anakooo/polar-cdn/releases/latest/download/";

module.exports = async function handler(req, res) {
  const { token, file } = req.query;
  
  if (!token || token !== SECRET_TOKEN) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  if (!file || !file.endsWith(".jar")) {
    res.status(400).json({ error: "Invalid file" });
    return;
  }

  const githubUrl = GITHUB_RELEASE_BASE + encodeURIComponent(file);

  try {
    const response = await fetch(githubUrl, {
      redirect: "follow", 
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "File not found on GitHub" });
      return;
    }

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
