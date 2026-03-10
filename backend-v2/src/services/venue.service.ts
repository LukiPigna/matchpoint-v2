import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import type { CreateVenueInput, UpdateVenueInput, CreateCourtInput, UpdateCourtInput } from '../schemas/venue.schemas.js';
import type { Zone } from '@prisma/client';

const venueSelect = {
  id: true, name: true, address: true, zone: true,
  description: true, amenities: true, imageUrl: true,
  openTime: true, closeTime: true, phone: true, instagram: true,
  ownerId: true, isActive: true, createdAt: true,
  _count: { select: { courts: true } },
};

export async function getVenues(filters?: { zone?: Zone; search?: string }) {
  return prisma.venue.findMany({
    where: {
      isActive: true,
      ...(filters?.zone && { zone: filters.zone }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { address: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    },
    select: venueSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getVenueById(id: string) {
  const venue = await prisma.venue.findUnique({
    where: { id },
    include: {
      courts: { where: { isActive: true }, orderBy: { name: 'asc' } },
      owner: { select: { id: true, name: true, email: true } },
    },
  });
  if (!venue) throw AppError.notFound('Sede no encontrada');
  return venue;
}

export async function createVenue(ownerId: string, data: CreateVenueInput) {
  return prisma.venue.create({
    data: { ...data, ownerId },
    select: venueSelect,
  });
}

export async function updateVenue(id: string, ownerId: string, data: UpdateVenueInput) {
  const venue = await prisma.venue.findUnique({ where: { id } });
  if (!venue) throw AppError.notFound('Sede no encontrada');
  if (venue.ownerId !== ownerId) throw AppError.forbidden('No tienes permiso para editar esta sede');

  return prisma.venue.update({
    where: { id },
    data,
    select: venueSelect,
  });
}

export async function deleteVenue(id: string, ownerId: string) {
  const venue = await prisma.venue.findUnique({ where: { id } });
  if (!venue) throw AppError.notFound('Sede no encontrada');
  if (venue.ownerId !== ownerId) throw AppError.forbidden('No tienes permiso para eliminar esta sede');

  return prisma.venue.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function addCourt(venueId: string, ownerId: string, data: CreateCourtInput) {
  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue) throw AppError.notFound('Sede no encontrada');
  if (venue.ownerId !== ownerId) throw AppError.forbidden('No tienes permiso para agregar canchas');

  return prisma.court.create({ data: { ...data, venueId } });
}

export async function updateCourt(courtId: string, ownerId: string, data: UpdateCourtInput) {
  const court = await prisma.court.findUnique({ where: { id: courtId }, include: { venue: true } });
  if (!court) throw AppError.notFound('Cancha no encontrada');
  if (court.venue.ownerId !== ownerId) throw AppError.forbidden('No tienes permiso para editar esta cancha');

  return prisma.court.update({ where: { id: courtId }, data });
}

export async function deleteCourt(courtId: string, ownerId: string) {
  const court = await prisma.court.findUnique({ where: { id: courtId }, include: { venue: true } });
  if (!court) throw AppError.notFound('Cancha no encontrada');
  if (court.venue.ownerId !== ownerId) throw AppError.forbidden('No tienes permiso para eliminar esta cancha');

  return prisma.court.update({ where: { id: courtId }, data: { isActive: false } });
}
