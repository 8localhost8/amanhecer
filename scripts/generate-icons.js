import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#072a49" />
      <stop offset="50%" stop-color="#0b416e" />
      <stop offset="85%" stop-color="#1e3a5f" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="65%" r="45%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="1" />
      <stop offset="40%" stop-color="#facc15" stop-opacity="0.85" />
      <stop offset="80%" stop-color="#eab308" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#eab308" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="mountainBack" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="goldCross" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#fef08a" />
    </linearGradient>
  </defs>

  <!-- Sky Background -->
  <rect width="512" height="512" rx="112" fill="url(#skyGrad)" />

  <!-- Sun Rays & Glow -->
  <circle cx="256" cy="310" r="190" fill="url(#sunGlow)" />
  
  <!-- Subtle Ray Beams -->
  <g opacity="0.4" stroke="#fef08a" stroke-width="3" stroke-linecap="round">
    <line x1="256" y1="310" x2="256" y2="80" />
    <line x1="256" y1="310" x2="120" y2="130" />
    <line x1="256" y1="310" x2="392" y2="130" />
    <line x1="256" y1="310" x2="60" y2="240" />
    <line x1="256" y1="310" x2="452" y2="240" />
  </g>

  <!-- Sun Disk -->
  <circle cx="256" cy="310" r="72" fill="#fef08a" />
  <circle cx="256" cy="310" r="64" fill="#fde047" />

  <!-- Distant Mountains -->
  <path d="M 0 430 L 140 330 L 260 410 L 400 310 L 512 390 L 512 512 L 0 512 Z" fill="url(#mountainBack)" opacity="0.9" />

  <!-- Bible / Book & Light Horizon at base -->
  <path d="M 96 460 C 180 430, 250 445, 256 450 C 262 445, 332 430, 416 460 L 416 480 C 332 455, 262 468, 256 472 C 250 468, 180 455, 96 480 Z" fill="#fde047" opacity="0.95" />

  <!-- Elegant Clean Cross centered with dawn glow -->
  <g filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))">
    <!-- Vertical beam -->
    <rect x="250" y="160" width="12" height="130" rx="3" fill="url(#goldCross)" />
    <!-- Horizontal beam -->
    <rect x="220" y="200" width="72" height="12" rx="3" fill="url(#goldCross)" />
  </g>
</svg>`;

// Helper function to create a minimal valid PNG with solid / gradient pixels
function createPng(width, height) {
  // We can write a PNG file using basic PNG chunks: IHDR, IDAT, IEND
  // For standard PWA icon preview, let's create a raw uncompressed PNG representation
  const buffer = Buffer.alloc(8 + 25 + (height * (1 + width * 4)) + 100);
  
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression deflate
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  
  // Generate scanlines RGBA
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type: None
    const ratioY = y / height;
    for (let x = 0; x < width; x++) {
      const ratioX = x / width;
      // Sky blue to deep gold dawn gradient
      const distFromSun = Math.sqrt(Math.pow(ratioX - 0.5, 2) + Math.pow(ratioY - 0.6, 2));
      let r, g, b;
      if (distFromSun < 0.15) {
        // Sun center
        r = 254; g = 240; b = 138;
      } else if (distFromSun < 0.35) {
        // Sun aura
        const aura = (0.35 - distFromSun) / 0.2;
        r = Math.min(255, Math.floor(14 + aura * 230));
        g = Math.min(255, Math.floor(65 + aura * 170));
        b = Math.min(255, Math.floor(110 + aura * 20));
      } else {
        // Deep dawn sky gradient
        r = Math.floor(7 + ratioY * 30);
        g = Math.floor(42 + ratioY * 60);
        b = Math.floor(73 + ratioY * 20);
      }
      
      // Simple cross drawing in center
      if (y >= height * 0.32 && y <= height * 0.58 && Math.abs(x - width * 0.5) <= width * 0.015) {
        r = 255; g = 255; b = 255;
      }
      if (y >= height * 0.40 && y <= height * 0.43 && Math.abs(x - width * 0.5) <= width * 0.08) {
        r = 255; g = 255; b = 255;
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = 255; // Alpha
    }
  }
  
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  
  const crcData = chunk.subarray(4, 8 + length);
  const crcVal = crc32(crcData);
  chunk.writeInt32BE(crcVal, 8 + length);
  return chunk;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) | 0;
}

const table = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  table[n] = c;
}

const iconsDir = path.resolve('public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent, 'utf-8');
fs.writeFileSync(path.resolve('public', 'favicon.svg'), svgContent, 'utf-8');
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), createPng(192, 192));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), createPng(512, 512));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), createPng(180, 180));
fs.writeFileSync(path.resolve('public', 'apple-touch-icon.png'), createPng(180, 180));
console.log('Icons generated successfully!');
