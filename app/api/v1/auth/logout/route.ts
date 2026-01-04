import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });

  // Clear the accessToken cookie
  response.cookies.delete('accessToken');

  return response;
}

