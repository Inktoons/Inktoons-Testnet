/**
 * Inktoons Supabase Service
 * Replaces IndexedDB with Supabase for cloud persistence
 * FREE TIER: 500MB database + 1GB storage
 */

import { supabase } from './supabase';

export interface Chapter {
    id: string;
    title: string;
    date: string;
    isLocked: boolean;
    unlockCost?: number;
    unlockDate?: string;
    images?: string[];
}

export interface Webtoon {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    author: string;
    imageUrl: string;
    rating?: number;
    votes?: number;
    views?: number;
    status: string;
    genres: string[];
    artist?: string;
    alternatives?: string;
    year?: string;
    language?: string;
    bannerUrl?: string;
    chapters?: Chapter[];
}

export class SupabaseService {
    /**
     * Get all webtoons with their chapters
     */
    static async getAllWebtoons(): Promise<Webtoon[]> {
        if (!supabase) return [];
        try {
            const { data: webtoons, error: webtoonsError } = await supabase
                .from('webtoons')
                .select('*')
                .order('created_at', { ascending: false });

            if (webtoonsError) throw webtoonsError;

            const { data: chapters, error: chaptersError } = await supabase
                .from('chapters')
                .select('*')
                .order('created_at', { ascending: false });

            if (chaptersError) throw chaptersError;

            const webtoonsWithChapters: Webtoon[] = (webtoons || []).map((w: any) => ({
                id: w.id,
                title: w.title,
                excerpt: w.excerpt,
                category: w.category,
                date: w.date,
                author: w.author,
                imageUrl: w.image_url,
                rating: w.rating,
                votes: w.votes,
                status: w.status,
                genres: w.genres,
                artist: w.artist,
                alternatives: w.alternatives || undefined,
                year: w.year,
                language: w.language,
                bannerUrl: w.banner_url || undefined,
                chapters: (chapters || [])
                    .filter((c: any) => c.webtoon_id === w.id)
                    .map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        date: c.date,
                        isLocked: c.is_locked,
                        unlockCost: c.unlock_cost || undefined,
                        unlockDate: c.unlock_date || undefined,
                        images: c.images || []
                    }))
            }));

            return webtoonsWithChapters;
        } catch (error) {
            console.error('Error fetching webtoons:', error);
            return [];
        }
    }

    /**
     * Save or update a webtoon
     */
    static async saveWebtoon(webtoon: Webtoon): Promise<void> {
        if (!supabase) return;
        try {
            const { chapters, ...webtoonData } = webtoon;

            const { error: webtoonError } = await supabase
                .from('webtoons')
                .upsert({
                    id: webtoonData.id,
                    title: webtoonData.title,
                    excerpt: webtoonData.excerpt,
                    category: webtoonData.category,
                    date: webtoonData.date,
                    author: webtoonData.author,
                    image_url: webtoonData.imageUrl,
                    rating: webtoonData.rating || 0,
                    votes: webtoonData.votes || 0,
                    status: webtoonData.status,
                    genres: webtoonData.genres,
                    artist: webtoonData.artist || 'Unknown',
                    alternatives: webtoonData.alternatives || null,
                    year: webtoonData.year || '2025',
                    language: webtoonData.language || 'Español',
                    banner_url: webtoonData.bannerUrl || null
                });

            if (webtoonError) throw webtoonError;

            if (chapters && chapters.length > 0) {
                const chaptersToInsert = chapters.map(c => ({
                    id: c.id,
                    webtoon_id: webtoonData.id,
                    title: c.title,
                    date: c.date,
                    is_locked: c.isLocked,
                    unlock_cost: c.unlockCost || null,
                    unlock_date: c.unlockDate || null,
                    images: c.images || []
                }));

                const { error: chaptersError } = await supabase
                    .from('chapters')
                    .upsert(chaptersToInsert);

                if (chaptersError) throw chaptersError;
            }
        } catch (error) {
            console.error('Error saving webtoon:', error);
            throw error;
        }
    }

    /**
     * Save multiple webtoons at once
     */
    static async saveAllWebtoons(webtoons: Webtoon[]): Promise<void> {
        for (const webtoon of webtoons) {
            await this.saveWebtoon(webtoon);
        }
    }

    /**
     * Delete a webtoon and its chapters
     */
    static async deleteWebtoon(id: string): Promise<void> {
        if (!supabase) return;
        try {
            const { error: chaptersError } = await supabase
                .from('chapters')
                .delete()
                .eq('webtoon_id', id);

            if (chaptersError) throw chaptersError;

            const { error: webtoonError } = await supabase
                .from('webtoons')
                .delete()
                .eq('id', id);

            if (webtoonError) throw webtoonError;
        } catch (error) {
            console.error('Error deleting webtoon:', error);
            throw error;
        }
    }

    /**
     * Add a chapter to a webtoon
     */
    static async addChapter(webtoonId: string, chapter: Chapter): Promise<void> {
        if (!supabase) return;
        try {
            const { error } = await supabase
                .from('chapters')
                .insert({
                    id: chapter.id,
                    webtoon_id: webtoonId,
                    title: chapter.title,
                    date: chapter.date,
                    is_locked: chapter.isLocked,
                    unlock_cost: chapter.unlockCost || null,
                    unlock_date: chapter.unlockDate || null,
                    images: chapter.images || []
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error adding chapter:', error);
            throw error;
        }
    }

    /**
     * Update a chapter
     */
    static async updateChapter(chapterId: string, updatedData: Partial<Chapter>): Promise<void> {
        if (!supabase) return;
        try {
            const updatePayload: any = {};
            if (updatedData.title !== undefined) updatePayload.title = updatedData.title;
            if (updatedData.date !== undefined) updatePayload.date = updatedData.date;
            if (updatedData.isLocked !== undefined) updatePayload.is_locked = updatedData.isLocked;
            if (updatedData.unlockCost !== undefined) updatePayload.unlock_cost = updatedData.unlockCost;
            if (updatedData.unlockDate !== undefined) updatePayload.unlock_date = updatedData.unlockDate;
            if (updatedData.images !== undefined) updatePayload.images = updatedData.images;

            const { error } = await supabase
                .from('chapters')
                .update(updatePayload)
                .eq('id', chapterId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating chapter:', error);
            throw error;
        }
    }

    /**
     * Upload an image to Supabase Storage
     */
    static async uploadImage(file: File, bucket: string = 'webtoon-images'): Promise<string | null> {
        if (!supabase) return null;
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    /**
     * Delete an image from Supabase Storage
     */
    static async deleteImage(imageUrl: string, bucket: string = 'webtoon-images'): Promise<void> {
        if (!supabase) return;
        try {
            const urlParts = imageUrl.split('/');
            const filePath = urlParts[urlParts.length - 1];

            const { error } = await supabase.storage
                .from(bucket)
                .remove([filePath]);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    }

    /**
     * Get user data by user ID
     */
    static async getUserData(userId: string): Promise<any | null> {
        if (!supabase || !userId) return null;
        try {
            const { data, error } = await supabase
                .from('user_data')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            if (!data) return null;

            return {
                favorites: data.favorites || [],
                history: data.reading_history || [],
                balance: data.inks || 0,
                missions: data.missions || null,
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    /**
     * Save or update user data
     */
    static async saveUserData(userId: string, data: any): Promise<void> {
        if (!supabase || !userId) return;
        try {
            const upsertData: any = {
                user_id: userId,
                updated_at: new Date().toISOString()
            };

            if (data.balance !== undefined) upsertData.inks = data.balance;
            if (data.favorites !== undefined) upsertData.favorites = data.favorites;
            if (data.history !== undefined) upsertData.reading_history = data.history;
            if (data.missions !== undefined) upsertData.missions = data.missions;

            const { error } = await supabase
                .from('user_data')
                .upsert(upsertData, { onConflict: 'user_id' });

            if (error) throw error;
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }
}
