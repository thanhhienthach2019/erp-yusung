const fs = require('fs');
const path = require('path');

const distHtmlPath = fs.existsSync(path.join(__dirname, 'frontend', 'dist', 'index.html'))
  ? path.join(__dirname, 'frontend', 'dist', 'index.html')
  : path.join(__dirname, 'frontend', 'scanner-app.html');
const scanWorkerPath = path.join(__dirname, 'cloudflare-worker-scan.js');

const html = fs.readFileSync(distHtmlPath, 'utf8');

const scanWorkerCode = `// ========================================================
// YUSUNG SCANNER - DEDICATED WORKER
// Domain: https://scan.yusung.workers.dev (hoặc https://scanner.yusung.workers.dev)
// ========================================================

const GAS_BACKEND = "https://script.google.com/macros/s/AKfycbz6_DifKwtYEkOMMCv_FqrTmXGMeBeREkigW891lxVSadepanEHjFe_d85DrbZxgK6o/exec";

const SCANNER_HTML = ${JSON.stringify(html)};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        }
      });
    }

    // 2. Proxy API requests to Google Apps Script
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      const targetUrl = GAS_BACKEND + url.search;
      const init = {
        method: request.method,
        headers: {
          "Accept": "application/json",
          "Content-Type": "text/plain;charset=utf-8"
        },
        redirect: "follow"
      };

      if (request.method === "POST" || request.method === "PUT") {
        init.body = await request.text();
      }

      try {
        const gasRes = await fetch(targetUrl, init);
        const data = await gasRes.text();
        return new Response(data, {
          status: gasRes.status,
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Cache-Control": "no-cache, no-store, must-revalidate"
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ status: false, message: "Lỗi proxy kết nối Google Apps Script: " + err.message }), {
          status: 502,
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }

    // 3. Serve Dedicated Scanner App directly at root /
    return new Response(SCANNER_HTML, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Permissions-Policy": "camera=*, microphone=*",
        "X-Content-Type-Options": "nosniff"
      }
    });
  }
};
`;

fs.writeFileSync(scanWorkerPath, scanWorkerCode, 'utf8');
console.log('Successfully generated cloudflare-worker-scan.js (' + scanWorkerCode.length + ' bytes)');
