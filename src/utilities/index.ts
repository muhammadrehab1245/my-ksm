import { getCodes, getName } from 'country-list';

export * from './http';
export * from './config';
export * from './store';
export * from './config/mantine';

export const isDev = process.env.NODE_ENV === 'development';

export function convertType(value: string) {
  const maps: { [index: string]: any } = { NaN, null: null, undefined, Infinity, '-Infinity': -Infinity };
  return value in maps ? maps[value] : value;
}

export const countries = getCodes().map((code) => ({ value: code, label: getName(code) ?? `aaa ${code}` }));
