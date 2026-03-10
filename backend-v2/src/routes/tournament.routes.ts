import { Router } from 'express';
import { tournamentController } from '../controllers/tournament.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', tournamentController.list);
router.get('/:id', tournamentController.getOne);
router.post('/', authenticate, requireRole('ADMIN'), tournamentController.create);
router.patch('/:id/status', authenticate, requireRole('ADMIN'), tournamentController.updateStatus);
router.delete('/:id', authenticate, requireRole('ADMIN'), tournamentController.remove);
router.post('/:id/register', authenticate, tournamentController.register);
router.delete('/:id/unregister', authenticate, tournamentController.unregister);

export default router;
