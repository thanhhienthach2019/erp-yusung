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
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #0b1329;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      color: #ffffff;
      transition: opacity 0.4s ease, visibility 0.4s ease;
    }
    .spinner-ring {
      width: 52px;
      height: 52px;
      border: 3.5px solid rgba(56, 189, 248, 0.15);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .brand-title {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #ffffff;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-badge {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    .brand-subtitle {
      font-size: 12.5px;
      color: #94a3b8;
      font-weight: 500;
    }
    .fast-bar {
      margin-top: 24px;
      width: 220px;
      height: 3px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
      position: relative;
    }
    .fast-bar::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 40%;
      background: #38bdf8;
      border-radius: 2px;
      animation: loadingBar 1.2s infinite ease-in-out;
    }
    @keyframes loadingBar {
      0% { left: -40%; width: 40%; }
      50% { left: 40%; width: 60%; }
      100% { left: 100%; width: 40%; }
    }
  </style>
</head>
<body>
  <div id="loader">
    <div class="spinner-ring"></div>
    <div class="brand-title">
      <span class="brand-badge"></span>
      YUSUNG ERP SYSTEM
    </div>
    <div class="brand-subtitle">Đang tải hệ thống dữ liệu Google Apps Script...</div>
    <div class="fast-bar"></div>
  </div>

  <iframe
    id="erp-frame"
    src=""
    allow="camera; microphone; clipboard-read; clipboard-write; fullscreen"
    sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
  ></iframe>

  <script>
    (function() {
      var baseGasUrl = "https://script.google.com/macros/s/AKfycbz6_DifKwtYEkOMMCv_FqrTmXGMeBeREkigW891lxVSadepanEHjFe_d85DrbZxgK6o/exec";
      var currentSearch = window.location.search || "";
      var targetUrl = baseGasUrl + currentSearch;

      var frame = document.getElementById("erp-frame");
      var loader = document.getElementById("loader");

      frame.src = targetUrl;

      frame.onload = function() {
        if (loader) {
          loader.style.opacity = "0";
          setTimeout(function() {
            loader.style.display = "none";
          }, 400);
        }
      };

      // Fallback: hide loader after 7s even if iframe onload is quiet
      setTimeout(function() {
        if (loader && loader.style.display !== "none") {
          loader.style.opacity = "0";
          setTimeout(function() {
            loader.style.display = "none";
          }, 400);
        }
      }, 7000);
    })();
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent, 'utf8');
console.log('Successfully generated dist/index.html for Google Apps Script Gateway!');
