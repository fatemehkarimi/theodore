/** @type {import('next').NextConfig} */
import nextra from 'nextra';

const withNextra = nextra({
  contentDirBasePath: '/docs',
  defaultShowCopyCode: true,
});

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig = {
  reactStrictMode: true,
  ...(isDevelopment
    ? {
        async rewrites() {
          return [
            {
              source: '/api/:path*',
              destination: 'https://api.theodore-js.dev/:path*',
            },
          ];
        },
      }
    : {
        output: 'export',
      }),
};

export default withNextra(nextConfig);
