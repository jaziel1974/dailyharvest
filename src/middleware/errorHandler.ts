import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiResponse } from '@/types/api';
import { NextRequest } from 'next/server';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return NextResponse.json<ApiResponse<null>>({
      error: 'Validation error',
      data: null,
      success: false
    }, { status: 400 });
  }

  if (error instanceof ValidationError) {
    return NextResponse.json<ApiResponse<null>>({
      error: error.message,
      data: null,
      success: false
    }, { status: 400 });
  }

  if (error instanceof Error) {
    return NextResponse.json<ApiResponse<null>>({
      error: error.message,
      data: null,
      success: false
    }, { status: 500 });
  }

  return NextResponse.json<ApiResponse<null>>({
    error: 'An unexpected error occurred',
    data: null,
    success: false
  }, { status: 500 });
}

// Set the default page to the harvests page
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Redirect to the harvests page if the root URL is accessed
  if (url.pathname === '/') {
    url.pathname = '/harvests';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}