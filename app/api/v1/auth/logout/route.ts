// app/api/v1/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  // Clear the accessToken cookie
  response.cookies.delete('accessToken');
  
  return response;
}

