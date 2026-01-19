
export interface Challenge {
    _id: string;
    type: string;
    gameType: string;
    title: string;
    description?: string;
    video?: string;
    references?: { title: string; url: string }[];
    sticker?: string;
    xp: number;
    difficulty?: string;
    badge?: string;
    data?: any;
    order?: number;
    lawId?: string;
}
