import type { NextConfig } from "next";
// Force config reload

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  allowedDevOrigins: ["susann-organographical-seema.ngrok-free.dev", "*.ngrok-free.dev", "*.ngrok-free.app"],
  devIndicators: false,
  reactStrictMode: false,
};

export default nextConfig;
