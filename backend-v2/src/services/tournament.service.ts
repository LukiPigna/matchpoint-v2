import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

const tournamentSelect = {
  id: true, name: true, description: true, zone: true,
  startDate: true, endDate: true, maxParticipants: true,
  prizeDescription: true, status: true, imageUrl: true, createdAt: true,
  club: { select: { id: true, name: true } },
  _count: { select: { participants: true } },
};

export const tournamentService = {

  // ── List tournaments ──────────────────────────────────────────────────────────────────
  async listTournaments(zone?: string, status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (zone) where.zone = zone;
    if (status) where.status = status;

    const [tournaments, total] = await prisma.$transaction([
      prisma.tournament.findMany({
        where,
        select: tournamentSelect,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
      }),
      prisma.tournament.count({ where }),
    ]);
    return { tournaments, total, page, totalPages: Math.ceil(total / limit) };
  },

  // ── Get tournament ─────────────────────────────────────────────────────────────────────
  async getTournamentById(tournamentId: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        club: { select: { id: true, name: true, imageUrl: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, skillLevel: true } },
          },
          orderBy: { registeredAt: 'asc' },
        },
      },
    });
    if (!tournament) throw AppError.notFound('Torneo no encontrado');
    return tournament;
  },

  // ── Create tournament ──────────────────────────────────────────────────────────────────
  async createTournament(userId: string, data: {
    name: string;
    description?: string;
    zone: string;
    startDate: string;
    endDate: string;
    maxParticipants: number;
    prizeDescription?: string;
    imageUrl?: string;
    clubId?: string;
  }) {
    // If clubId provided, verify ownership or admin role
    if (data.clubId) {
      const member = await prisma.clubMember.findUnique({
        where: { clubId_userId: { clubId: data.clubId, userId } },
      });
      if (!member || member.role !== 'ADMIN') {
        throw AppError.forbidden('Solo admins del club pueden crear torneos');
      }
    }

    return prisma.tournament.create({
      data: {
        name: data.name,
        description: data.description,
        zone: data.zone as any,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        maxParticipants: data.maxParticipants,
        prizeDescription: data.prizeDescription,
        imageUrl: data.imageUrl,
        clubId: data.clubId,
        status: 'UPCOMING',
      },
      select: tournamentSelect,
    });
  },

  // ── Register to tournament ──────────────────────────────────────────────────────────────
  async registerToTournament(tournamentId: string, userId: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { _count: { select: { participants: true } } },
    });
    if (!tournament) throw AppError.notFound('Torneo no encontrado');
    if (tournament.status !== 'UPCOMING') {
      throw AppError.badRequest('El torneo ya no acepta inscripciones');
    }
    if (tournament._count.participants >= tournament.maxParticipants) {
      throw AppError.badRequest('El torneo está completo');
    }

    const existing = await prisma.tournamentParticipant.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
    });
    if (existing) throw AppError.conflict('Ya estás inscripto en este torneo');

    return prisma.tournamentParticipant.create({
      data: { tournamentId, userId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  },

  // ── Unregister from tournament ───────────────────────────────────────────────────────────
  async unregisterFromTournament(tournamentId: string, userId: string) {
    const participant = await prisma.tournamentParticipant.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
    });
    if (!participant) throw AppError.notFound('No estás inscripto en este torneo');

    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (tournament?.status !== 'UPCOMING') {
      throw AppError.badRequest('No podés desinscribirte de un torneo que ya empezó');
    }

    await prisma.tournamentParticipant.delete({
      where: { tournamentId_userId: { tournamentId, userId } },
    });
    return { message: 'Desinscripción exitosa' };
  },

  // ── Update tournament status (admin) ───────────────────────────────────────────────────────
  async updateTournamentStatus(tournamentId: string, status: string) {
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) throw AppError.notFound('Torneo no encontrado');

    return prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: status as any },
      select: tournamentSelect,
    });
  },
};
