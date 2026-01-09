import Quest from '../models/Quest.js';

export const checkAndAdvanceQuest = async (user: any, criteriaType: string, amount: number = 1) => {
    let questUpdated = false;
    const currentQuestIds = user.dailyQuests.map((q: any) => q.questId);
    // Find quests by _id using the stored ObjectIds
    const questDefs = await Quest.find({ _id: { $in: currentQuestIds } });

    for (const uq of user.dailyQuests) {
        if (uq.isClaimed) continue;

        // Compare ObjectIds via string conversion
        const def = questDefs.find(d => d._id.toString() === uq.questId.toString());
        if (!def) continue;

        if (def.criteria.type === criteriaType) {
            uq.progress += amount;

            if (uq.progress >= def.criteria.target && !uq.isClaimed) {
                uq.isClaimed = true;
                user.xp += def.xpReward;
                questUpdated = true;
            } else {
                questUpdated = true;
            }
        }
    }
    return questUpdated;
};
