import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type AuthSuccess = { userId: string; errorResponse: null };
type AuthFailure = { userId: null; errorResponse: NextResponse };
type AuthResult = AuthSuccess | AuthFailure;

export const requireAuth = async (): Promise<AuthResult> => {
    const { isAuthenticated, userId } = await auth();
    if (!isAuthenticated || !userId) {
        const errorResponse = NextResponse.json(
            { error: { code: "UNAUTHENTICATED", message: "Authentication required" } },
            { status: 401 },
        );
        return { userId: null, errorResponse };
    }
    return { userId, errorResponse: null };
};
