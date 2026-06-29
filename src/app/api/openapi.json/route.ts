import { NextResponse } from "next/server";
import { getOpenApiDocument } from "@/lib/openapi";

export function GET() {
    return NextResponse.json(getOpenApiDocument());
}
