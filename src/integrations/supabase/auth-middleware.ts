// middleware.js

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const SUPABASE_URL =
    process.env.https://jhpdfrasoxvqfldvrnqe.supabase.co;

  const SUPABASE_ANON_KEY =
    process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpocGRmcmFzb3h2cWZsZHZybnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjQ3MTUsImV4cCI6MjA5Mzc0MDcxNX0.c4fvUkjfHZ8HNf59GErmmAq_9cQYaxy6YDe81wn_LgE;

  // Check environment variables
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new NextResponse(
      "Missing Supabase environment variables",
      { status: 500 }
    );
  }

  // Get Authorization header
  const authHeader =
    request.headers.get("authorization");

  // No auth header
  if (!authHeader) {
    return new NextResponse(
      "Unauthorized: No authorization header provided",
      { status: 401 }
    );
  }

  // Must be Bearer token
  if (!authHeader.startsWith("Bearer ")) {
    return new NextResponse(
      "Unauthorized: Only Bearer tokens are supported",
      { status: 401 }
    );
  }

  // Extract token
  const token = authHeader.replace(
    "Bearer ",
    ""
  );

  if (!token) {
    return new NextResponse(
      "Unauthorized: No token provided",
      { status: 401 }
    );
  }

  // Create Supabase client
  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },

      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  // Verify token
  const { data, error } =
    await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return new NextResponse(
      "Unauthorized: Invalid token",
      { status: 401 }
    );
  }

  // Clone request headers
  const requestHeaders = new Headers(
    request.headers
  );

  // Pass user data forward
  requestHeaders.set(
    "x-user-id",
    data.user.id
  );

  requestHeaders.set(
    "x-user-email",
    data.user.email || ""
  );

  // Continue request
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Protect routes
export const config = {
  matcher: ["/app/:path*"],
};