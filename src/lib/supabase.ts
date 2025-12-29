import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('Supabase environment variables are missing! Cloud features will not work.');
    }
}

// Create the client only if we have the required parameters to avoid crashing the build
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (null as any); // Fallback for build time if keys are missing

// Database types
export interface Database {
    public: {
        Tables: {
            webtoons: {
                Row: {
                    id: string;
                    title: string;
                    excerpt: string;
                    category: string;
                    date: string;
                    author: string;
                    image_url: string;
                    rating: number;
                    votes: number;
                    status: string;
                    genres: string[];
                    artist: string;
                    alternatives: string | null;
                    year: string;
                    language: string;
                    banner_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['webtoons']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['webtoons']['Insert']>;
            };
            chapters: {
                Row: {
                    id: string;
                    webtoon_id: string;
                    title: string;
                    date: string;
                    is_locked: boolean;
                    unlock_cost: number | null;
                    unlock_date: string | null;
                    images: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['chapters']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['chapters']['Insert']>;
            };
            user_data: {
                Row: {
                    id: string;
                    user_id: string;
                    inks: number;
                    unlocked_chapters: string[];
                    favorites: string[];
                    reading_history: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['user_data']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['user_data']['Insert']>;
            };
        };
    };
}
