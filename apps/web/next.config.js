/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: "http", hostname: "localhost" }, { protocol: "https", hostname: "*.onrender.com" }, { protocol: "https", hostname: "*.r2.cloudflarestorage.com" }] },
};
module.exports = nextConfig;
