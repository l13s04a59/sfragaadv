import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  // cursor/identity.ts (and identity.dev.ts) import sibling modules with a .js
  // extension (Node ESM style). Webpack production builds need the alias so
  // those resolve to the .ts sources without editing the locked identity helper.
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js", ".jsx"],
    };
    return config;
  },
};

export default nextConfig;
