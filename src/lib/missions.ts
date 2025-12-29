
export type MissionData = {
    id: string;
    title: string;
    description: string;
    reward: number;
    target: number;
    type: 'easy' | 'medium' | 'hard' | 'expert';
    category: 'read' | 'social' | 'explore' | 'engagement';
};

export const MISSION_POOL: MissionData[] = [
    // 5 Inks - Easy (Balanced)
    { id: 'pool_1', title: 'mission_pool_1_title', description: 'mission_pool_1_desc', reward: 5, target: 2, type: 'easy', category: 'explore' },
    { id: 'pool_2', title: 'mission_pool_2_title', description: 'mission_pool_2_desc', reward: 5, target: 1, type: 'easy', category: 'read' },
    { id: 'pool_3', title: 'mission_pool_3_title', description: 'mission_pool_3_desc', reward: 5, target: 1, type: 'easy', category: 'engagement' },
    { id: 'pool_4', title: 'mission_pool_4_title', description: 'mission_pool_4_desc', reward: 5, target: 1, type: 'easy', category: 'explore' },
    { id: 'pool_5', title: 'mission_pool_5_title', description: 'mission_pool_5_desc', reward: 5, target: 1, type: 'easy', category: 'social' },
    { id: 'pool_6', title: 'mission_pool_6_title', description: 'mission_pool_6_desc', reward: 5, target: 1, type: 'easy', category: 'engagement' },
    { id: 'pool_7', title: 'mission_pool_7_title', description: 'mission_pool_7_desc', reward: 5, target: 3, type: 'easy', category: 'explore' },
    { id: 'pool_8', title: 'mission_pool_8_title', description: 'mission_pool_8_desc', reward: 5, target: 1, type: 'easy', category: 'read' },

    // 10 Inks - Medium-Low (Balanced)
    { id: 'pool_9', title: 'mission_pool_9_title', description: 'mission_pool_9_desc', reward: 10, target: 3, type: 'medium', category: 'read' },
    { id: 'pool_10', title: 'mission_pool_10_title', description: 'mission_pool_10_desc', reward: 10, target: 2, type: 'medium', category: 'explore' },
    { id: 'pool_11', title: 'mission_pool_11_title', description: 'mission_pool_11_desc', reward: 10, target: 1, type: 'medium', category: 'social' },
    { id: 'pool_12', title: 'mission_pool_12_title', description: 'mission_pool_12_desc', reward: 10, target: 1, type: 'medium', category: 'engagement' },
    { id: 'pool_13', title: 'mission_pool_13_title', description: 'mission_pool_13_desc', reward: 10, target: 3, type: 'medium', category: 'read' },
    { id: 'pool_14', title: 'mission_pool_14_title', description: 'mission_pool_14_desc', reward: 10, target: 3, type: 'medium', category: 'engagement' },

    // 15 Inks - Medium
    { id: 'pool_15', title: 'mission_pool_15_title', description: 'mission_pool_15_desc', reward: 15, target: 5, type: 'medium', category: 'read' },
    { id: 'pool_16', title: 'mission_pool_16_title', description: 'mission_pool_16_desc', reward: 15, target: 1, type: 'medium', category: 'social' },
    { id: 'pool_17', title: 'mission_pool_17_title', description: 'mission_pool_17_desc', reward: 15, target: 3, type: 'medium', category: 'explore' },
    { id: 'pool_18', title: 'mission_pool_18_title', description: 'mission_pool_18_desc', reward: 15, target: 1, type: 'medium', category: 'read' },
    { id: 'pool_19', title: 'mission_pool_19_title', description: 'mission_pool_19_desc', reward: 15, target: 1, type: 'medium', category: 'social' },
    { id: 'pool_20', title: 'mission_pool_20_title', description: 'mission_pool_20_desc', reward: 15, target: 2, type: 'medium', category: 'read' },

    // 20 Inks - Hard
    { id: 'pool_21', title: 'mission_pool_21_title', description: 'mission_pool_21_desc', reward: 20, target: 10, type: 'hard', category: 'read' },
    { id: 'pool_22', title: 'mission_pool_22_title', description: 'mission_pool_22_desc', reward: 20, target: 4, type: 'hard', category: 'social' },
    { id: 'pool_23', title: 'mission_pool_23_title', description: 'mission_pool_23_desc', reward: 20, target: 3, type: 'hard', category: 'engagement' },
    { id: 'pool_24', title: 'mission_pool_24_title', description: 'mission_pool_24_desc', reward: 20, target: 5, type: 'hard', category: 'explore' },

    // 25 Inks - Expert
    { id: 'pool_25', title: 'mission_pool_25_title', description: 'mission_pool_25_desc', reward: 25, target: 20, type: 'expert', category: 'read' },
    { id: 'pool_26', title: 'mission_pool_26_title', description: 'mission_pool_26_desc', reward: 25, target: 10, type: 'expert', category: 'engagement' },
    { id: 'pool_27', title: 'mission_pool_27_title', description: 'mission_pool_27_desc', reward: 25, target: 8, type: 'expert', category: 'social' },
    { id: 'pool_28', title: 'mission_pool_28_title', description: 'mission_pool_28_desc', reward: 25, target: 5, type: 'expert', category: 'social' },

    // VIP Exclusive
    { id: 'pool_vip_1', title: 'mission_pool_vip_1_title', description: 'mission_pool_vip_1_desc', reward: 20, target: 1, type: 'medium', category: 'engagement' },
];

