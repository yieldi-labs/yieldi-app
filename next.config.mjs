/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/stake/btc",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
