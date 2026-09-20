import { CATEGORIES } from '../data/seed';
import type { LineItem } from '../types/procurement';

const CATEGORY_KEYWORDS: Array<{category: (typeof CATEGORIES)[number];words: string[];}> = [
{ category: 'IT Equipment', words: ['laptop', 'monitor', 'switch', 'server', 'dock', 'display', 'printer', 'router', 'phone'] },
{ category: 'Office Supplies', words: ['toner', 'marker', 'paper', 'pen', 'cartridge', 'stationery', 'notebook', 'arm'] },
{ category: 'Facilities', words: ['chair', 'desk', 'furniture', 'cabinet', 'lamp', 'carpet', 'locker'] },
{ category: 'Software & Licences', words: ['licence', 'license', 'software', 'subscription', 'seat', 'saas'] }];


const UOM_KEYWORDS: Array<{uom: string;words: string[];}> = [
{ uom: 'cartridge', words: ['toner', 'cartridge'] },
{ uom: 'kit', words: ['kit', 'rail'] },
{ uom: 'piece', words: ['marker', 'pen', 'paper'] }];


export interface NormalizedDraft {
  title: string;
  category: string;
  items: LineItem[];
  notes: string[];
  unresolved: string[];
}

function titleCase(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function parseMoney(fragment: string): number | null {
  const m = fragment.match(/(\d+(?:[.,]\d+)?)\s*(m|tr|million|k)\b/i);
  if (m) {
    const base = Number.parseFloat(m[1].replace(',', '.'));
    const unit = m[2].toLowerCase();
    if (unit === 'k') return Math.round(base * 1_000);
    return Math.round(base * 1_000_000);
  }
  const plain = fragment.match(/(\d[\d.,]{5,})\s*(?:vnd|₫|d)?\b/i);
  if (plain) {
    const value = Number.parseInt(plain[1].replace(/[.,]/g, ''), 10);
    if (!Number.isNaN(value) && value >= 10_000) return value;
  }
  return null;
}

/**
 * Restructures the requester's own free-text note into request fields.
 * It never introduces values that are not present in the note.
 */
export function normalizeFreeText(raw: string): NormalizedDraft {
  const notes: string[] = [];
  const unresolved: string[] = [];
  const text = raw.trim();

  const fragments = text.
  split(/[\n;,]|\band\b|\bplus\b/gi).
  map((f) => f.trim()).
  filter((f) => f.length > 2);

  const items: LineItem[] = [];
  fragments.forEach((fragment, index) => {
    const qtyMatch = fragment.match(/(?:^|\s)(?:x\s*)?(\d{1,4})\s*(?:x\b|pcs?\b|units?\b)?/i);
    const qty = qtyMatch ? Number.parseInt(qtyMatch[1], 10) : 1;
    const price = parseMoney(fragment);
    const description = titleCase(
      fragment.
      replace(/(?:^|\s)(?:x\s*)?\d{1,4}\s*(?:x\b|pcs?\b|units?\b)?/i, ' ').
      replace(/(\d+(?:[.,]\d+)?)\s*(m|tr|million|k)\b/i, ' ').
      replace(/\b(?:each|per unit|approx|about|around|vnd|₫)\b/gi, ' ').
      trim()
    );
    if (!description) return;
    if (!qtyMatch) notes.push(`No quantity found for “${description}” — defaulted to 1.`);
    if (price === null) unresolved.push(`Estimated unit price for “${description}”`);
    items.push({
      id: `li-n-${index}`,
      description,
      qty,
      uom: UOM_KEYWORDS.find((u) => u.words.some((w) => fragment.toLowerCase().includes(w)))?.uom ?? 'unit',
      estUnitPrice: price ?? 0
    });
  });

  const lower = text.toLowerCase();
  const categoryHit = CATEGORY_KEYWORDS.find((c) => c.words.some((w) => lower.includes(w)));
  if (categoryHit) {
    notes.push(`Category mapped to ${categoryHit.category} from the wording of the note.`);
  } else {
    unresolved.push('Category — no recognised keyword in the note');
  }

  const first = items[0];
  const title = first ?
  titleCase(`${first.description}${first.qty > 1 ? ` (${first.qty} ${first.uom}s)` : ''}`) :
  titleCase(text.slice(0, 60));

  if (items.length > 1) notes.push(`Split into ${items.length} line items.`);
  if (!/\d{4}-\d{2}-\d{2}/.test(text)) unresolved.push('Required-by date — no date in the note');

  return { title, category: categoryHit?.category ?? '', items, notes, unresolved };
}