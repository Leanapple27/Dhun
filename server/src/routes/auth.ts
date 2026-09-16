import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { auth, AuthRequest } from '../middleware/auth';
import { userService } from '../services/userService';

const router = Router();

const generateTokens = (userId: string) => {
  const token = jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return { token, refreshToken };
};

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, username, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const existing = await userService.findByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userService.createUser({
      email,
      password: hashedPassword,
      username: username || name || email.split('@')[0]
    });

    const tokens = generateTokens(user.id);
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username || email.split('@')[0],
          avatar: user.googleAvatar
        },
        ...tokens
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await userService.findByEmail(email);
    
    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const tokens = generateTokens(user.id);
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username || email.split('@')[0],
          avatar: user.googleAvatar
        },
        ...tokens
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const { googleId, email, avatar, username, name } = req.body;
    const resolvedEmail = email || 'user@dhun.app';
    const resolvedId = googleId || 'google_' + Date.now();
    
    let user = await userService.findByGoogle(resolvedId, resolvedEmail);

    if (!user) {
      user = await userService.createUser({
        email: resolvedEmail,
        googleId: resolvedId,
        username: username || name || resolvedEmail.split('@')[0],
        googleAvatar: avatar
      });
    } else if (!user.googleId) {
      const updated = await userService.updateGoogle(user.id, {
        googleId: resolvedId,
        email: resolvedEmail,
        avatar
      });
      if (updated) user = updated;
    }

    const tokens = generateTokens(user.id);
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username || user.email.split('@')[0],
          avatar: user.googleAvatar || avatar
        },
        ...tokens
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'No refresh token' });

    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { id: string };
    const tokens = generateTokens(decoded.id);
    res.json({ success: true, data: tokens });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

router.get('/me', auth, (req: AuthRequest, res) => {
  const user = req.user;
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      username: user.username || user.email.split('@')[0],
      avatar: user.googleAvatar || user.avatar
    }
  });
});

export default router;
