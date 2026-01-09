import { auth } from '../middleware/auth.js';
import router from './auth.routes.js';
import { getWorldMap , getLevel, completeLevel } from '@/controllers/level.controller.js';
import { getDailyQuests } from '@/controllers/quest.controller.js';
import { getUserProgress, getLeaderboard , submitFeedback} from '@/controllers/user.controller.js';
import { awardChallengeXP } from '@/controllers/challenge.controller.js';


router.get('/map', getWorldMap);
router.get('/progress', auth, getUserProgress);
router.post('/level/complete', auth, completeLevel);
router.get('/level/:id', auth, getLevel); // New route
router.get('/leaderboard', getLeaderboard);
router.get('/daily-quests', auth, getDailyQuests);
router.post('/feedback', auth, submitFeedback);
router.post('/challenge/complete', auth, awardChallengeXP); // New route

export default router;