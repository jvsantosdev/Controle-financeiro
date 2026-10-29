import { prisma } from './db';
import bcrypt from 'bcryptjs';

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({ where: { email } });
}

export async function createUser(data: { email: string; password: string; name?: string }) {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  return await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  });
}

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}