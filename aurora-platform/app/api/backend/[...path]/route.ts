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
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    const isReadRequest = request.method === "GET" || request.method === "HEAD";

    const body = isReadRequest ? undefined : await request.arrayBuffer();

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${token}`);

    const contentType = request.headers.get("content-type");

    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    const backendResponse = await fetch(
      `${BACKEND_API_URL}/${backendPath}${search}`,
      {
        method: request.method,
        headers,
        body,
        cache: "no-store",
      },
    );

    const responseBody = await backendResponse.arrayBuffer();

    const responseHeaders = new Headers();
    const responseContentType = backendResponse.headers.get("content-type");

    if (responseContentType) {
      responseHeaders.set("Content-Type", responseContentType);
    }

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("BACKEND PROXY ERROR:", error);

    return NextResponse.json(
      { message: "Backend service unavailable" },
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
