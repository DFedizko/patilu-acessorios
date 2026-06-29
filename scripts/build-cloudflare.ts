import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const SCHEMA_PATH = "prisma/schema.prisma";
const OUTPUT_LINE = 'output        = "../src/generated/prisma"';
const WORKERD_LINE = `${OUTPUT_LINE}\n    runtime       = "workerd"`;

const run = (command: string): void => {
    execSync(command, { stdio: "inherit" });
};

const baseSchema = readFileSync(SCHEMA_PATH, "utf8").replace(/\n\s*runtime\s*=\s*"[^"]*"/g, "");
const workerdSchema = baseSchema.replace(OUTPUT_LINE, WORKERD_LINE);

try {
    console.log("Generating Prisma client for the workerd runtime...");
    writeFileSync(SCHEMA_PATH, workerdSchema);
    run("bunx prisma generate");
    console.log("Building the app for Cloudflare Workers...");
    run("bunx opennextjs-cloudflare build");
} finally {
    writeFileSync(SCHEMA_PATH, baseSchema);
    run("bunx prisma generate");
}
