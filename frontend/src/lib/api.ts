import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
});

// Add a request interceptor to add the token to headers
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('token'); // Changed from 'edu_user' object to simple token storage or extract from it
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// Add a response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.data && error.response.data.message) {
            error.message = error.response.data.message;
        }
        return Promise.reject(error);
    }
);

// Helper methods
export const gameApi = {
    getLeaderboard: () => api.get('/game/leaderboard'),
    getDailyQuests: () => api.get('/game/daily-quests'),
    getMapData: () => api.get('/game/map'), // Reuse existing map endpoint
    completeLevel: (levelId: string, stars: number, solvedPuzzles: string[] = []) => api.post('/game/level/complete', { levelId, stars, solvedPuzzles }),
    getLevel: (levelId: string) => api.get(`/game/level/${levelId}`),
    awardChallengeXP: (levelId: string, gameType: string, challengeIndex: number) => api.post('/game/challenge/complete', { levelId, gameType, challengeIndex }),
    submitFeedback: (message: string) => api.post('/game/feedback', { message }),
    completePuzzle: (solvedPuzzles: string[]) => api.post('/game/puzzle/complete', { solvedPuzzles }),
};

export default api;
