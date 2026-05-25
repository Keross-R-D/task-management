import { clearAllCookieSession, getCookieSession } from "ikoncomponents";
import { NextRequest, NextResponse } from "next/server";


export default async function proxy(req: NextRequest) {
    const nextResponse = NextResponse.next();

    const accessToken = await getCookieSession("accessToken");
    const refreshToken = await getCookieSession("refreshToken");

    if (!accessToken && !refreshToken) {
        await clearAllCookieSession();
        return NextResponse.redirect(
            new URL(process.env.LOGIN_PAGE_URL || "/login.html", req.url)
        );
    }

    return nextResponse;
}

export const config = {
    matcher: ["/((?!_next|assets|api|login.css|login.js|login.html).*)"], // Exclude static and API routes
};
