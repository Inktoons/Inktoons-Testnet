"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { MissionData, getRandomMissions, MISSION_POOL } from '@/lib/missions';
import { usePi } from '@/components/PiNetworkProvider';
import { SupabaseService } from '@/lib/supabaseService';
import { useUserData } from '@/context/UserDataContext';

export type ActiveMission = MissionData & {
    progress: number;
    isClaimed: boolean;
    swapped?: boolean;
    progressDetails?: Record<string, number>;
};

type MissionContextType = {
    missions: ActiveMission[];
    loading: boolean;
    regenerateMissions: () => void;
    claimMission: (missionId: string) => { success: boolean; reward: number };
    replaceMission: (missionId: string) => void;
    trackAction: (actionType: string, payload?: any) => void;
};

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export function MissionProvider({ children }: { children: React.ReactNode }) {
    const { user } = usePi();
    const [missions, setMissions] = useState<ActiveMission[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastActionTime, setLastActionTime] = useState<number>(0);
    const { addNotification } = useUserData();

    useEffect(() => {
        const loadMissions = async () => {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            if (user?.uid) {
                const cloudData = await SupabaseService.getUserData(user.uid);
                if (cloudData?.missions && cloudData.missions.date === today) {
                    setMissions(cloudData.missions.list);
                    setLoading(false);
                    return;
                }
            }
            const storedKey = `inktoons_missions_${today}`;
            const stored = localStorage.getItem(storedKey);
            if (stored) {
                setMissions(JSON.parse(stored));
            } else {
                const newMissions: ActiveMission[] = getRandomMissions().map(m => ({ ...m, progress: 0, isClaimed: false }));
                setMissions(newMissions);
            }
            setLoading(false);
            setTimeout(() => trackAction('LOGIN_TODAY'), 1000);
        };
        loadMissions();
    }, [user?.uid]);

    useEffect(() => {
        if (loading || missions.length === 0) return;
        const today = new Date().toISOString().split('T')[0];
        const storedKey = `inktoons_missions_${today}`;
        localStorage.setItem(storedKey, JSON.stringify(missions));
        if (user?.uid) {
            const timeoutId = setTimeout(() => {
                SupabaseService.saveUserData(user.uid, { missions: { date: today, list: missions } });
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [missions, user?.uid, loading]);

    const regenerateMissions = useCallback(() => {
        const newMissions: ActiveMission[] = getRandomMissions().map(m => ({ ...m, progress: 0, isClaimed: false }));
        setMissions(newMissions);
    }, []);

    const claimMission = useCallback((missionId: string) => {
        const mission = missions.find(m => m.id === missionId);
        if (!mission) return { success: false, reward: 0 };

        if (mission.progress >= mission.target && !mission.isClaimed) {
            setMissions(prev => prev.map(m => m.id === missionId ? { ...m, isClaimed: true } : m));
            return { success: true, reward: mission.reward };
        }
        return { success: false, reward: 0 };
    }, [missions]);

    const replaceMission = useCallback((missionId: string) => {
        setMissions(prev => {
            const missionIndex = prev.findIndex(m => m.id === missionId);
            if (missionIndex === -1) return prev;
            const currentMission = prev[missionIndex];
            if (currentMission.swapped || currentMission.isClaimed || currentMission.progress >= currentMission.target) return prev;
            const targetCategory = currentMission.category;
            const existingIds = new Set(prev.map(m => m.id));
            const candidates = MISSION_POOL.filter(m => m.category === targetCategory && !existingIds.has(m.id));
            let newMissionData = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null;
            if (!newMissionData) return prev;
            const newMission: ActiveMission = { ...newMissionData, progress: 0, isClaimed: false, swapped: true, progressDetails: {} };
            const next = [...prev];
            next[missionIndex] = newMission;
            return next;
        });
    }, []);

    const trackAction = useCallback((actionType: string, payload: any = {}) => {
        const now = Date.now();
        if (now - lastActionTime < 500) return;
        setLastActionTime(now);
        setMissions(prevMissions => prevMissions.map(mission => {
            if (mission.isClaimed || mission.progress >= mission.target) return mission;
            let increment = 0;
            let subIncrementKey: string | null = null;
            if (actionType === 'READ_CHAPTER') {
                if (['pool_2', 'pool_9', 'pool_15', 'pool_21', 'pool_25', 'pool_24'].includes(mission.id)) increment = 1;
                if (mission.id === 'pool_10' && payload.seriesId) increment = 1;
                if (mission.id === 'pool_13' || mission.id === 'pool_17' || mission.id === 'pool_20') increment = 1;
            } else if (actionType === 'VIEW_SERIES_DETAILS') {
                if (['pool_1', 'pool_7'].includes(mission.id)) increment = 1;
            } else if (actionType === 'SEARCH_USED') {
                if (mission.id === 'pool_4') increment = 1;
            } else if (actionType === 'FILTER_GENRE') {
                if (mission.id === 'pool_8') increment = 1;
            } else if (actionType === 'VISIT_PROFILE') {
                if (mission.id === 'pool_5') increment = 1;
            } else if (actionType === 'LOGIN_TODAY') {
                if (mission.id === 'pool_6') increment = 1;
            } else if (actionType === 'LIKE_CHAPTER') {
                if (['pool_3', 'pool_14'].includes(mission.id)) increment = 1;
                if (mission.id === 'pool_26') { increment = 1; subIncrementKey = 'likes'; }
            } else if (actionType === 'FOLLOW_AUTHOR') {
                if (mission.id === 'pool_11') increment = 1;
                if (mission.id === 'pool_22') { increment = 1; subIncrementKey = 'follows'; }
            } else if (actionType === 'RATE_SERIES') {
                if (mission.id === 'pool_12') increment = 1;
                if (mission.id === 'pool_26' || mission.id === 'pool_27') { increment = 1; subIncrementKey = 'ratings'; }
            } else if (actionType === 'COMMENT') {
                if (['pool_16', 'pool_23'].includes(mission.id)) increment = 1;
                if (mission.id === 'pool_22' || mission.id === 'pool_27') { increment = 1; subIncrementKey = 'comments'; }
            } else if (actionType === 'SHARE_SERIES') {
                if (['pool_19', 'pool_28'].includes(mission.id)) increment = 1;
            } else if (actionType === 'DOWNLOAD_CHAPTER') {
                if (mission.id === 'pool_vip_1') increment = 1;
            }
            if (increment > 0) {
                let validIncrement = true;
                const newDetails = { ...(mission.progressDetails || {}) };
                if (mission.id === 'pool_26') {
                    if (subIncrementKey === 'likes' && (newDetails['likes'] || 0) >= 5) validIncrement = false;
                    else if (subIncrementKey === 'ratings' && (newDetails['ratings'] || 0) >= 5) validIncrement = false;
                    else if (subIncrementKey) newDetails[subIncrementKey] = (newDetails[subIncrementKey] || 0) + 1;
                } else if (mission.id === 'pool_22') {
                    if (subIncrementKey === 'follows' && (newDetails['follows'] || 0) >= 3) validIncrement = false;
                    else if (subIncrementKey === 'comments' && (newDetails['comments'] || 0) >= 1) validIncrement = false;
                    else if (subIncrementKey) newDetails[subIncrementKey] = (newDetails[subIncrementKey] || 0) + 1;
                } else if (mission.id === 'pool_27') {
                    if (subIncrementKey === 'comments' && (newDetails['comments'] || 0) >= 5) validIncrement = false;
                    else if (subIncrementKey === 'ratings' && (newDetails['ratings'] || 0) >= 3) validIncrement = false;
                    else if (subIncrementKey) newDetails[subIncrementKey] = (newDetails[subIncrementKey] || 0) + 1;
                }
                if (validIncrement) {
                    const newProgress = Math.min(mission.progress + increment, mission.target);
                    if (newProgress !== mission.progress) {
                        // If just completed
                        if (newProgress >= mission.target) {
                            addNotification({
                                type: 'MISSION',
                                title: '¡Misión Completada!',
                                message: `Has completado "${mission.title}". ¡Ve a reclamar tu recompensa!`,
                                icon: '🎯',
                                link: '/wallet#missions'
                            });
                        }
                        return { ...mission, progress: newProgress, progressDetails: newDetails };
                    }
                }
            }
            return mission;
        }));
    }, [lastActionTime]);

    return (
        <MissionContext.Provider value={{ missions, loading, regenerateMissions, claimMission, replaceMission, trackAction }}>
            {children}
        </MissionContext.Provider>
    );
}

export const useMissions = () => {
    const context = useContext(MissionContext);
    if (!context) throw new Error('useMissions must be used within a MissionProvider');
    return context;
};
