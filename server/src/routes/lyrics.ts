import { Router } from 'express';
import { lyricsService } from '../services/lyricsService';
import { multiPipeRouter } from '../services/multiPipeRouter';
import { pipedService } from '../services/pipedService';

const router = Router();

router.get('/:videoId', async (req, res, next) => {
  try {
    const videoId = req.params.videoId as string;
    let title = (req.query.title as string) || '';
    let artist = (req.query.artist as string) || '';
    let duration = req.query.duration ? parseFloat(req.query.duration as string) : undefined;

    // If client didn't supply title/artist, try fetching from stream info safely
    if (!title) {
      try {
        const instanceUrl = multiPipeRouter.getHealthyInstance();
        const streamData = await pipedService.getStream(instanceUrl, videoId);
        if (streamData?.title) {
          title = streamData.title;
          artist = artist || streamData.uploader || '';
          duration = duration || streamData.duration;
        }
      } catch {
        // stream info failed, continue with whatever was provided
      }
    }

    if (!title && !videoId) {
      return res.json({ success: true, data: { syncedLyrics: null, plainLyrics: null } });
    }

    const lyrics = await lyricsService.fetchLyrics(title || videoId, artist, duration);
    res.json({ success: true, data: lyrics });
  } catch (error) {
    // Return empty lyrics gracefully instead of 500
    res.json({ success: true, data: { syncedLyrics: null, plainLyrics: null } });
  }
});

export default router;
