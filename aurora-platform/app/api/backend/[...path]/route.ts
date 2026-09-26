import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://ian8vvr5zg.execute-api.eu-north-1.amazonaws.com/api"
    : "http://localhost:4000/api";

async function proxyRequest(
  request: NextRequest,
  context: {
    params: Promise<{
      path: string[];
    }>;
  },
) {
  try {
    const { path } = await context.params;

    const backendPath = path.join("/");
    const search = request.nextUrl.search;

    const token = request.cookies.get("aurora_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.text();

    const backendResponse = await fetch(
      `${BACKEND_API_URL}/${backendPath}${search}`,
      {
        method: request.method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
        cache: "no-store",
      },
    );

    const responseBody = await backendResponse.text();

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("BACKEND PROXY ERROR:", error);

    return NextResponse.json(
      {
        message: "Backend service unavailable",
      },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
