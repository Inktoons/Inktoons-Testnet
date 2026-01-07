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
    tipAmount?: number;
    isTipsEnabled?: boolean;
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
                        images: c.images || [],
                        tipAmount: c.tip_amount || undefined,
                        isTipsEnabled: c.is_tips_enabled || false
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
                    images: c.images || [],
                    tip_amount: c.tipAmount || null,
                    is_tips_enabled: c.isTipsEnabled || false
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
                    images: chapter.images || [],
                    tip_amount: chapter.tipAmount || null,
                    is_tips_enabled: chapter.isTipsEnabled || false
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
            if (updatedData.tipAmount !== undefined) updatePayload.tip_amount = updatedData.tipAmount;
            if (updatedData.isTipsEnabled !== undefined) updatePayload.is_tips_enabled = updatedData.isTipsEnabled;

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

            // Mapeamos los campos de la base de datos a los campos del contexto
            return {
                favorites: data.favorites || [],
                history: data.reading_history || [],
                following: data.following || [],
                ratings: data.ratings || {},
                lastRead: data.last_read || {},
                readChapters: data.read_chapters || {},
                profileImage: data.profile_image || undefined,
                balance: data.inks || 0,
                notifications: data.notifications || [],
                censorshipEnabled: data.censorship_enabled ?? true,
                walletAddress: data.wallet_address || "",
                subscription: data.subscription || undefined,
                likedChapters: data.liked_chapters || [],
                isFounder: data.is_founder || false,
                missions: data.missions || null,
                creatorBalance: data.creator_balance || 0,
                creatorInksBalance: data.creator_inks_balance || 0,
                creatorTransactions: data.creator_transactions || [],
                tipsEnabled: data.tips_enabled || false,
                creatorDescription: data.creator_description || "",
                profileBanner: data.profile_banner || undefined,
                username: data.username || "" // Added username
            };
        } catch (error) {
            console.error('Error fetching user data from Supabase:', error);
            return null;
        }
    }

    static async getUserByUsername(username: string): Promise<any | null> {
        if (!supabase) return null; // Added check for supabase
        try {
            const { data, error } = await supabase
                .from('user_data')
                .select('*')
                .ilike('username', username)
                .maybeSingle();

            if (error) throw error;
            if (!data) return null;

            return {
                id: data.user_id,
                balance: data.inks || 0,
                creatorBalance: data.creator_balance || 0,
                creatorDescription: data.creator_description || "",
                tipsEnabled: data.tips_enabled || false,
                walletAddress: data.wallet_address || "",
                profileImage: data.profile_image || undefined,
                profileBanner: data.profile_banner || undefined,
                username: data.username || ""
            };
        } catch (error) {
            console.error('Error fetching user by username:', error);
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

            // Mapeamos todos los campos del contexto a la base de datos
            if (data.balance !== undefined) upsertData.inks = data.balance;
            if (data.favorites !== undefined) upsertData.favorites = data.favorites;
            if (data.history !== undefined) upsertData.reading_history = data.history;
            if (data.following !== undefined) upsertData.following = data.following;
            if (data.ratings !== undefined) upsertData.ratings = data.ratings;
            if (data.lastRead !== undefined) upsertData.last_read = data.lastRead;
            if (data.readChapters !== undefined) upsertData.read_chapters = data.readChapters;
            if (data.profileImage !== undefined) upsertData.profile_image = data.profileImage;
            if (data.notifications !== undefined) upsertData.notifications = data.notifications;
            if (data.censorshipEnabled !== undefined) upsertData.censorship_enabled = data.censorshipEnabled;
            if (data.walletAddress !== undefined) upsertData.wallet_address = data.walletAddress;
            if (data.subscription !== undefined) upsertData.subscription = data.subscription;
            if (data.likedChapters !== undefined) upsertData.liked_chapters = data.likedChapters;
            if (data.isFounder !== undefined) upsertData.is_founder = data.isFounder;
            if (data.missions !== undefined) upsertData.missions = data.missions;
            if (data.creatorBalance !== undefined) upsertData.creator_balance = data.creatorBalance;
            if (data.creatorInksBalance !== undefined) upsertData.creator_inks_balance = data.creatorInksBalance;
            if (data.creatorTransactions !== undefined) upsertData.creator_transactions = data.creatorTransactions;
            if (data.tipsEnabled !== undefined) upsertData.tips_enabled = data.tipsEnabled;
            if (data.creatorDescription !== undefined) upsertData.creator_description = data.creatorDescription;
            if (data.profileBanner !== undefined) upsertData.profile_banner = data.profileBanner;
            if (data.username !== undefined) upsertData.username = data.username; // Save username too!

            const { error } = await supabase
                .from('user_data')
                .upsert(upsertData, { onConflict: 'user_id' });

            if (error) throw error;
        } catch (error) {
            console.error('Error saving user data to Supabase:', error);
        }
    }

    /**
     * Get top artists sorted by received inks (or most active)
     */
    static async getTopArtists(limit: number = 4): Promise<any[]> {
        if (!supabase) return [];
        try {
            const { data, error } = await supabase
                .from('user_data')
                .select('*')
                .not('username', 'is', null)
                .order('creator_inks_balance', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data.map((artist: any) => ({
                name: artist.username,
                inks: artist.creator_inks_balance || 0,
                works: 0,
                profileImage: artist.profile_image,
                color: 'from-pi-purple to-indigo-600'
            }));
        } catch (error) {
            console.error('Error fetching top artists:', error);
            return [];
        }
    }

    /**
     * Increment an artist's creator_inks_balance by username
     */
    static async incrementArtistInks(username: string, amount: number): Promise<boolean> {
        if (!supabase) return false;
        try {
            // First get current balance
            const { data, error: fetchError } = await supabase
                .from('user_data')
                .select('creator_inks_balance')
                .eq('username', username)
                .single();

            if (fetchError) throw fetchError;

            const newBalance = (data.creator_inks_balance || 0) + amount;

            const { error: updateError } = await supabase
                .from('user_data')
                .update({ creator_inks_balance: newBalance })
                .eq('username', username);

            if (updateError) throw updateError;
            return true;
        } catch (error) {
            console.error('Error incrementing artist inks:', error);
            return false;
        }
    }

    /**
     * Increment an artist's creator_balance (Pi) using secure RPC
     * @deprecated Use addCreatorTransaction instead which handles both balance and history
     */
    static async incrementArtistPi(username: string, amount: number): Promise<boolean> {
        // This is now handled within addCreatorTransaction/processCreatorDonation via RPC
        // to ensure atomicity and bypass RLS. We return true to maintain compatibility
        // with existing flows that call this before addCreatorTransaction.
        console.log("incrementArtistPi called - delegating to transaction RPC");
        return true;
    }

    /**
     * Add a new transaction to creator's transaction history AND update balance
     * Uses RPC to bypass RLS and ensure atomic update
     */
    static async addCreatorTransaction(
        creatorUsername: string,
        transaction: {
            type: 'DONATION' | 'PAYMENT' | 'WITHDRAWAL';
            origin: string; // donor username or source
            work: string; // chapter/webtoon title
            amount: number;
            webtoonId?: string;
            chapterId?: string;
        }
    ): Promise<boolean> {
        if (!supabase) return false;
        try {
            const newTransaction = {
                id: Math.random().toString(36).substr(2, 9),
                ...transaction,
                date: new Date().toISOString()
            };

            const { error } = await supabase.rpc('process_creator_donation', {
                p_username: creatorUsername,
                p_amount: transaction.amount,
                p_transaction: newTransaction
            });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error adding creator transaction via RPC:', error);
            return false;
        }
    }

    /**
     * Process a withdrawal for a creator
     */
    static async processWithdrawal(username: string): Promise<{ success: boolean; amount: number }> {
        if (!supabase) return { success: false, amount: 0 };
        try {
            // 1. Get current balance
            const { data, error: fetchError } = await supabase
                .from('user_data')
                .select('creator_balance')
                .eq('username', username)
                .single();

            if (fetchError) throw fetchError;

            const currentBalance = data.creator_balance || 0;
            if (currentBalance <= 0) return { success: false, amount: 0 };

            const finalAmount = currentBalance * 0.85; // Deduct 15% fee

            // 2. Add withdrawal transaction
            await this.addCreatorTransaction(username, {
                type: 'WITHDRAWAL',
                origin: 'Inktoons Platform',
                work: 'Withdrawal',
                amount: finalAmount,
            });

            // 3. Reset balance
            const { error: updateError } = await supabase
                .from('user_data')
                .update({ creator_balance: 0 })
                .eq('username', username);

            if (updateError) throw updateError;

            return { success: true, amount: finalAmount };

        } catch (error) {
            console.error('Error processing withdrawal:', error);
            return { success: false, amount: 0 };
        }
    }
}
