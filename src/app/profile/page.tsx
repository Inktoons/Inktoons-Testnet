"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePi } from "@/components/PiNetworkProvider";
import { useUserData } from "@/context/UserDataContext";
import { useTheme } from "@/components/ThemeHandler";
import {
    ArrowLeft,
    Bell,
    Menu,
    Heart,
    Users,
    History,
    ChevronRight,
    Edit2,
    Home,
    Search,
    BookOpen,
    User,
    Upload,
    Trash2,
    BarChart2,
    MessageCircle,
    Star,
    Shield,
    Wallet,
    Save,
    Crown,
    Settings,
    RefreshCcw,
    XCircle,
    Languages,
    TrendingUp,
    Check,
    Loader2
} from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { useMissions } from "@/context/MissionContext";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/data/translations";
import TopNavbar from "@/components/TopNavbar";
import { SupabaseService } from "@/lib/supabaseService";

type ViewMode = 'main' | 'favorites' | 'following' | 'history' | 'creator_panel';

export default function ProfilePage() {
    const router = useRouter();
    const { user } = usePi();
    const { userData, setProfileImage, toggleCensorship, updateWalletAddress, cancelSubscription } = useUserData();
    const { regenerateMissions } = useMissions();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { webtoons, deleteWebtoon, uploadImage } = useContent();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('main');
    const [isMyContentExpanded, setIsMyContentExpanded] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
    const [currentPiValue, setCurrentPiValue] = useState<number | null>(null);
    const [isSavingWallet, setIsSavingWallet] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    // Fetch Pi price from official API (via proxy to avoid CORS)
    React.useEffect(() => {
        const fetchPiPrice = async () => {
            try {
                const response = await fetch('/api/price');
                const data = await response.json();
                if (data && data.price) {
                    setCurrentPiValue(data.price);
                }
            } catch (error) {
                console.error("Error fetching Pi price in Profile:", error);
            }
        };
        fetchPiPrice();
        const interval = setInterval(fetchPiPrice, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const piToUsd = (piAmount: number) => {
        if (!currentPiValue) return (piAmount * 0.01); // Fallback
        return piAmount * currentPiValue;
    };

    const usdToPi = (usdAmount: number) => {
        if (!currentPiValue) return (usdAmount / 0.01); // Fallback
        return usdAmount / currentPiValue;
    };

    const withdrawalThresholdPi = currentPiValue ? Math.ceil(10 / currentPiValue) : 1000;

    const username = user?.username || "Pionero";
    const initial = username.charAt(0).toUpperCase();

    const getFilteredWebtoons = () => {
        switch (viewMode) {
            case 'favorites':
                return webtoons.filter(w => userData.favorites.includes(w.id));
            case 'following':
                if (selectedAuthor) {
                    return webtoons.filter(w => w.author === selectedAuthor);
                }
                return [];
            case 'history':
                return userData.history
                    .map(hId => webtoons.find(w => w.id === hId))
                    .filter(Boolean) as typeof webtoons;
            default:
                return webtoons.filter(w => w.author === username);
        }
    };

    const historyItems = React.useMemo(() => {
        return userData.history.reduce((acc: any[], id) => {
            const webtoon = webtoons.find(w => w.id === id);
            if (!webtoon) return acc;
            const totalChapters = webtoon.chapters?.length || 0;
            const readChapters = userData.readChapters[id] || [];
            const readCount = readChapters.length;
            const progress = totalChapters > 0 ? Math.round((readCount / totalChapters) * 100) : 0;
            const lastReadId = userData.lastRead[id];
            const lastReadChapter = webtoon.chapters?.find(ch => ch.id === lastReadId);
            acc.push({ ...webtoon, progress, readCount, totalChapters, lastChapterTitle: lastReadChapter?.title || t('profile_en_curso') });
            return acc;
        }, []);
    }, [webtoons, userData.history, userData.readChapters, userData.lastRead]);

    const menuItems = [
        {
            id: 'favorites',
            icon: <Heart className="text-red-500" size={22} />,
            label: t('profile_favorites'),
            count: userData.favorites.length,
            color: "bg-red-50"
        },
        {
            id: 'following',
            icon: <Users className="text-blue-500" size={22} />,
            label: t('profile_following'),
            count: userData.following.length,
            color: "bg-blue-50"
        },
        {
            id: 'history',
            icon: <History className="text-green-500" size={22} />,
            label: t('profile_history'),
            count: historyItems.length,
            color: "bg-green-50"
        },
    ];

    const getViewTitle = () => {
        switch (viewMode) {
            case 'favorites': return t('profile_view_favorites');
            case 'following': return t('profile_view_following');
            case 'history': return t('profile_view_history');
            case 'creator_panel': return t('profile_creator_panel');
            default: return t('profile_title');
        }
    };

    const handleSaveWallet = async () => {
        if (!user?.uid || !userData.walletAddress) return;
        setIsSavingWallet(true);
        try {
            await SupabaseService.saveUserData(user.uid, { walletAddress: userData.walletAddress });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (error) {
            console.error("Error saving wallet:", error);
        } finally {
            setIsSavingWallet(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const blobUrl = URL.createObjectURL(file);
                setProfileImage(blobUrl);
                const finalUrl = await uploadImage(file);
                if (finalUrl) setProfileImage(finalUrl);
            } catch (err) {
                console.error("Profile upload failed:", err);
            }
        }
    };

    const handleEditClick = () => {
        fileInputRef.current?.click();
    };

    const renderHistoryItem = (item: any, idx: number) => (
        <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => router.push(`/news/${item.id}`)}
            className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 hover:shadow-md transition-all cursor-pointer"
        >
            <div className="w-16 h-22 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1 mb-1">{item.title}</h4>
                <p className="text-[10px] font-bold text-pi-purple uppercase mb-2">{item.lastChapterTitle}</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-pi-purple h-full" style={{ width: `${item.progress}%` }} />
                </div>
            </div>
        </motion.div>
    );

    const renderFollowingAuthor = (authorName: string, idx: number) => {
        const authorWebtoons = webtoons.filter(w => w.author === authorName);
        const isSelected = selectedAuthor === authorName;

        return (
            <div key={authorName} className="space-y-3">
                <div
                    onClick={() => setSelectedAuthor(isSelected ? null : authorName)}
                    className={`bg-white rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'border-pi-purple shadow-md' : 'border-slate-100 hover:border-pi-purple/30'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pi-purple/10 flex items-center justify-center text-pi-purple font-black">
                            {authorName[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{authorName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{authorWebtoons.length} INKTOONS</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className={`text-slate-300 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                </div>
                {isSelected && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pl-4 space-y-3"
                    >
                        {authorWebtoons.map((ink, i) => (
                            <div
                                key={ink.id}
                                onClick={() => router.push(`/news/${ink.id}`)}
                                className="bg-white/50 rounded-xl border border-slate-100 p-3 flex gap-3 cursor-pointer hover:bg-white"
                            >
                                <img src={ink.imageUrl} className="w-10 h-14 rounded object-cover shadow-sm" />
                                <div className="flex-1 py-1">
                                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{ink.title}</p>
                                    <p className="text-[9px] font-bold text-pi-purple/60 uppercase">{t(ink.category.toLowerCase() as any)}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        );
    };

    const renderWebtoonList = (items: typeof webtoons) => (
        <div className="space-y-4">
            {items.length > 0 ? (
                items.map((inktoon, idx) => (
                    <motion.div
                        key={inktoon.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => router.push(`/news/${inktoon.id}`)}
                        className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 relative group hover:border-pi-purple/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                        <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-slate-100">
                            <img src={inktoon.imageUrl} alt={inktoon.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center py-1">
                            <h4 className="font-bold text-sm text-slate-900 line-clamp-2 mb-1">{inktoon.title}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2">
                                <User size={12} className="text-slate-400" />
                                <span>{inktoon.author}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                                <Star size={12} className="text-pi-gold" fill="currentColor" />
                                <span className="text-[10px] font-black">{inktoon.rating?.toFixed(1) || "0.0"}</span>
                            </div>
                        </div>
                    </motion.div>
                ))
            ) : (
                <div className="py-20 text-center text-gray-400 font-bold text-sm">
                    {t('profile_no_content')}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col transition-colors duration-300">
            <TopNavbar />

            {/* Sub-view Header (if active) */}
            {viewMode !== 'main' && (
                <div className="sticky top-16 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center gap-4">
                    <button onClick={() => { setViewMode('main'); setSelectedAuthor(null); }} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={22} />
                    </button>
                    <h2 className="font-extrabold text-lg text-slate-900">{getViewTitle()}</h2>
                </div>
            )}

            <main className="flex-1 pb-32">
                <AnimatePresence mode="wait">
                    {viewMode === 'main' ? (
                        <motion.div
                            key="main"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-6 space-y-8"
                        >
                            {/* Profile Header Card */}
                            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-pi-purple/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="relative">
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-xl border-4 overflow-hidden relative ${userData.isFounder
                                            ? "ring-4 ring-amber-400 ring-offset-4 ring-offset-slate-50 border-transparent bg-gradient-to-tr from-pi-purple via-amber-500 to-indigo-600 p-[3px] animate-gradient-xy shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                                            : userData.subscription?.type === '1y'
                                                ? "border-amber-400 shadow-amber-200/50"
                                                : userData.subscription?.type === '6m'
                                                    ? "border-blue-400 shadow-blue-200/50"
                                                    : (userData.subscription?.type === '1m' || userData.subscription?.type === '7d')
                                                        ? "border-pi-purple/50 shadow-pi-purple/20"
                                                        : "border-white"
                                            }`}>
                                            <div className="w-full h-full rounded-full overflow-hidden bg-pi-purple flex items-center justify-center">
                                                {userData.profileImage ? (
                                                    <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{initial}</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleEditClick}
                                            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-pi-purple hover:scale-110 transition-transform"
                                        >
                                            <Edit2 size={14} fill="currentColor" />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h1 className="text-xl font-black text-slate-900">{username}</h1>
                                            {userData.isFounder ? (
                                                <div className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black rounded uppercase flex items-center gap-1 shadow-lg border border-white/20 animate-pulse">
                                                    <Crown size={10} fill="currentColor" className="text-white" /> Fundador Inktoons
                                                </div>
                                            ) : userData.subscription && (
                                                <div className="px-2 py-0.5 bg-pi-gold/10 text-pi-gold-dark text-[10px] font-black rounded uppercase flex items-center gap-1">
                                                    <Crown size={10} fill="currentColor" /> {userData.subscription.type === '7d' ? t('wallet_7_days').toUpperCase() : userData.subscription.type.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${username === 'adriespi' ? 'text-amber-500' : 'text-slate-400'}`}>
                                            {username === 'adriespi' ? 'Creador Inktoons' : (userData.isFounder ? t('profile_founder_desc') : t('profile_pioneer_desc'))}
                                        </p>
                                        <button
                                            onClick={() => router.push(`/creator/${username}?edit=true`)}
                                            className="p-1.5 px-3 bg-slate-50 text-slate-500 hover:text-pi-purple hover:bg-pi-purple/5 transition-all text-[10px] font-extrabold uppercase flex items-center gap-2 border border-slate-100 shadow-sm rounded-xl active:scale-95"
                                        >
                                            <Edit2 size={12} /> Editar Perfil Creador
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Creator Panel Entry Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setViewMode('creator_panel')}
                                className="w-full bg-gradient-to-r from-pi-purple to-indigo-600 p-5 rounded-3xl shadow-lg shadow-pi-purple/20 flex items-center justify-between text-white group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <BarChart2 size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-black text-lg leading-tight">{t('profile_creator_panel')}</h3>
                                        <p className="text-xs text-white/70 font-bold uppercase tracking-widest">{t('creator_withdrawal_progress')}</p>
                                    </div>
                                </div>
                                <ChevronRight size={24} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            </motion.button>

                            {/* Stats/Quick Access */}
                            <div className="grid grid-cols-3 gap-4 font-bold">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setViewMode(item.id as ViewMode)}
                                        className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all hover:border-pi-purple/20"
                                    >
                                        <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center`}>
                                            {item.icon}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter mb-0.5">{item.label}</p>
                                            <p className="text-sm font-black text-slate-900">{item.count}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* MY CONTENT SECTION - COLLAPSIBLE */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('profile_my_content')}</h3>
                                    {webtoons.filter(w => w.author === username).length > 3 && (
                                        <button
                                            onClick={() => setIsMyContentExpanded(!isMyContentExpanded)}
                                            className="text-[10px] font-black text-pi-purple uppercase tracking-widest flex items-center gap-1 hover:underline"
                                        >
                                            {isMyContentExpanded ? t('profile_ver_menos') : `${t('profile_ver_todos')} (${webtoons.filter(w => w.author === username).length})`}
                                            <ChevronRight size={14} className={isMyContentExpanded ? "-rotate-90 transition-transform" : "rotate-90 transition-transform"} />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {webtoons.filter(w => w.author === username).length > 0 ? (
                                        webtoons.filter(w => w.author === username)
                                            .slice(0, isMyContentExpanded ? undefined : 3)
                                            .map((ink, idx) => (
                                                <motion.div
                                                    key={ink.id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="bg-white p-3 rounded-2xl border border-slate-100 flex gap-4 cursor-pointer hover:border-pi-purple/20 group transition-all"
                                                    onClick={() => router.push(`/news/${ink.id}`)}
                                                >
                                                    <div className="w-16 h-22 rounded-lg overflow-hidden flex-shrink-0 bg-slate-50">
                                                        <img src={ink.imageUrl} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center gap-1">
                                                        <p className="text-[9px] font-black text-pi-purple uppercase tracking-widest">{t(ink.category.toLowerCase() as any)}</p>
                                                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{ink.title}</h4>
                                                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                                            <span className="flex items-center gap-1"><Star size={10} className="text-pi-gold" fill="currentColor" /> {ink.rating?.toFixed(1) || "0.0"}</span>
                                                            <span className="flex items-center gap-1"><BookOpen size={10} /> {ink.chapters?.length || 0} {t('profile_caps')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center pr-2">
                                                        <button onClick={(e) => { e.stopPropagation(); deleteWebtoon(ink.id); }} className="p-2 text-slate-400 hover:text-red-500 transition-all">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))
                                    ) : (
                                        <div onClick={() => router.push('/upload')} className="bg-white border-2 border-dashed border-slate-100 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                            <Upload className="text-slate-300" size={32} />
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('profile_upload_first')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Settings */}
                            <div className="space-y-4">
                                <div
                                    onClick={toggleCensorship}
                                    className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between group cursor-pointer hover:border-pi-purple/30 transition-all active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                                            <Shield className="text-pink-500" size={22} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-700 block">{t('profile_filter_content')}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('profile_censorship')}</span>
                                        </div>
                                    </div>
                                    <div className={`relative w-11 h-6 rounded-full transition-colors ${userData.censorshipEnabled ? 'bg-pi-purple' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${userData.censorshipEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* SELECT LANGUAGE */}
                                    <div className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-pi-purple/30 transition-all flex flex-col h-full relative overflow-hidden group">
                                        {/* Decorative element */}
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl group-hover:bg-pi-purple/10 transition-colors" />

                                        <div className="flex items-center gap-4 mb-6 relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                                                <Languages className="text-indigo-500" size={28} />
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{t('profile_language')}</h3>
                                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{t('profile_language_desc')}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 relative z-10 mt-auto">
                                            {[
                                                { id: 'es', name: 'Español', flag: '🇪🇸' },
                                                { id: 'en', name: 'English', flag: '🇺🇸' },
                                                { id: 'pt', name: 'Português', flag: '🇧🇷' },
                                                { id: 'fr', name: 'Français', flag: '🇫🇷' },
                                                { id: 'ko', name: '한국어', flag: '🇰🇷' }
                                            ].map((lang) => (
                                                <button
                                                    key={lang.id}
                                                    onClick={() => setLanguage(lang.id as Language)}
                                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl border text-sm font-black transition-all active:scale-[0.97] ${language === lang.id
                                                        ? 'bg-pi-purple text-white border-pi-purple shadow-xl shadow-pi-purple/20'
                                                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-pi-purple/30 hover:bg-white'
                                                        }`}
                                                >
                                                    {/* Flag removed as per request */}
                                                    <span className="flex-1 text-left">{lang.name}</span>
                                                    {language === lang.id && (
                                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* WALLET */}
                                    <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-pi-purple/30 transition-all flex flex-col h-full relative overflow-hidden">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                                                <Wallet className="text-amber-500" size={24} />
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-700 block leading-tight">{t('profile_wallet')}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('profile_wallet_desc')}</span>
                                            </div>
                                        </div>
                                        <div className="mt-auto space-y-3 pt-2">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder={t('profile_wallet_placeholder')}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-pi-purple/50 focus:ring-1 focus:ring-pi-purple/50 font-mono"
                                                    value={userData.walletAddress || ""}
                                                    onChange={(e) => updateWalletAddress(e.target.value)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    {saveSuccess && (
                                                        <span className="text-[10px] font-black text-green-500 flex items-center gap-1 animate-pulse">
                                                            <Check size={12} /> {t('profile_wallet_saved')}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={handleSaveWallet}
                                                    disabled={isSavingWallet || !userData.walletAddress}
                                                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-pi-purple hover:shadow-pi-purple/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSavingWallet ? (
                                                        <RefreshCcw size={12} className="animate-spin" />
                                                    ) : (
                                                        <Save size={12} />
                                                    )}
                                                    {t('profile_wallet_save')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </motion.div>
                    ) : (
                        <motion.div
                            key="subview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="p-6 space-y-6"
                        >
                            {viewMode === 'following' ? (
                                <div className="space-y-4">
                                    {userData.following.length > 0 ? (
                                        userData.following.map((author, idx) => renderFollowingAuthor(author, idx))
                                    ) : (
                                        <div className="py-20 text-center text-slate-400 font-bold text-sm">No sigues a ningún autor todavía.</div>
                                    )}
                                </div>
                            ) : viewMode === 'creator_panel' ? (
                                <div className="space-y-8">
                                    {/* Main Balance Card - PI (DONATED) */}
                                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pi-purple to-indigo-600" />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t('creator_total_balance')}</p>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <span className="text-5xl font-black text-slate-900">{userData.creatorBalance?.toFixed(2) || "0.00"}</span>
                                            <div className="flex flex-col items-start leading-none ml-1">
                                                <span className="text-xs font-bold text-pi-purple uppercase tracking-tighter">Pi</span>
                                                <span className="text-[10px] font-black text-slate-300 uppercase">donados</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold">
                                            ≈ ${((userData.creatorBalance || 0) * (currentPiValue || 0)).toFixed(2)} USD Bruto
                                        </p>
                                    </div>

                                    {/* Withdrawal Progress Bar (Based on USD Value) */}
                                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <h3 className="font-black text-sm text-slate-900 mb-1">{t('creator_withdrawal_progress')}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{t('creator_withdrawal_min')}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black text-pi-purple">
                                                    ${((userData.creatorBalance || 0) * (currentPiValue || 0)).toFixed(2)}
                                                </span>
                                                <span className="text-xs text-slate-300 font-bold mx-1">/</span>
                                                <span className="text-sm font-black text-slate-300">$10</span>
                                            </div>
                                        </div>

                                        <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 flex p-1 mb-4">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((((userData.creatorBalance || 0) * (currentPiValue || 0)) / 10) * 100, 100)}%` }}
                                                className="h-full bg-gradient-to-r from-pi-purple to-indigo-500 rounded-full"
                                            />
                                        </div>

                                        <div className="bg-pi-purple/5 rounded-2xl p-4 flex items-start gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-pi-purple flex-shrink-0">
                                                <TrendingUp size={20} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                                {t('creator_next_withdrawal').replace('{amount}', (Math.max(0, 10 - ((userData.creatorBalance || 0) * (currentPiValue || 0)))).toFixed(2))}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Swap Area & Pi Balance */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-pi-purple/5 rounded-[2.5rem] p-6 border border-pi-purple/10 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-pi-purple/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
                                        <div className="relative z-10 flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">{t('creator_swap_title')}</h3>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mt-1">{t('creator_swap_desc')}</p>
                                                </div>
                                            </div>

                                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80">
                                                {/* Step-by-Step Breakdown */}
                                                <div className="space-y-4 mb-6 pt-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-1.5 h-4 bg-pi-purple rounded-full" />
                                                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{t('creator_gross_value')}</h4>
                                                    </div>

                                                    <div className="space-y-2 bg-white/40 rounded-xl p-3 border border-white/60">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] text-slate-500 font-bold">Pi Donado Total</span>
                                                            <span className="text-[11px] text-slate-900 font-black">{userData.creatorBalance?.toFixed(4) || "0.0000"} Pi</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-amber-500 bg-amber-50/50 rounded-lg px-2 py-1">
                                                            <span className="text-[10px] font-bold flex items-center gap-1">
                                                                <Shield size={10} /> {t('creator_platform_fee')}
                                                            </span>
                                                            <span className="text-[10px] font-black">-{((userData.creatorBalance || 0) * 0.15).toFixed(4)} Pi</span>
                                                        </div>
                                                        <div className="flex justify-between items-center border-t border-slate-100/50 pt-2">
                                                            <span className="text-[10px] text-slate-500 font-bold">Cotización (Coingecko)</span>
                                                            <span className="text-[10px] text-pi-purple font-black">${currentPiValue?.toFixed(4) || "---"} USD</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Final Quote Card */}
                                                <div className="bg-gradient-to-br from-white to-pi-purple/5 rounded-2xl p-4 border border-pi-purple/20 shadow-sm relative overflow-hidden mb-6">
                                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                                        <RefreshCcw size={40} className={!currentPiValue ? "animate-spin" : ""} />
                                                    </div>
                                                    <p className="text-[9px] font-black text-pi-purple uppercase tracking-widest mb-1">{t('creator_final_amount')}</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-black text-slate-900 tracking-tighter">
                                                            {((userData.creatorBalance || 0) * 0.85).toFixed(4)}
                                                        </span>
                                                        <span className="text-sm font-black text-pi-purple">Pi</span>
                                                    </div>
                                                    <p className="text-[8px] font-bold text-slate-400 mt-2 flex items-center gap-1 uppercase">
                                                        <RefreshCcw size={8} className="animate-pulse" /> Actualizado en tiempo real
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={async () => {
                                                        if (!username) return;
                                                        if (!confirm(t('creator_confirm_withdraw'))) return;

                                                        setIsWithdrawing(true);
                                                        try {
                                                            const result = await SupabaseService.processWithdrawal(username);
                                                            if (result.success) {
                                                                // Refresh user data to show 0 balance and new transaction
                                                                if (user?.uid) {
                                                                    // Ideally we refresh context, but for now we force a reload or rely on simple alert
                                                                    alert(`¡Retiro exitoso! Se han enviado ${result.amount.toFixed(4)} Pi a tu billetera.`);
                                                                    window.location.reload();
                                                                }
                                                            } else {
                                                                alert("Error procesando el retiro. Inténtalo de nuevo.");
                                                            }
                                                        } catch (error) {
                                                            console.error(error);
                                                            alert("Error desconocido.");
                                                        } finally {
                                                            setIsWithdrawing(false);
                                                        }
                                                    }}
                                                    disabled={isWithdrawing || !currentPiValue || ((userData.creatorBalance || 0) * (currentPiValue || 0)) < 10 || !userData.walletAddress}
                                                    className="w-full py-4 bg-pi-purple text-white rounded-xl font-black text-sm shadow-lg shadow-pi-purple/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest flex items-center justify-center gap-2"
                                                >
                                                    {isWithdrawing ? <Loader2 className="animate-spin" /> : <RefreshCcw size={18} />}
                                                    {isWithdrawing ? "PROCESANDO..." : t('creator_exchange_btn')}
                                                </button>

                                                {!userData.walletAddress && (
                                                    <p className="mt-3 text-[9px] font-bold text-amber-500 text-center uppercase tracking-tight">
                                                        ⚠️ {t('creator_setup_wallet')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction History for Pi */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('creator_history')}</h3>
                                        <div className="space-y-3">
                                            {userData.creatorTransactions && userData.creatorTransactions.length > 0 ? (
                                                userData.creatorTransactions.map((tx: any) => (
                                                    <div key={tx.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between group hover:border-pi-purple/20 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-pi-purple/5 text-pi-purple`}>
                                                                <RefreshCcw size={20} className="text-pi-purple" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-bold text-slate-800 text-sm">{tx.origin}</p>
                                                                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-600">
                                                                        {t('creator_status_completed')}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">{tx.work}</p>
                                                                <p className="text-[9px] text-slate-300 font-bold">{new Date(tx.date).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-black text-slate-900">+{tx.amount?.toFixed(4)} Pi</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                {tx.type === 'DONATION' ? t('creator_type_donation') : t('creator_type_payment')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-10 text-center text-slate-400 font-bold text-sm">No hay transacciones aún.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Security & Fund Destination */}
                                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white text-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-white/10" />
                                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                                            <Shield size={24} className="text-indigo-300" />
                                        </div>
                                        <h4 className="font-black text-sm mb-2 uppercase tracking-widest text-indigo-200">Destino de Fondos</h4>
                                        <div className="bg-white/10 rounded-2xl p-4 mb-4 border border-white/10 backdrop-blur-sm">
                                            <p className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-1">Tu Billetera Pi vinculada:</p>
                                            <p className="text-xs font-mono font-bold text-indigo-300 break-all">
                                                {userData.walletAddress || "No configurada en Perfil"}
                                            </p>
                                        </div>
                                        <p className="text-[10px] font-medium text-white/60 leading-relaxed px-4 text-center">
                                            Tus donaciones acumuladas se enviarán de forma segura a esta billetera tras el intercambio, descontando la comisión del servicio.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                renderWebtoonList(getFilteredWebtoons())
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-[50]">
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
                <button onClick={() => router.push("/library")} className="text-slate-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <BookOpen size={22} />
                    <span className="text-[10px] font-bold">{t('nav_library')}</span>
                </button>
                <button onClick={() => setViewMode('main')} className="text-pi-purple transition-all flex flex-col items-center gap-1">
                    <User size={22} fill="currentColor" />
                    <span className="text-[10px] font-bold">{t('nav_profile')}</span>
                </button>
            </div>
        </div>
    );
}
