import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/booking.service.js';
import { createBookingSchema, updateBookingResultSchema } from '../schemas/booking.schemas.js';
import type { AuthRequest } from '../middleware/auth.js';

export const bookingController = {

  async myBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const { page, limit, upcoming } = req.query;
      const result = await bookingService.getUserBookings(userId, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        upcoming: upcoming === 'true',
      });
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const booking = await bookingService.getById(req.params.id, userId);
      res.json({ success: true, data: booking });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const data = createBookingSchema.parse(req.body);
      const booking = await bookingService.create(userId, data);
      res.status(201).json({ success: true, data: booking });
    } catch (err) { next(err); }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const userRole = (req as AuthRequest).userRole;
      const booking = await bookingService.cancel(req.params.id, userId, userRole);
      res.json({ success: true, data: booking });
    } catch (err) { next(err); }
  },

  async setResult(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const data = updateBookingResultSchema.parse(req.body);
      const result = await bookingService.setResult(req.params.id, userId, data);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async courtAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;
      if (!date) throw new Error('date requerido');
      const slots = await bookingService.getCourtAvailability(
        req.params.courtId,
        date as string,
      );
      res.json({ success: true, data: slots });
    } catch (err) { next(err); }
  },
};
