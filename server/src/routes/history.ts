import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const history = await prisma.listeningHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { playedAt: 'desc' },
      take: limit
    });
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { videoId, title, artist, thumbnail, duration } = req.body;
    const record = await prisma.listeningHistory.create({
      data: {
        userId: req.user.id,
        videoId, title, artist, thumbnail, duration
      }
    });
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
});

export default router;
