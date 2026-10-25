import { Router } from 'express';
import { registerUser, loginUser, getProfile } from '../services/auth.service.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name || typeof name !== 'string' || !email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'name, email, and password are required.' });
  }

  try {
    const result = await registerUser({ name, email, password });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  try {
    const result = await loginUser({ email, password });
    return res.json(result);
  } catch (error) {
    return res.status(401).json({ error: error instanceof Error ? error.message : 'Login failed' });
  }
});

router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token.' });
  }

  try {
    const result = await getProfile(token);
    return res.json(result);
  } catch (error) {
    return res.status(401).json({ error: error instanceof Error ? error.message : 'Invalid token' });
  }
});

export default router;
