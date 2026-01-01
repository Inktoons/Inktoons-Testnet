"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft, Image as ImageIcon, Upload, X, Check, Lock,
    Coins, Calendar, Eye, AlertCircle, Loader2, Trash2, Edit3, Keyboard,
    ChevronUp, ChevronDown, Plus, Play, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent, Chapter, Webtoon } from "@/context/ContentContext";
import { usePi } from "@/components/PiNetworkProvider";
import { useUserData } from "@/context/UserDataContext";
import { useLanguage } from "@/context/LanguageContext";
import BottomNavbar from "@/components/BottomNavbar";

interface CustomPromptProps {
    isOpen: boolean;
    title: string;
    value: string;
    onConfirm: (val: string) => void;
    onCancel: () => void;
}

function CustomPrompt({ isOpen, title, value, onConfirm, onCancel }: CustomPromptProps) {
    const { t } = useLanguage();
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTempValue(value);
            // Intentar auto-foco
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, value]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">{title}</h3>
                        <button onClick={onCancel} className="p-2 bg-gray-100 rounded-full text-gray-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="relative">
                        <textarea
                            ref={(el) => {
                                // @ts-ignore
                                inputRef.current = el;
                            }}
                            className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-lg font-bold text-black focus:border-pi-purple focus:bg-white outline-none transition-all min-h-[150px] resize-none"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            placeholder={t('upload_write_here')}
                            autoComplete="off"
                        />
                        {/* Botón de ayuda para forzar teclado si falla el auto-focussing */}
                        <button
                            onClick={() => inputRef.current?.focus()}
                            className="absolute right-4 top-4 text-pi-purple/30"
                        >
                            <Keyboard size={20} />
                        </button>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-colors"
                        >
                            {t('upload_cancel')}
                        </button>
                        <button
                            onClick={() => onConfirm(tempValue)}
                            className="flex-1 py-4 bg-pi-purple text-white font-black rounded-2xl shadow-lg shadow-pi-purple/20 active:scale-95 transition-all"
                        >
                            {t('upload_accept')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function UploadPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const webtoonIdFromQuery = searchParams.get("webtoonId");
    const chapterIdFromQuery = searchParams.get("chapterId"); // New for edit mode

    const { webtoons, addWebtoon, addChapter, updateChapter, uploadImage } = useContent();
    const { t, language: appLanguage, setLanguage: setAppLanguage } = useLanguage();
    const { user } = usePi();
    const { userData } = useUserData();

    const isEditMode = !!chapterIdFromQuery;

    const [activeTab, setActiveTab] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showLangSelector, setShowLangSelector] = useState(false);

    // Prompt States
    const [promptConfig, setPromptConfig] = useState<{ isOpen: boolean; title: string; field: string; value: string }>({
        isOpen: false,
        title: "",
        field: "",
        value: ""
    });

    // Tab 1: Webtoon Info
    const [title, setTitle] = useState("");
    const [language, setLanguage] = useState("Español");
    const [author, setAuthor] = useState(user?.username || "");
    const [artist, setArtist] = useState("");
    const [alternatives, setAlternatives] = useState("");
    const [status, setStatus] = useState("ongoing");
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [description, setDescription] = useState("");

    // Tab 2: Chapter Info
    const [selectedWebtoonId, setSelectedWebtoonId] = useState<string>("");
    const [chapterTitle, setChapterTitle] = useState("");
    const [isMonetized, setIsMonetized] = useState(false);
    const [chapterPages, setChapterPages] = useState<{ id: string, url: string, file?: File }[]>([]);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const movePage = (index: number, direction: 'up' | 'down') => {
        const newPages = [...chapterPages];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newPages.length) return;

        const temp = newPages[index];
        newPages[index] = newPages[targetIndex];
        newPages[targetIndex] = temp;
        setChapterPages(newPages);
    };

    const deletePage = (index: number) => {
        const page = chapterPages[index];
        if (page.url.startsWith('blob:')) {
            URL.revokeObjectURL(page.url);
        }
        setChapterPages(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (user?.username) {
            setAuthor(user.username);
        }
    }, [user]);

    useEffect(() => {
        if (webtoonIdFromQuery) {
            setSelectedWebtoonId(webtoonIdFromQuery);
            setActiveTab(2);

            // If we have a chapterId, load its data
            if (chapterIdFromQuery) {
                const targetWebtoon = webtoons.find(w => w.id === webtoonIdFromQuery);
                const targetChapter = targetWebtoon?.chapters?.find(c => c.id === chapterIdFromQuery);
                if (targetChapter) {
                    setChapterTitle(targetChapter.title);
                    setChapterPages((targetChapter.images || []).map(url => ({
                        id: Math.random().toString(36).substr(2, 9),
                        url
                    })));
                    setIsMonetized(targetChapter.isLocked);
                }
            }
        }
    }, [webtoonIdFromQuery, chapterIdFromQuery, webtoons]);

    // Handle Custom Prompt
    const openPrompt = (label: string, field: string, value: string) => {
        setPromptConfig({ isOpen: true, title: `${t('upload_introduce')} ${label}`, field, value });
    };

    const handlePromptConfirm = (val: string) => {
        if (promptConfig.field === "title") setTitle(val);
        if (promptConfig.field === "author") setAuthor(val);
        if (promptConfig.field === "artist") setArtist(val);
        if (promptConfig.field === "alternatives") setAlternatives(val);
        if (promptConfig.field === "year") setYear(val);
        if (promptConfig.field === "chapterTitle") setChapterTitle(val);
        if (promptConfig.field === "description") setDescription(val);
        setPromptConfig({ ...promptConfig, isOpen: false });
    };

    // Refs for file inputs
    const coverInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const pagesInputRef = useRef<HTMLInputElement>(null);

    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'banner' | 'pages') => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (type === 'pages') {
            const newPages = files.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                url: URL.createObjectURL(file),
                file
            }));
            setChapterPages(prev => [...prev, ...newPages]);
        } else {
            const file = files[0];
            const url = URL.createObjectURL(file);
            if (type === 'cover') {
                setCoverImage(url);
                setCoverFile(file);
            } else {
                setBannerImage(url);
                setBannerFile(file);
            }
        }
        // Reset input to allow same file again
        e.target.value = '';
    };

    const flushObjectURLs = () => {
        chapterPages.forEach(p => {
            if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url);
        });
        if (coverImage?.startsWith('blob:')) URL.revokeObjectURL(coverImage);
        if (bannerImage?.startsWith('blob:')) URL.revokeObjectURL(bannerImage);
    };

    const genres = [
        "genre_4koma", "genre_action", "genre_adult", "genre_adventure", "genre_apocalyptic",
        "genre_comedy", "genre_delinquents", "genre_demons", "genre_drama", "genre_ecchi",
        "genre_erotic", "genre_fantasy", "genre_gender_bender", "genre_gore", "genre_harem",
        "genre_hentai", "genre_historical", "genre_horror", "genre_isekai", "genre_josei",
        "genre_karate", "genre_mafia", "genre_magic", "genre_manhwa", "genre_martial_arts",
        "genre_mature", "genre_mecha", "genre_military", "genre_music", "genre_mystery",
        "genre_nsfw", "genre_omegaverse", "genre_oneshot", "genre_parody", "genre_police",
        "genre_psychological", "genre_reincarnation", "genre_romance", "genre_samurai",
        "genre_school", "genre_scifi", "genre_seinen", "genre_shojo", "genre_shonen",
        "genre_sliceoflife", "genre_smut", "genre_sports", "genre_super_power",
        "genre_supernatural", "genre_survival", "genre_suspense", "genre_thriller",
        "genre_tragedy", "genre_vampires", "genre_virtual_reality", "genre_webcomic",
        "genre_webtoon", "genre_yaoi", "genre_yuri"
    ];

    const handleSubmitWebtoon = async () => {
        if (!title || !coverImage) {
            alert(t('upload_error_missing_fields'));
            return;
        }
        if (!description || description.trim().length < 10) {
            alert(t('upload_error_synopsis'));
            return;
        }
        if (selectedGenres.length === 0) {
            alert(t('upload_error_genres'));
            return;
        }
        setIsSubmitting(true);
        setStatusMessage(t('upload_status_cover'));

        try {
            const finalCoverUrl = coverFile ? (await uploadImage(coverFile)) : coverImage;

            setStatusMessage(t('upload_status_banner'));
            const finalBannerUrl = bannerFile ? (await uploadImage(bannerFile)) : bannerImage;

            setStatusMessage(t('upload_status_world'));
            await new Promise(r => setTimeout(r, 1000));

            const id = Math.random().toString(36).substr(2, 9);
            const webtoon: Webtoon = {
                id, title, excerpt: description || alternatives || "Nueva historia.",
                category: selectedGenres[0] || "Acción",
                date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
                author: author || "Creador",
                imageUrl: finalCoverUrl || coverImage!,
                bannerUrl: finalBannerUrl || bannerImage || undefined,
                status: status as any,
                genres: selectedGenres,
                chapters: [],
                artist: artist || "Desconocido",
                year: year,
                language: language,
                alternatives: alternatives,
                rating: 0,
                votes: 0
            };

            await addWebtoon(webtoon);
            setSelectedWebtoonId(id);
            setIsSubmitting(false);
            setIsSuccess(true);
            setStatusMessage(t('upload_success'));
            setTimeout(() => { setIsSuccess(false); setActiveTab(2); }, 2000);
        } catch (error: any) {
            console.error("Error submitting webtoon:", error);
            alert(t('upload_error_generic'));
            setIsSubmitting(false);
        }
    };

    const handleSubmitChapter = async () => {
        if (!chapterTitle || !selectedWebtoonId) {
            alert(t('upload_error_chapter_title'));
            return;
        }

        const targetWebtoon = webtoons.find(w => w.id === selectedWebtoonId);
        if (!targetWebtoon) return;

        setIsSubmitting(true);
        setStatusMessage(t('upload_status_preparing'));

        try {
            // Upload images sequentially to avoid overwhelming
            const finalImages: string[] = [];
            for (let i = 0; i < chapterPages.length; i++) {
                const page = chapterPages[i];
                setStatusMessage(`${t('upload_status_pages')} ${i + 1}/${chapterPages.length}...`);
                if (page.file) {
                    const url = await uploadImage(page.file);
                    if (url) finalImages.push(url);
                    else finalImages.push(page.url); // Fallback
                } else {
                    finalImages.push(page.url);
                }
            }

            setStatusMessage(t('upload_status_saving'));
            await new Promise(r => setTimeout(r, 1000));

            if (isEditMode && chapterIdFromQuery) {
                // EDITING EXISTING CHAPTER
                await updateChapter(selectedWebtoonId, chapterIdFromQuery, {
                    title: chapterTitle,
                    images: finalImages
                });
            } else {
                // NEW CHAPTER logic with sequential days
                const activeLockedChapters = (targetWebtoon.chapters || []).filter(ch =>
                    ch.isLocked && ch.unlockDate && new Date(ch.unlockDate) > new Date()
                );

                // Base 3 days + 1 day per existing locked chapter
                const baseDays = 3;
                const extraDays = activeLockedChapters.length;
                const totalDays = baseDays + extraDays;

                const unlockDate = isMonetized
                    ? new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000).toISOString()
                    : undefined;

                const newChapter: Chapter = {
                    id: Math.random().toString(36).substr(2, 9),
                    title: chapterTitle, date: "Hoy",
                    isLocked: isMonetized,
                    unlockCost: isMonetized ? 60 : undefined,
                    unlockDate: unlockDate,
                    images: finalImages
                };
                await addChapter(selectedWebtoonId, newChapter);
            }

            setIsSubmitting(false);
            setIsSuccess(true);
            setStatusMessage(t('upload_success_chapter'));
            flushObjectURLs();
            setTimeout(() => router.push(`/news/${selectedWebtoonId}`), 2000);
        } catch (error: any) {
            console.error("Error submitting chapter:", error);
            alert(language === 'es' ? "No se pudo subir el capítulo. Inténtalo de nuevo en unos momentos." : "Could not upload chapter. Try again in a few moments.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FD] text-foreground pb-20">
            {/* Custom Prompt Modal (Replacing native prompt) */}
            <AnimatePresence>
                {promptConfig.isOpen && (
                    <CustomPrompt
                        isOpen={promptConfig.isOpen}
                        title={promptConfig.title}
                        value={promptConfig.value}
                        onConfirm={handlePromptConfirm}
                        onCancel={() => setPromptConfig({ ...promptConfig, isOpen: false })}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="sticky top-0 z-[50] bg-white/80 backdrop-blur-lg border-b border-gray-100 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full">
                            <ArrowLeft size={22} className="text-gray-700" />
                        </button>
                        <h1 className="font-extrabold text-xl bg-gradient-to-r from-pi-purple to-indigo-600 bg-clip-text text-transparent">
                            {isEditMode ? t('upload_edit_chapter') : (webtoonIdFromQuery ? t('upload_new_chapter') : t('upload_title'))}
                        </h1>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowLangSelector(!showLangSelector)}
                            className={`p-2 rounded-full transition-all active:scale-95 flex items-center gap-1 ${showLangSelector ? 'bg-pi-purple/10 text-pi-purple' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`}
                        >
                            <Globe size={20} />
                            <span className="text-[10px] font-black uppercase">
                                {appLanguage === 'es' ? '🇪🇸' : appLanguage === 'en' ? '🇺🇸' : appLanguage === 'pt' ? '🇧🇷' : appLanguage === 'fr' ? '🇫🇷' : '🇰🇷'}
                            </span>
                        </button>

                        <AnimatePresence>
                            {showLangSelector && (
                                <>
                                    <div className="fixed inset-0 z-[-1]" onClick={() => setShowLangSelector(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 min-w-[150px] z-[100]"
                                    >
                                        {[
                                            { id: 'es', name: 'Español' },
                                            { id: 'en', name: 'English' },
                                            { id: 'pt', name: 'Português' },
                                            { id: 'fr', name: 'Français' },
                                            { id: 'ko', name: '한국어' }
                                        ].map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={() => {
                                                    setAppLanguage(lang.id as any);
                                                    setShowLangSelector(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all font-bold text-xs active:scale-[0.98] ${appLanguage === lang.id ? 'bg-pi-purple text-white shadow-md' : 'hover:bg-gray-50 text-gray-700'}`}
                                            >
                                                {lang.name}
                                                {appLanguage === lang.id && <Check size={14} />}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Tabs - Only show if creating NEW manga */}
            {!webtoonIdFromQuery && (
                <div className="px-4 bg-white border-b border-gray-100 flex">
                    <button onClick={() => setActiveTab(1)} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest relative ${activeTab === 1 ? 'text-pi-purple' : 'text-gray-400'}`}>
                        1. {t('upload_step_1')}
                        {activeTab === 1 && <motion.div layoutId="tab-u" className="absolute bottom-0 left-6 right-6 h-1 bg-pi-purple rounded-full" />}
                    </button>
                    <button onClick={() => selectedWebtoonId && setActiveTab(2)} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest relative ${activeTab === 2 ? 'text-pi-purple' : 'text-gray-400'} ${!selectedWebtoonId ? 'opacity-30' : ''}`}>
                        2. {t('upload_step_2')}
                        {activeTab === 2 && <motion.div layoutId="tab-u" className="absolute bottom-0 left-6 right-6 h-1 bg-pi-purple rounded-full" />}
                    </button>
                </div>
            )}

            <div className="max-w-xl mx-auto p-6 space-y-8">
                {(activeTab === 1 && !webtoonIdFromQuery) ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Image Uploads */}
                        <div className="grid grid-cols-2 gap-4">
                            <div onClick={() => coverInputRef.current?.click()} className="aspect-[3/4] rounded-2xl bg-white border-2 border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden relative">
                                {coverImage ? <img src={coverImage} className="w-full h-full object-cover" /> : <><ImageIcon className="text-gray-300" /><span className="text-[10px] font-black mt-2 text-gray-400 uppercase">{t('upload_cover')}</span></>}
                                <input ref={coverInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
                                {!coverImage && <span className="absolute top-2 right-2 text-red-500 font-bold">*</span>}
                            </div>
                            <div onClick={() => bannerInputRef.current?.click()} className="aspect-[3/4] rounded-2xl bg-white border-2 border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden">
                                {bannerImage ? <img src={bannerImage} className="w-full h-full object-cover" /> : <><ImageIcon className="text-gray-300" /><span className="text-[10px] font-black mt-2 text-gray-400 uppercase">{t('upload_banner')}</span></>}
                                <input ref={bannerInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
                            </div>
                        </div>

                        {/* Text Fields */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{t('upload_inktoon_title')} <span className="text-red-500">*</span></label>
                                <div onClick={() => openPrompt("Inktoon", "title", title)} className="w-full p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-lg flex justify-between items-center active:bg-gray-50">
                                    <span className={title ? "text-black font-bold" : "text-gray-300"}>{title || t('upload_inktoon_placeholder')}</span>
                                    <Edit3 size={18} className="text-pi-purple/40" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{t('upload_field_author')}</label>
                                <div className="w-full p-4 bg-gray-50/50 border border-gray-100 rounded-2xl flex justify-between items-center group transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-pi-purple flex items-center justify-center text-white font-black text-xs border-2 border-white shadow-sm overflow-hidden">
                                            {userData.profileImage ? (
                                                <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{user?.username?.charAt(0).toUpperCase() || "?"}</span>
                                            )}
                                        </div>
                                        <span className="text-black font-extrabold text-sm">{user?.username || t('upload_author_connecting')}</span>
                                    </div>
                                    <div className="px-2 py-1 bg-gray-200/50 rounded-lg">
                                        <Lock size={14} className="text-gray-400" />
                                    </div>
                                </div>
                                <p className="text-[8px] font-black text-pi-purple/40 uppercase tracking-tighter ml-1">{t('upload_using_identity')}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{t('upload_field_artist')}</label>
                                <div onClick={() => openPrompt(t('upload_field_artist'), "artist", artist)} className="w-full p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50">
                                    <span className={artist ? "text-black font-bold" : "text-gray-300"}>{artist || t('upload_artist_placeholder')}</span>
                                    <Edit3 size={18} className="text-pi-purple/40" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{t('upload_field_alternatives')}</label>
                                <div onClick={() => openPrompt(t('upload_field_alternatives'), "alternatives", alternatives)} className="w-full p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50">
                                    <span className={alternatives ? "text-black font-bold" : "text-gray-300"}>{alternatives || t('upload_alternatives_placeholder')}</span>
                                    <Edit3 size={18} className="text-pi-purple/40" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{t('upload_synopsis')} <span className="text-red-500">*</span></label>
                                <div onClick={() => openPrompt(t('upload_synopsis'), "description", description)} className="w-full p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex justify-between items-center active:bg-gray-50 min-h-[100px]">
                                    <span className={description ? "text-black font-bold text-sm leading-relaxed" : "text-gray-300 text-sm"}>
                                        {description || t('upload_synopsis_placeholder')}
                                    </span>
                                    <Edit3 size={18} className="text-pi-purple/40 flex-shrink-0" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{t('explore_status')}</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setStatus("ongoing")}
                                            className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black transition-all border-2 ${status === "ongoing" ? "bg-pi-purple text-white border-pi-purple" : "bg-white text-gray-400 border-gray-100"}`}
                                        >
                                            {t('upload_ongoing')}
                                        </button>
                                        <button
                                            onClick={() => setStatus("completed")}
                                            className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black transition-all border-2 ${status === "completed" ? "bg-pi-purple text-white border-pi-purple" : "bg-white text-gray-400 border-gray-100"}`}
                                        >
                                            {t('upload_completed')}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{t('upload_year_label')}</label>
                                    <button onClick={() => openPrompt(t('upload_year_label'), "year", year)} className="w-full bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                                        <span className="font-black text-pi-purple">{year}</span>
                                        <Calendar size={14} className="text-pi-purple opacity-40" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{t('upload_language_label')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: "Español", label: t('upload_esp') || "ESP" },
                                        { id: "Inglés", label: t('upload_eng') || "ING" },
                                        { id: "Portugués", label: t('upload_por') || "POR" },
                                        { id: "Francés", label: t('upload_fra') || "FRA" },
                                        { id: "Coreano", label: t('upload_kor') || "KOR" }
                                    ].map(lang => (
                                        <button
                                            key={lang.id}
                                            onClick={() => setLanguage(lang.id)}
                                            className={`flex-1 min-w-[70px] py-2 rounded-xl text-[10px] font-black border-2 transition-all ${language === lang.id ? "bg-pi-purple text-white border-pi-purple" : "bg-white text-gray-400 border-gray-100"}`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Géneros Grid */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{t('upload_genres_label')} <span className="text-red-500">{t('upload_genres_sub')}</span></label>
                                <div className="flex flex-wrap gap-2">
                                    {genres.map(genre => (
                                        <button
                                            key={genre}
                                            onClick={() => {
                                                if (selectedGenres.includes(genre)) {
                                                    setSelectedGenres(selectedGenres.filter(g => g !== genre));
                                                } else {
                                                    setSelectedGenres([...selectedGenres, genre]);
                                                }
                                            }}
                                            className={`px-3 py-2 rounded-full text-[10px] font-bold transition-all border ${selectedGenres.includes(genre)
                                                ? "bg-pi-purple/10 text-pi-purple border-pi-purple"
                                                : "bg-white text-gray-500 border-gray-100 hover:border-gray-300"
                                                }`}
                                        >
                                            {t(genre as any)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmitWebtoon}
                            disabled={isSubmitting || isSuccess}
                            className={`w-full py-5 rounded-2xl font-black text-sm shadow-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all ${isSuccess ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-pi-purple to-indigo-600 text-white'}`}
                        >
                            <div className="flex items-center gap-3">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Upload />}
                                {isSubmitting ? t('upload_publishing') : isSuccess ? t('upload_success') : t('upload_publish')}
                            </div>
                            {isSubmitting && statusMessage && (
                                <span className="text-[10px] opacity-70 animate-pulse">{statusMessage}</span>
                            )}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Chapter Title Section */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">01. {t('upload_chapter_name_label')}</h3>
                            <div onClick={() => openPrompt(t('upload_field_chapter_title'), "chapterTitle", chapterTitle)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl flex justify-between items-center active:scale-[0.98] transition-transform">
                                <span className={chapterTitle ? "text-black font-bold" : "text-gray-400"}>{chapterTitle || t('upload_chapter_name_placeholder')}</span>
                                {chapterTitle ? <Check className="text-green-500" size={18} /> : <Edit3 size={18} className="text-pi-purple/40" />}
                            </div>
                        </div>

                        {/* Chapter Images Section */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">02. {t('upload_choose_photos')}:</h3>
                                <button
                                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${isPreviewMode ? 'bg-pi-purple text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {isPreviewMode ? <Eye size={14} /> : <Play size={14} />}
                                    {isPreviewMode ? t('upload_close_view') : t('upload_preview')}
                                </button>
                            </div>

                            {isPreviewMode ? (
                                <div className="space-y-2 max-h-[60vh] overflow-y-auto rounded-2xl bg-black/5 p-4 border-2 border-dashed border-gray-200">
                                    {chapterPages.length > 0 ? (
                                        chapterPages.map((page, i) => (
                                            <img key={page.id} src={page.url} className="w-full rounded-lg shadow-md" alt={`Página ${i}`} />
                                        ))
                                    ) : (
                                        <div className="py-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">{t('upload_no_preview')}</div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Upload Trigger (Top button as in user image) */}
                                    <button
                                        onClick={() => pagesInputRef.current?.click()}
                                        className="w-fit px-6 py-3 bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                    >
                                        {t('upload_choose_photos')}
                                    </button>

                                    {/* Pages List */}
                                    <div className="space-y-4 mt-6">
                                        <AnimatePresence>
                                            {chapterPages.map((page, index) => (
                                                <motion.div
                                                    key={page.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="flex gap-4 items-center bg-gray-50/50 p-2 rounded-2xl border border-gray-100"
                                                >
                                                    <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white">
                                                        <img src={page.url} className="w-full h-full object-cover" />
                                                        <div className="absolute top-0 left-0 bg-black/60 text-white text-[8px] font-black px-2 py-1 rounded-br-lg backdrop-blur-sm">
                                                            No. {index + 1}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 flex justify-end gap-2 pr-2">
                                                        <button
                                                            disabled={index === 0}
                                                            onClick={() => movePage(index, 'up')}
                                                            className="p-3 bg-white rounded-full text-gray-400 border border-gray-100 shadow-sm disabled:opacity-30 active:scale-90 transition-all hover:text-pi-purple"
                                                        >
                                                            <ChevronUp size={20} />
                                                        </button>
                                                        <button
                                                            disabled={index === chapterPages.length - 1}
                                                            onClick={() => movePage(index, 'down')}
                                                            className="p-3 bg-white rounded-full text-gray-400 border border-gray-100 shadow-sm disabled:opacity-30 active:scale-90 transition-all hover:text-pi-purple"
                                                        >
                                                            <ChevronDown size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => deletePage(index)}
                                                            className="p-3 bg-white rounded-full text-red-400 border border-gray-100 shadow-sm active:scale-90 transition-all hover:bg-red-50"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {/* Add More Box */}
                                        <div
                                            onClick={() => pagesInputRef.current?.click()}
                                            className="w-full h-32 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/20 flex items-center justify-center cursor-pointer hover:bg-blue-50/40 transition-colors"
                                        >
                                            <Plus className="text-blue-400" size={32} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <input ref={pagesInputRef} type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'pages')} />
                            <div className="pt-4 space-y-1">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t('upload_format_disclaimer')}</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t('upload_batch_disclaimer')}</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t('upload_order_disclaimer')}</p>
                            </div>
                        </div>

                        {/* Premium Setting Section (Final Step) */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5 relative overflow-hidden group">
                            {/* Decorative border if active */}
                            {isMonetized && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-pi-gold" />
                            )}

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-sm text-gray-800">{t('upload_early_access_label')}</h3>
                                        <div className="px-1.5 py-0.5 bg-pi-gold/10 text-pi-gold-dark text-[8px] font-black rounded uppercase">Premium</div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('upload_early_access_sub')}</p>
                                </div>
                                <button
                                    disabled={isEditMode}
                                    onClick={() => !isEditMode && setIsMonetized(!isMonetized)}
                                    className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 shadow-inner ${isMonetized ? 'bg-pi-gold' : 'bg-gray-200'} ${isEditMode ? 'opacity-30 cursor-not-allowed' : ''}`}
                                >
                                    <motion.div
                                        animate={{ x: isMonetized ? 24 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                                    >
                                        {isMonetized ? <Coins size={12} className="text-pi-gold" fill="currentColor" /> : <Lock size={12} className="text-gray-300" />}
                                    </motion.div>
                                </button>
                            </div>

                            {isEditMode && (
                                <p className="text-[9px] font-bold text-pi-purple/60 uppercase">{t('upload_edit_warning')}</p>
                            )}

                            <AnimatePresence>
                                {isMonetized && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="pt-2"
                                    >
                                        <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-amber-100 text-pi-gold-dark">
                                                <Coins size={20} fill="currentColor" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[11px] font-black text-amber-900 uppercase tracking-tight flex items-center justify-between">
                                                    {t('upload_reading_cost')} <span>60 INKS</span>
                                                </p>
                                                <div className="h-px bg-amber-200/30 my-2" />
                                                <p className="text-[10px] font-bold text-amber-700 leading-relaxed italic">
                                                    "{t('upload_early_access_info')}"
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={handleSubmitChapter}
                            disabled={isSubmitting || isSuccess || chapterPages.length === 0}
                            className={`w-full py-5 rounded-2xl font-black text-sm shadow-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all overflow-hidden relative group ${isSuccess
                                ? 'bg-green-500 text-white'
                                : isMonetized
                                    ? 'bg-gradient-to-r from-amber-500 to-pi-gold text-white'
                                    : 'bg-black text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" />
                                ) : isMonetized ? (
                                    <Coins size={20} fill="currentColor" />
                                ) : (
                                    <Upload size={20} />
                                )}

                                <span>
                                    {isSubmitting
                                        ? t('upload_publishing')
                                        : isSuccess
                                            ? (isEditMode ? t('upload_success_changes') : t('upload_success_chapter'))
                                            : isMonetized
                                                ? t('upload_early_access')
                                                : (isEditMode ? t('upload_save') : t('upload_publish_free'))}
                                </span>
                            </div>

                            {isSubmitting && statusMessage && (
                                <span className="text-[10px] opacity-70 animate-pulse">{statusMessage}</span>
                            )}
                        </button>
                    </motion.div>
                )}
            </div>

            <BottomNavbar />
        </div>
    );
}

export default function UploadPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="animate-spin text-pi-purple" size={48} />
            </div>
        }>
            <UploadPageContent />
        </Suspense>
    );
}
