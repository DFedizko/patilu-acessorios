const TEST_DB_SUFFIX = "_test";
const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? "";
const match = testDatabaseUrl.match(/\/([^/?]+)(\?|$)/);
const databaseName = match?.[1] ?? "";

const abort = (lines: string[]): never => {
    console.error(
        [
            "",
            "==========================================================================",
            ...lines,
            "==========================================================================",
            "",
        ].join("\n"),
    );
    process.exit(1);
};

if (!testDatabaseUrl) {
    abort([
        " ABORTADO: TEST_DATABASE_URL não está definido.",
        "   Os testes batem num banco real (truncate antes de cada teste) e precisam de um",
        "   banco de teste dedicado. Defina TEST_DATABASE_URL (nome terminando em _test) no",
        "   seu .env ou no ambiente de CI. Ex.: postgresql://user:pass@host:5432/patilu_test",
    ]);
}

if (!databaseName.endsWith(TEST_DB_SUFFIX)) {
    abort([
        " ABORTADO: TEST_DATABASE_URL não aponta para um banco de teste.",
        `   Banco "${databaseName || "(vazio)"}" não termina em "${TEST_DB_SUFFIX}". Recusando para`,
        "   não truncar dados reais. Aponte TEST_DATABASE_URL para um banco de teste dedicado.",
    ]);
}
