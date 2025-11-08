/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    domains: ["*"],
  },

  // ? Vi?t l?i du?ng d?n (rewrites) n?u b?n mu?n mapping route
  async rewrites() {
    return [
      {
        source: "/project-details/:slug",
        destination: "/frontend/src/modules/client/pages/Projectdetails",
      },
    ];
  },
};
const serverUrl = process.env.NEXT_PUBLIC_API_URL;

if (!serverUrl?.startsWith("http")) {
  throw new Error("NEXT_PUBLIC_SERVER_URL must start with http:// or https://");
}

// Add rewrites dynamically
nextConfig.rewrites = async () => {
  return [
    {
      source: "/uploads/:path*",
      destination: `${serverUrl}/uploads/:path*`,
    },
    {
      source: "/imageapi/:path*",
      destination: `${serverUrl}/imageapi/:path*`,
    },
  ];
};

module.exports = nextConfig;
