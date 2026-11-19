// Editor state and wiring: photo slots, panel selection, drag-to-pan on the
// preview canvas, layout/size/caption controls, and PNG export. Photos are
// read with object URLs on the person's own machine and never uploaded.

import { drawCoverArt } from './render.js';
import { panelCount, panelRects, SIZES } from './layouts.js';

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load image'));
    img.src = url;
  });
}

/** A fresh photo slot: zoom 1.2, centred. */
export function emptySlot() {
  return { zoom: 1.2, panX: 0, panY: 0 };
}

/** The editor's starting state. */
export function freshState() {
  return {
    layout: 'trio',
    size: '1080x1080',
    grade: 'sunset',
    titleStyle: 'sunset',
    caption: 'SUNSET HEIST',
    subtitle: 'VICE CITY · EST. 2026',
    sunOn: true,
    palmsOn: true,
    grainOn: true,
    photos: [null, null, null, null],
    slots: [emptySlot(), emptySlot(), emptySlot(), emptySlot()],
    selected: 0,
  };
}

const $ = (id) => document.getElementById(id);

/** Renders the panel chip list under the photo buttons. */
export function renderPanelList(state, onSelect, onSwap) {
  const list = $('panelList');
  list.innerHTML = '';
  const count = panelCount(state.layout);
  for (let i = 0; i < count; i++) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'panel-chip' + (state.selected === i ? ' on' : '') + (state.photos[i] ? '' : ' empty');
    const dot = document.createElement('span');
    dot.className = 'dot';
    const label = document.createElement('span');
    label.textContent = state.photos[i]
      ? `Panel ${i + 1} — photo loaded`
      : `Panel ${i + 1} — empty`;
    const swap = document.createElement('span');
    swap.className = 'swap';
    swap.textContent = 'change';
    chip.append(dot, label, swap);
    chip.addEventListener('click', () => onSelect(i));
    swap.addEventListener('click', (e) => { e.stopPropagation(); onSwap(i); });
    list.appendChild(chip);
  }
}

/** Wires every control on the page to `state` and the preview `canvas`. */
export function wireEditor(canvas, state) {
  const status = $('status');
  let lastRects = [];

  function redraw() {
    const [w, h] = SIZES[state.size];
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    lastRects = drawCoverArt(canvas, state);
    syncSliders();
  }

  function syncSliders() {
    const slot = state.slots[state.selected];
    $('zoom').value = String(slot.zoom);
    $('zoomVal').textContent = `${slot.zoom.toFixed(2)}×`;
    $('panX').value = String(slot.panX);
    $('panXVal').textContent = String(slot.panX);
    $('panY').value = String(slot.panY);
    $('panYVal').textContent = String(slot.panY);
  }

  function refreshChips() {
    renderPanelList(state, (i) => { state.selected = i; refreshChips(); redraw(); }, pickForPanel);
  }

  function say(msg) { status.textContent = msg; }

  async function addFiles(files, startAt = 0) {
    let placed = 0;
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const at = (startAt + placed) % Math.max(1, panelCount(state.layout));
      try {
        state.photos[at] = await loadImage(URL.createObjectURL(file));
        state.slots[at] = emptySlot();
        state.selected = at;
        placed++;
      } catch { say('That file could not be read as a photo.'); }
    }
    if (placed) say(`${placed} photo${placed > 1 ? 's' : ''} loaded — drag inside a panel to move it.`);
    refreshChips();
    redraw();
  }

  let fileTarget = 0;
  function pickForPanel(i) {
    state.selected = i;
    fileTarget = i;
    $('photoFile').click();
  }

  $('photoFile').addEventListener('change', (e) => {
    addFiles([...e.target.files], fileTarget);
    e.target.value = '';
  });
  $('fillAll').addEventListener('click', () => {
    const first = state.photos.find((p) => p);
    if (!first) { say('Load a photo first, then fill all panels with it.'); return; }
    for (let i = 0; i < panelCount(state.layout); i++) state.photos[i] = first;
    say('Every panel now shows the same photo — zoom each one differently.');
    refreshChips();
    redraw();
  });
  $('samplePier').addEventListener('click', async () => {
    state.photos[state.selected] = await loadImage('samples/pier.jpg');
    state.slots[state.selected] = emptySlot();
    say('Pier sample loaded.');
    refreshChips(); redraw();
  });
  $('sampleBoulevard').addEventListener('click', async () => {
    state.photos[state.selected] = await loadImage('samples/boulevard.jpg');
    state.slots[state.selected] = emptySlot();
    say('Boulevard sample loaded.');
    refreshChips(); redraw();
  });

  $('layout').addEventListener('change', (e) => {
    state.layout = e.target.value;
    state.selected = 0;
    refreshChips(); redraw();
  });
  $('sizeSeg').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-size]');
    if (!btn) return;
    state.size = btn.dataset.size;
    document.querySelectorAll('#sizeSeg button').forEach((b) => b.classList.toggle('on', b === btn));
    redraw();
  });
  $('caption').addEventListener('input', (e) => { state.caption = e.target.value; redraw(); });
  $('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
  $('titleStyle').addEventListener('change', (e) => { state.titleStyle = e.target.value; redraw(); });
  $('grade').addEventListener('change', (e) => { state.grade = e.target.value; redraw(); });
  $('sunOn').addEventListener('change', (e) => { state.sunOn = e.target.checked; redraw(); });
  $('palmsOn').addEventListener('change', (e) => { state.palmsOn = e.target.checked; redraw(); });
  $('grainOn').addEventListener('change', (e) => { state.grainOn = e.target.checked; redraw(); });

  $('zoom').addEventListener('input', (e) => {
    state.slots[state.selected].zoom = Number(e.target.value);
    redraw();
  });
  $('panX').addEventListener('input', (e) => {
    state.slots[state.selected].panX = Number(e.target.value);
    redraw();
  });
  $('panY').addEventListener('input', (e) => {
    state.slots[state.selected].panY = Number(e.target.value);
    redraw();
  });

  // Drag on the preview: pick the panel under the pointer, pan its photo.
  let drag = null;
  function pointerPos(e) {
    const box = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - box.left) * (canvas.width / box.width),
      y: (e.clientY - box.top) * (canvas.height / box.height),
    };
  }
  canvas.addEventListener('pointerdown', (e) => {
    const p = pointerPos(e);
    const i = lastRects.findIndex((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
    if (i === -1) return;
    state.selected = i;
    drag = { x: p.x, y: p.y, panX: state.slots[i].panX, panY: state.slots[i].panY };
    canvas.setPointerCapture(e.pointerId);
    refreshChips();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = pointerPos(e);
    const i = state.selected;
    const rect = lastRects[i];
    if (!rect) return;
    state.slots[i].panX = Math.max(-100, Math.min(100, drag.panX + ((p.x - drag.x) / rect.w) * 250));
    state.slots[i].panY = Math.max(-100, Math.min(100, drag.panY + ((p.y - drag.y) / rect.h) * 250));
    redraw();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });

  $('export').addEventListener('click', () => {
    const [w, h] = SIZES[state.size];
    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    drawCoverArt(out, state);
    out.toBlob((blob) => {
      if (!blob) { say('Export failed — try again.'); return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-cover-${w}x${h}.png`;
      a.click();
      say(`Saved vice-cover-${w}x${h}.png — share it.`);
    }, 'image/png');
  });

  refreshChips();
  redraw();
  return { redraw, refreshChips, addFiles, say };
}
