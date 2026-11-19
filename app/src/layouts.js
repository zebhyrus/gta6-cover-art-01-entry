// Poster panel layouts: each layout returns the panel rectangles (fractions of the
// cover, x/y/w/h in 0..1) for a given cover size. Panel gaps are thin white seams,
// the multi-panel look of a GTA-style poster. Layouts adapt to portrait, square
// and landscape covers so every size keeps the same poster feel.

export const LAYOUTS = {
  trio: { name: 'Trio', panels: 3 },
  heroDuo: { name: 'Hero + duo', panels: 3 },
  quad: { name: 'Quad', panels: 4 },
  solo: { name: 'Solo', panels: 1 },
};

/** Panel rectangles for `layout` on a cover of width `w` and height `h`. */
export function panelRects(layout, w, h) {
  const gap = 0.012; // seam between panels, as a fraction of the short side
  const g = Math.min(w, h) * gap;
  const landscape = w > h;
  if (layout === 'solo') return [{ x: 0, y: 0, w, h }];
  if (layout === 'quad') {
    return [
      { x: 0, y: 0, w: (w - g) / 2, h: (h - g) / 2 },
      { x: (w + g) / 2, y: 0, w: (w - g) / 2, h: (h - g) / 2 },
      { x: 0, y: (h + g) / 2, w: (w - g) / 2, h: (h - g) / 2 },
      { x: (w + g) / 2, y: (h + g) / 2, w: (w - g) / 2, h: (h - g) / 2 },
    ];
  }
  if (layout === 'heroDuo') {
    if (landscape) {
      const heroW = w * 0.58;
      return [
        { x: 0, y: 0, w: heroW, h },
        { x: heroW + g, y: 0, w: w - heroW - g, h: (h - g) / 2 },
        { x: heroW + g, y: (h + g) / 2, w: w - heroW - g, h: (h - g) / 2 },
      ];
    }
    const heroH = h * 0.58;
    return [
      { x: 0, y: 0, w, h: heroH },
      { x: 0, y: heroH + g, w: (w - g) / 2, h: h - heroH - g },
      { x: (w + g) / 2, y: heroH + g, w: (w - g) / 2, h: h - heroH - g },
    ];
  }
  // trio: three tall panels side by side on landscape and square; on portrait
  // the middle panel is wider so faces stay readable.
  const third = (w - 2 * g) / 3;
  if (landscape || w === h) {
    return [
      { x: 0, y: 0, w: third, h },
      { x: third + g, y: 0, w: third, h },
      { x: 2 * (third + g), y: 0, w: third, h },
    ];
  }
  const side = w * 0.30;
  const mid = w - 2 * side - 2 * g;
  return [
    { x: 0, y: 0, w: side, h },
    { x: side + g, y: 0, w: mid, h },
    { x: side + mid + 2 * g, y: 0, w: side, h },
  ];
}

/** How many panels a layout shows. */
export function panelCount(layout) {
  return LAYOUTS[layout]?.panels ?? 3;
}

/** The export sizes the app offers, as [width, height] pairs. */
export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};
