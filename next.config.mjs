/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/timeline", destination: "/calendario", permanent: false },
      { source: "/whatsapp", destination: "/settings", permanent: false },
      { source: "/deals", destination: "/ventas", permanent: false },
      { source: "/deals/:path*", destination: "/ventas/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
