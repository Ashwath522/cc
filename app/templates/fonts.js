const fs = require("fs");
const path = require("path");

const fontsDir = path.join(__dirname, "fonts");

function fontToBase64(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = {
    ".ttf": "font/truetype",
    ".otf": "font/opentype",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  }[ext] || "application/octet-stream";

  const fontBuffer = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${fontBuffer.toString("base64")}`;
}

const regularFont = fontToBase64(path.join(fontsDir, "woff/mr-eaves-xl-modern-regular.woff"));
const boldFont = fontToBase64(path.join(fontsDir, "woff/mr-eaves-xl-modern-bold.woff"));
const heavyFont = fontToBase64(path.join(fontsDir, "mr_eaves_xl_modern_heavy.ttf"));
const rupeeFont = fontToBase64(path.join(fontsDir, "rupee_foradian.ttf"));

// Create CSS dynamically with Base64-encoded fonts
const fontFaceCSS = `
  @font-face {
    font-family: "Mr Eaves XL Modern";
    font-style: normal;
    font-weight: 400;
    src: url("${regularFont}") format("woff");
  }

  @font-face {
    font-family: "Mr Eaves XL Modern Bold";
    font-style: normal;
    font-weight: 700;
    src: url("${boldFont}") format("woff");
  }

  @font-face {
    font-family: "Mr Eaves XL Modern Heavy";
    font-style: normal;
    font-weight: 900;
    src: url("${heavyFont}") format("truetype");
  }

  @font-face {
    font-family: "Rupee Foradian";
    font-style: normal;
    src: url("${rupeeFont}") format("truetype");
  }
`;

module.exports = { fontFaceCSS };
