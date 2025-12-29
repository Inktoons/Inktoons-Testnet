"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { usePi } from "@/components/PiNetworkProvider";
import { SupabaseService } from "@/lib/supabaseService";

export interface Notification {
    id: string;
    type: 'CHAPTER' | 'MISSION' | 'FOLLOW' | 'SYSTEM';
    title: string;
    message: string;
    date: number;
    read: boolean;
    link?: string;
    icon?: string;
}

interface UserData {
    favorites: string[];
    history: string[];
    following: string[];
    ratings: Record<string, number>;
    lastRead: Record<string, string>;
    readChapters: Record<string, string[]>;
    profileImage?: string;
    balance: number;
    notifications?: Notification[];
    censorshipEnabled?: boolean;
    walletAddress?: string;
    subscription?: {
        type: '7d' | '1m' | '6m' | '1y';
        expiresAt: number;
    };
    likedChapters?: string[];
    isFounder?: boolean;
}

export interface Toast {
    title: string;
    message: string;
    icon?: string;
    link?: string;
}

interface UserDataContextType {
    userData: UserData;
    loading: boolean;
    toast: Toast | null;
    clearToast: () => void;
    toggleFavorite: (id: string) => void;
    addToHistory: (id: string) => void;
    toggleFollowAuthor: (authorName: string) => void;
    rateWebtoon: (id: string, rating: number) => void;
    setProfileImage: (image: string) => void;
    addBalance: (amount: number) => void;
    setSubscription: (type: '7d' | '1m' | '6m' | '1y', durationInMonths: number) => void;
    isFavorite: (id: string) => boolean;
    isInHistory: (id: string) => boolean;
    isFollowingAuthor: (authorName: string) => boolean;
    getUserRating: (id: string) => number | undefined;
    getLastReadChapter: (id: string) => string | undefined;
    isChapterRead: (webtoonId: string, chapterId: string) => boolean;
    updateReadingProgress: (webtoonId: string, chapterId: string) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
    markNotificationRead: (id: string) => void;
    clearNotifications: () => void;
    toggleCensorship: () => void;
    updateWalletAddress: (address: string) => void;
    toggleLikeChapter: (webtoonId: string, chapterId: string) => void;
    isChapterLiked: (webtoonId: string, chapterId: string) => boolean;
    cancelSubscription: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: ReactNode }) {
    const { user } = usePi();
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<Toast | null>(null);
    const [userData, setUserData] = useState<UserData>({
        favorites: [],
        history: [],
        following: [],
        ratings: {},
        lastRead: {},
        readChapters: {},
        profileImage: undefined,
        balance: 50,
        notifications: [],
        censorshipEnabled: true,
        walletAddress: "",
        likedChapters: []
    });

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            if (user?.uid) {
                const cloudData = await SupabaseService.getUserData(user.uid);
                if (cloudData) {
                    setUserData(prev => ({ ...prev, ...cloudData }));
                    setLoading(false);
                    return;
                }
            }
            const stored = localStorage.getItem("inktoons_user_data");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setUserData(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error("Failed to parse user data", e);
                }
            }
            setLoading(false);
        };
        loadInitialData();
    }, [user?.uid]);

    useEffect(() => {
        if (loading) return;
        localStorage.setItem("inktoons_user_data", JSON.stringify(userData));
        if (user?.uid) {
            const timeoutId = setTimeout(() => {
                SupabaseService.saveUserData(user.uid, userData);
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [userData, user?.uid, loading]);

    const toggleFavorite = useCallback((id: string) => {
        setUserData(prev => {
            const isFav = prev.favorites.includes(id);
            return {
                ...prev,
                favorites: isFav ? prev.favorites.filter(fid => fid !== id) : [...prev.favorites, id]
            };
        });
    }, []);

    const addToHistory = useCallback((id: string) => {
        setUserData(prev => {
            if (prev.history.includes(id)) return prev;
            return { ...prev, history: [id, ...prev.history] };
        });
    }, []);

    const toggleFollowAuthor = useCallback((authorName: string) => {
        setUserData(prev => {
            const isFollowing = prev.following.includes(authorName);
            return {
                ...prev,
                following: isFollowing ? prev.following.filter(name => name !== authorName) : [...prev.following, authorName]
            };
        });
    }, []);

    const rateWebtoon = useCallback((id: string, rating: number) => {
        setUserData(prev => ({ ...prev, ratings: { ...prev.ratings, [id]: rating } }));
    }, []);

    const updateReadingProgress = useCallback((webtoonId: string, chapterId: string) => {
        setUserData(prev => {
            const currentRead = prev.readChapters[webtoonId] || [];
            if (prev.lastRead[webtoonId] === chapterId && currentRead.includes(chapterId)) return prev;
            const newRead = currentRead.includes(chapterId) ? currentRead : [...currentRead, chapterId];
            return {
                ...prev,
                lastRead: { ...prev.lastRead, [webtoonId]: chapterId },
                readChapters: { ...prev.readChapters, [webtoonId]: newRead },
                history: prev.history.includes(webtoonId) ? prev.history : [webtoonId, ...prev.history]
            };
        });
    }, []);

    const setProfileImage = useCallback((image: string) => {
        setUserData(prev => ({ ...prev, profileImage: image }));
    }, []);

    const addBalance = useCallback((amount: number) => {
        setUserData(prev => ({ ...prev, balance: (prev.balance || 0) + amount }));
    }, []);

    const toggleCensorship = useCallback(() => {
        setUserData(prev => ({ ...prev, censorshipEnabled: !prev.censorshipEnabled }));
    }, []);

    const updateWalletAddress = useCallback((address: string) => {
        setUserData(prev => ({ ...prev, walletAddress: address }));
    }, []);

    const toggleLikeChapter = useCallback((webtoonId: string, chapterId: string) => {
        setUserData(prev => {
            const key = `${webtoonId}:${chapterId}`;
            const currentLikes = prev.likedChapters || [];
            const isLiked = currentLikes.includes(key);

            return {
                ...prev,
                likedChapters: isLiked
                    ? currentLikes.filter(k => k !== key)
                    : [...currentLikes, key]
            };
        });
    }, []);

    const isChapterLiked = useCallback((webtoonId: string, chapterId: string) => {
        return (userData.likedChapters || []).includes(`${webtoonId}:${chapterId}`);
    }, [userData.likedChapters]);

    const addNotification = useCallback((notif: Omit<Notification, 'id' | 'date' | 'read'>) => {
        setUserData(prev => {
            const newNotif: Notification = {
                ...notif,
                id: Math.random().toString(36).substr(2, 9),
                date: Date.now(),
                read: false
            };
            return {
                ...prev,
                notifications: [newNotif, ...(prev.notifications || [])].slice(0, 50)
            };
        });
        // Also show toast
        setToast({
            title: notif.title,
            message: notif.message,
            icon: notif.icon,
            link: notif.link
        });
    }, []);

    const clearToast = useCallback(() => setToast(null), []);

    const markNotificationRead = useCallback((id: string) => {
        setUserData(prev => ({
            ...prev,
            notifications: (prev.notifications || []).map(n => n.id === id ? { ...n, read: true } : n)
        }));
    }, []);

    const clearNotifications = useCallback(() => {
        setUserData(prev => ({ ...prev, notifications: [] }));
    }, []);

    const setSubscription = useCallback((type: '7d' | '1m' | '6m' | '1y', durationInMonths: number) => {
        setUserData(prev => {
            const now = Date.now();
            const ms = durationInMonths * 30 * 24 * 60 * 60 * 1000;
            const currentExpiry = prev.subscription?.expiresAt || now;
            const newExpiry = Math.max(now, currentExpiry) + ms;
            return { ...prev, subscription: { type, expiresAt: newExpiry } };
        });
    }, []);

    const cancelSubscription = useCallback(() => {
        setUserData(prev => {
            const { subscription, isFounder, ...rest } = prev;
            return { ...rest, isFounder: false };
        });
    }, []);

    const isFavorite = useCallback((id: string) => userData.favorites.includes(id), [userData.favorites]);
    const isInHistory = useCallback((id: string) => userData.history.includes(id), [userData.history]);
    const isFollowingAuthor = useCallback((authorName: string) => userData.following.includes(authorName), [userData.following]);
    const getUserRating = useCallback((id: string) => userData.ratings[id], [userData.ratings]);
    const getLastReadChapter = useCallback((id: string) => userData.lastRead[id], [userData.lastRead]);
    const isChapterRead = useCallback((webtoonId: string, chapterId: string) => (userData.readChapters[webtoonId] || []).includes(chapterId), [userData.readChapters]);

    return (
        <UserDataContext.Provider value={{
            userData, loading, toast, clearToast, toggleFavorite, addToHistory, toggleFollowAuthor, rateWebtoon, setProfileImage, addBalance, setSubscription, isFavorite, isInHistory, isFollowingAuthor, getUserRating, getLastReadChapter, isChapterRead, updateReadingProgress,
            addNotification, markNotificationRead, clearNotifications, toggleCensorship, updateWalletAddress, toggleLikeChapter, isChapterLiked, cancelSubscription
        }}>
            {children}
        </UserDataContext.Provider>
    );
}

export function useUserData() {
    const context = useContext(UserDataContext);
    if (context === undefined) throw new Error("useUserData must be used within a UserDataProvider");
    return context;
}
