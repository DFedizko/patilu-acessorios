export const register = () => {
    if (process.env.NODE_ENV === "development") {
        const port = process.env.PORT ?? 3000;
        console.log(`\n  \x1b[36m➜\x1b[0m  Docs: \x1b[4mhttp://localhost:${port}/api/reference\x1b[0m\n`);
    }
};
