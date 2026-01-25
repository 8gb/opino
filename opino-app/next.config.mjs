/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['antd'],
  async headers() {
    return [
      {
        source: '/main.js',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
