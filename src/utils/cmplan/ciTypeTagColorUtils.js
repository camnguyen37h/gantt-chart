// Deterministic color mapping for dynamic tag values (CI Types, environments,
// statuses, etc.). Uses a hash of the value + a fixed pastel palette so the
// same value always renders with the same colors without requiring a static map.

// Palette is taken verbatim from STATUS_CONFIG (unique background/color pairs).
// No new colors are introduced — values are hashed onto these tuples.
const TAG_COLOR_PALETTE = [
  { backgroundColor: '#deebff', color: '#0647a6' },
  { backgroundColor: '#e3fcef', color: '#0b6644' },
  { backgroundColor: '#dfe1e5', color: '#42526e' },
]

const toSafeKey = (value) => (value == null ? 'unknown' : String(value))

const hashString = (value) => {
  const key = toSafeKey(value)
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

const getPaletteItem = (value) =>
  TAG_COLOR_PALETTE[hashString(value) % TAG_COLOR_PALETTE.length]

// ── Generic API (preferred) ──────────────────────────────────────────────────

/** Returns `{ backgroundColor, color }` tuple for any tag value. */
export const getTagStyleByValue = (value) => {
  const item = getPaletteItem(value)
  return {
    backgroundColor: item.backgroundColor,
    color: item.color,
  }
}

/** Returns only the foreground color for any tag value. */
export const getTagTextColor = (value) => getPaletteItem(value).color

// ── Back-compat aliases ──────────────────────────────────────────────────────
// Older imports used CI-type-specific names; keep them as aliases.
export const getCITypeTagStyle = getTagStyleByValue
export const getCITypeTextColor = getTagTextColor

