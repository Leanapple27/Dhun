import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { rateLimit } from './middleware/rateLimit';
import { multiPipeRouter } from './services/multiPipeRouter';

import authRoutes from './routes/auth';
import musicRoutes from './routes/music';
import playlistsRoutes from './routes/playlists';
import lyricsRoutes from './routes/lyrics';
import speedDialRoutes from './routes/speedDial';
import historyRoutes from './routes/history';
import usersRoutes from './routes/users';

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(rateLimit);

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/playlists', playlistsRoutes);
app.use('/api/lyrics', lyricsRoutes);
app.use('/api/speed-dial', speedDialRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/users', usersRoutes);

app.use(errorHandler);

// Initialize piped router health checks
multiPipeRouter.startHealthChecks();

export default app;
