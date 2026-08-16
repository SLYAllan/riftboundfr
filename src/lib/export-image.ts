import { DOMAIN_COLORS, DOMAIN_LABELS_FR, DOMAIN_ICONS } from "@/lib/domains";

export interface ExportCardEntry {
  cardId: string;
  name: string;
  imageUrl: string | null;
  energy?: number | null;
  quantity: number;
}

const CARD_W = 105;
const CARD_H = 147;
const GAP = 5;
const PAD = 24;
const LEFT_W = 190;
const GRID_COLS = 8;
const BG = "#1a1a2e";
const BG_PANEL = "#12121e";
const TEXT = "#e2e0dc";
const MUTED = "#8b8680";
const ACCENT = "#a78bfa";
const GOLD = "#d4a843";

async function loadImg(url: string): Promise<HTMLImageElement> {
  const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error("Proxy fetch failed");
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("Failed to load image"));
    };
    img.src = blobUrl;
  });
}

async function loadLocalImg(path: string): Promise<HTMLImageElement> {
  const res = await fetch(path);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("Failed to load image"));
    };
    img.src = blobUrl;
  });
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number, y: number, w: number, h: number,
  name: string, qty: number,
) {
  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, 4);
  ctx.clip();

  if (img) {
    ctx.drawImage(img, x, y, w, h);
  } else {
    ctx.fillStyle = "#2a2a3e";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = MUTED;
    ctx.font = "9px system-ui, sans-serif";
    const words = name.split(" ");
    let ly = y + h / 2 - (words.length * 10) / 2;
    for (const word of words) {
      ctx.fillText(word, x + w / 2 - ctx.measureText(word).width / 2, ly + 9);
      ly += 10;
    }
  }
  ctx.restore();

  if (qty > 1) {
    const badge = `x${qty}`;
    ctx.font = "bold 11px system-ui, sans-serif";
    const bw = ctx.measureText(badge).width + 8;
    const bx = x + w - bw - 2;
    const by = y + h - 16;
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    drawRoundedRect(ctx, bx, by, bw, 14, 3);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(badge, bx + 4, by + 11);
  }
}

