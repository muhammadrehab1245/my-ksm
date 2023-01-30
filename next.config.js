const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
  i18n,
  swcMinify: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  /*experimental: {
    nextScriptWorkers: true,
  },*/
});
