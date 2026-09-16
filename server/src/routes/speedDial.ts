import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const slots = await prisma.speedDial.findMany({
      where: { userId: req.user.id },
      orderBy: { slot: 'asc' }
    });
    res.json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
});

router.put('/:slot', async (req: AuthRequest, res, next) => {
  try {
    const slot = parseInt(req.params.slot as string, 10);
    const { videoId, type, targetId, title, thumbnail } = req.body;

    const existing = await prisma.speedDial.findFirst({
      where: { userId: req.user.id, slot }
    });

    let result;
    if (existing) {
      result = await prisma.speedDial.update({
        where: { id: existing.id },
        data: { videoId, type, targetId, title, thumbnail }
      });
    } else {
      result = await prisma.speedDial.create({
        data: {
          userId: req.user.id,
          slot, videoId, type, targetId, title, thumbnail
        }
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.delete('/:slot', async (req: AuthRequest, res, next) => {
  try {
    const slot = parseInt(req.params.slot as string, 10);
    await prisma.speedDial.deleteMany({
      where: { userId: req.user.id, slot }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
