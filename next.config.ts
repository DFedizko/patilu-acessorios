import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
    turbopack: {
        root: import.meta.dirname,
    },
    reactCompiler: true,
};

initOpenNextCloudflareForDev();

export default nextConfig;
