import { Request, Response, NextFunction } from 'express';
import { tournamentService } from '../services/tournament.service.js';
import type { AuthRequest } from '../middleware/auth.js';

export const tournamentController = {

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { zone, status, page, limit } = req.query;
      const result = await tournamentService.list({
        zone: zone as string,
        status: status as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const tournament = await tournamentService.getById(req.params.id);
      res.json({ success: true, data: tournament });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const tournament = await tournamentService.create(userId, req.body);
      res.status(201).json({ success: true, data: tournament });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const userRole = (req as AuthRequest).userRole;
      const tournament = await tournamentService.update(req.params.id, userId, userRole, req.body);
      res.json({ success: true, data: tournament });
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const userRole = (req as AuthRequest).userRole;
      await tournamentService.delete(req.params.id, userId, userRole);
      res.json({ success: true, message: 'Torneo eliminado' });
    } catch (err) { next(err); }
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const participant = await tournamentService.register(req.params.id, userId);
      res.status(201).json({ success: true, data: participant });
    } catch (err) { next(err); }
  },

  async unregister(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      await tournamentService.unregister(req.params.id, userId);
      res.json({ success: true, message: 'Inscripcion cancelada' });
    } catch (err) { next(err); }
  },

  async changeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const userRole = (req as AuthRequest).userRole;
      const { status } = req.body;
      const tournament = await tournamentService.changeStatus(req.params.id, userId, userRole, status);
      res.json({ success: true, data: tournament });
    } catch (err) { next(err); }
  },

  async myTournaments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId;
      const tournaments = await tournamentService.getUserTournaments(userId);
      res.json({ success: true, data: tournaments });
    } catch (err) { next(err); }
  },
};
