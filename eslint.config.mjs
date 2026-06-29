import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        files: ["src/**/*.{ts,tsx}"],
        extends: [betterTailwindcss.configs.recommended],
        settings: {
            "better-tailwindcss": {
                entryPoint: "src/app/globals.css",
            },
        },
        rules: {
            // Prettier owns line wrapping/formatting; avoid conflicts.
            "better-tailwindcss/enforce-consistent-line-wrapping": "off",
        },
    },
    prettierRecommended,
    {
        rules: {
            complexity: ["error", 10],
        },
    },
    globalIgnores([
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        "src/generated/**",
    ]),
]);

export default eslintConfig;
