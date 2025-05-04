import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiResponse } from '@/types/api';

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