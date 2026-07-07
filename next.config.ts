import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
    turbopack: {
        root: import.meta.dirname,
    },
    reactCompiler: true,
    serverExternalPackages: ["pg-cloudflare", "pg-native"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "www.clerk.com",
                pathname: "**",
            },
        ],
    },
};

initOpenNextCloudflareForDev();

export default nextConfig;
