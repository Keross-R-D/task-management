import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  basePath: process.env.BASE_PATH,
  assetPrefix: process.env.BASE_PATH,
  output: "standalone",
  env: {
    BASE_PATH: process.env.BASE_PATH,
    BASE_API_URL: process.env.BASE_API_URL,
    LOGIN_PAGE_URL: process.env.LOGIN_PAGE_URL,
    IKON_PLATFORM_UI_URL: process.env.IKON_PLATFORM_UI_URL,
    APPLICATION_API_URL: process.env.APPLICATION_API_URL,
  },
};

export default nextConfig;
