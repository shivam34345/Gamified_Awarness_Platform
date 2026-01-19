export interface LevelData {
    _id: string;
    levelNumber: number;
    title: string;
    status: 'locked' | 'unlocked' | 'completed';
    stars: number;
    x: number;
    y: number;
}

export interface RegionData {
    _id: string;
    title: string;
    levels: LevelData[];
    themeColor: string;
    bgGradient?: string;
}
