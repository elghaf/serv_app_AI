import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Delete the user's session from Prisma
    await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        sessions: {
          deleteMany: {} // This will delete all sessions for the user
        }
      }
    });

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Error during logout' },
      { status: 500 }
    );
  }
}