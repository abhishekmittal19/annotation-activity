import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://ian8vvr5zg.execute-api.eu-north-1.amazonaws.com/api"
    : "http://localhost:4000/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        otp: body.otp,
      }),
      cache: "no-store",
    });

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("NEXT OTP VERIFICATION ERROR:", error);

    return NextResponse.json(
      { message: "OTP verification service unavailable" },
      { status: 500 },
    );
  }
}
