import { getServerSession } from 'next-auth';
import { authOptions } from './config';
import { NextRequest } from 'next/server';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }
  return session.user;
}

export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user.id;
}

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }
  return session.user.id;
}