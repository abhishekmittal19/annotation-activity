import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function POST(request: NextRequest) {
  try {
    if (!BACKEND_API_URL) {
      console.error("BACKEND_API_URL is not configured");

      return NextResponse.json(
        {
          message: "BACKEND_API_URL is not configured",
        },
        { status: 500 },
      );
    }

    const body = await request.json();

    console.log("LOGIN ROUTE: Calling backend");
    console.log("LOGIN ROUTE: Backend URL:", BACKEND_API_URL);
    console.log("LOGIN ROUTE: Email:", body.email);

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

    console.log("LOGIN ROUTE: Backend status:", backendResponse.status);

    const responseText = await backendResponse.text();

    console.log("LOGIN ROUTE: Backend response:", responseText);

    let data: any;

    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          message: "Backend returned an invalid response",
          backendStatus: backendResponse.status,
        },
        { status: 500 },
      );
    }

    if (!backendResponse.ok) {
      return NextResponse.json(data, {
        status: backendResponse.status,
      });
    }

    if (!data.token || !data.user) {
      return NextResponse.json(
        {
          message: "Backend login response is missing token or user",
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

    console.log("LOGIN ROUTE: Login successful");

    return response;
  } catch (error) {
    console.error("NEXT LOGIN ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Authentication service unavailable",
      },
      { status: 500 },
    );
  }
}
