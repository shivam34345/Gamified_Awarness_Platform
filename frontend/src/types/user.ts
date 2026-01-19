export interface User {
    _id: string;
    id: string;
    username: string;
    email: string;
    avatarId: string;
    totalStars: number;
    currentRegion?: string;
    progress: { levelId: string; status: string; stars: number }[];
    xp: number;
    level?: number;
    accuracy: number;
    badges: string[];
    streak: { count: number; lastLogin: string };
    dailyQuests?: any[];
    currency?: number;
    // New profile fields
    location?: string;
    bio?: string;
    aboutMe?: string;
    achievements?: { title: string; date: string; description: string }[];
    topSkills?: string[];
    volunteeringExperience?: { role: string; organization: string; startDate: string; endDate?: string; description: string }[];
}
