import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.schemas.js';

const SALT_ROUNDS = 12;

function signAccessToken(userId: string, role: string) {
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as string,
  });
}

function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as string,
  });
}

export async function registerUser(data: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw AppError.conflict('El email ya esta registrado');

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      zone: data.zone,
    },
    select: { id: true, name: true, email: true, role: true, zone: true, createdAt: true },
  });

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user, accessToken, refreshToken };
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw AppError.unauthorized('Credenciales invalidas');

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw AppError.unauthorized('Credenciales invalidas');

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshAccessToken(token: string) {
  let payload: { sub: string };
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
  } catch {
    throw AppError.unauthorized('Refresh token invalido o expirado');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw AppError.unauthorized('Refresh token revocado o expirado');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw AppError.unauthorized('Usuario no encontrado');

  const newAccessToken = signAccessToken(user.id, user.role);
  return { accessToken: newAccessToken };
}

export async function logoutUser(token: string) {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revokedAt: new Date() },
  });
}
