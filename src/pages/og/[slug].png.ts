/**
 * Open Graph images (1200×630 PNG), rendered at build time with Satori + resvg:
 *   /og/index.png for the home page, /og/<note-id>.png for each note.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getNotes, partLabel } from '@/lib/notes';
import { SITE } from '@/lib/site';

type Props = { title: string; description: string; label: string };

export const getStaticPaths: GetStaticPaths = async () => {
  const notes = await getNotes();
  return [
    { params: { slug: 'index' }, props: { title: SITE.name, description: SITE.description, label: 'Study notes' } },
    ...notes.map((n) => ({
      params: { slug: n.id },
      props: { title: n.data.title, description: n.data.description, label: partLabel(n.data.part) },
    })),
  ];
};

const font = (pkg: string, file: string) => readFileSync(join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file));
const fonts = [
  { name: 'Newsreader', data: font('newsreader', 'newsreader-latin-400-normal.woff'), weight: 400, style: 'normal' },
  { name: 'Newsreader', data: font('newsreader', 'newsreader-latin-400-italic.woff'), weight: 400, style: 'italic' },
  { name: 'Newsreader', data: font('newsreader', 'newsreader-latin-600-normal.woff'), weight: 600, style: 'normal' },
  { name: 'JetBrains Mono', data: font('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'), weight: 500, style: 'normal' },
] as const;

const mark = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), 'public/favicon.svg')).toString('base64')}`;

// tiny helper so the layout below reads like markup
const h = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });

const C = { paper: '#f8f2e6', ink: '#2d2620', muted: '#675c4f', rule: '#e3d8c3', accent: '#9c4a24' };

export const GET: APIRoute = async ({ props, site }) => {
  const { title, description, label } = props as Props;
  const host = new URL(import.meta.env.BASE_URL, site ?? 'https://example.com').href.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const titleSize = title.length > 34 ? 64 : 80;

  const tree = h(
    'div',
    // padding adds to the box in Satori, so the content box is 1200×630 minus the padding
    { width: 1200 - 144, height: 630 - 128, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', background: C.paper, color: C.ink },
    [
      h('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
        { type: 'img', props: { src: mark, width: 56, height: 56 } },
        h('div', { fontFamily: 'JetBrains Mono', fontSize: 24, letterSpacing: 2, textTransform: 'uppercase', color: C.muted }, `${SITE.name}  ·  ${label}`),
      ]),
      h('div', { display: 'flex', flexDirection: 'column', gap: 24 }, [
        h('div', { fontFamily: 'Newsreader', fontWeight: 600, fontSize: titleSize, lineHeight: 1.08, letterSpacing: -1.5 }, title),
        h('div', { fontFamily: 'Newsreader', fontStyle: 'italic', fontSize: 34, lineHeight: 1.35, color: C.muted, maxWidth: 980 }, description),
      ]),
      h('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `2px solid ${C.rule}`, paddingTop: 24, fontFamily: 'JetBrains Mono', fontSize: 22, color: C.muted }, [
        h('div', { color: C.accent }, host),
        h('div', {}, SITE.tagline),
      ]),
    ],
  );

  const svg = await satori(tree as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: fonts as unknown as Parameters<typeof satori>[1]['fonts'] });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
