const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const interBoldB64 = fs
  .readFileSync(path.resolve(__dirname, "../../../backend/inter-bold.woff2"))
  .toString("base64");
const interRegularB64 = fs
  .readFileSync(path.resolve(__dirname, "../../../backend/inter-regular.woff2"))
  .toString("base64");
const trophyPath = path.resolve(
  __dirname,
  "../../../backend/noun-world-cup-trophy-4696281.png",
);
const outputPath = path.resolve(
  __dirname,
  "../../../frontend/public/og-image.png",
);

async function generate() {
  // Pega as dimensões originais
  const meta = await sharp(trophyPath).metadata();

  // Corta o texto do rodapé (últimos ~12% da altura) e coloriza
  const trophyRaw = await sharp(trophyPath)
    .extract({
      left: 50,
      top: 0,
      width: meta.width - 100,
      height: Math.floor(meta.height * 0.85),
    })
    .resize(220, 220, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .greyscale()
    .linear(3, -180)
    .threshold(30)
    .png()
    .toBuffer();

  const yellowLayer = await sharp({
    create: {
      width: 220,
      height: 220,
      channels: 4,
      background: { r: 250, g: 204, b: 21, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  const trophyBuffer = await sharp(yellowLayer)
    .composite([
      {
        input: trophyRaw,
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  const trophyB64 = trophyBuffer.toString("base64");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 630">
    <defs>
      <style>
        @font-face {
          font-family: 'Inter';
          font-weight: 900;
          src: url('data:font/woff2;base64,${interBoldB64}') format('woff2');
        }
        @font-face {
          font-family: 'Inter';
          font-weight: 400;
          src: url('data:font/woff2;base64,${interRegularB64}') format('woff2');
        }
      </style>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#facc15" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#09090b" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <rect width="1200" height="630" fill="#09090b"/>
    <rect width="1200" height="630" fill="url(#glow)"/>

    <image href="data:image/png;base64,${trophyB64}" x="490" y="20" width="220" height="220"/>

    <text x="600" y="370" font-family="Inter, Arial, sans-serif" font-size="90" font-weight="900" fill="white" text-anchor="middle">Meu<tspan fill="#facc15">Álbum</tspan></text>
    <text x="600" y="430" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="400" fill="#71717a" text-anchor="middle" letter-spacing="10">COPA DO MUNDO 2026</text>
    <text x="600" y="490" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="400" fill="#a1a1aa" text-anchor="middle">980 figurinhas. 48 seleções. 1 álbum pra completar.</text>
  </svg>`;

  await sharp(Buffer.from(svg)).resize(1200, 630).png().toFile(outputPath);

  // Gera favicon
  const faviconPath = path.resolve(
    __dirname,
    "../../../frontend/public/favicon.png",
  );
  await sharp(trophyPath)
    .extract({
      left: 50,
      top: 0,
      width: meta.width - 100,
      height: Math.floor(meta.height * 0.85),
    })
    .resize(64, 64, {
      fit: "contain",
      background: { r: 9, g: 9, b: 11, alpha: 0 },
    })
    .greyscale()
    .linear(3, -180)
    .threshold(30)
    .png()
    .toBuffer()
    .then(async (rawFavicon) => {
      const yellowFavicon = await sharp({
        create: {
          width: 64,
          height: 64,
          channels: 4,
          background: { r: 250, g: 204, b: 21, alpha: 1 },
        },
      })
        .png()
        .toBuffer();

      await sharp(yellowFavicon)
        .composite([{ input: rawFavicon, blend: "dest-in" }])
        .png()
        .toFile(faviconPath);
    });

  console.log("✅ og-image.png gerado com sucesso!");
}

generate().catch(console.error);
