const fs = require('fs');
const path = require('path');

const distHtmlPath = path.join(__dirname, 'dist', 'index.html');
const workerPath = path.join(__dirname, '..', 'cloudflare-worker.js');

if (!fs.existsSync(distHtmlPath)) {
  console.error('Error: frontend/dist/index.html not found!');
  process.exit(1);
}

const html = fs.readFileSync(distHtmlPath, 'utf8');

const workerCode = `// ========================================================
// YUSUNG ERP SYSTEM - CLOUDFLARE WORKER GATEWAY
// Domain: https://erp.yusung.workers.dev
// Dedicated Mobile & Tablet Barcode Scanner Application
// ========================================================

const GAS_BACKEND = "https://script.google.com/macros/s/AKfycbz6_DifKwtYEkOMMCv_FqrTmXGMeBeREkigW891lxVSadepanEHjFe_d85DrbZxgK6o/exec";

// Pure Standalone HTML5/CSS3/JS Web Application
const APP_HTML = ${JSON.stringify(html)};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. CORS Preflight Support
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

    // 2. High-Speed API Proxy to Google Apps Script Backend
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

    // 3. Serve Dedicated Mobile & Tablet Barcode Scanner App directly at root
    // Permissions-Policy: camera=* gives 100% full hardware access to camera without iframe restrictions!
    return new Response(APP_HTML, {
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

fs.writeFileSync(workerPath, workerCode, 'utf8');
console.log('Successfully generated cloudflare-worker.js! Size: ' + workerCode.length + ' bytes');
