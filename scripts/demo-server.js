#!/usr/bin/env node
/**
 * Lightweight static server for the Sienna demo page.
 * Serves files from the repository root with index fallback to demo/index.html.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 4173);
const rootDir = process.cwd();
const demoIndex = path.join(rootDir, "demo", "index.html");

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".map": "application/json"
};

function toFilePath(requestUrl) {
    const { pathname } = url.parse(requestUrl);
    if (!pathname || pathname === "/") {
        return demoIndex;
    }

    const normalized = path.normalize(decodeURIComponent(pathname));
    const sanitized = normalized.replace(/^(\.\.[/\\])+/, "");

    if (sanitized === "/" || sanitized === "") {
        return demoIndex;
    }

    return path.join(rootDir, sanitized);
}

function sendFile(res, filePath) {
    fs.readFile(filePath, (readErr, data) => {
        if (readErr) {
            if (filePath !== demoIndex) {
                sendNotFound(res);
                return;
            }

            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("500 Internal Server Error");
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
}

function sendNotFound(res) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
}

const server = http.createServer((req, res) => {
    if (!req.url) {
        sendNotFound(res);
        return;
    }

    const filePath = toFilePath(req.url);
    fs.stat(filePath, (statErr, stats) => {
        if (statErr) {
            if (filePath !== demoIndex) {
                sendNotFound(res);
                return;
            }
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Demo index not found. Run npm run build first.");
            return;
        }

        if (stats.isDirectory()) {
            sendFile(res, path.join(filePath, "index.html"));
            return;
        }

        sendFile(res, filePath);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`\nSienna demo available at http://${HOST}:${PORT}/`);
    console.log("Press Ctrl+C to stop the server.");
});
