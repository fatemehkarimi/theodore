/** @type {import('next').NextConfig} */
import nextra from 'nextra';

const withNextra = nextra({
  contentDirBasePath: '/docs',
  defaultShowCopyCode: true,
});

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
};

export default withNextra(nextConfig);
