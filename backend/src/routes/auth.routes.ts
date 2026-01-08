import express from 'express';
import { register, login, verifyToken, getMe } from '../controllers/auth.controller.js';

import { auth } from '../middleware/auth.js';

const router: express.Router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', auth, verifyToken);
router.get('/me', auth, getMe);

export default router;
