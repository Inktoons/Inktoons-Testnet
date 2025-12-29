"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { mockNews } from "@/data/mockNews";
import {
    ArrowLeft,
    Share2,
    Download,
    AlertCircle,
    Star,
    Heart,
    Bell,
    BookOpen,
    Info,
    MessageSquare,
    ThumbsUp,
    PenTool,
    Image as ImageIcon,
    Send,
    X,
    MessageCircle,
    Trash2,
    Lock,
    Coins,
    Calendar,
    CheckCircle2,
    PlusCircle,
    Edit3,
    Crown,
    Home as HomeIcon,
    Search,
    User,
    Upload
} from "lucide-react";
import { usePi } from "@/components/PiNetworkProvider";
import { useUserData } from "@/context/UserDataContext";
import { useContent, Chapter, Webtoon } from "@/context/ContentContext";
import { useMissions } from "@/context/MissionContext";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useLanguage } from "@/context/LanguageContext";
import BottomNavbar from "@/components/BottomNavbar";
import { Wallet, Globe, Languages } from "lucide-react";

interface Comment {
    id: string;
    username: string;
    avatar: string; // URL or initial
    content: string;
    image?: string; // Optional image URL
    timestamp: string;
    likes: number;
    replies: number;
}

export default function MangaDetailPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const requestedTab = searchParams.get('tab');
    const { user, authenticate, loading } = usePi();
    const { t, language, setLanguage } = useLanguage();
    const {
        isFavorite,
        toggleFavorite,
        isInHistory,
        addToHistory,
        isFollowingAuthor,
        toggleFollowAuthor,
        rateWebtoon,
        getUserRating,
        getLastReadChapter,
        isChapterRead,
        userData,
        addBalance,
        updateReadingProgress
    } = useUserData();
    const { getWebtoon } = useContent();
    const { trackAction } = useMissions();

    // Attempt to get from context first, then mock
    const contentWebtoon = getWebtoon(id as string);
    const news = (contentWebtoon || mockNews.find((item) => item.id === id)) as Webtoon | undefined;

    const [activeTab, setActiveTab] = useState(requestedTab || "details");
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showLangSelector, setShowLangSelector] = useState(false);

    const unreadCount = (userData.notifications || []).filter(n => !n.read).length;
    const isVIP = userData.subscription && Date.now() < userData.subscription.expiresAt;

    // Comments State
    const [comments, setComments] = useState<Comment[]>([
        {
            id: "c1",
            username: "W893",
            avatar: "W",
            content: "🔥🥵",
            timestamp: "3 Horas atras",
            likes: 0,
            replies: 0
        },
        {
            id: "c2",
            username: "Pionero",
            avatar: "P",
            content: "¡Increíble historia! Me encanta el desarrollo de los personajes. 👍🥵👍",
            image: "https://images.unsplash.com/photo-1620336655055-1f69376980c2?auto=format&fit=crop&w=200&q=80",
            timestamp: "Nov 22, 2025",
            likes: 42,
            replies: 2
        }
    ]);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [newCommentText, setNewCommentText] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Rating State initialized from data as integer
    const [mockRating, setMockRating] = useState(Math.round(news?.rating || 0).toString());
    const [voteCount, setVoteCount] = useState(news?.votes || 0);

    // Sync state with news data when it loads
    React.useEffect(() => {
        if (news) {
            setMockRating(Math.round(news.rating || 0).toString());
            setVoteCount(news.votes || 0);
        }
    }, [news?.rating, news?.votes]);

    // Track visit
    React.useEffect(() => {
        if (news?.id) {
            trackAction('VIEW_SERIES_DETAILS', { seriesId: news.id });
        }
    }, [news?.id, trackAction]);


    if (!news) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 border-4 border-pi-purple border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-bold">Cargando inicio...</p>
                {/* Fallback button if it takes too long */}
                <button
                    onClick={() => router.push('/')}
                    className="mt-8 text-xs text-pi-purple font-bold border border-pi-purple/20 px-4 py-2 rounded-full"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    const { createPayment } = usePi();

    // Mock data to match the screenshot richness
    const status = "En progreso";
    const alternativeTitle = "The Pioneer's Legacy, Cronache della Rete";
    const genres = ["Acción", "Aventura", "Fantasía"];

    const isFav = isFavorite(news.id);
    const inHist = isInHistory(news.id);
    const isFollowingAuth = isFollowingAuthor(news.author);
    const userRating = getUserRating(news.id); // Get current user vote

    const handleRead = () => {
        addToHistory(news.id);
    };

    const handleVote = (ratingValue: number) => {
        if (user) {
            if (!userRating) {
                // Only increment if it's a new vote
                setVoteCount(prev => prev + 1);
            }
            rateWebtoon(news.id, ratingValue);

            // Updates visual average slightly to show interaction (rounded to nearest integer)
            const currentTotal = parseFloat(mockRating) * voteCount;
            const newAverage = Math.round((currentTotal + ratingValue) / (voteCount + 1)).toString();
            setMockRating(newAverage);

            trackAction('RATE_SERIES', { seriesId: news.id, rating: ratingValue });

        } else {
            authenticate();
        }
    };

    // Format votes for display (e.g. 12500 -> 12.5k, 12501 -> 12501)
    const displayVotes = voteCount > 1000 && voteCount % 1000 === 0
        ? `${(voteCount / 1000).toFixed(1)}k`
        : voteCount.toLocaleString();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Disabled by user request
    };

    const handleDeleteComment = (commentId: string) => {
        if (confirm(t('detail_dialog_delete'))) {
            setComments(comments.filter(c => c.id !== commentId));
        }
    };

    const handleSubmitComment = () => {
        if (!user) {
            alert(t('detail_comment_login'));
            // authenticate(); // Could trigger auth flow
            return;
        }
        if (!newCommentText.trim()) return;

        const newComment: Comment = {
            id: Date.now().toString(),
            username: user.username,
            avatar: user.username.charAt(0).toUpperCase(),
            content: newCommentText,
            timestamp: "Justo ahora",
            likes: 0,
            replies: 0
        };

        setComments([newComment, ...comments]);
        setNewCommentText("");
        setShowCommentInput(false);
        trackAction('COMMENT', { seriesId: news.id });
    };

    return (
        <div className="min-h-screen bg-white text-foreground pb-20">
            {/* Top Navigation - Manga Style */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-gray-600 hover:text-black transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <span className="font-black text-lg">{t('detail_nav_title')}</span>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {user && (
                        <div className="flex items-center gap-1 md:gap-3">
                            {/* Language Selector */}
                            <div className="relative flex items-center">
                                <button
                                    onClick={() => setShowLangSelector(!showLangSelector)}
                                    className={`p-2 rounded-full transition-all active:scale-95 flex items-center gap-1.5 ${showLangSelector ? 'bg-pi-purple/10 text-pi-purple' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`}
                                    title="Seleccionar Idioma"
                                >
                                    <Globe size={22} />
                                    <span className="text-[10px] font-black uppercase hidden md:block">
                                        {language === 'es' ? '🇪🇸' : language === 'en' ? '🇺🇸' : language === 'pt' ? '🇧🇷' : '🇫🇷'}
                                    </span>
                                </button>

                                {showLangSelector && (
                                    <>
                                        <div className="fixed inset-0 z-[90]" onClick={() => setShowLangSelector(false)} />
                                        <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 min-w-[150px] z-[100] animate-in fade-in zoom-in-95 duration-100">
                                            {[
                                                { id: 'es', flag: '🇪🇸', name: 'Español' },
                                                { id: 'en', flag: '🇺🇸', name: 'English' },
                                                { id: 'pt', flag: '🇧🇷', name: 'Português' },
                                                { id: 'fr', flag: '🇫🇷', name: 'Français' }
                                            ].map((lang) => (
                                                <button
                                                    key={lang.id}
                                                    onClick={() => {
                                                        setLanguage(lang.id as any);
                                                        setShowLangSelector(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-bold text-sm active:scale-[0.98] ${language === lang.id ? 'bg-pi-purple text-white shadow-md' : 'hover:bg-gray-50 text-gray-700'}`}
                                                >
                                                    <span className="text-xl">{lang.flag}</span>
                                                    <span className="flex-1 text-left">{lang.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Wallet */}
                            <button
                                onClick={() => router.push('/wallet')}
                                className="p-2 transition-transform active:scale-90 text-gray-500 hover:text-black"
                                title="Billetera"
                            >
                                <Wallet size={22} />
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-pi-purple/10 text-pi-purple' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <Bell size={22} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF4D4D] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                            </div>

                            <div
                                onClick={() => router.push("/profile")}
                                className="relative cursor-pointer group ml-1"
                            >
                                {isVIP && (
                                    <div className="absolute -inset-1 bg-gradient-to-tr from-amber-300 via-yellow-500 to-amber-600 rounded-full animate-spin-slow opacity-80 blur-[1px]" />
                                )}
                                <div className="w-8 h-8 rounded-full bg-pi-purple flex items-center justify-center text-white shadow-sm overflow-hidden relative z-10 border-2 border-white">
                                    {userData.profileImage ? (
                                        <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[10px] font-bold">{user.username.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <div className="px-5 py-6 flex gap-5">
                    {/* Cover Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-32 h-44 flex-shrink-0 rounded-lg overflow-hidden shadow-lg"
                    >
                        <Image
                            src={news.imageUrl}
                            alt={news.title}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute top-0 right-0 bg-pi-gold text-black text-[10px] font-black px-1.5 py-0.5 rounded-bl-lg">
                            HOT
                        </div>
                    </motion.div>

                    {/* Info */}
                    <div className="flex-1 py-1">
                        <h1 className="text-xl font-black leading-tight mb-2 line-clamp-3">
                            {news.title}
                        </h1>

                        {/* Interactive Rating */}
                        <div className="flex items-center gap-1 mb-2">
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map(i => {
                                    // If user hasn't voted, stars are empty (userRating is undefined/0)
                                    // If user HAS voted, stars filled up to userRating
                                    const isFilled = i <= (userRating || 0);

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleVote(i)}
                                            className="focus:outline-none transition-transform active:scale-95 p-0.5"
                                        >
                                            <Star
                                                size={16}
                                                className={`${isFilled
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-gray-300 fill-transparent stroke-gray-300"
                                                    }`}
                                                strokeWidth={2}
                                            />
                                        </button>
                                    );
                                })}
                            </div>

                            <span className="text-red-500 font-bold text-sm ml-1">
                                {mockRating}
                            </span>
                            <span className="text-gray-400 text-xs font-medium">
                                ({displayVotes} {t('detail_votes')})
                            </span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${news.status === 'Completed' ? 'bg-green-500' : 'bg-green-500'}`} />
                            <span className="text-sm font-medium text-gray-500">
                                {t((news.status === 'Completed' ? 'status_completed' : 'status_ongoing') as any)}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                            {genres.map(g => {
                                // Simple mapping for translation
                                // We try to normalize string to key format: genre_accion -> genre_action checking known keys
                                let genreKey = 'genre_' + g.toLowerCase()
                                    .replace('ó', 'o')
                                    .replace('í', 'i')
                                    .replace('é', 'e')
                                    .replace('á', 'a')
                                    .replace('ñ', 'n')
                                    .replace(/\s+/g, '') // remove spaces for keys like sliceoflife
                                    .replace(/-+/g, ''); // remove dashes for sci-fi

                                // Direct fixes for translations
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
                                // If t() returns the key itself (meaning no translation found) or empty, fallback to original
                                const display = (translated && translated !== genreKey) ? translated : g;

                                return (
                                    <span key={g} className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                                        {display}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-5 mb-8 flex gap-4">
                    <button
                        onClick={() => {
                            toggleFavorite(news.id);
                            // Assuming toggleFavorite doesn't return state, we track only if it was not fav before (likely following)
                            // But simplify: just track intent.
                            if (!isFav) trackAction('FOLLOW_AUTHOR', { author: news.author }); // Actually this is 'FOLLOW_SERIES' usually, but 'Follow Author' is separate in text.
                            // NOTE: toggleFavorite follows the Webtoon Series. 
                            // toggleFollowAuthor follows the AUTHOR. This button says "SEGUIR / SIGUIENDO" but calls toggleFavorite(news.id) which looks like Series Follow.
                            // Let's check the text below "Publicador". Using that one for 'FOLLOW_AUTHOR'.
                            // This generic button probably means "Follow Series".
                        }}
                        className={`flex-1 py-3 rounded-full font-black text-sm border-2 transition-all active:scale-95 flex items-center justify-center gap-2 ${isFav
                            ? "border-pi-purple bg-pi-purple/10 text-pi-purple"
                            : "border-gray-200 text-gray-700 hover:border-pi-purple"
                            }`}
                    >
                        {isFav ? <Heart size={18} fill="currentColor" /> : <Heart size={18} />}
                        {isFav ? t('detail_btn_reading') : t('detail_btn_follow')}
                    </button>
                    <button
                        onClick={() => {
                            handleRead();
                            const lastChapterId = getLastReadChapter(news.id);
                            if (lastChapterId) {
                                router.push(`/chapter/${id}/${lastChapterId}`);
                            } else if (news.chapters && news.chapters.length > 0) {
                                // Navigate to the oldest chapter first if new reader? 
                                // Actually, webtoons usually display newest first in list, 
                                // so the first chapter to read is usually the last one in the array if sorted newest-first.
                                // Let's assume index 0 for now as previously, but better to go to newest if it's a "latest" click.
                                router.push(`/chapter/${id}/${news.chapters[news.chapters.length - 1].id}`);
                            } else {
                                setActiveTab("episodes");
                            }
                        }}
                        className={`flex-1 py-3 rounded-full font-black text-sm shadow-lg shadow-pi-purple/20 transition-all active:scale-95 flex items-center justify-center gap-2 ${inHist
                            ? "bg-gray-800 text-white" // Reading state
                            : "bg-pi-purple text-white"
                            }`}
                    >
                        <BookOpen size={18} />
                        {inHist ? t('detail_btn_continue') : t('detail_btn_read')}
                    </button>
                </div>

                {/* Tab Navigation - Adjusted for better sticky behavior */}
                <div className="flex items-center border-b border-gray-100 sticky top-[52px] bg-white z-40 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.01)]">
                    {[
                        { id: 'details', label: 'detail_tab_details' },
                        { id: 'episodes', label: 'detail_tab_episodes' },
                        { id: 'comments', label: 'detail_tab_comments' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 text-[11px] font-black tracking-widest relative transition-colors ${activeTab === tab.id ? "text-pi-purple" : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {t(tab.label as any)}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="underline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-pi-purple"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="px-5 pt-6 pb-20 min-h-[300px]">
                    {activeTab === "details" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {/* Introducción */}
                            <div className="mb-8">
                                <h3 className="text-gray-400 text-xs font-bold uppercase mb-3 px-1">{t('detail_intro_title')}</h3>
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                    <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                                        {news.excerpt}
                                    </p>
                                </div>
                            </div>

                            {/* Publicador Section */}
                            <div className="mb-10">
                                <h3 className="text-gray-400 text-xs font-bold uppercase mb-3 px-1">{t('detail_publisher_title')}</h3>
                                <div className="bg-white rounded-3xl border border-slate-100 p-5 flex items-center justify-between shadow-sm group">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {/* Safe logic for frame */}
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-black shadow-lg border-2 overflow-hidden relative ${(user && news && user.username === news.author && userData?.isFounder)
                                                ? "border-transparent bg-gradient-to-tr from-pi-purple via-amber-500 to-indigo-600 p-[2px] animate-gradient-xy"
                                                : (user && news && user.username === news.author && userData?.subscription)
                                                    ? "border-amber-400"
                                                    : "border-white"
                                                }`}>
                                                <div className="w-full h-full rounded-full overflow-hidden bg-pi-purple flex items-center justify-center">
                                                    {(user && news && user.username === news.author && userData?.profileImage) ? (
                                                        <img src={userData.profileImage} alt="Author" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{news?.author?.charAt(0).toUpperCase() || "A"}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {(user && news && user.username === news.author && userData?.subscription) && (
                                                <div className="absolute -bottom-1 -right-1 bg-pi-gold text-[8px] font-black px-1 rounded border border-white shadow-sm">
                                                    VIP
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <p className="font-black text-slate-900">{news?.author || "Autor"}</p>
                                                {(user && news && user.username === news.author && userData?.isFounder) && (
                                                    <Crown size={12} className="text-pi-gold fill-pi-gold" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-slate-100 text-slate-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{t('detail_official_creator')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => news && toggleFollowAuthor(news.author)}
                                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isFollowingAuth
                                            ? "bg-slate-100 text-slate-400"
                                            : "bg-pi-purple text-white shadow-md shadow-pi-purple/20 active:scale-95"
                                            }`}
                                    >
                                        {isFollowingAuth ? t('detail_btn_reading') : t('detail_btn_follow')}
                                    </button>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div>
                                <h3 className="text-gray-400 text-xs font-bold uppercase mb-4 px-1">{t('detail_you_may_like')}</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {mockNews.filter(n => n.id !== id).map(item => (
                                        <div
                                            key={item.id}
                                            className="cursor-pointer group"
                                            onClick={() => router.push(`/news/${item.id}`)}
                                        >
                                            <div className="relative aspect-[3/4.5] rounded-lg overflow-hidden mb-2 bg-gray-100">
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform"
                                                />
                                            </div>
                                            <p className="text-xs font-bold line-clamp-2 leading-tight group-hover:text-pi-purple">{item.title}</p>
                                        </div>
                                    ))}
                                    {/* Placeholders to fill grid */}
                                    <div className="aspect-[3/4.5] rounded-lg bg-gray-100 animate-pulse" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "episodes" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                            {/* Creator Add Chapter Button */}
                            {(() => {
                                if (loading) return null; // Don't render until auth state is known
                                if (!user) return null; // Only show if a user is logged in

                                // 1. Check by username (case-insensitive)
                                const isAuthorName = user.username?.toLowerCase() === news.author?.toLowerCase();

                                // 2. Check if the webtoon ID belongs to the current user's locally created content
                                // This would require a way to track webtoons created by the current user,
                                // e.g., a 'myWebtoons' list in usePi or checking local storage for created IDs.
                                // For now, we rely on the author string.
                                // A more robust check might involve:
                                // const isLocalCreator = localStorage.getItem(`myWebtoon_${news.id}`) === user.username;
                                // const isCreator = isAuthorName || isLocalCreator;
                                const isCreator = isAuthorName;

                                return isCreator && (
                                    <button
                                        onClick={() => router.push(`/upload?webtoonId=${news.id}`)}
                                        className="w-full py-4 mb-4 border-2 border-dashed border-pi-purple/30 rounded-xl flex items-center justify-center gap-2 text-pi-purple font-black text-sm hover:bg-pi-purple/5 transition-all active:scale-[0.98]"
                                    >
                                        <PlusCircle size={20} />
                                        {t('detail_add_chapter')}
                                    </button>
                                );
                            })()}

                            {news?.chapters && news.chapters.length > 0 ? (
                                news.chapters.map((chapter: Chapter, index: number) => {
                                    const isRead = isChapterRead(news.id, chapter.id);

                                    return (
                                        <div
                                            key={chapter.id}
                                            onClick={() => {
                                                const isUnlockedByTime = chapter.unlockDate && new Date() > new Date(chapter.unlockDate);
                                                const isVIP = userData.subscription && Date.now() < userData.subscription.expiresAt;
                                                const effectiveIsLocked = chapter.isLocked && !isUnlockedByTime && !isVIP;

                                                if (effectiveIsLocked) {
                                                    setSelectedChapter(chapter);
                                                    setShowUnlockModal(true);
                                                } else {
                                                    router.push(`/chapter/${id}/${chapter.id}`);
                                                }
                                            }}
                                            className={`p-4 rounded-xl flex items-center justify-between border transition-all cursor-pointer group ${isRead
                                                ? "bg-white border-pi-purple/20 shadow-sm"
                                                : "bg-gray-50 border-gray-100 hover:border-pi-purple/30 shadow-none"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs ${isRead ? "bg-pi-purple/10 text-pi-purple" : "bg-white border border-gray-200 text-gray-400"
                                                    }`}>
                                                    {(news.chapters?.length || 0) - index}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className={`font-bold text-sm transition-colors ${isRead ? "text-pi-purple" : "text-gray-900 group-hover:text-pi-purple"
                                                            }`}>
                                                            {chapter.title}
                                                        </p>
                                                        {isRead && <CheckCircle2 size={14} className="text-pi-purple" />}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                                                        {chapter.date} {isRead && `• ${t('detail_chapter_read')}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Edit Button for Author */}
                                                {(user?.username?.toLowerCase() === news.author?.toLowerCase()) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/upload?webtoonId=${news.id}&chapterId=${chapter.id}`);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-pi-purple hover:bg-pi-purple/10 rounded-lg transition-all"
                                                        title="Editar capítulo"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                )}

                                                {(() => {
                                                    const isUnlockedByTime = chapter.unlockDate && new Date() > new Date(chapter.unlockDate);
                                                    const isVIP = userData.subscription && Date.now() < userData.subscription.expiresAt;
                                                    const effectiveIsLocked = chapter.isLocked && !isUnlockedByTime && !isVIP;

                                                    if (effectiveIsLocked) {
                                                        const daysRemaining = Math.max(0, Math.ceil((new Date(chapter.unlockDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

                                                        return (
                                                            <div className="flex flex-col items-end">
                                                                <div className="flex items-center gap-1.5 bg-pi-gold/10 text-pi-gold-dark px-2 py-1 rounded-md">
                                                                    <Coins size={12} fill="currentColor" />
                                                                    <span className="text-[10px] font-black">{chapter.unlockCost || 60} INKS</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-[9px] text-gray-400 mt-1">
                                                                    <Lock size={10} />
                                                                    <span>{t('detail_chapter_free_in')} {daysRemaining} {daysRemaining === 1 ? t('detail_chapter_day') : t('detail_chapter_days')}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    } else if (isVIP) {
                                                        return (
                                                            <div className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black border border-amber-200 uppercase tracking-tighter">
                                                                <Crown size={12} fill="currentColor" />
                                                                VIP PASS
                                                            </div>
                                                        );
                                                    } else if (chapter.isLocked && isUnlockedByTime) {
                                                        return (
                                                            <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black">
                                                                FREE
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div className={`p-2 transition-colors ${isRead ? "text-pi-purple" : "text-gray-300"}`}>
                                                                <ArrowLeft className="rotate-180" size={18} />
                                                            </div>
                                                        );
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-20 text-gray-400">
                                    <ImageIcon className="mx-auto mb-4 opacity-20" size={48} />
                                    <p className="text-sm font-bold">{t('detail_no_chapters')}</p>
                                    <p className="text-xs">{t('detail_be_first')}</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "comments" && (
                        <div className="relative min-h-[300px]">
                            {/* Comments List */}
                            <div className="flex flex-col gap-6">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4">
                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                                                {/* If avatar is length 1, treat as initial, else image */}
                                                {comment.avatar.length === 1 ? (
                                                    <span className="font-bold text-gray-600">{comment.avatar}</span>
                                                ) : (
                                                    <Image src={comment.avatar} alt={comment.username} width={40} height={40} className="object-cover" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-gray-900">{comment.username}</span>
                                                </div>
                                                <span className="text-xs text-gray-400 font-medium">{comment.timestamp}</span>
                                            </div>

                                            <p className="text-sm text-gray-800 leading-relaxed mb-2 whitespace-pre-wrap">{comment.content}</p>

                                            {comment.image && (
                                                <div className="relative w-48 h-48 rounded-lg overflow-hidden mb-4 border border-gray-100">
                                                    <Image
                                                        src={comment.image}
                                                        alt="Comment attachment"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-6 text-gray-400 mt-2">
                                                <button className="flex items-center gap-1.5 hover:text-pi-purple transition-colors text-xs font-bold">
                                                    <ThumbsUp size={14} />
                                                    <span>{comment.likes}</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 hover:text-pi-purple transition-colors text-xs font-bold">
                                                    <MessageCircle size={14} />
                                                    <span>{comment.replies}</span>
                                                </button>

                                                {/* Delete Button for Owner */}
                                                {user && user.username === comment.username && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="ml-auto flex items-center gap-1 hover:text-red-500 transition-colors text-xs"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}

                                                {/* Report Button for Others */}
                                                {(!user || user.username !== comment.username) && (
                                                    <button className="ml-auto hover:text-red-500 transition-colors">
                                                        <AlertCircle size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* FAB - Write Comment Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => user ? setShowCommentInput(true) : authenticate()}
                                className="fixed bottom-24 right-6 w-14 h-14 bg-[#FF6B6B] text-white rounded-full shadow-lg shadow-red-200 flex items-center justify-center z-40"
                            >
                                <PenTool size={24} />
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* Comment Input Drawer/Modal */}
                <AnimatePresence>
                    {showCommentInput && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 z-[60]"
                                onClick={() => setShowCommentInput(false)}
                            />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-[70] shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg">{t('detail_comment_write')}</h3>
                                    <button onClick={() => setShowCommentInput(false)} className="p-2 text-gray-400 hover:text-black">
                                        <X size={24} />
                                    </button>
                                </div>

                                <textarea
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    placeholder={t('detail_comment_placeholder')}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm outline-none focus:border-pi-purple focus:ring-1 focus:ring-pi-purple min-h-[120px] resize-none mb-4"
                                />



                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {/* Image upload disabled by user request */}
                                    </div>
                                    <button
                                        onClick={handleSubmitComment}
                                        disabled={!newCommentText.trim()}
                                        className="bg-[#FF6B6B] text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500 transition-colors"
                                    >
                                        <Send size={18} />
                                        PUBLICAR
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Unlock Chapter Modal */}
                <AnimatePresence>
                    {showUnlockModal && selectedChapter && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                                onClick={() => setShowUnlockModal(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="fixed inset-0 m-auto w-[90%] max-w-sm h-fit bg-white rounded-3xl p-8 z-[110] shadow-2xl text-center"
                            >
                                <div className="w-20 h-20 bg-pi-purple/10 rounded-full flex items-center justify-center mx-auto mb-6 text-pi-purple">
                                    <Lock size={40} />
                                </div>
                                <h3 className="text-2xl font-black mb-2">Capítulo Bloqueado</h3>
                                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                    Este capítulo es exclusivo de **Early Access**. Desbloquéalo ahora con Inks o espera al estreno gratuito.
                                </p>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                authenticate();
                                                return;
                                            }

                                            const cost = selectedChapter.unlockCost || 60; // 60 Inks is roughly 0.06 Pi/chapter

                                            if (userData.balance >= cost) {
                                                // Deduct inks and unlock
                                                addBalance(-cost);
                                                updateReadingProgress(id as string, selectedChapter.id);
                                                alert(`¡Capítulo desbloqueado! Se han descontado ${cost} Inks de tu saldo.`);
                                                setShowUnlockModal(false);
                                            } else {
                                                if (confirm(`No tienes suficientes Inks (necesitas ${cost}). ¿Quieres ir a la Wallet a comprar más?`)) {
                                                    router.push('/wallet');
                                                }
                                            }
                                        }}
                                        className="w-full py-4 bg-pi-purple text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-pi-purple/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        <Coins size={20} fill="currentColor" />
                                        DESBLOQUEAR CON {selectedChapter.unlockCost || 60} INKS
                                    </button>
                                    <button
                                        onClick={() => setShowUnlockModal(false)}
                                        className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                                    >
                                        ESPERAR AL ESTRENO
                                    </button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-center gap-2 text-pi-gold-dark font-black text-xs">
                                        <Calendar size={14} />
                                        <span>ESTRENO GRATIS: {new Date(selectedChapter.unlockDate || Date.now()).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <BottomNavbar />
            </main>


            {/* Safe Area Spacer */}
            <div className="h-10" />
        </div>
    );
}
