/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [process.env.NEXT_PUBLIC_WEB_URL],
    },
  },
};

module.exports = nextConfig;
