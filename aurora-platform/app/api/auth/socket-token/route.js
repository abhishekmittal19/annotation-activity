import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:4000/api";

export async function POST(request) {
  try {
    const token = request.cookies.get("aurora_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_API_URL}/auth/socket-token`,
      {
        method: "POST",
        headers: {
          Cookie: `aurora_token=${token}`,
        },
        cache: "no-store",
      },
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("SOCKET TOKEN API ERROR:", error);

    return NextResponse.json(
      { message: "Unable to authenticate socket connection" },
      { status: 500 },
    );
  }
}
