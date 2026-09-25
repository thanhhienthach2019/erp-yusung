const fs = require('fs');
const path = require('path');

const distHtmlPath = path.join(__dirname, 'dist', 'index.html');
const workerPath = path.join(__dirname, '..', 'cloudflare-worker.js');

if (!fs.existsSync(distHtmlPath)) {
  console.error('Error: frontend/dist/index.html not found!');
  process.exit(1);
}

// 1. Dedicated Mobile & Tablet Scanner App HTML
const scannerHtml = fs.readFileSync(distHtmlPath, 'utf8');

// 2. Web ERP HTML (Full Management & Data Entry System)
const webErpHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>YUSUNG ERP SYSTEM - Quản Trị & Nhập Liệu Sản Xuất</title>
  <link rel="icon" type="image/x-icon" href="https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico">
  <!-- FontAwesome & Html5-Qrcode at Top Level -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #erp-frame {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
      background: #ffffff;
    }
    #loader {
      position: fixed;
      inset: 0;
      background: #0b1329;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      color: #ffffff;
      transition: opacity 0.4s ease;
    }
    .spinner-ring {
      width: 48px;
      height: 48px;
      border: 3.5px solid rgba(56, 189, 248, 0.15);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 18px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-sub { font-size: 12px; color: #94a3b8; }

    /* Floating Switch to Mobile Scanner App Button */
    #btnGoScanner {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #0284c7, #10b981);
      color: #ffffff;
      padding: 11px 18px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 800;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 10px 25px -4px rgba(2, 132, 199, 0.6), 0 0 0 2px rgba(56, 189, 248, 0.3);
      z-index: 9999;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #btnGoScanner:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 14px 28px -4px rgba(2, 132, 199, 0.7);
    }
    #btnGoScanner:active { transform: scale(0.96); }

    /* Top-Level Camera Modal (Phục vụ khi cần scan nhanh trên giao diện Desktop) */
    #topCameraOverlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.90);
      backdrop-filter: blur(8px);
      z-index: 100000;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .scanner-modal-card {
      width: 100%;
      max-width: 440px;
      background: #1e293b;
      border-radius: 16px;
      border: 1px solid #334155;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
    }
    .scanner-modal-header {
      padding: 14px 18px;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #334155;
    }
    .scanner-header-title {
      font-size: 14px;
      font-weight: 800;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .scanner-close-btn {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
    }
    .scanner-body {
      position: relative;
      background: #000000;
      width: 100%;
      height: 320px;
      overflow: hidden;
    }
    #topQrReader { width: 100%; height: 100%; }
    #topQrReader video { width: 100% !important; height: 100% !important; object-fit: cover !important; }
    .scan-laser-line {
      position: absolute;
      left: 8%;
      right: 8%;
      height: 2px;
      background: #ef4444;
      box-shadow: 0 0 12px #ef4444, 0 0 4px #ef4444;
      animation: laserMove 2s infinite ease-in-out;
      pointer-events: none;
      z-index: 10;
    }
    @keyframes laserMove {
      0% { top: 15%; opacity: 0.3; }
      50% { top: 85%; opacity: 1; }
      100% { top: 15%; opacity: 0.3; }
    }
    .scanner-modal-footer {
      padding: 14px 18px;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #334155;
    }
    .scan-status-text {
      font-size: 12px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
    .btn-stop-camera {
      background: #ef4444;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  </style>
</head>
<body>
  <!-- Loading Screen -->
  <div id="loader">
    <div class="spinner-ring"></div>
    <div class="brand-title">
      <i class="fa-solid fa-cube text-primary" style="color: #38bdf8;"></i>
      <span>YUSUNG ERP SYSTEM</span>
    </div>
    <div class="brand-sub">Hệ Thống Quản Trị Doanh Nghiệp Trực Tuyến</div>
  </div>

  <!-- Main Web ERP Frame (Google Apps Script) -->
  <iframe
    id="erp-frame"
    src="https://script.google.com/macros/s/AKfycbz6_DifKwtYEkOMMCv_FqrTmXGMeBeREkigW891lxVSadepanEHjFe_d85DrbZxgK6o/exec"
    allow="camera; microphone; clipboard-read; clipboard-write; fullscreen"
    sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
  ></iframe>

  <!-- Quick Floating Action: Switch to Mobile Scanner App -->
  <a id="btnGoScanner" href="/scan" title="Chuyển sang Giao diện Quét Tem Barcode Chuyên Biệt cho Điện Thoại & Máy Tính Bảng">
    <i class="fa-solid fa-barcode"></i>
    <span>Mở Màn Hình Scan Mobile</span>
  </a>

  <!-- Top-Level Camera Scanner Overlay (cho desktop khi cần) -->
  <div id="topCameraOverlay">
    <div class="scanner-modal-card">
      <div class="scanner-modal-header">
        <div class="scanner-header-title">
          <i class="fa-solid fa-barcode"></i>
          CAMERA QUÉT MÃ VẠCH (YUSUNG)
        </div>
        <button class="scanner-close-btn" onclick="closeTopCameraScanner()" title="Đóng">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <div class="scanner-body">
        <div class="scan-laser-line"></div>
        <div id="topQrReader"></div>
      </div>

      <div class="scanner-modal-footer">
        <div class="scan-status-text">
          <span class="pulse-dot"></span>
          Đang quét camera liên tục...
        </div>
        <button class="btn-stop-camera" onclick="closeTopCameraScanner()">
          <i class="fa-solid fa-stop"></i> Tắt Camera
        </button>
      </div>
    </div>
  </div>

  <script>
    var frame = document.getElementById("erp-frame");
    var loader = document.getElementById("loader");
    var overlay = document.getElementById("topCameraOverlay");
    var topScanner = null;
    var lastScannedBarcode = "";
    var lastScannedTime = 0;

    // Fade out loader once frame loads
    frame.addEventListener("load", function() {
      if (loader) {
        loader.style.opacity = "0";
        setTimeout(function() { loader.style.display = "none"; }, 400);
      }
    });

    setTimeout(function() {
      if (loader && loader.style.display !== "none") {
        loader.style.opacity = "0";
        setTimeout(function() { loader.style.display = "none"; }, 400);
      }
    }, 4500);

    function playBeep() {
      try {
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(900, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } catch(e) {}
    }

    function openTopCameraScanner() {
      overlay.style.display = "flex";
      if (frame && frame.contentWindow) {
        try { frame.contentWindow.postMessage({ type: 'CAMERA_OPENED' }, '*'); } catch(e) {}
      }

      setTimeout(function() {
        if (!topScanner) {
          var formats = [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13
          ];
          topScanner = new Html5Qrcode("topQrReader", {
            formatsToSupport: formats,
            experimentalFeatures: { useBarCodeDetectorIfSupported: true },
            verbose: false
          });
        }

        var scanConfig = {
          fps: 15,
          qrbox: function(viewfinderWidth, viewfinderHeight) {
            var w = Math.min(Math.floor(viewfinderWidth * 0.90), 320);
            var h = Math.min(Math.floor(viewfinderHeight * 0.65), 200);
            return { width: Math.max(w, 200), height: Math.max(h, 140) };
          }
        };

        topScanner.start(
          { facingMode: "environment" },
          scanConfig,
          function(decodedText) {
            var now = Date.now();
            if (decodedText === lastScannedBarcode && (now - lastScannedTime) < 1800) return;
            lastScannedBarcode = decodedText;
            lastScannedTime = now;
            playBeep();
            if (frame && frame.contentWindow) {
              frame.contentWindow.postMessage({ type: 'BARCODE_SCANNED', barcode: decodedText }, '*');
            }
          },
          function(err) {}
        ).catch(function(err) {
          topScanner.start(
            { facingMode: "user" },
            scanConfig,
            function(decodedText) {
              var now = Date.now();
              if (decodedText === lastScannedBarcode && (now - lastScannedTime) < 1800) return;
              lastScannedBarcode = decodedText;
              lastScannedTime = now;
              playBeep();
              if (frame && frame.contentWindow) {
                frame.contentWindow.postMessage({ type: 'BARCODE_SCANNED', barcode: decodedText }, '*');
              }
            },
            function(e) {}
          ).catch(function(eFinal) {
            alert("Không thể mở Camera: " + (eFinal.message || eFinal));
            closeTopCameraScanner();
          });
        });
      }, 80);
    }

    function closeTopCameraScanner() {
      overlay.style.display = "none";
      if (frame && frame.contentWindow) {
        try { frame.contentWindow.postMessage({ type: 'CAMERA_CLOSED' }, '*'); } catch(e) {}
      }
      cleanUpHardwareTracks();
    }

    function cleanUpHardwareTracks() {
      try {
        var video = document.querySelector("#topQrReader video");
        if (video && video.srcObject) {
          var stream = video.srcObject;
          if (stream && typeof stream.getTracks === 'function') {
            stream.getTracks().forEach(function(t) { try { t.stop(); } catch(e) {} });
          }
          video.srcObject = null;
        }
      } catch(e) {}

      if (topScanner) {
        try {
          var state = typeof topScanner.getState === 'function' ? topScanner.getState() : 2;
          if (state === 2 || state === 3) {
            topScanner.stop().catch(function() {});
          }
          topScanner.clear();
        } catch(e) {}
        topScanner = null;
      }
    }

    window.addEventListener("message", function(event) {
      if (!event.data) return;
      if (event.data.type === "START_CAMERA" || event.data.type === "OPEN_CAMERA") {
        openTopCameraScanner();
      } else if (event.data.type === "STOP_CAMERA" || event.data.type === "CLOSE_CAMERA") {
        closeTopCameraScanner();
      }
    });
  </script>
</body>
</html>`;

// 3. Build Unified Cloudflare Worker Code
const workerCode = `// ========================================================
// YUSUNG ERP SYSTEM - CLOUDFLARE WORKER ROUTER
// Domain: https://erp.yusung.workers.dev
// Phục vụ song song:
//  1. Web ERP Nhập Liệu Toàn Hệ Thống: /
//  2. Ứng Dụng Quét Mã Vạch Riêng Mobile & Tablet: /scan (hoặc /scanner, hoặc scan.*)
// ========================================================

const GAS_BACKEND = "https://script.google.com/macros/s/AKfycbz6_DifKwtYEkOMMCv_FqrTmXGMeBeREkigW891lxVSadepanEHjFe_d85DrbZxgK6o/exec";

// 1. Giao diện Web ERP đầy đủ cho máy tính / nhập liệu
const WEB_ERP_HTML = ${JSON.stringify(webErpHtml)};

// 2. Giao diện Quét Tem Barcode chuyên biệt cho Mobile & Tablet
const SCANNER_HTML = ${JSON.stringify(scannerHtml)};

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

    // 3. MÀN HÌNH QUÉT BARCODE RIÊNG (Dành cho Mobile & Tablet):
    // Kích hoạt khi:
    //  - Truy cập đường dẫn: /scan hoặc /scanner
    //  - Hoặc nếu chạy trên tên miền riêng cho scan: scan.yusung.workers.dev
    const isScanRoute = url.pathname === "/scan" ||
                        url.pathname.startsWith("/scan/") ||
                        url.pathname === "/scanner" ||
                        url.hostname.startsWith("scan");

    if (isScanRoute) {
      return new Response(SCANNER_HTML, {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Permissions-Policy": "camera=*, microphone=*",
          "X-Content-Type-Options": "nosniff"
        }
      });
    }

    // 4. MẶC ĐỊNH (/): WEB ERP ĐẦY ĐỦ DÀNH CHO NHẬP LIỆU & QUẢN TRỊ
    return new Response(WEB_ERP_HTML, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "no-cache",
        "Permissions-Policy": "camera=*, microphone=*"
      }
    });
  }
};
`;

fs.writeFileSync(workerPath, workerCode, 'utf8');
console.log('Successfully generated unified cloudflare-worker.js! Size: ' + workerCode.length + ' bytes');
