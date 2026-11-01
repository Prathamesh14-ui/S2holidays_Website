// Generates lightweight SVG illustrations used as clearly-labelled SAMPLE imagery
// until real, licensed destination photography is uploaded through the CMS.
// Usage: node scripts/generate-sample-art.mjs
import { writeFileSync, mkdirSync } from "node:fs";

const W = 1600, H = 1000;
const out = new URL("../public/sample/", import.meta.url);
mkdirSync(out, { recursive: true });

const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

function ridge(r, baseY, amp, step = 80) {
  let d = `M0 ${H} L0 ${baseY}`;
  for (let x = 0; x <= W + step; x += step) {
    const y = baseY - r() * amp + amp / 2;
    d += ` L${x} ${y.toFixed(0)}`;
  }
  return d + ` L${W} ${H} Z`;
}
function peaks(r, baseY, amp, n) {
  let d = `M0 ${H} L0 ${baseY}`;
  const w = W / n;
  for (let i = 0; i < n; i++) {
    const px = i * w + w / 2 + (r() - 0.5) * w * 0.4;
    const py = baseY - amp * (0.6 + r() * 0.4);
    d += ` L${px.toFixed(0)} ${py.toFixed(0)} L${((i + 1) * w).toFixed(0)} ${(baseY - r() * amp * 0.2).toFixed(0)}`;
  }
  return d + ` L${W} ${H} Z`;
}
const palm = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}">
  <path d="M0 0 C 10 -120 30 -220 20 -320 L 34 -320 C 46 -220 26 -120 14 0 Z"/>
  ${[-150, -110, -60, -20, 25, 70].map((a) => `<path transform="translate(27 -320) rotate(${a})" d="M0 0 C 60 -30 130 -10 170 30 C 120 5 60 0 0 8 Z"/>`).join("")}
</g>`;

function sky(id, top, bottom) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;
}
function label() {
  return `<g opacity="0.85"><rect x="${W - 300}" y="${H - 70}" width="270" height="44" rx="22" fill="#000" fill-opacity="0.35"/>
  <text x="${W - 165}" y="${H - 41}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" letter-spacing="3" fill="#fff">SAMPLE IMAGE</text></g>`;
}
function svg(body, defs) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}${label()}</svg>`;
}

