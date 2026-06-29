import { ApiReference } from "@scalar/nextjs-api-reference";

const config = {
    url: "/api/openapi.json",
};

const notFound = (): Response => new Response(null, { status: 404 });

export const GET = process.env.NODE_ENV === "production" ? notFound : ApiReference(config);
