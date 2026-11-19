// Colour grades and poster decoration, all drawn by hand on canvas: no game
// artwork, no copied fonts. Grades are warm overlay gradients plus a photo
// filter; the decoration is a retro striped sun, palm silhouettes and grain.

export const GRADES = {
  sunset: {
    name: 'Vice sunset',
    filter: 'saturate(1.35) contrast(1.08) brightness(1.02)',
    top: 'rgba(255, 94, 120, 0.10)',
    bottom: 'rgba(255, 122, 47, 0.34)',
    caption: 'sunset',
  },
  neon: {
    name: 'Neon nights',
    filter: 'saturate(1.5) contrast(1.12) hue-rotate(-8deg)',
    top: 'rgba(255, 0, 160, 0.16)',
    bottom: 'rgba(0, 210, 200, 0.26)',
    caption: 'neon',
  },
  dusk: {
    name: 'Palm dusk',
    filter: 'saturate(1.2) contrast(1.1) brightness(0.94)',
    top: 'rgba(60, 10, 90, 0.22)',
    bottom: 'rgba(255, 80, 140, 0.22)',
    caption: 'sunset',
  },
  clean: {
    name: 'Clean',
    filter: 'saturate(1.05) contrast(1.02)',
    top: 'rgba(0, 0, 0, 0)',
    bottom: 'rgba(0, 0, 0, 0.10)',
    caption: 'white',
  },
};

/** Paints a grade's warm wash over the whole cover. */
export function paintGrade(ctx, w, h, grade) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, grade.top);
  g.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
  g.addColorStop(1, grade.bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Draws a retro sun: a striped disc low in the sky, in sunset colours. */
export function drawRetroSun(ctx, cx, cy, r) {
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.7);
  glow.addColorStop(0, 'rgba(255, 190, 80, 0.55)');
  glow.addColorStop(1, 'rgba(255, 190, 80, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 1.8, cy - r * 1.8, r * 3.6, r * 3.6);
  const disc = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  disc.addColorStop(0, '#ffe066');
  disc.addColorStop(0.5, '#ff8a3d');
  disc.addColorStop(1, '#ff2e88');
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Horizontal slits cut through the lower half, synthwave style.
  ctx.globalCompositeOperation = 'destination-out';
  let y = cy + r * 0.08;
  let thick = r * 0.05;
  while (y < cy + r) {
    ctx.fillRect(cx - r - 2, y, r * 2 + 4, thick);
    y += thick + r * 0.16;
    thick *= 1.35;
  }
  ctx.restore();
}

/** One palm tree silhouette: a thick curved trunk and fronds that arc up
 *  from the crown before drooping, so it reads as a palm, not a spider. */
export function drawPalm(ctx, x, y, size, lean, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(flip ? -size : size, size);
  ctx.strokeStyle = 'rgba(20, 6, 26, 0.95)';
  ctx.fillStyle = 'rgba(20, 6, 26, 0.95)';
  ctx.lineCap = 'round';
  // Trunk: a thick curve from the base up to the crown.
  ctx.lineWidth = 0.075;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(0.02, -0.35, 0.10, -0.68);
  ctx.stroke();
  // Fronds arc up and out from the crown, then droop at the tips.
  for (let i = 0; i < 7; i++) {
    const spread = -0.35 + i * 0.22; // -0.35 .. 0.97 across the crown
    const len = 0.42 + (i % 3) * 0.06;
    const tipX = 0.10 + spread * len;
    const tipY = -0.68 - 0.10 + Math.abs(spread) * 0.22;
    ctx.lineWidth = 0.055;
    ctx.beginPath();
    ctx.moveTo(0.10, -0.68);
    ctx.quadraticCurveTo(0.10 + spread * len * 0.55, -0.68 - 0.24, tipX, tipY);
    ctx.stroke();
  }
  // Coconuts at the crown.
  ctx.beginPath();
  ctx.arc(0.05, -0.63, 0.04, 0, Math.PI * 2);
  ctx.arc(0.15, -0.62, 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A pair of palms in the bottom corners, leaning in from the edges. */
export function drawPalmPair(ctx, w, h) {
  const s = Math.min(w, h);
  drawPalm(ctx, w * 0.03, h * 1.0, s * 0.24, -0.05);
  drawPalm(ctx, w * 0.97, h * 1.0, s * 0.21, 0.05, true);
}

/** Deterministic film grain: seeded dots so re-renders look identical. */
export function drawGrain(ctx, w, h, amount = 0.05) {
  let seed = 20261119;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  ctx.save();
  ctx.globalAlpha = amount;
  const step = Math.max(3, Math.round(Math.min(w, h) / 360));
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (next() < 0.5) {
        ctx.fillStyle = next() < 0.5 ? '#ffffff' : '#000000';
        ctx.fillRect(x, y, step * 0.6, step * 0.6);
      }
    }
  }
  ctx.restore();
}

/** Soft dark corners that pull the eye to the middle of the poster. */
export function drawVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0, 0, 0, 0)');
  g.addColorStop(1, 'rgba(10, 2, 18, 0.38)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}
