import { NextResponse } from "next/server";
import { getOpenApiDocument } from "@/lib/openapi";

const notFound = (): Response => new Response(null, { status: 404 });

const serveDocument = (): Response => NextResponse.json(getOpenApiDocument());

export const GET = process.env.NODE_ENV === "production" ? notFound : serveDocument;
