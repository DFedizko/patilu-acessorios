import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type AuthSuccess = { userId: string; errorResponse: null };
type AuthFailure = { userId: null; errorResponse: NextResponse };
type AuthResult = AuthSuccess | AuthFailure;

const DEV_USER_ID = "dev-user";

export const requireAuth = async (): Promise<AuthResult> => {
    if (process.env.NODE_ENV === "development") {
        return { userId: DEV_USER_ID, errorResponse: null };
    }
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
