import { NextResponse } from "next/server";
import { DomainError } from "@/server/domain/error/DomainError";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

const INTERNAL_ERROR_CODE = "INTERNAL_ERROR";
const INTERNAL_ERROR_STATUS = 500;

export const toHttpResponse = (error: unknown): NextResponse => {
    if (error instanceof DomainError || error instanceof NotFoundError) {
        return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.httpStatus });
    }
    return NextResponse.json(
        { error: { code: INTERNAL_ERROR_CODE, message: "An unexpected error occurred" } },
        { status: INTERNAL_ERROR_STATUS },
    );
};
