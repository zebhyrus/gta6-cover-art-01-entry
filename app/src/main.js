// Boots Vice Cover Studio: builds the editor state, wires the controls, and
// runs a fixed ?shot= scene instead when one is requested for a screenshot.
import { freshState, wireEditor } from './editor.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const state = freshState();
const editor = wireEditor(canvas, state);

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, state, editor).catch(() => {
    window.__shotReady = true;
  });
}
