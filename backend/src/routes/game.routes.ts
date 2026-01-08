// ... (previous imports)
import { getWorldMap, getUserProgress, completeLevel, getLeaderboard, getDailyQuests, submitFeedback, completePuzzle } from '../controllers/game.controller.js';
import { auth } from '../middleware/auth.js';
import router from './auth.routes.js';
// ...

router.get('/map', getWorldMap);
router.get('/progress', auth, getUserProgress);
router.post('/level/complete', auth, completeLevel);
router.get('/leaderboard', getLeaderboard);
router.get('/daily-quests', auth, getDailyQuests);
router.post('/feedback', auth, submitFeedback);
router.post('/puzzle/complete', auth, completePuzzle);

export default router;