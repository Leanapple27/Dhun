import { Router } from 'express';
import axios from 'axios';
import { multiPipeRouter } from '../services/multiPipeRouter';
import { pipedService } from '../services/pipedService';

const router = Router();

router.get('/suggestions', async (req, res, next) => {
  try {
    const query = req.query.q as string;
    if (!query || !query.trim()) {
      return res.json({ success: true, data: [] });
    }

    const response = await axios.get('https://suggestqueries.google.com/complete/search', {
      params: {
        client: 'firefox',
        ds: 'yt',
        q: query.trim()
      },
      timeout: 3000
    });

    const suggestions = Array.isArray(response.data?.[1]) ? response.data[1].slice(0, 8) : [];
    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.q as string;
    const filter = (req.query.filter as any) || 'all';
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const results = await multiPipeRouter.searchParallel(query, filter);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

router.get('/stream/:videoId', async (req, res, next) => {
  try {
    const videoId = req.params.videoId;
    const streamInfo = await multiPipeRouter.getStream(videoId);
    res.json({ success: true, data: streamInfo });
  } catch (error) {
    next(error);
  }
});

router.get('/trending', async (req, res, next) => {
  try {
    const region = (req.query.region as string) || 'IN';
    const category = (req.query.category as string) || 'india';
    
    let searchQuery = 'Trending Bollywood Songs';
    if (category === 'global' || region === 'GLOBAL' || region === 'US') {
      searchQuery = 'Billboard Hot 100 Hits 2025';
    } else if (category === 'punjabi') {
      searchQuery = 'Punjabi Top Trending Songs';
    } else if (category === 'bollywood') {
      searchQuery = 'Latest Bollywood Hits Songs';
    } else if (category === 'pop') {
      searchQuery = 'Top Global Pop Hits';
    } else if (category === 'india') {
      searchQuery = 'Trending Songs India Top Hits';
    }

    const raw = await multiPipeRouter.searchParallel(searchQuery, 'music_songs');
    // Filter out 1-hour/continuous DJ mixes; keep normal songs between 60s and 600s
    const validSongs = (raw || []).filter((t: any) => !t.duration || (t.duration >= 45 && t.duration <= 600));
    res.json({ success: true, data: validSongs.slice(0, 20) });
  } catch (error) {
    next(error);
  }
});

router.get('/artist/:id', async (req, res, next) => {
  try {
    const instanceUrl = multiPipeRouter.getHealthyInstance();
    const channel = await pipedService.getChannel(instanceUrl, req.params.id);
    res.json({ success: true, data: channel });
  } catch (error) {
    next(error);
  }
});

router.get('/album/:id', async (req, res, next) => {
  try {
    const instanceUrl = multiPipeRouter.getHealthyInstance();
    const playlist = await pipedService.getPlaylist(instanceUrl, req.params.id);
    res.json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
});

export default router;
