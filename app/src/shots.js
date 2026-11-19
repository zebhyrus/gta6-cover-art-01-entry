// Fixed scenes for screenshots: ?shot=cover shows the finished cover alone,
// ?shot=editor shows the editor with photos loaded. Query knobs: photo,
// photo2, caption, subtitle, layout, size, grade, style. window.__shotReady
// is set once the scene has painted, so a screenshot tool can wait on it.
import { loadImage, emptySlot } from './editor.js';

const SAMPLES = { pier: 'samples/pier.jpg', boulevard: 'samples/boulevard.jpg' };

/** Applies one fixed scene to the editor state, then redraws it. */
export async function runShot(shot, query, state, editor) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photoName = query.get('photo') ?? 'pier';
  const photo2Name = query.get('photo2') ?? (photoName === 'pier' ? 'boulevard' : 'pier');
  const first = await loadImage(SAMPLES[photoName] ?? SAMPLES.pier);
  const second = await loadImage(SAMPLES[photo2Name] ?? SAMPLES.boulevard);
  state.layout = query.get('layout') ?? 'trio';
  state.size = query.get('size') ?? '1080x1080';
  state.grade = query.get('grade') ?? 'sunset';
  state.titleStyle = query.get('style') ?? 'sunset';
  state.caption = (query.get('caption') ?? 'Sunset Heist').toUpperCase();
  state.subtitle = query.get('subtitle') ?? 'VICE CITY · EST. 2026';
  state.photos = [first, second, first, second];
  state.slots = [emptySlot(), emptySlot(), emptySlot(), emptySlot()];
  // Crop each panel differently so the same photo reads as three shots.
  state.slots[0].zoom = 1.35;
  state.slots[0].panX = -18;
  state.slots[1].zoom = 1.15;
  state.slots[1].panY = -12;
  state.slots[2].zoom = 1.45;
  state.slots[2].panX = 20;
  state.slots[2].panY = 8;
  state.slots[3].zoom = 1.25;
  if (state.layout === 'heroDuo') {
    // The hero panel is wide: pull the portrait photo down so the face,
    // at the top of the frame, stays in shot instead of a headless torso.
    state.slots[0].zoom = 1.0;
    state.slots[0].panX = 0;
    state.slots[0].panY = 45;
    state.slots[1].zoom = 1.2;
    state.slots[1].panY = 0;
    state.slots[2].zoom = 1.3;
    state.slots[2].panY = 0;
  }
  if (query.get('layout')) {
    const layoutEl = document.getElementById('layout');
    if (layoutEl) layoutEl.value = state.layout;
    const sizeBtns = document.querySelectorAll('#sizeSeg button');
    sizeBtns.forEach((b) => b.classList.toggle('on', b.dataset.size === state.size));
    const captionEl = document.getElementById('caption');
    if (captionEl) captionEl.value = state.caption;
    const subtitleEl = document.getElementById('subtitle');
    if (subtitleEl) subtitleEl.value = state.subtitle;
    const gradeEl = document.getElementById('grade');
    if (gradeEl) gradeEl.value = state.grade;
    const styleEl = document.getElementById('titleStyle');
    if (styleEl) styleEl.value = state.titleStyle;
  }
  editor.refreshChips();
  editor.redraw();
  editor.say('Sample photos loaded — edit the caption, then export.');
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
