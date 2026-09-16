import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { userId: req.user.id },
      include: { _count: { select: { tracks: true } } }
    });
    res.json({ success: true, data: playlists });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const playlist = await prisma.playlist.create({
      data: {
        name: req.body.name,
        userId: req.user.id
      }
    });
    res.json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const playlist = await prisma.playlist.findFirst({
      where: { id, userId: req.user.id },
      include: { tracks: { orderBy: { position: 'asc' } } }
    });
    if (!playlist) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const playlist = await prisma.playlist.updateMany({
      where: { id, userId: req.user.id },
      data: { name: req.body.name }
    });
    res.json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    await prisma.playlist.deleteMany({
      where: { id, userId: req.user.id }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/tracks', async (req: AuthRequest, res, next) => {
  try {
    const playlistId = req.params.id as string;
    const { videoId, title, artist, thumbnail, duration } = req.body;
    const count = await prisma.playlistTrack.count({ where: { playlistId } });
    
    const track = await prisma.playlistTrack.create({
      data: {
        playlistId,
        videoId, title, artist, thumbnail, duration, position: count
      }
    });
    res.json({ success: true, data: track });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/tracks/:trackId', async (req: AuthRequest, res, next) => {
  try {
    const trackId = req.params.trackId as string;
    await prisma.playlistTrack.delete({
      where: { id: trackId }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
