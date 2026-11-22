import type { UrlPurpose } from './urls.js';

type Locked = { type: 'locked'; label: string };
type Text = { type: 'text'; label: string; initial: string; multiline?: boolean; max?: number; url?: UrlPurpose; optional?: boolean; options?: Record<string, string> };
type RecordField = { type: 'record'; label: string; fields: Record<string, Field> };
type ListField = { type: 'list'; label: string; item: Field; initial: unknown[]; max: number; min: number; fixed?: boolean; titleKey?: string };
export type Field = Locked | Text | RecordField | ListField;
export type Value<F extends Field> = F extends Locked ? unknown : F extends Text ? string : F extends { type: 'record'; fields: infer T extends Record<string, Field> } ? { [K in keyof T]: Value<T[K]> } : F extends { type: 'list'; item: infer I extends Field } ? Value<I>[] : never;

export const locked = (label: string): Locked => ({ type: 'locked', label });
export const copy = (label: string, initial = '', options: Partial<Omit<Text, 'type' | 'label' | 'initial'>> = {}): Text => ({ type: 'text', label, initial, ...options });
export const url = (label: string, initial = '', purpose: UrlPurpose = 'link', optional = false) => copy(label, initial, { url: purpose, optional });
export const group = <T extends Record<string, Field>>(label: string, fields: T) => ({ type: 'record' as const, label, fields });
export const entries = <I extends Field>(label: string, item: I, initial: Value<I>[], options: { max?: number; min?: number; fixed?: boolean; titleKey?: string } = {}) =>
  ({ type: 'list' as const, label, item, initial, max: 50, min: 0, ...options });

/** Keep display defaults on the server. The form needs only labels, rules and blanks for new entries. */
export function editorFields(field: Field): Field {
  switch (field.type) {
    case 'locked': return field;
    case 'text': return { ...field, initial: '' };
    case 'list': return {
      ...field, item: editorFields(field.item),
      initial: field.fixed ? field.initial.map(item => lockedDefaults(field.item, item)) : [],
    };
    case 'record': return { ...field, fields: Object.fromEntries(Object.entries(field.fields).map(([key, item]) => [key, editorFields(item)])) };
  }
}

function lockedDefaults(field: Field, value: unknown): unknown {
  if (field.type === 'locked') return value;
  if (field.type !== 'record') return null;
  const entry = value as Record<string, unknown>;
  return Object.fromEntries(Object.entries(field.fields).filter(([, child]) => child.type === 'locked')
    .map(([key, child]) => [key, lockedDefaults(child, entry[key])]));
}

export function initialFields<F extends Field>(field: F): Value<F>;
export function initialFields(field: Field): unknown {
  switch (field.type) {
    case 'locked': return undefined;
    case 'text': return field.initial;
    case 'list': return field.initial;
    case 'record': return Object.fromEntries(Object.entries(field.fields).map(([key, item]) => [key, initialFields(item)]));
  }
}
