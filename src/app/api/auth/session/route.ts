import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get the most recent session
    const session = await prisma.session.findFirst({
      where: {
        expires: {
          gt: new Date() // Only get non-expired sessions
        }
      },
      orderBy: {
        created: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            department: true
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}