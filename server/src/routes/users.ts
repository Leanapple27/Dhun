import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/liked', async (req: AuthRequest, res, next) => {
  try {
    const liked = await prisma.likedTrack.findMany({
      where: { userId: req.user.id },
      orderBy: { likedAt: 'desc' }
    });
    res.json({ success: true, data: liked });
  } catch (error) {
    next(error);
  }
});

router.post('/liked/:videoId', async (req: AuthRequest, res, next) => {
  try {
    const videoId = req.params.videoId as string;
    const existing = await prisma.likedTrack.findFirst({
      where: { userId: req.user.id, videoId }
    });

    if (existing) {
      await prisma.likedTrack.delete({ where: { id: existing.id } });
      return res.json({ success: true, data: { liked: false } });
    }

    const { title, artist, thumbnail, duration } = req.body;
    await prisma.likedTrack.create({
      data: {
        userId: req.user.id,
        videoId, title, artist, thumbnail, duration
      }
    });
    res.json({ success: true, data: { liked: true } });
  } catch (error) {
    next(error);
  }
});

export default router;
