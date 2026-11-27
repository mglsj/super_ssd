import { getCollection, type CollectionEntry } from 'astro:content';

export const PARTS = [
  { id: 'python', label: 'Python Core' },
  { id: 'reasoning', label: 'Reasoning & Proofs' },
  { id: 'exam', label: 'Exam Practice' },
] as const;

export type Note = CollectionEntry<'notes'>;

/** All notes in reading order: by part, then by `order`. */
export async function getNotes(): Promise<Note[]> {
  const rank = (p: string) => PARTS.findIndex((x) => x.id === p);
  return (await getCollection('notes')).sort(
    (a, b) => rank(a.data.part) - rank(b.data.part) || a.data.order - b.data.order,
  );
}

export const partLabel = (id: string) => PARTS.find((p) => p.id === id)?.label ?? id;
