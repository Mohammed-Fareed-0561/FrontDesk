/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*.e2b.app", "*.e2b.dev"],
      allowedForwardedHosts: ["*.e2b.app", "*.e2b.dev"],
    },
  },
};

module.exports = nextConfig;
