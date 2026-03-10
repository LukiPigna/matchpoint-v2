import { z } from 'zod';
import { Zone } from '@prisma/client';

export const createClubSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  zone: z.nativeEnum(Zone),
  imageUrl: z.string().url().optional(),
  isPrivate: z.boolean().default(false),
});

export const updateClubSchema = createClubSchema.partial();

export const createTournamentSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  maxParticipants: z.coerce.number().int().min(2).max(128),
  format: z.enum(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS']),
  prizeDescription: z.string().max(200).optional(),
  entryFee: z.coerce.number().min(0).optional(),
  venueId: z.string().cuid().optional(),
  clubId: z.string().cuid().optional(),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  { message: 'La fecha de inicio debe ser antes que la de fin', path: ['endDate'] }
);

export const updateTournamentSchema = createTournamentSchema.partial();

export type CreateClubInput = z.infer<typeof createClubSchema>;
export type UpdateClubInput = z.infer<typeof updateClubSchema>;
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;
