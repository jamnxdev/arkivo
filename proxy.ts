import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedPage = createRouteMatcher(["/dashboard(.*)", "/app(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // ONLY protect UI routes
  if (isProtectedPage(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