const scenes = {
  mountains: (s, p) => {
    const r = rnd(s);
    return svg(
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>
       <circle cx="${1150 + r() * 200}" cy="260" r="80" fill="${p.sun}" opacity="0.9"/>
       <path d="${peaks(r, 620, 380, 5)}" fill="${p.far}"/>
       <path d="${peaks(r, 720, 300, 7)}" fill="${p.mid}"/>
       <path d="${ridge(r, 820, 90)}" fill="${p.near}"/>
       <path d="${ridge(r, 920, 60, 60)}" fill="${p.front}"/>`,
      sky("sky", p.top, p.bottom)
    );
  },
  beach: (s, p) => {
    const r = rnd(s);
    return svg(
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>
       <circle cx="${500 + r() * 600}" cy="430" r="110" fill="${p.sun}" opacity="0.95"/>
       <rect y="520" width="${W}" height="260" fill="url(#sea)"/>
       ${[560, 610, 670, 730].map((y, i) => `<path d="M0 ${y} Q 400 ${y - 10} 800 ${y} T ${W} ${y}" stroke="#fff" stroke-opacity="${0.15 + i * 0.05}" stroke-width="3" fill="none"/>`).join("")}
       <path d="M0 780 Q 500 720 1000 770 T ${W} 760 L ${W} ${H} L 0 ${H} Z" fill="${p.sand}"/>
       ${palm(1280, 900, 1.25, p.front)}${palm(1420, 960, 0.95, p.front)}`,
      sky("sky", p.top, p.bottom) + sky("sea", p.sea1, p.sea2)
    );
  },
  backwaters: (s, p) => {
    const r = rnd(s);
    return svg(
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>
       <path d="${ridge(r, 560, 50)}" fill="${p.far}"/>
       <rect y="600" width="${W}" height="400" fill="url(#sea)"/>
       ${[200, 380, 620, 900, 1150, 1400].map((x, i) => palm(x, 610, 0.6 + (i % 3) * 0.12, p.mid)).join("")}
       <path d="M520 760 L 980 760 L 930 800 L 570 800 Z" fill="${p.front}"/>
       <path d="M600 760 Q 750 690 900 760 Z" fill="${p.near}"/>
       <path d="M0 640 L ${W} 640" stroke="${p.far}" stroke-opacity="0.5" stroke-width="6"/>`,
      sky("sky", p.top, p.bottom) + sky("sea", p.sea1, p.sea2)
    );
  },
  desert: (s, p) => {
    const r = rnd(s);
    return svg(
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>
       <circle cx="${300 + r() * 300}" cy="330" r="120" fill="${p.sun}" opacity="0.9"/>
       <g fill="${p.far}"><rect x="980" y="380" width="380" height="360"/>
       ${[980, 1060, 1140, 1220, 1300].map((x) => `<rect x="${x}" y="350" width="40" height="40"/>`).join("")}
       <rect x="1120" y="250" width="100" height="140"/><path d="M1110 250 Q 1170 170 1230 250 Z"/></g>
       <path d="M0 700 Q 400 560 800 680 T ${W} 640 L ${W} ${H} L 0 ${H} Z" fill="${p.mid}"/>
       <path d="M0 820 Q 500 700 1000 820 T ${W} 790 L ${W} ${H} L 0 ${H} Z" fill="${p.near}"/>
       <path d="M0 920 Q 600 860 1200 930 T ${W} 900 L ${W} ${H} L 0 ${H} Z" fill="${p.front}"/>`,
      sky("sky", p.top, p.bottom)
    );
  },
  city: (s, p) => {
    const r = rnd(s);
    let b = "";
    for (let x = 0; x < W; x += 70 + r() * 50) {
      const h = 180 + r() * 380, w = 50 + r() * 50;
      b += `<rect x="${x.toFixed(0)}" y="${(760 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${r() > 0.5 ? p.far : p.mid}"/>`;
      for (let wy = 760 - h + 20; wy < 740; wy += 34) if (r() > 0.55) b += `<rect x="${(x + 12).toFixed(0)}" y="${wy.toFixed(0)}" width="10" height="14" fill="${p.sun}" opacity="0.7"/>`;
    }
    return svg(
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>
       <circle cx="1250" cy="230" r="70" fill="${p.sun}" opacity="0.8"/>
       <path d="M780 760 L 800 120 L 820 760 Z" fill="${p.near}"/>${b}
       <rect y="760" width="${W}" height="240" fill="url(#sea)"/>
       <path d="M0 860 Q 400 830 800 860 T ${W} 850" stroke="${p.sun}" stroke-opacity="0.4" stroke-width="4" fill="none"/>`,
      sky("sky", p.top, p.bottom) + sky("sea", p.sea1, p.sea2)
    );
  },
  temple: (s, p) => {
    const r = rnd(s);
    const tier = (x, y, w, n) => Array.from({ length: n }, (_, i) => {
      const ww = w * (1 - i * 0.16), yy = y - i * 70;
      return `<path d="M${x - ww / 2 - 30} ${yy} Q ${x} ${yy - 30} ${x + ww / 2 + 30} ${yy} L ${x + ww / 2} ${yy - 50} L ${x - ww / 2} ${yy - 50} Z"/>`;
    }).join("");
    return svg(
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>
       <circle cx="${350 + r() * 200}" cy="300" r="100" fill="${p.sun}" opacity="0.9"/>
       <path d="${ridge(r, 650, 120)}" fill="${p.far}"/>
       <g fill="${p.mid}">${tier(1100, 700, 380, 5)}<rect x="1060" y="300" width="80" height="400"/><path d="M1075 300 L 1100 160 L 1125 300 Z"/></g>
       <path d="${ridge(r, 820, 60)}" fill="${p.near}"/>${palm(200, 960, 1.1, p.front)}
       <path d="M0 920 L ${W} 900 L ${W} ${H} L 0 ${H} Z" fill="${p.front}"/>`,
      sky("sky", p.top, p.bottom)
    );
  },
  seafront: (s, p) => {
    const r = rnd(s);
    let b = "";
    for (let x = 0; x < W; x += 60 + r() * 40) {
      const h = 80 + r() * 200;
      b += `<rect x="${x.toFixed(0)}" y="${(560 - h).toFixed(0)}" width="${(46 + r() * 30).toFixed(0)}" height="${h.toFixed(0)}" fill="${p.far}"/>`;
    }
    return svg(
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>
       <circle cx="1300" cy="380" r="90" fill="${p.sun}" opacity="0.9"/>${b}
       <rect y="560" width="${W}" height="440" fill="url(#sea)"/>
       <path d="M0 640 Q 800 560 ${W} 700 L ${W} 740 Q 800 600 0 690 Z" fill="${p.near}"/>
       ${Array.from({ length: 22 }, (_, i) => `<circle cx="${40 + i * 75}" cy="${640 - Math.sin(i / 7) * 40}" r="5" fill="${p.sun}"/>`).join("")}`,
      sky("sky", p.top, p.bottom) + sky("sea", p.sea1, p.sea2)
    );
  },
  road: (s, p) => {
    const r = rnd(s);
    return svg(
      `<rect width="${W}" height="${H}" fill="url(#sky)"/>
       <circle cx="1200" cy="300" r="90" fill="${p.sun}" opacity="0.9"/>
       <path d="${ridge(r, 560, 160)}" fill="${p.far}"/>
       <path d="${ridge(r, 640, 80)}" fill="${p.mid}"/>
       <path d="M0 ${H} L 0 650 L ${W} 650 L ${W} ${H} Z" fill="${p.near}"/>
       <path d="M640 650 L 960 650 L 1500 ${H} L 100 ${H} Z" fill="${p.front}"/>
       ${[680, 740, 820, 920].map((y, i) => `<rect x="${795 - i * 4}" y="${y}" width="${10 + i * 8}" height="${18 + i * 14}" fill="${p.sun}" opacity="0.85"/>`).join("")}`,
      sky("sky", p.top, p.bottom)
    );
  },
};

const palettes = {
  dawn: { top: "#f7c59f", bottom: "#fde8d0", sun: "#fff4e0", far: "#8aa1b4", mid: "#5f7a91", near: "#3f5a6f", front: "#22384a", sea1: "#5fa8c8", sea2: "#1d5f86", sand: "#ecd3a6" },
  alpine: { top: "#9cc7e6", bottom: "#e8f3fb", sun: "#ffffff", far: "#c9d8e6", mid: "#7f9bb3", near: "#3f6a55", front: "#24443a", sea1: "#7cc", sea2: "#357", sand: "#eee" },
  tropic: { top: "#4fb3d9", bottom: "#c9eef7", sun: "#fff6c9", far: "#3d8f7b", mid: "#2b6e5e", near: "#7a4b2a", front: "#1e4a3a", sea1: "#3cc7d1", sea2: "#0b7a9a", sand: "#f1dcae" },
  sunset: { top: "#2d2a4a", bottom: "#f08a5d", sun: "#ffd27a", far: "#5b3a5e", mid: "#3a2a4a", near: "#2a1d36", front: "#171026", sea1: "#e0805f", sea2: "#3a2f55", sand: "#d9a46c" },
  desert: { top: "#f3b562", bottom: "#fde7c3", sun: "#fff3d6", far: "#b8673a", mid: "#e0a15e", near: "#c98745", front: "#a5652f", sea1: "#d99a5b", sea2: "#8a4f2a", sand: "#e9c48a" },
  dusk: { top: "#16324f", bottom: "#d9786a", sun: "#ffd89a", far: "#24405f", mid: "#1b2f47", near: "#0f1f33", front: "#0b1626", sea1: "#a35f62", sea2: "#13263d", sand: "#c79f7a" },
  lagoon: { top: "#e9a77a", bottom: "#fbe3c8", sun: "#fff1d6", far: "#4e7f69", mid: "#2f6b52", near: "#c5713f", front: "#5a2f1c", sea1: "#7fb7a6", sea2: "#2f6e6a", sand: "#e8cfa1" },
};

const files = {
  "hero": ["mountains", 7, "dusk"],
  "kashmir": ["mountains", 11, "alpine"],
  "himachal": ["mountains", 23, "dawn"],
  "ladakh": ["mountains", 37, "desert"],
  "switzerland": ["mountains", 41, "alpine"],
  "goa": ["beach", 5, "sunset"],
  "andaman": ["beach", 13, "tropic"],
  "maldives": ["beach", 29, "tropic"],
  "bali": ["temple", 17, "lagoon"],
  "kerala": ["backwaters", 19, "lagoon"],
  "rajasthan": ["desert", 3, "desert"],
  "dubai": ["city", 31, "desert"],
  "singapore": ["city", 43, "dusk"],
  "thailand": ["temple", 47, "sunset"],
  "mumbai": ["seafront", 53, "dusk"],
  "car-rental": ["road", 59, "dawn"],
  "tourist-guide": ["temple", 61, "dawn"],
  "blog-1": ["beach", 67, "dawn"],
  "blog-2": ["mountains", 71, "sunset"],
  "blog-3": ["desert", 73, "dusk"],
  "about": ["backwaters", 79, "dawn"],
};

for (const [name, [scene, seed, pal]] of Object.entries(files)) {
  writeFileSync(new URL(`${name}.svg`, out), scenes[scene](seed, palettes[pal]));
}
console.log(`Generated ${Object.keys(files).length} sample illustrations in public/sample/`);
