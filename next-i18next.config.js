const { resolve } = require('path');

module.exports = {
  i18n: {
    locales: ['en', 'ja'],
    defaultLocale: 'ja',
    localeDetection: false,
    ...(typeof window === undefined ? { localePath: resolve('./public/locales') } : {}),
  },
  fallbackLng: {
    default: ['en'],
  },
};
