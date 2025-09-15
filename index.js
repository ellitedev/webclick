const { createServer } = require("http");
const { promises: fs } = require("fs");
const { parse } = require("url");

// Read files at startup
let errorFile, indexFile, cssFile, faviconFile;

const initializeFiles = async () => {
  try {
    errorFile = await fs.readFile("error.html");
    indexFile = await fs.readFile("index.html");
    cssFile = await fs.readFile("styles.css");
    faviconFile = await fs.readFile("favicon/favicon-32x32.png");
  } catch (err) {
    console.error("Error reading files:", err);
    process.exit(1);
  }
};

const htmlResponse = (res, content, statusCode = 503) => {
  res.writeHead(statusCode, {
    "Content-Type": "text/html",
  });
  res.end(content);
};

const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url);

  if (parsedUrl.pathname === "/styles.css") {
    res.writeHead(200, {
      "Content-Type": "text/css",
    });
    res.end(cssFile);
    return;
  }

  if (parsedUrl.pathname === "/favicon.ico") {
    res.writeHead(200, {
      "Content-Type": "image/x-icon",
    });
    res.end(faviconFile);
    return;
  }

  try {
    const healthCheckResp = await fetch("https://gotify.ellite.dev/health");

    if (!healthCheckResp.ok) {
      throw new Error("health check failed");
    }

    const healthCheck = await healthCheckResp.json();

    if (healthCheck.health === "green") {
      htmlResponse(res, indexFile, 200);
    } else {
      throw new Error(healthCheck.health);
    }
  } catch (err) {
    htmlResponse(res, errorFile);
  }
});

const PORT = 3000;

// Initialize files and start server
initializeFiles()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize server:", err);
    process.exit(1);
  });
