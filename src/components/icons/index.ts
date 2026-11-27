// Registry of the built icon set (see icons.yaml). Built SVGs draw in currentColor.
// Sources live in ./source; run the draw-icons `build` to regenerate the SVGs.
const files = import.meta.glob<string>('./*.svg', { query: '?raw', import: 'default', eager: true });

export const icons: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, svg]) => [path.slice(2, -4), svg]),
);

/** The sizes the set is drawn and checked for (icons.yaml → sizes). */
export type IconSize = 16 | 20 | 24 | 48 | 96;

export function iconSvg(name: string, size: IconSize = 24): string {
  const svg = icons[name];
  if (!svg) throw new Error(`Unknown icon "${name}". Available: ${Object.keys(icons).join(', ')}`);
  return svg
    .replace(/width="24" height="24"/, `width="${size}" height="${size}" aria-hidden="true" focusable="false"`);
}