export function getRandomMissions(): MissionData[] {
    const patterns = [
        [5, 10, 20, 25],
        [5, 5, 25, 25],
        [10, 10, 20, 20],
        [5, 15, 20, 20],
        [10, 15, 15, 20],
        [5, 15, 15, 25]
    ];

    // Retry logic to ensure maximum diversity
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        attempts++;
        const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];

        const byReward: Record<number, MissionData[]> = {};
        MISSION_POOL.forEach(m => {
            if (!byReward[m.reward]) byReward[m.reward] = [];
            byReward[m.reward].push(m);
        });

        const selectedMissions: MissionData[] = [];
        const usedIds = new Set<string>();
        const usedCategories = new Set<string>();

        let possible = true;

        for (const reward of selectedPattern) {
            // Prioritize candidates with UNUSED categories
            let candidates = byReward[reward].filter(m => !usedIds.has(m.id));
            if (candidates.length === 0) { possible = false; break; }

            // Try to find one with a new category
            const uniqueCatCandidates = candidates.filter(m => !usedCategories.has(m.category));

            let chosen: MissionData;

            if (uniqueCatCandidates.length > 0) {
                chosen = uniqueCatCandidates[Math.floor(Math.random() * uniqueCatCandidates.length)];
            } else {
                chosen = candidates[Math.floor(Math.random() * candidates.length)];
            }

            selectedMissions.push(chosen);
            usedIds.add(chosen.id);
            usedCategories.add(chosen.category);
        }

        if (possible) {
            // If we have at least 3 unique categories, we accept. 
            // Ideally 4, but some patterns might make it hard (though with updated pool it should be easy).
            if (usedCategories.size >= 3) {
                return selectedMissions;
            }
        }
    }

    // Fallback if loop finishes without perfect match (should rarely happen)
    // Just return the last valid selection or a safe fallback.
    // Re-run simple logic:
    const fallbackPattern = patterns[0];
    const simpleMissions: MissionData[] = [];
    const usedIds = new Set<string>();
    for (const reward of fallbackPattern) {
        const candidates = MISSION_POOL.filter(m => m.reward === reward && !usedIds.has(m.id));
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        simpleMissions.push(chosen);
        usedIds.add(chosen.id);
    }
    return simpleMissions;
}
