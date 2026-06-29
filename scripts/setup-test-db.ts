import { execSync } from "node:child_process";

const TEST_DB_SUFFIX = "_test";
const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? "";
const match = testDatabaseUrl.match(/\/([^/?]+)(\?|$)/);
const databaseName = match?.[1] ?? "";

if (!testDatabaseUrl) {
    console.error("TEST_DATABASE_URL não está definido. Defina no .env (ou no ambiente de CI).");
    process.exit(1);
}

if (!databaseName.endsWith(TEST_DB_SUFFIX)) {
    console.error(
        `Recusando: TEST_DATABASE_URL aponta para "${databaseName}", que não termina em "${TEST_DB_SUFFIX}". ` +
            "Use um banco de teste dedicado para não destruir dados reais.",
    );
    process.exit(1);
}

console.log(`Preparando banco de teste "${databaseName}" (migrate deploy)...`);
execSync("bunx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
});
console.log("Banco de teste pronto.");
