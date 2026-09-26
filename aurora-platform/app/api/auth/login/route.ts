import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://ian8vvr5zg.execute-api.eu-north-1.amazonaws.com/api"
    : "http://localhost:4000/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
      cache: "no-store",
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, {
        status: backendResponse.status,
      });
    }

    if (!data.token || !data.user) {
      return NextResponse.json(
        {
          message: "Invalid login response from authentication server",
        },
        { status: 500 },
      );
    }

    const response = NextResponse.json({
      user: data.user,
    });

    response.cookies.set("aurora_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("NEXT LOGIN ERROR:", error);

    return NextResponse.json(
      {
        message: "Authentication service unavailable",
      },
      { status: 500 },
    );
  }
}
