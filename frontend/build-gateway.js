const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>YUSUNG ERP SYSTEM - Quản Trị Sản Xuất</title>
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
    .brand-badge {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    .brand-subtitle { font-size: 12px; color: #94a3b8; }

    /* Top-Level Camera Modal (Bypasses Google Iframe Permissions Block) */
    #topCameraOverlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(8px);
      z-index: 100000;
      display: none;
      flex-direction: column;
      align-items: center;
      justifyContent: center;
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
    #topQrReader {
      width: 100%;
      height: 100%;
    }
    #topQrReader video {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
    }
    /* Laser guide */
    .scan-laser-line {
      position: absolute;
      left: 10%;
      right: 10%;
      height: 2px;
      background: #ef4444;
      box-shadow: 0 0 10px #ef4444, 0 0 4px #ef4444;
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

    /* Floating Quick Camera Launcher */
    #quickCamTrigger {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 54px;
      height: 54px;
      border-radius: 27px;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.5), 0 0 0 3px rgba(56, 189, 248, 0.2);
      cursor: pointer;
      z-index: 9999;
      font-size: 20px;
      transition: transform 0.2s ease;
    }
    #quickCamTrigger:active { transform: scale(0.92); }
  </style>
</head>
<body>
  <!-- Loading Splash Screen -->
  <div id="loader">
    <div class="spinner-ring"></div>
    <div class="brand-title">
      <span class="brand-badge"></span>
      YUSUNG ERP SYSTEM
    </div>
    <div class="brand-subtitle">Đang kết nối hệ thống dữ liệu Google Apps Script...</div>
  </div>

  <!-- Main Google Apps Script Frame -->
  <iframe
    id="erp-frame"
    src=""
    allow="camera; microphone; clipboard-read; clipboard-write; fullscreen"
    sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
  ></iframe>

  <!-- Floating Quick Camera Button (Always accessible) -->
  <div id="quickCamTrigger" title="Mở Camera Quét Tem" onclick="openTopCameraScanner()">
    <i class="fa-solid fa-camera"></i>
  </div>

  <!-- Top-Level Camera Scanner Overlay -->
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
          Đang quét camera sau liên tục...
        </div>
        <button class="btn-stop-camera" onclick="closeTopCameraScanner()">
          <i class="fa-solid fa-stop"></i> Tắt Camera
        </button>
      </div>
    </div>
  </div>

  <script>
    var baseGasUrl = "https://script.google.com/macros/s/AKfycbz6_DifKwtYEkOMMCv_FqrTmXGMeBeREkigW891lxVSadepanEHjFe_d85DrbZxgK6o/exec";
    var frame = document.getElementById("erp-frame");
    var loader = document.getElementById("loader");
    var overlay = document.getElementById("topCameraOverlay");
    var topScanner = null;
    var lastScannedBarcode = "";
    var lastScannedTime = 0;

    // Load Apps Script Web App
    frame.src = baseGasUrl + (window.location.search || "");
    frame.onload = function() {
      if (loader) {
        loader.style.opacity = "0";
        setTimeout(function() { loader.style.display = "none"; }, 350);
      }
    };
    setTimeout(function() {
      if (loader && loader.style.display !== "none") {
        loader.style.opacity = "0";
        setTimeout(function() { loader.style.display = "none"; }, 350);
      }
    }, 6000);

    // Audio BEEP feedback when barcode is detected
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

    // Top-Level Camera Scanner (Direct Hardware Access - Bypasses Google Sandbox)
    function openTopCameraScanner() {
      overlay.style.display = "flex";

      // Thông báo cho Google Apps Script iframe biết camera đã bật
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
            if (decodedText === lastScannedBarcode && (now - lastScannedTime) < 1800) {
              return; // Anti-duplicate within 1.8s
            }
            lastScannedBarcode = decodedText;
            lastScannedTime = now;

            playBeep();

            // Dispatch scanned barcode to Google Apps Script ERP inside iframe
            if (frame && frame.contentWindow) {
              frame.contentWindow.postMessage({
                type: 'BARCODE_SCANNED',
                barcode: decodedText
              }, '*');
            }
          },
          function(err) {}
        ).catch(function(err) {
          console.warn("Lỗi camera sau, thử camera mặc định:", err);
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
            alert("Không thể mở Camera: " + (eFinal.message || eFinal) + ". Vui lòng kiểm tra quyền Camera trong cài đặt Chrome/Safari!");
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

    // Listen for messages from inside Google Apps Script iframe
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

fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent, 'utf8');
console.log('Successfully generated dist/index.html with Top-Level Camera Scanner Gateway!');
