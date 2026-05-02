/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  /**
   * In dev, use in-memory webpack cache only. On Windows, the default persistent
   * cache under .next can reference chunk ids (e.g. ./687.js) that no longer exist
   * after HMR or interrupted compiles → "Cannot find module './687.js'".
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory' };
    }
    return config;
  },
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google OAuth profile pictures
  },
  // Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