export async function generateDeckImage(params: {
  title: string;
  legend: ExportCardEntry | null;
  champion: ExportCardEntry | undefined;
  main: ExportCardEntry[];
  rune: ExportCardEntry[];
  battlefield: ExportCardEntry[];
  side: ExportCardEntry[];
  legendDomains: string[];
}): Promise<Blob | null> {
  const { title, legend, champion, main, rune, battlefield, side, legendDomains } = params;

  const mainSorted = [...main]
    .filter((e) => e.cardId !== champion?.cardId)
    .sort((a, b) => (a.energy ?? 99) - (b.energy ?? 99) || a.name.localeCompare(b.name));

  const mainCards = champion ? [champion, ...mainSorted] : mainSorted;
  const mainRows = Math.ceil(mainCards.length / GRID_COLS);
  const sideRows = side.length > 0 ? Math.ceil(side.length / GRID_COLS) : 0;

  const gridW = GRID_COLS * (CARD_W + GAP) - GAP;
  const totalW = PAD + LEFT_W + 16 + gridW + PAD;

  const gridAreaH = mainRows * (CARD_H + GAP) - GAP;
  const sideAreaH = sideRows > 0 ? 28 + sideRows * (CARD_H + GAP) : 0;
  const legendH = (LEFT_W - 8) * 1.4;
  const runeH = rune.length > 0 ? 24 : 0;
  const bfItemH = (LEFT_W - 16) * 0.6 + 4;
  const leftMinH = legend ? legendH + 8 + runeH + battlefield.length * bfItemH + 16 : 100;
  const rightH = gridAreaH + sideAreaH + 16;
  const contentH = Math.max(leftMinH, rightH);
  const totalH = PAD + 40 + 16 + contentH + 32;

  const allEntries: { entry: ExportCardEntry; key: string }[] = [];
  if (legend) allEntries.push({ entry: legend, key: "legend" });
  for (const e of mainCards) allEntries.push({ entry: e, key: `m-${e.cardId}` });
  for (const e of battlefield) allEntries.push({ entry: e, key: `bf-${e.cardId}` });
  for (const e of side) allEntries.push({ entry: e, key: `s-${e.cardId}` });

  const imgMap = new Map<string, HTMLImageElement>();
  let bgImg: HTMLImageElement | null = null;

  const loadPromises = allEntries
    .filter((a) => a.entry.imageUrl)
    .map(async (a) => {
      try {
        const img = await loadImg(a.entry.imageUrl!);
        imgMap.set(a.entry.cardId, img);
      } catch { /* placeholder fallback */ }
    });

  const bgPromise = loadLocalImg("/img/fond-export.png").then((img) => { bgImg = img; }).catch(() => {});

  const domainIconMap = new Map<string, HTMLImageElement>();
  const domainIconPromises = rune.map(async (r) => {
    const domain = r.name.replace(" Rune", "");
    if (domainIconMap.has(domain)) return;
    const iconPath = DOMAIN_ICONS[domain];
    if (!iconPath) return;
    try {
      const img = await loadLocalImg(iconPath);
      domainIconMap.set(domain, img);
    } catch { /* fallback to circle */ }
  });

  await Promise.all([...loadPromises, bgPromise, ...domainIconPromises]);

  const canvas = document.createElement("canvas");
  const ratio = 2;
  canvas.width = totalW * ratio;
  canvas.height = totalH * ratio;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(ratio, ratio);

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, totalW, totalH);
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, totalW, totalH);
  }

  ctx.fillStyle = TEXT;
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.fillText(title, PAD, PAD + 24);
  if (legendDomains.length > 0) {
    const tw = ctx.measureText(title).width;
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillStyle = MUTED;
    const frDomains = legendDomains.map((d) => DOMAIN_LABELS_FR[d] ?? d);
    ctx.fillText(`  ·  ${frDomains.join(" / ")}`, PAD + tw, PAD + 24);
  }

  const bodyY = PAD + 40 + 8;

  ctx.fillStyle = BG_PANEL;
  drawRoundedRect(ctx, PAD - 4, bodyY - 4, LEFT_W + 8, contentH + 8, 8);
  ctx.fill();

  const leftPanelX = PAD - 4;
  const leftPanelW = LEFT_W + 8;
  let leftY = bodyY + 4;
  if (legend) {
    const lw = LEFT_W - 8;
    const lh = lw * 1.4;
    const lx = leftPanelX + (leftPanelW - lw) / 2;
    drawCard(ctx, imgMap.get(legend.cardId) ?? null, lx, leftY, lw, lh, legend.name, 1);
    leftY += lh + 8;

    if (rune.length > 0) {
      const sorted = [...rune].sort((a, b) => b.quantity - a.quantity);
      ctx.font = "bold 11px system-ui, sans-serif";
      const items = sorted.map((r) => {
        const domain = r.name.replace(" Rune", "");
        const frName = DOMAIN_LABELS_FR[domain] ?? domain;
        const textW = ctx.measureText(`${frName} x${r.quantity}`).width;
        return { domain, frName, quantity: r.quantity, w: 20 + 4 + textW };
      });
      const totalRuneW = items.reduce((s, it) => s + it.w, 0) + (items.length - 1) * 8;
      let rx = PAD + Math.max(0, (LEFT_W - totalRuneW) / 2);
      for (const it of items) {
        const icon = domainIconMap.get(it.domain);
        const color = DOMAIN_COLORS[it.domain] ?? ACCENT;
        if (icon) {
          ctx.drawImage(icon, rx, leftY, 18, 18);
        } else {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(rx + 9, leftY + 9, 9, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = TEXT;
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.fillText(`${it.frName} x${it.quantity}`, rx + 22, leftY + 13);
        rx += it.w + 8;
      }
      leftY += 24;
    }

    if (battlefield.length > 0) {
      for (const bf of battlefield) {
        const bfw = LEFT_W - 16;
        const bfh = bfw * 0.6;
        const bfx = leftPanelX + (leftPanelW - bfw) / 2;
        drawCard(ctx, imgMap.get(bf.cardId) ?? null, bfx, leftY, bfw, bfh, bf.name, 1);
        leftY += bfh + 4;
      }
    }
  }

  const gridX = PAD + LEFT_W + 16;
  const gy = bodyY;
  for (let i = 0; i < mainCards.length; i++) {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const cx = gridX + col * (CARD_W + GAP);
    const cy = gy + row * (CARD_H + GAP);
    const e = mainCards[i];
    drawCard(ctx, imgMap.get(e.cardId) ?? null, cx, cy, CARD_W, CARD_H, e.name, e.quantity);
  }

  if (side.length > 0) {
    const sideY = gy + mainRows * (CARD_H + GAP) + 8;

    ctx.fillStyle = GOLD;
    ctx.fillRect(gridX, sideY, gridW, 1);
    ctx.font = "bold 10px system-ui, sans-serif";
    const label = "RÉSERVE";
    const labelW = ctx.measureText(label).width;
    const labelX = gridX + gridW / 2 - labelW / 2 - 6;
    ctx.fillStyle = BG;
    ctx.fillRect(labelX, sideY - 6, labelW + 12, 12);
    ctx.fillStyle = GOLD;
    ctx.fillText(label, labelX + 6, sideY + 4);

    const sideStartY = sideY + 16;
    const sideSorted = [...side].sort((a, b) => (a.energy ?? 99) - (b.energy ?? 99) || a.name.localeCompare(b.name));
    for (let i = 0; i < sideSorted.length; i++) {
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      const cx = gridX + col * (CARD_W + GAP);
      const cy = sideStartY + row * (CARD_H + GAP);
      const e = sideSorted[i];
      drawCard(ctx, imgMap.get(e.cardId) ?? null, cx, cy, CARD_W, CARD_H, e.name, e.quantity);
    }
  }

  ctx.fillStyle = MUTED;
  ctx.font = "11px system-ui, sans-serif";
  const wm = "riftboundfrance.fr";
  ctx.fillText(wm, totalW - PAD - ctx.measureText(wm).width, totalH - 12);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}
