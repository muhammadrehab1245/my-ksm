import dayjs from 'dayjs';

export * from './http';
export * from './config';
export * from './store';
export * from './config/mantine';

Date.prototype.toJSON = function () {
  return dayjs(this).format('YYYY-MM-DDTHH:mm:ss');
};

export const isDev = process.env.NODE_ENV === 'development';

export function convertType(value: string) {
  const maps: { [index: string]: any } = { NaN, null: null, undefined, Infinity, '-Infinity': -Infinity };
  return value in maps ? maps[value] : value;
}
