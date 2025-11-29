import http from "http";
import fs from "fs";
import path from "path";
import { WebSocketServer } from "ws";
import chokidar from "chokidar";

const PUBLIC_DIR = path.join(process.cwd(), "public");

// --- WebSocket reload server ---
const wss = new WebSocketServer({ noServer: true });

function broadcastReload() {
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send("reload");
    }
  }
}

// Simple MIME type map
const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const url = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(PUBLIC_DIR, url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      return res.end("Not found");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});


// Upgrade HTTP → WebSocket
server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, ws => {
    wss.emit("connection", ws, req);
  });
});

// --- Watch public folder for changes ---
chokidar.watch(PUBLIC_DIR).on("change", () => {
  console.log("Reload triggered");
  broadcastReload();
});

// --- Start server ---
server.listen(3000, () =>
  console.log("Dev server running at http://localhost:3000")
);
