import { Request, Response, NextFunction } from 'express';
import { clubService } from '../services/club.service.js';
import { createClubSchema, updateClubSchema } from '../schemas/club.schemas.js';
import type { AuthRequest } from '../middleware/auth.js';

export const clubController = {

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { zone, page, limit } = req.query;
      const result = await clubService.list({
        zone: zone as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const club = await clubService.getById(req.params.id);
      res.json({ success: true, data: club });
    } catch (err) { next(err); }
  },

  async myClubs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const clubs = await clubService.getUserClubs(userId);
      res.json({ success: true, data: clubs });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const data = createClubSchema.parse(req.body);
      const club = await clubService.create(userId, data);
      res.status(201).json({ success: true, data: club });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const userRole = (req as AuthRequest).userRole;
      const data = updateClubSchema.parse(req.body);
      const club = await clubService.update(req.params.id, userId, userRole, data);
      res.json({ success: true, data: club });
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const userRole = (req as AuthRequest).userRole;
      await clubService.delete(req.params.id, userId, userRole);
      res.json({ success: true, message: 'Club eliminado' });
    } catch (err) { next(err); }
  },

  async join(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const member = await clubService.join(req.params.id, userId);
      res.status(201).json({ success: true, data: member });
    } catch (err) { next(err); }
  },

  async leave(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      await clubService.leave(req.params.id, userId);
      res.json({ success: true, message: 'Saliste del club' });
    } catch (err) { next(err); }
  },

  async members(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await clubService.getMembers(req.params.id);
      res.json({ success: true, data: members });
    } catch (err) { next(err); }
  },
};
