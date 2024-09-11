/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/stake",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
