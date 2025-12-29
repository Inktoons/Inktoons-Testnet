"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePi } from "@/components/PiNetworkProvider";
import {
    Search,
    Home,
    BookOpen,
    User,
    Eye,
    ArrowLeft,
    TrendingUp,
    Clock,
    Grid,
    ChevronDown,
    X,
    Filter,
    Upload
} from "lucide-react";
import { mockNews } from "@/data/mockNews";
import { useContent } from "@/context/ContentContext";
import { useMissions } from "@/context/MissionContext";
import { motion, AnimatePresence } from "framer-motion";
import TopNavbar from "@/components/TopNavbar";
import { useLanguage } from "@/context/LanguageContext";

export default function ExplorePage() {
    const router = useRouter();
    const { user } = usePi();
    const { webtoons } = useContent();
    const { trackAction } = useMissions();
    const { t } = useLanguage();

    // Active Tab: popular, latest, directory
    const [activeTab, setActiveTab] = useState("directory");
    const [searchQuery, setSearchQuery] = useState("");

    // Filters
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

    // Initial check for category in URL
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('category');
        if (cat) {
            setSelectedGenre(cat);
            setActiveTab("directory");
        }
    }, []);

    // Combine Data
    const allItems = useMemo(() => {
        const combined = [
            ...webtoons.map(w => ({
                id: w.id,
                title: w.title,
                author: w.author,
                genre: w.category,
                views: w.views || 0,
                votes: w.votes || 0,
                status: w.status === "ongoing" ? t('status_ongoing') : t('status_completed'),
                isNew: new Date(w.date).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000), // Within 7 days
                image: w.imageUrl,
                date: w.date
            })),
            ...mockNews.map(item => ({
                id: item.id,
                title: item.title,
                author: item.author,
                genre: item.category,
                views: item.views || Math.floor(Math.random() * 1000),
                votes: item.votes || 0,
                status: Math.random() > 0.3 ? t('status_ongoing') : t('status_completed'),
                isNew: false,
                image: item.imageUrl,
                date: item.date
            }))
        ];

        const EXCLUDED_CATEGORIES = ['hentai', 'gore', '+18', 'adult', 'erotic', 'ecchi', 'nsfw'];

        return combined.filter(item => {
            const cat = item.genre?.toLowerCase() || '';
            return !EXCLUDED_CATEGORIES.some(excluded => cat.includes(excluded));
        });
    }, [webtoons]);

    // Derived Filtered List for Results
    const searchResults = useMemo(() => {
        if (!searchQuery && !selectedStatus && !selectedLetter && !selectedGenre) return [];

        return allItems.filter(item => {
            const matchesSearch = !searchQuery ||
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.author.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = !selectedStatus ||
                (selectedStatus === t('status_new') ? item.isNew : item.status === selectedStatus);

            const matchesLetter = !selectedLetter ||
                (selectedLetter === "0-9"
                    ? /^\d/.test(item.title)
                    : item.title.toUpperCase().startsWith(selectedLetter));

            const matchesGenre = !selectedGenre ||
                (() => {
                    let genreKey = 'genre_' + item.genre.toLowerCase()
                        .replace('ó', 'o')
                        .replace('í', 'i')
                        .replace('é', 'e')
                        .replace('á', 'a')
                        .replace('ñ', 'n')
                        .replace(/\s+/g, '')
                        .replace(/-+/g, '');

                    if (genreKey === 'genre_accion') genreKey = 'genre_action';
                    if (genreKey === 'genre_aventura') genreKey = 'genre_adventure';
                    if (genreKey === 'genre_fantasia') genreKey = 'genre_fantasy';
                    if (genreKey === 'genre_cienciaficcion') genreKey = 'genre_scifi';
                    if (genreKey === 'genre_misterio') genreKey = 'genre_mystery';
                    if (genreKey === 'genre_comedia') genreKey = 'genre_comedy';
                    if (genreKey === 'genre_terror') genreKey = 'genre_horror';
                    if (genreKey === 'genre_psicologico') genreKey = 'genre_psychological';
                    if (genreKey === 'genre_cotidiano') genreKey = 'genre_sliceoflife';
                    if (genreKey === 'genre_historico') genreKey = 'genre_historical';
                    if (genreKey === 'genre_artesmarciales') genreKey = 'genre_martial_arts';
                    if (genreKey === 'genre_ficcioncientifica') genreKey = 'genre_scifi'; // portuguese

                    // Compare the normalized key with selectedGenre (which is now a key like 'genre_action')
                    return genreKey === selectedGenre;
                })();

            return matchesSearch && matchesStatus && matchesLetter && matchesGenre;
        });
    }, [searchQuery, selectedStatus, selectedLetter, selectedGenre, allItems]);

    // Lists for Popular and Latest
    const popularList = useMemo(() => [...allItems].sort((a, b) => {
        if ((b.views || 0) !== (a.views || 0)) return (b.views || 0) - (a.views || 0);
        return (b.votes || 0) - (a.votes || 0);
    }), [allItems]);

    const latestList = useMemo(() => [...allItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [allItems]);

    const alphabet = ["0-9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

    const allGenres = useMemo(() => {
        const genres = new Set<string>();
        allItems.forEach(item => {
            if (item.genre) {
                genres.add(item.genre);
            }
        });
        return Array.from(genres).sort();
    }, [allItems]);

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans transition-colors duration-300">
            <TopNavbar />

            {/* 1. TOP SEARCH BAR */}
            <div className="p-4 bg-white">
                <div className="relative group">
                    <div className={`absolute inset-0 bg-pi-purple/5 rounded-lg blur-md opacity-0 group-focus-within:opacity-100 transition-opacity`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('explore_search_placeholder')}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3.5 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-gray-400 relative z-10 text-gray-900 focus:border-pi-purple/30"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-20" size={20} />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black z-20"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* 2. MAIN TABS */}
            <div className="flex border-b border-gray-50 px-4 bg-white">
                {[
                    { id: 'popular', label: t('explore_popular') },
                    { id: 'latest', label: t('explore_latest') },
                    { id: 'directory', label: t('explore_directory') }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            if (tab.id !== "directory") {
                                setSelectedStatus(null);
                                setSelectedLetter(null);
                            }
                        }}
                        className={`flex-1 py-4 text-xs font-black tracking-widest relative transition-colors ${activeTab === tab.id ? "text-pi-purple" : "text-gray-400"
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="tab-indicator"
                                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-pi-purple"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* 3. CONTENT AREA */}
            <main className="flex-1 overflow-y-auto pb-32 bg-white">
                <AnimatePresence mode="wait">
                    {activeTab === "directory" && !searchQuery && !selectedStatus && !selectedLetter && !selectedGenre ? (
                        <motion.div
                            key="directory-main"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-6 space-y-8 bg-white"
                        >
                            {/* --- GENEROS --- */}
                            <div>
                                <h3 className="text-gray-400 text-[11px] font-black uppercase tracking-widest mb-6 px-1">{t('explore_genres')}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {(() => {
                                        // Static list of all available genre keys
                                        const ALL_GENRES = [
                                            'genre_4koma', 'genre_action', 'genre_adult', 'genre_adventure', 'genre_apocalyptic',
                                            'genre_scifi', 'genre_comedy', 'genre_sliceoflife', 'genre_delinquents', 'genre_demons',
                                            'genre_sports', 'genre_drama', 'genre_school', 'genre_fantasy', 'genre_gender_bender',
                                            'genre_gore', 'genre_harem', 'genre_hentai', 'genre_historical', 'genre_horror',
                                            'genre_josei', 'genre_karate', 'genre_mature', 'genre_mafia', 'genre_magic',
                                            'genre_manhwa', 'genre_martial_arts', 'genre_mecha', 'genre_military', 'genre_music',
                                            'genre_omegaverse', 'genre_oneshot', 'genre_parody', 'genre_police',
                                            'genre_psychological', 'genre_virtual_reality', 'genre_reincarnation', 'genre_romance',
                                            'genre_samurai', 'genre_seinen', 'genre_shojo', 'genre_shonen', 'genre_smut',
                                            'genre_supernatural', 'genre_super_power', 'genre_survival', 'genre_suspense', 'genre_thriller',
                                            'genre_tragedy', 'genre_vampires', 'genre_webcomic', 'genre_webtoon', 'genre_yaoi', 'genre_yuri',
                                            'genre_ecchi', 'genre_erotic', 'genre_nsfw'
                                        ];

                                        // Default filtering of sensitive content unless explicitly allowed (assuming safe default)
                                        const EXCLUDED_CATEGORIES = ['hentai', 'gore', '+18', 'adult', 'erotic', 'ecchi', 'nsfw', 'smut', 'yaoi', 'yuri'];

                                        // Filter genres based on exclusion list
                                        const filteredGenres = ALL_GENRES.filter(key => {
                                            const rawKey = key.replace('genre_', '');
                                            // Check if any excluded term is part of the key
                                            return !EXCLUDED_CATEGORIES.some(excluded => rawKey.includes(excluded));
                                        });

                                        return filteredGenres.map((genreKey) => {
                                            // We want to pass the KEY as the selected genre, 
                                            // but the filtering logic compares against item.genre which might be "Action"
                                            // For now, let's assume we pass the translated value? 
                                            // No, passing the key is cleaner, but requires updating filtering logic.
                                            // The user asked to "add all these genres... depending on the selected language".
                                            // So we show the TRANSLATED name.

                                            // Ideally we should refactor filtering to use keys, but to avoid breaking existing data:
                                            // We will pass the RAW genre name found in translations (e.g. "Action", "Deportes").
                                            // But wait, item.genre in mock data is English ("Action").
                                            // If I set filter to "Deportes", it won't match "Sports".
                                            // So filtering must handle translation or keys.

                                            // Let's pass the KEY to selectedGenre.
                                            // And update the searchResults filter logic next.

                                            return (
                                                <button
                                                    key={genreKey}
                                                    // Temporarily, we will set it to the TRANSLATED value because `searchResults` expects string matching
                                                    // But this is fragile if data is in English.
                                                    // Actually previously we tried to match keys in `searchResults`.
                                                    // Let's stick to setting it to the Key 'genre_action' and update the search filter below.
                                                    onClick={() => setSelectedGenre(genreKey)}
                                                    className="py-3 px-4 text-[13px] font-bold text-gray-500 hover:text-pi-purple hover:bg-pi-purple/5 transition-all border border-gray-100/50 rounded-xl text-left flex items-center justify-between group bg-slate-50/30"
                                                >
                                                    {t(genreKey as any)}
                                                    <TrendingUp size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-pi-purple" />
                                                </button>
                                            )
                                        });
                                    })()}
                                </div>
                            </div>

                            {/* --- ESTADO --- */}
                            <div>
                                <h3 className="text-gray-400 text-[11px] font-black uppercase tracking-widest mb-6 px-1">{t('explore_status')}</h3>
                                <div className="grid grid-cols-3 gap-x-2">
                                    {[t('status_ongoing'), t('status_completed'), t('status_new')].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setSelectedStatus(status)}
                                            className="py-3 text-[13px] font-bold text-gray-500 hover:text-white hover:bg-pi-purple transition-all border border-gray-100/50 rounded-xl bg-slate-50/30"
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* --- ALFABETICO --- */}
                            <div>
                                <h3 className="text-gray-400 text-[11px] font-black uppercase tracking-widest mb-6 px-1">{t('explore_alphabet')}</h3>
                                <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                                    {alphabet.map((char) => (
                                        <button
                                            key={char}
                                            onClick={() => setSelectedLetter(char)}
                                            className="h-10 text-[13px] font-bold text-gray-500 hover:text-pi-purple hover:bg-pi-purple/5 transition-all flex items-center justify-center rounded-lg border border-transparent hover:border-pi-purple/20"
                                        >
                                            {char}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4"
                        >
                            {/* Filter Summary / Clear Button */}
                            {(searchQuery || selectedStatus || selectedLetter || selectedGenre) && (
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedGenre && (
                                            <span className="bg-pi-purple text-white px-3 py-1 rounded-full text-[10px] font-black border border-pi-purple/10 uppercase">
                                                {t(selectedGenre as any)}
                                            </span>
                                        )}
                                        {selectedStatus && (
                                            <span className="bg-pi-purple/10 text-pi-purple px-3 py-1 rounded-full text-[10px] font-black border border-pi-purple/20">
                                                {selectedStatus.toUpperCase()}
                                            </span>
                                        )}
                                        {selectedLetter && (
                                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black border border-slate-200">
                                                LETRA: {selectedLetter}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedStatus(null);
                                            setSelectedLetter(null);
                                            setSelectedGenre(null);
                                        }}
                                        className="text-[10px] font-black text-pi-purple hover:text-pi-purple-dark uppercase tracking-tighter hover:underline"
                                    >
                                        Limpiar Todo
                                    </button>
                                </div>
                            )}

                            {/* Results Grid - Responsive 4 columns */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                                {(searchQuery || selectedStatus || selectedLetter || selectedGenre ? searchResults :
                                    activeTab === "POPULAR" ? popularList : latestList).length > 0 ? (
                                    (searchQuery || selectedStatus || selectedLetter || selectedGenre ? searchResults :
                                        activeTab === "POPULAR" ? popularList : latestList).map((item, idx) => (
                                            <div
                                                key={item.id + idx}
                                                onClick={() => router.push(`/news/${item.id}`)}
                                                className="flex flex-col gap-3 bg-white hover:bg-gray-50/50 rounded-2xl transition-all cursor-pointer group active:scale-[0.98] border border-transparent hover:border-gray-100 p-2"
                                            >
                                                <div className="relative w-full aspect-[3/4.5] rounded-xl overflow-hidden shadow-sm">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    {item.isNew && (
                                                        <div className="absolute top-2 left-2 bg-pi-purple text-[8px] font-black px-2 py-1 rounded-md uppercase text-white shadow-lg">
                                                            {t('status_new')}
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="flex flex-col px-1">
                                                    <h4 className="font-black text-sm text-gray-900 line-clamp-1 leading-tight group-hover:text-pi-purple transition-colors mb-1">
                                                        {item.title}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mb-3">
                                                        <span className="truncate">{item.author}</span>
                                                        <span className="text-gray-200">|</span>
                                                        <span className="text-pi-purple/70 uppercase tracking-tighter">
                                                            {(() => {
                                                                let genreKey = 'genre_' + item.genre.toLowerCase()
                                                                    .replace('ó', 'o')
                                                                    .replace('í', 'i')
                                                                    .replace('é', 'e')
                                                                    .replace('á', 'a')
                                                                    .replace('ñ', 'n')
                                                                    .replace(/\s+/g, '')
                                                                    .replace(/-+/g, '');

                                                                if (genreKey === 'genre_accion') genreKey = 'genre_action';
                                                                if (genreKey === 'genre_aventura') genreKey = 'genre_adventure';
                                                                if (genreKey === 'genre_fantasia') genreKey = 'genre_fantasy';
                                                                if (genreKey === 'genre_cienciaficcion') genreKey = 'genre_scifi';
                                                                if (genreKey === 'genre_misterio') genreKey = 'genre_mystery';
                                                                if (genreKey === 'genre_comedia') genreKey = 'genre_comedy';
                                                                if (genreKey === 'genre_terror') genreKey = 'genre_horror';
                                                                if (genreKey === 'genre_psicologico') genreKey = 'genre_psychological';
                                                                if (genreKey === 'genre_cotidiano') genreKey = 'genre_sliceoflife';
                                                                if (genreKey === 'genre_historico') genreKey = 'genre_historical';

                                                                const translated = t(genreKey as any);
                                                                return (translated && translated !== genreKey) ? translated : item.genre;
                                                            })()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1 text-gray-400">
                                                            <TrendingUp size={10} className="text-pi-purple" />
                                                            <span className="text-[10px] font-black">{(item.views || 0).toLocaleString()}</span>
                                                        </div>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${item.status === 'Continuo'
                                                            ? 'bg-green-50 text-green-600 border-green-100'
                                                            : 'bg-blue-50 text-blue-600 border-blue-100'
                                                            }`}>
                                                            {item.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div className="col-span-full text-center py-24 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-gray-300 border border-gray-100">
                                            <Search size={36} />
                                        </div>
                                        <p className="text-gray-900 text-lg font-black tracking-tight">{t('explore_no_results')}</p>
                                        <p className="text-gray-400 text-sm mt-1">{t('explore_try_others')}</p>
                                        <button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setSelectedStatus(null);
                                                setSelectedLetter(null);
                                                setSelectedGenre(null);
                                            }}
                                            className="mt-8 px-6 py-3 bg-pi-purple text-white text-xs font-black rounded-xl hover:shadow-lg transition-all active:scale-95"
                                        >
                                            {t('explore_show_all')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* 4. BOTTOM NAVIGATION */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-3 flex items-center justify-between z-50 transition-colors duration-300">
                <button onClick={() => router.push("/")} className="text-slate-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <Home size={22} />
                    <span className="text-[10px] font-bold">{t('nav_home')}</span>
                </button>
                <button className="text-pi-purple flex flex-col items-center gap-1">
                    <Search size={22} />
                    <span className="text-[10px] font-bold underline decoration-2 underline-offset-4">{t('nav_explore')}</span>
                </button>
                <button onClick={() => router.push("/upload")} className="text-slate-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <Upload size={22} />
                    <span className="text-[10px] font-bold">{t('nav_upload')}</span>
                </button>
                <button onClick={() => router.push("/library")} className="text-slate-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <BookOpen size={22} />
                    <span className="text-[10px] font-bold">{t('nav_library')}</span>
                </button>
                <button onClick={() => router.push("/profile")} className="text-slate-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <User size={22} />
                    <span className="text-[10px] font-bold">{t('nav_profile')}</span>
                </button>
            </nav>
        </div>
    );
}
