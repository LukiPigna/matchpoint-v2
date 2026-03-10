import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import type { CreateClubInput, UpdateClubInput } from '../schemas/club.schemas.js';

const clubSelect = {
  id: true, name: true, description: true, zone: true,
  imageUrl: true, isPrivate: true, createdAt: true,
  _count: { select: { members: true } },
};

export const clubService = {

  // ── List clubs ─────────────────────────────────────────────────────────────────────
  async listClubs(zone?: string, search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { isPrivate: false };
    if (zone) where.zone = zone;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [clubs, total] = await prisma.$transaction([
      prisma.club.findMany({ where, select: clubSelect, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.club.count({ where }),
    ]);
    return { clubs, total, page, totalPages: Math.ceil(total / limit) };
  },

  // ── Get club ─────────────────────────────────────────────────────────────────────────
  async getClubById(clubId: string, requesterId?: string) {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true, skillLevel: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
    if (!club) throw AppError.notFound('Club no encontrado');

    if (club.isPrivate && requesterId) {
      const isMember = club.members.some((m) => m.userId === requesterId);
      if (!isMember) throw AppError.forbidden('Este club es privado');
    }
    return club;
  },

  // ── Create club ────────────────────────────────────────────────────────────────────
  async createClub(userId: string, data: CreateClubInput) {
    return prisma.club.create({
      data: {
        ...data,
        ownerId: userId,
        members: {
          create: { userId, role: 'ADMIN' },
        },
      },
      select: clubSelect,
    });
  },

  // ── Update club ────────────────────────────────────────────────────────────────────
  async updateClub(clubId: string, userId: string, data: UpdateClubInput) {
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw AppError.notFound('Club no encontrado');
    if (club.ownerId !== userId) throw AppError.forbidden('Solo el dueño puede editar el club');

    return prisma.club.update({
      where: { id: clubId },
      data,
      select: clubSelect,
    });
  },

  // ── Delete club ────────────────────────────────────────────────────────────────────
  async deleteClub(clubId: string, userId: string) {
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw AppError.notFound('Club no encontrado');
    if (club.ownerId !== userId) throw AppError.forbidden('Solo el dueño puede eliminar el club');

    await prisma.club.delete({ where: { id: clubId } });
    return { message: 'Club eliminado correctamente' };
  },

  // ── Join club ──────────────────────────────────────────────────────────────────────
  async joinClub(clubId: string, userId: string) {
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw AppError.notFound('Club no encontrado');
    if (club.isPrivate) throw AppError.forbidden('Este club es privado. Necesitás una invitación');

    const existing = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });
    if (existing) throw AppError.conflict('Ya sos miembro de este club');

    return prisma.clubMember.create({
      data: { clubId, userId, role: 'MEMBER' },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  },

  // ── Leave club ─────────────────────────────────────────────────────────────────────
  async leaveClub(clubId: string, userId: string) {
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw AppError.notFound('Club no encontrado');
    if (club.ownerId === userId) throw AppError.badRequest('El dueño no puede abandonar el club. Transferí la propiedad primero');

    const member = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });
    if (!member) throw AppError.notFound('No sos miembro de este club');

    await prisma.clubMember.delete({ where: { clubId_userId: { clubId, userId } } });
    return { message: 'Saliste del club correctamente' };
  },

  // ── Get my clubs ───────────────────────────────────────────────────────────────────
  async getUserClubs(userId: string) {
    return prisma.clubMember.findMany({
      where: { userId },
      include: { club: { select: clubSelect } },
      orderBy: { joinedAt: 'desc' },
    });
  },
};
