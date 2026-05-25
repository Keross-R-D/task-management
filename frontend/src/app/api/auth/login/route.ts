import { setCookieSession } from "ikoncomponents";
import { NextResponse } from "next/server";


const auth_service_url = `${process.env.BASE_API_URL}/platform/auth`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userlogin, password, credentialType } = body;

    if (!userlogin || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const loginDetails = {
      userlogin,
      password,
      credentialType,
    };

    const url = `${auth_service_url}/login`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginDetails),
    });

    const data = await response.json();

    if (data?.status === "Failure") {
      throw new Error(data.message);
    }

    const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = data;

    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json(
        { message: "Token not provided or invalid" },
        { status: 400 }
      );
    }

    // Set the cookie
    await setCookieSession("accessToken", accessToken, { maxAge: expiresIn });
    await setCookieSession("refreshToken", refreshToken, { maxAge: refreshExpiresIn });

    return NextResponse.json({ success: true, message: "Login successful!" });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
