"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useUserData } from "@/context/UserDataContext";
import { useContent, Webtoon } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import TopNavbar from "@/components/TopNavbar";
import {
    Bell,
    Menu,
    BookOpen,
    Home,
    Search,
    User,
    Clock,
    Play,
    Upload
} from "lucide-react";

export default function LibraryPage() {
    const router = useRouter();
    const { userData } = useUserData();
    const { webtoons, loading } = useContent();
    const { t, language } = useLanguage();

    // Interfaz para los items procesados de la biblioteca
    interface ReadingItem extends Webtoon {
        progress: number;
        readCount: number;
        totalChapters: number;
        remainingCount: number;
        lastChapterTitle: string;
    }

    // Calculamos las historias que el usuario está leyendo realmente
    const readingNow = useMemo<ReadingItem[]>(() => {
        if (!webtoons.length) return [];

        // Filtramos y transformamos en un solo paso para evitar problemas de tipos con null
        return userData.history.map(id => {
            const webtoon = webtoons.find(w => w.id === id);
            if (!webtoon) return null;

            const totalChapters = webtoon.chapters?.length || 0;
            const readChapters = userData.readChapters[id] || [];
            const readCount = readChapters.length;
            const remainingCount = Math.max(0, totalChapters - readCount);

            const progress = totalChapters > 0
                ? Math.round((readCount / totalChapters) * 100)
                : 0;

            const lastReadId = userData.lastRead[id];
            const lastReadChapter = webtoon.chapters?.find(ch => ch.id === lastReadId);
            const lastChapterTitle = lastReadChapter ? lastReadChapter.title : (language === 'es' ? "Iniciado" : language === 'en' ? "Started" : language === 'pt' ? "Iniciado" : "Commencé");

            return {
                ...webtoon,
                progress,
                readCount,
                totalChapters,
                remainingCount,
                lastChapterTitle
            } as ReadingItem;
        }).filter((item): item is ReadingItem => item !== null);
    }, [webtoons, userData.history, userData.readChapters, userData.lastRead, language]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pi-purple"></div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('library_loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col transition-colors duration-300">
            <TopNavbar />

            <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                        <BookOpen className="text-pi-purple" size={24} />
                        {t('library_title')}
                    </h1>
                    <span className="text-xs font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {readingNow.length} {readingNow.length === 1 ? t('library_historia') : t('library_historias')}
                    </span>
                </div>

                {readingNow.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {readingNow.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => router.push(`/news/${item.id}`)}
                            >
                                <div className="flex h-44">
                                    <div className="relative w-32 h-full flex-shrink-0">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-pi-purple scale-0 group-hover:scale-100 transition-transform shadow-lg">
                                                <Play size={20} fill="currentColor" className="ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-black text-pi-purple uppercase tracking-widest">
                                                    {(() => {
                                                        const cat = item.category || "";
                                                        const genreKey = cat.startsWith('genre_') ? cat : 'genre_action';
                                                        const translated = t(genreKey as any);
                                                        return (translated && translated !== genreKey) ? translated : cat;
                                                    })()}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-2 text-slate-900 group-hover:text-pi-purple transition-colors">
                                                {item.title}
                                            </h3>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold">
                                                    <Clock size={12} className="text-gray-400" />
                                                    <span className="line-clamp-1">{item.lastChapterTitle}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                    <span>{item.readCount} {t('library_read')}</span>
                                                    <span className="w-1 h-1 bg-gray-100 rounded-full" />
                                                    <span>{item.remainingCount} {t('library_to_read')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 mt-2">
                                            <div className="flex justify-between text-[10px] font-black text-gray-400">
                                                <span>{t('library_progress')}</span>
                                                <span className="text-pi-purple">{item.progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.progress}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="h-full bg-pi-purple shadow-[0_0_8px_rgba(147,51,234,0.3)]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-6">
                            <BookOpen size={48} />
                        </div>
                        <h2 className="text-xl font-black mb-2 text-slate-900">{t('library_empty')}</h2>
                        <p className="text-gray-400 text-sm max-w-xs mb-8">
                            {t('library_empty_desc')}
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="bg-black text-white px-10 py-3 rounded-full font-black hover:scale-105 transition-transform"
                        >
                            {t('library_explore')}
                        </button>
                    </div>
                )}

                {/* Section for Recommendations or Favorites could go here */}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between z-50 transition-colors duration-300">
                <button onClick={() => router.push("/")} className="text-slate-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <Home size={22} />
                    <span className="text-[10px] font-bold">{t('nav_home')}</span>
                </button>
                <button onClick={() => router.push("/explore")} className="text-slate-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <Search size={22} />
                    <span className="text-[10px] font-bold">{t('nav_explore')}</span>
                </button>
                <button onClick={() => router.push("/upload")} className="text-slate-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <Upload size={22} />
                    <span className="text-[10px] font-bold">{t('nav_upload')}</span>
                </button>
                <button className="text-pi-purple transition-all flex flex-col items-center gap-1">
                    <BookOpen size={22} />
                    <span className="text-[10px] font-bold">{t('nav_library')}</span>
                </button>
                <button onClick={() => router.push("/profile")} className="text-slate-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <User size={22} />
                    <span className="text-[10px] font-bold">{t('nav_profile')}</span>
                </button>
            </nav>
            <div className="h-24" />
        </div>
    );
}
