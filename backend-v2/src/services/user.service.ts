import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import bcrypt from 'bcryptjs';

const userPublicSelect = {
  id: true, name: true, email: true, avatarUrl: true,
  zone: true, skillLevel: true, role: true,
  createdAt: true,
};

export const userService = {

  // ── Get profile ───────────────────────────────────────────────────────────────────
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...userPublicSelect,
        _count: { select: { bookingsOwned: true, friendshipsA: true } },
      },
    });
    if (!user) throw AppError.notFound('Usuario no encontrado');
    return user;
  },

  // ── Update profile ───────────────────────────────────────────────────────────────────
  async updateProfile(userId: string, data: {
    name?: string;
    avatarUrl?: string;
    zone?: string;
    skillLevel?: string;
  }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: userPublicSelect,
    });
  },

  // ── Change password ──────────────────────────────────────────────────────────────────
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('Usuario no encontrado');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw AppError.badRequest('Contraseña actual incorrecta');

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { message: 'Contraseña actualizada correctamente' };
  },

  // ── Search users ───────────────────────────────────────────────────────────────────
  async searchUsers(query: string, zone?: string, limit = 20) {
    return prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          zone ? { zone: zone as any } : {},
        ],
      },
      select: { id: true, name: true, avatarUrl: true, zone: true, skillLevel: true },
      take: limit,
    });
  },

  // ── Friendships ────────────────────────────────────────────────────────────────────
  async sendFriendRequest(fromId: string, toId: string) {
    if (fromId === toId) throw AppError.badRequest('No podés enviarte una solicitud a vos mismo');

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: fromId, userBId: toId },
          { userAId: toId, userBId: fromId },
        ],
      },
    });
    if (existing) throw AppError.conflict('Ya existe una relación entre estos usuarios');

    return prisma.friendship.create({
      data: { userAId: fromId, userBId: toId, status: 'PENDING' },
    });
  },

  async respondFriendRequest(friendshipId: string, userId: string, accept: boolean) {
    const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship) throw AppError.notFound('Solicitud no encontrada');
    if (friendship.userBId !== userId) throw AppError.forbidden('No podés responder esta solicitud');
    if (friendship.status !== 'PENDING') throw AppError.badRequest('La solicitud ya fue respondida');

    return prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: accept ? 'ACCEPTED' : 'REJECTED' },
    });
  },

  async getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userAId: userId, status: 'ACCEPTED' },
          { userBId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        userA: { select: { id: true, name: true, avatarUrl: true, zone: true, skillLevel: true } },
        userB: { select: { id: true, name: true, avatarUrl: true, zone: true, skillLevel: true } },
      },
    });

    return friendships.map((f) =>
      f.userAId === userId ? f.userB : f.userA
    );
  },

  async getPendingRequests(userId: string) {
    return prisma.friendship.findMany({
      where: { userBId: userId, status: 'PENDING' },
      include: {
        userA: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  },
};
