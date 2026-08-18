import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows testing this local dev server from the current LAN address.
  // Update this value if the computer receives a different local IP address.
  allowedDevOrigins: ["172.20.10.11"],
};

export default nextConfig;
