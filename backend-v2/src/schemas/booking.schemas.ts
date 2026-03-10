import { z } from 'zod';

export const createBookingSchema = z.object({
  courtId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM'),
  playerIds: z.array(z.string().cuid()).max(3, 'Maximo 3 jugadores adicionales').optional(),
  notes: z.string().max(300).optional(),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: 'La hora de inicio debe ser antes que la de fin', path: ['endTime'] }
);

export const updateBookingSchema = z.object({
  notes: z.string().max(300).optional(),
  playerIds: z.array(z.string().cuid()).max(3).optional(),
});

export const recordResultSchema = z.object({
  winnerId: z.string().cuid().optional(),
  score: z.string().max(50).optional(),
  notes: z.string().max(300).optional(),
});

export const availabilityQuerySchema = z.object({
  courtId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type RecordResultInput = z.infer<typeof recordResultSchema>;
