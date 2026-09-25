/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
