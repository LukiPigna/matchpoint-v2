import { Request, Response, NextFunction } from 'express';
import { venueService } from '../services/venue.service.js';
import { createVenueSchema, updateVenueSchema, createCourtSchema, updateCourtSchema } from '../schemas/venue.schemas.js';
import type { AuthRequest } from '../middleware/auth.js';

export const venueController = {

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { zone, page, limit } = req.query;
      const result = await venueService.list({
        zone: zone as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const venue = await venueService.getById(req.params.id);
      res.json({ success: true, data: venue });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createVenueSchema.parse(req.body);
      const venue = await venueService.create(data);
      res.status(201).json({ success: true, data: venue });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateVenueSchema.parse(req.body);
      const venue = await venueService.update(req.params.id, data);
      res.json({ success: true, data: venue });
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await venueService.delete(req.params.id);
      res.json({ success: true, message: 'Venue eliminado' });
    } catch (err) { next(err); }
  },

  async availability(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;
      if (!date) throw new Error('date requerido');
      const slots = await venueService.getAvailability(req.params.id, date as string);
      res.json({ success: true, data: slots });
    } catch (err) { next(err); }
  },

  // ── Courts ──────────────────────────────────────────────────────────────────
  async addCourt(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCourtSchema.parse(req.body);
      const court = await venueService.addCourt(req.params.id, data);
      res.status(201).json({ success: true, data: court });
    } catch (err) { next(err); }
  },

  async updateCourt(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateCourtSchema.parse(req.body);
      const court = await venueService.updateCourt(req.params.courtId, data);
      res.json({ success: true, data: court });
    } catch (err) { next(err); }
  },

  async removeCourt(req: Request, res: Response, next: NextFunction) {
    try {
      await venueService.deleteCourt(req.params.courtId);
      res.json({ success: true, message: 'Cancha eliminada' });
    } catch (err) { next(err); }
  },
};
