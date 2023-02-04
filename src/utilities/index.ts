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

export const parseDigits = (string: string) => (string.match(/\d+/g) || []).join('');

export const formatDate = (string: string) => {
  const digits = parseDigits(string);
  const chars = digits.split('');
  return chars.reduce((r, v, index) => (index === 2 ? `${r}/${v}` : `${r}${v}`), '').substring(0, 5);
};

export const formatCVV = (string: string) => parseDigits(string).substring(0, 3);
