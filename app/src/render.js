// Draws the whole poster onto a canvas: photo panels, grade, retro sun, palms,
// bold caption lettering and a thin frame. All lettering is drawn with system
// fonts on canvas, so the app ships no font file at all.

import { panelRects } from './layouts.js';
import { GRADES, paintGrade, drawRetroSun, drawPalmPair, drawGrain, drawVignette } from './grade.js';

/** Draws one photo into one panel, cover-fit, with the panel's zoom and pan. */
export function drawPanelPhoto(ctx, photo, rect, slot) {
  if (!photo) {
    ctx.fillStyle = '#241028';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = `600 ${Math.max(14, rect.w * 0.045)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    return;
  }
  const base = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight);
  const scale = base * (slot.zoom || 1);
  const pw = photo.naturalWidth * scale;
  const ph = photo.naturalHeight * scale;
  const cx = rect.x + rect.w / 2 + (slot.panX || 0) * rect.w * 0.004;
  const cy = rect.y + rect.h / 2 + (slot.panY || 0) * rect.h * 0.004;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = GRADES[slot.grade || 'sunset'].filter;
  ctx.drawImage(photo, cx - pw / 2, cy - ph / 2, pw, ph);
  ctx.restore();
}

/** The title in heavy condensed capitals, with a thick dark outline and a
 *  gradient or neon fill, slightly slanted like a poster headline. */
export function drawPosterTitle(ctx, text, w, h, style) {
  const words = text.trim().toUpperCase();
  if (!words) return;
  const bandY = h * 0.86;
  const maxWidth = w * 0.92;
  let size = h * 0.115;
  const font = (s) => `900 ${s}px "Arial Black", Impact, "Helvetica Neue", sans-serif`;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = font(size);
  while (ctx.measureText(words).width > maxWidth && size > 20) {
    size -= 3;
    ctx.font = font(size);
  }
  const cx = w / 2;
  const cy = bandY;
  ctx.translate(cx, cy);
  ctx.rotate(-0.02);
  ctx.translate(-cx, -cy);
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.shadowColor = 'rgba(10, 2, 18, 0.65)';
  ctx.shadowBlur = size * 0.18;
  ctx.shadowOffsetY = size * 0.05;
  ctx.lineWidth = size * 0.16;
  ctx.strokeStyle = '#160818';
  ctx.strokeText(words, cx, cy);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  if (style === 'sunset') {
    const g = ctx.createLinearGradient(0, cy - size * 0.6, 0, cy + size * 0.6);
    g.addColorStop(0, '#fff6a3');
    g.addColorStop(0.45, '#ffb347');
    g.addColorStop(0.75, '#ff5e3a');
    g.addColorStop(1, '#ff2e88');
    ctx.fillStyle = g;
  } else if (style === 'neon') {
    ctx.fillStyle = '#ff2e88';
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = size * 0.35;
  } else if (style === 'gold') {
    const g = ctx.createLinearGradient(0, cy - size * 0.6, 0, cy + size * 0.6);
    g.addColorStop(0, '#fff8d6');
    g.addColorStop(0.5, '#f5c542');
    g.addColorStop(1, '#a86f00');
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = '#ffffff';
  }
  ctx.fillText(words, cx, cy);
  // A thin bright inner line keeps the letters crisp at small sizes.
  ctx.lineWidth = size * 0.02;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.strokeText(words, cx, cy);
  ctx.restore();
}

/** Letter-spaced subtitle in a small band above the title. */
export function drawPosterSubtitle(ctx, text, w, h) {
  const words = text.trim().toUpperCase();
  if (!words) return;
  const size = Math.max(16, h * 0.026);
  ctx.save();
  ctx.font = `700 ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const spaced = words.split('').join(' ');
  const maxW = w * 0.88;
  let s = size;
  while (ctx.measureText(spaced).width > maxW && s > 10) {
    s -= 1;
    ctx.font = `700 ${s}px system-ui, sans-serif`;
  }
  const y = h * 0.775;
  ctx.fillStyle = 'rgba(10, 2, 18, 0.55)';
  const tw = ctx.measureText(spaced).width;
  ctx.fillRect(w / 2 - tw / 2 - s * 0.9, y - s * 0.85, tw + s * 1.8, s * 1.7);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(spaced, w / 2, y);
  ctx.restore();
}

/** Renders the full cover for `state` onto `canvas` at its own pixel size. */
export function drawCoverArt(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#160818';
  ctx.fillRect(0, 0, w, h);
  const rects = panelRects(state.layout, w, h);
  rects.forEach((rect, i) => {
    drawPanelPhoto(ctx, state.photos[i] || null, rect, { ...state.slots[i], grade: state.grade });
  });
  // White seams between panels.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  const seam = Math.max(2, Math.min(w, h) * 0.006);
  rects.forEach((r) => {
    ctx.fillRect(r.x + r.w - seam / 2, r.y, seam, r.h);
    ctx.fillRect(r.x, r.y + r.h - seam / 2, r.w, seam);
  });
  paintGrade(ctx, w, h, grade);
  if (state.sunOn) {
    // Sun placement per layout, chosen to sit in open sky: the middle
    // panel's top-left sky on trio, the seam's sky on quad, the hero's
    // top-left sky on hero + duo. Faces sit centre-top in both samples,
    // so the sun stays off-centre.
    const r = Math.min(w, h) * (state.layout === 'heroDuo' ? 0.09 : 0.075);
    const spot = state.layout === 'heroDuo'
      ? { x: w * 0.14, y: h * 0.15, r }
      : state.layout === 'quad'
        ? { x: w * 0.5, y: h * 0.10, r }
        : { x: w * 0.37, y: h * 0.10, r };
    drawRetroSun(ctx, spot.x, spot.y, spot.r);
  }
  // A dark band at the foot so the caption always reads.
  const band = ctx.createLinearGradient(0, h * 0.70, 0, h);
  band.addColorStop(0, 'rgba(10, 2, 18, 0)');
  band.addColorStop(0.5, 'rgba(10, 2, 18, 0.45)');
  band.addColorStop(1, 'rgba(10, 2, 18, 0.72)');
  ctx.fillStyle = band;
  ctx.fillRect(0, h * 0.70, w, h * 0.30);
  if (state.palmsOn) drawPalmPair(ctx, w, h);
  drawPosterSubtitle(ctx, state.subtitle, w, h);
  drawPosterTitle(ctx, state.caption, w, h, state.titleStyle);
  drawVignette(ctx, w, h);
  if (state.grainOn) drawGrain(ctx, w, h);
  // Thin poster frame.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = Math.max(3, Math.min(w, h) * 0.008);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
  return rects;
}
