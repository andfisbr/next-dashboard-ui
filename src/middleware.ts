import { clerkMiddleware, ClerkMiddlewareAuth, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";



const matchers = Object.keys(routeAccessMap).map((route) => ({
        matcher: createRouteMatcher([route]),
        allowedRoles: routeAccessMap[route],
}))


console.log(matchers)


export default clerkMiddleware(async (auth, req) => {

        const { sessionClaims, userId } = await auth()
        const role = (sessionClaims?.metadata as { role?: string })?.role || "default"
        const currentUserId = userId || "-1"



        console.log("middleware >>> role detected: " + role)
        const res = NextResponse.next()
        res.cookies.set("X-User-Role", role, {
                httpOnly: true,
                path: "/",
                secure: false,
                sameSite: "lax"
        })
        res.cookies.set("X-User-ID", currentUserId, {
                httpOnly: true,
                path: "/",
                secure: false,
                sameSite: "lax"
        })
        console.log("response", res)


        for (const { matcher, allowedRoles } of matchers) {
                if (matcher(req) && !allowedRoles.includes(role!)) {
                        const newUrl = new URL(`/${role!}`, req.url)
                        return NextResponse.redirect(newUrl)
                }
        }

        return res
});


export const config = {
        matcher: [
                // Skip Next.js internals and all static files, unless found in search params
                '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
                // Always run for API routes
                '/(api|trpc)(.*)',
        ],
};
