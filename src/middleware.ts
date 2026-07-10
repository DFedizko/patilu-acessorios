import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sso-callback(.*)",
    "/sobre(.*)",
    "/privacidade(.*)",
    "/api/webhooks/(.*)",
]);

const isDevelopment = process.env.NODE_ENV === "development";

export default clerkMiddleware(async (auth, req) => {
    if (isDevelopment) return;
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
        "/__clerk/(.*)",
    ],
};
