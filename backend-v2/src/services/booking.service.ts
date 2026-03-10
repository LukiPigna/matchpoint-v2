import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import type { CreateBookingInput, UpdateBookingResultInput } from '../schemas/booking.schemas.js';

export const bookingService = {

  // ── List bookings for a user ─────────────────────────────────────────────────────
  async getUserBookings(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { players: { some: { userId } } },
          ],
        },
        include: {
          court: { include: { venue: { select: { id: true, name: true, address: true } } } },
          players: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
          result: true,
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({
        where: {
          OR: [
            { ownerId: userId },
            { players: { some: { userId } } },
          ],
        },
      }),
    ]);
    return { bookings, total, page, totalPages: Math.ceil(total / limit) };
  },

  // ── Get single booking ───────────────────────────────────────────────────────────────
  async getBookingById(bookingId: string, requesterId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        court: { include: { venue: true } },
        owner: { select: { id: true, name: true, avatarUrl: true } },
        players: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        result: true,
      },
    });
    if (!booking) throw AppError.notFound('Reserva no encontrada');
    const isParticipant = booking.ownerId === requesterId ||
      booking.players.some((p) => p.userId === requesterId);
    if (!isParticipant) throw AppError.forbidden('No tenés acceso a esta reserva');
    return booking;
  },

  // ── Create booking ───────────────────────────────────────────────────────────────────
  async createBooking(userId: string, data: CreateBookingInput) {
    const court = await prisma.court.findUnique({
      where: { id: data.courtId },
      include: { venue: true },
    });
    if (!court) throw AppError.notFound('Cancha no encontrada');
    if (!court.isActive) throw AppError.badRequest('La cancha no está disponible');

    // Parse date + times
    const bookingDate = new Date(data.date);
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    const startDt = new Date(bookingDate);
    startDt.setHours(startH, startM, 0, 0);
    const endDt = new Date(bookingDate);
    endDt.setHours(endH, endM, 0, 0);

    if (endDt <= startDt) throw AppError.badRequest('El horario de fin debe ser posterior al de inicio');

    // Check availability
    const conflict = await prisma.booking.findFirst({
      where: {
        courtId: data.courtId,
        date: bookingDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          { startTime: { lt: endDt }, endTime: { gt: startDt } },
        ],
      },
    });
    if (conflict) throw AppError.conflict('La cancha ya está reservada en ese horario');

    // Calculate price
    const durationHours = (endDt.getTime() - startDt.getTime()) / 3_600_000;
    const totalPrice = court.pricePerHour * durationHours;

    const booking = await prisma.booking.create({
      data: {
        courtId: data.courtId,
        ownerId: userId,
        date: bookingDate,
        startTime: startDt,
        endTime: endDt,
        totalPrice,
        status: 'PENDING',
        players: {
          create: [
            { userId },
            ...(data.playerIds ?? []).filter((id) => id !== userId).map((id) => ({ userId: id })),
          ],
        },
      },
      include: {
        court: { include: { venue: { select: { id: true, name: true } } } },
        players: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      },
    });
    return booking;
  },

  // ── Cancel booking ───────────────────────────────────────────────────────────────────
  async cancelBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw AppError.notFound('Reserva no encontrada');
    if (booking.ownerId !== userId) throw AppError.forbidden('Solo el creador puede cancelar la reserva');
    if (booking.status === 'CANCELLED') throw AppError.badRequest('La reserva ya está cancelada');
    if (booking.status === 'COMPLETED') throw AppError.badRequest('No se puede cancelar una reserva completada');

    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });
  },

  // ── Submit result ────────────────────────────────────────────────────────────────────
  async submitResult(bookingId: string, userId: string, data: UpdateBookingResultInput) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { players: true },
    });
    if (!booking) throw AppError.notFound('Reserva no encontrada');
    const isParticipant = booking.ownerId === userId ||
      booking.players.some((p) => p.userId === userId);
    if (!isParticipant) throw AppError.forbidden('Solo los participantes pueden cargar el resultado');
    if (booking.status !== 'CONFIRMED') throw AppError.badRequest('La reserva debe estar confirmada para cargar resultado');

    const result = await prisma.bookingResult.upsert({
      where: { bookingId },
      create: { bookingId, ...data },
      update: { ...data },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED' },
    });

    return result;
  },

  // ── Get court availability ───────────────────────────────────────────────────────────────
  async getCourtAvailability(courtId: string, date: string) {
    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (!court) throw AppError.notFound('Cancha no encontrada');

    const bookingDate = new Date(date);
    const bookings = await prisma.booking.findMany({
      where: {
        courtId,
        date: bookingDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { startTime: true, endTime: true, status: true },
      orderBy: { startTime: 'asc' },
    });
    return { court, date, bookedSlots: bookings };
  },
};
