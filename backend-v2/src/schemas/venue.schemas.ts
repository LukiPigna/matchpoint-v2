import { z } from 'zod';
import { Zone } from '@prisma/client';

export const createVenueSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5).max(200),
  zone: z.nativeEnum(Zone),
  description: z.string().max(500).optional(),
  amenities: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  openTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM'),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM'),
  phone: z.string().optional(),
  instagram: z.string().optional(),
});

export const updateVenueSchema = createVenueSchema.partial();

export const createCourtSchema = z.object({
  name: z.string().min(1).max(50),
  surface: z.string().min(2).max(50),
  indoorOutdoor: z.enum(['INDOOR', 'OUTDOOR']),
  pricePerHour: z.coerce.number().positive(),
  imageUrl: z.string().url().optional(),
});

export const updateCourtSchema = createCourtSchema.partial();

export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;
export type CreateCourtInput = z.infer<typeof createCourtSchema>;
export type UpdateCourtInput = z.infer<typeof updateCourtSchema>;
