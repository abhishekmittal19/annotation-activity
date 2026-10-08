import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://ian8vvr5zg.execute-api.eu-north-1.amazonaws.com/api"
    : "http://localhost:4000/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: body.name,
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

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("NEXT REGISTER ERROR:", error);

    return NextResponse.json(
      {
        message: "Registration service unavailable",
      },
      {
        status: 500,
      },
    );
  }
}
