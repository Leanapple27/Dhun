import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DATA_DIR = path.resolve(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export interface UserRecord {
  id: string;
  email: string;
  password?: string;
  username?: string;
  googleId?: string;
  googleEmail?: string;
  googleAvatar?: string;
  createdAt: string;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create data dir:', err);
  }
}

// Helper: read local users file
function getLocalUsers(): UserRecord[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Error reading local users file:', err);
  }
  return [];
}

// Helper: write local users file
function saveLocalUsers(users: UserRecord[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local users file:', err);
  }
}

export const userService = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) return user as any;
    } catch {
      // Prisma / DB unreachable fallback
    }

    const localUsers = getLocalUsers();
    return localUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findById(id: string): Promise<UserRecord | null> {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (user) return user as any;
    } catch {
      // Fallback
    }

    const localUsers = getLocalUsers();
    return localUsers.find((u) => u.id === id) || null;
  },

  async findByGoogle(googleId: string, email: string): Promise<UserRecord | null> {
    try {
      const user = await prisma.user.findFirst({
        where: { OR: [{ googleId }, { email }] }
      });
      if (user) return user as any;
    } catch {
      // Fallback
    }

    const localUsers = getLocalUsers();
    return (
      localUsers.find(
        (u) => u.googleId === googleId || u.email.toLowerCase() === email.toLowerCase()
      ) || null
    );
  },

  async createUser(data: {
    email: string;
    password?: string;
    username?: string;
    googleId?: string;
    googleAvatar?: string;
  }): Promise<UserRecord> {
    try {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: data.password,
          googleId: data.googleId,
          googleEmail: data.email,
          googleAvatar: data.googleAvatar
        }
      });
      return user as any;
    } catch {
      // Local fallback
    }

    const localUsers = getLocalUsers();
    const newUser: UserRecord = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      email: data.email,
      password: data.password,
      username: data.username || data.email.split('@')[0],
      googleId: data.googleId,
      googleEmail: data.email,
      googleAvatar: data.googleAvatar,
      createdAt: new Date().toISOString()
    };

    localUsers.push(newUser);
    saveLocalUsers(localUsers);
    return newUser;
  },

  async updateGoogle(id: string, data: { googleId: string; email: string; avatar?: string }): Promise<UserRecord | null> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          googleId: data.googleId,
          googleEmail: data.email,
          googleAvatar: data.avatar
        }
      });
      if (user) return user as any;
    } catch {
      // Fallback
    }

    const localUsers = getLocalUsers();
    const idx = localUsers.findIndex((u) => u.id === id);
    if (idx !== -1) {
      localUsers[idx].googleId = data.googleId;
      localUsers[idx].googleEmail = data.email;
      if (data.avatar) localUsers[idx].googleAvatar = data.avatar;
      saveLocalUsers(localUsers);
      return localUsers[idx];
    }
    return null;
  }
};
