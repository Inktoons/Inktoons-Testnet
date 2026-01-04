"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Heart, BookOpen, Star, MessageCircle,
    ChevronRight, Loader2, Coins, Edit3, Send, CheckCircle2,
    X, Info, ShieldCheck
} from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePi } from "@/components/PiNetworkProvider";
import { useUserData } from "@/context/UserDataContext";
import { SupabaseService } from "@/lib/supabaseService";
import TopNavbar from "@/components/TopNavbar";
import { Wallet, Save } from "lucide-react";

export default function CreatorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const username = params.username as string;
    const { webtoons } = useContent();
    const { t } = useLanguage();
    const { createPayment, user: currentUser } = usePi();
    const { userData: myUserData, updateCreatorBio, toggleTips, updateWalletAddress } = useUserData();

    const [creatorData, setCreatorData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isDonating, setIsDonating] = useState(false);
    const [donationAmount, setDonationAmount] = useState("");
    const [donationSuccess, setDonationSuccess] = useState(false);
    const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editedBio, setEditedBio] = useState("");
    const [editedTipsEnabled, setEditedTipsEnabled] = useState(false);
    const [editedWalletAddress, setEditedWalletAddress] = useState("");

    const isMyProfile = currentUser?.username === username;

    useEffect(() => {
        if (isMyProfile && searchParams.get('edit') === 'true') {
            setIsEditing(true);
        }
    }, [isMyProfile, searchParams]);

    useEffect(() => {
        const fetchCreator = async () => {
            setLoading(true);
            const data = await SupabaseService.getUserByUsername(username);

            // If it's my profile, we can use context data as source of truth
            if (isMyProfile) {
                setCreatorData({
                    username: username,
                    creatorDescription: myUserData.creatorDescription,
                    tipsEnabled: true,
                    walletAddress: myUserData.walletAddress,
                    id: currentUser?.uid
                });
                setEditedBio(myUserData.creatorDescription || "");
                setEditedTipsEnabled(myUserData.tipsEnabled || false);
                setEditedWalletAddress(myUserData.walletAddress || "");
            } else if (data) {
                setCreatorData({ ...data, tipsEnabled: true });
            } else {
                // Fallback for user with no data yet but existing username
                setCreatorData({
                    username: username,
                    creatorDescription: "",
                    tipsEnabled: true,
                    walletAddress: ""
                });
            }
            setLoading(false);
        };
        if (username) fetchCreator();
    }, [username, isMyProfile, myUserData.creatorDescription, myUserData.tipsEnabled]);

    const creatorWorks = webtoons.filter(w => w.author === username);
    const creatorBanner = creatorWorks.find(w => w.bannerUrl)?.bannerUrl;

    const handleSaveProfile = async () => {
        if (!isMyProfile) return;
        await updateCreatorBio(editedBio);
        await updateWalletAddress(editedWalletAddress);
        setIsEditing(false);
    };

    const handleDonation = async (amount: string) => {
        const finalAmount = amount || donationAmount;
        if (!finalAmount || isNaN(Number(finalAmount)) || Number(finalAmount) <= 0) {
            alert(t('creator_donate_invalid_amount'));
            return;
        }

        try {
            setIsSubmittingDonation(true);
            await createPayment(
                Number(finalAmount),
                t('creator_donate_memo').replace('{username}', username),
                {
                    type: "DIRECT_DONATION",
                    recipient_uid: creatorData?.id,
                    recipient_username: username
                },
                () => {
                    setDonationSuccess(true);
                    setTimeout(() => {
                        setDonationSuccess(false);
                        setDonationAmount("");
                        setIsDonating(false);
                    }, 5000);
                }
            );
        } catch (error) {
            console.error("Donation error:", error);
        } finally {
            setIsSubmittingDonation(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="animate-spin text-pi-purple" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FD]">
            <TopNavbar />

            <div className="max-w-4xl mx-auto pt-20 pb-32">
                {/* Header Banner Area */}
                <div className="relative mb-20">
                    <div className="relative h-64 rounded-b-[80px] shadow-2xl overflow-hidden bg-slate-200">
                        {creatorBanner ? (
                            <div className="absolute inset-0">
                                <img src={creatorBanner} className="w-full h-full object-cover" alt="Banner" />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-pi-purple to-pi-purple-dark">
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl animate-pulse" />
                                    <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-pi-gold blur-3xl animate-pulse" />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => router.back()}
                            className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-all z-10"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    </div>

                    {/* Floating Avatar - CIRCULAR and outside overflow hidden */}
                    <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-2xl relative">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-pi-purple to-pi-purple-dark flex items-center justify-center text-white text-5xl font-black overflow-hidden shadow-inner border-4 border-white">
                                    {isMyProfile && myUserData.profileImage ? (
                                        <img src={myUserData.profileImage} className="w-full h-full object-cover" alt="Avatar" />
                                    ) : (
                                        username.charAt(0).toUpperCase()
                                    )}
                                </div>

                                {isMyProfile && (
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="absolute bottom-0 right-0 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-pi-purple border-2 border-slate-50 hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 text-center mt-2 mb-10">
                    <h1 className="text-3xl font-black text-slate-900 mb-1">{username}</h1>
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="px-4 py-1.5 bg-pi-gold/10 text-pi-gold-dark text-[10px] font-black rounded-full uppercase tracking-widest border border-pi-gold/20 shadow-sm flex items-center gap-1.5">
                            <ShieldCheck size={12} fill="currentColor" />
                            {t('profile_pioneer_desc')}
                        </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 min-w-[100px]">
                            <div className="text-xl font-black text-slate-900">{creatorWorks.length}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t('creator_profile_works')}</div>
                        </div>
                        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 min-w-[100px]">
                            <div className="text-xl font-black text-slate-900">
                                {(creatorWorks.reduce((acc, w) => acc + (w.rating || 0), 0) / (creatorWorks.length || 1)).toFixed(1)}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t('creator_profile_rating')}</div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-8 text-left max-w-2xl mx-auto">
                        {/* Description Section */}
                        <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[12px] font-black text-pi-purple uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-pi-purple" />
                                    {t('creator_profile_description')}
                                </h3>
                                {isMyProfile && isEditing && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditedBio(creatorData.creatorDescription || "");
                                            }}
                                            className="p-1 px-3 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase"
                                        >
                                            {t('common_cancel')}
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="p-1 px-3 bg-pi-purple text-white rounded-lg text-[10px] font-black uppercase shadow-lg shadow-pi-purple/20"
                                        >
                                            {t('common_save')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isEditing ? (
                                <textarea
                                    value={editedBio}
                                    onChange={(e) => setEditedBio(e.target.value)}
                                    placeholder={t('upload_creator_description_placeholder')}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:border-pi-purple focus:bg-white transition-all min-h-[120px] resize-none"
                                />
                            ) : (
                                <p className="text-slate-600 text-[15px] leading-relaxed font-medium italic">
                                    {creatorData.creatorDescription ? `"${creatorData.creatorDescription}"` : t('creator_profile_no_desc')}
                                </p>
                            )}
                        </div>

                        {/* Wallet Section (Only in Edit Mode) */}
                        {isMyProfile && isEditing && (
                            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
                                        <Wallet className="text-pi-gold" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 leading-none mb-1">{t('profile_wallet')}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('profile_wallet_desc')}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={editedWalletAddress}
                                            onChange={(e) => setEditedWalletAddress(e.target.value)}
                                            placeholder={t('profile_wallet_placeholder')}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-6 pr-14 font-bold text-slate-700 outline-none focus:border-pi-purple focus:bg-white transition-all text-sm"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-pi-purple/40">
                                            <Save size={20} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold italic pl-2">
                                        {t('profile_wallet_autosave')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Works Section */}
                <div className="px-6 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            📚 {t('creator_profile_works')}
                            <span className="text-sm font-bold text-gray-300 ml-2">({creatorWorks.length})</span>
                        </h2>
                        <div className="h-px flex-1 bg-slate-100 ml-6" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        {creatorWorks.map((work) => (
                            <motion.div
                                key={work.id}
                                whileHover={{ y: -5, scale: 1.02 }}
                                onClick={() => router.push(`/news/${work.id}`)}
                                className="bg-white p-4 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 flex gap-5 cursor-pointer group hover:bg-slate-50 transition-all"
                            >
                                <div className="w-28 h-36 rounded-[28px] overflow-hidden flex-shrink-0 shadow-lg relative">
                                    <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-pi-purple/90 text-white text-[8px] font-black rounded-lg uppercase backdrop-blur-sm">
                                        {work.status}
                                    </div>
                                </div>

                                <div className="flex-1 py-1 flex flex-col justify-between overflow-hidden">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                            {work.genres?.slice(0, 2).map(g => (
                                                <span key={g} className="text-[9px] font-black text-pi-purple px-2 py-0.5 bg-pi-purple/5 rounded-full uppercase tracking-wider">{t(g as any)}</span>
                                            ))}
                                        </div>
                                        <h3 className="font-black text-lg text-slate-900 group-hover:text-pi-purple transition-colors leading-tight mb-2 truncate">{work.title}</h3>
                                        <p className="text-[11px] text-slate-400 font-bold line-clamp-2 leading-relaxed italic mb-3">
                                            "{work.excerpt}"
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-pi-gold-dark font-black text-[12px]">
                                                <Star size={14} fill="currentColor" />
                                                <span>{work.rating || "0.0"}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-400 font-black text-[12px]">
                                                <MessageCircle size={14} />
                                                <span>{work.votes || 0}</span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-slate-100 rounded-2xl text-slate-400 group-hover:bg-pi-purple group-hover:text-white transition-all">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {creatorWorks.length === 0 && (
                        <div className="bg-white p-20 rounded-[50px] border border-dashed border-slate-200 text-center shadow-inner">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <BookOpen size={40} />
                            </div>
                            <p className="text-slate-400 font-black tracking-tight text-xl">{t('creator_profile_empty_works')}</p>
                            <p className="text-sm text-slate-300 font-bold mt-2">¡Pronto habrá contenido increíble aquí!</p>
                        </div>
                    )}
                </div>

                {/* Tips Section - Conditioned by walletAddress */}
                {creatorData?.walletAddress && (
                    <div className="px-6 mt-12 mb-20">
                        <div className="max-w-2xl mx-auto bg-[#FFFBF0] rounded-[60px] p-10 shadow-2xl shadow-amber-200/20 border border-pi-gold/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-pi-gold/5 rounded-full blur-3xl -mr-32 -mt-32" />

                            <div className="text-center mb-10">
                                <h3 className="text-3xl font-black text-slate-900 mb-2 flex items-center justify-center gap-3">
                                    <Heart size={32} fill="#f2b200" className="text-pi-gold" />
                                    {t('creator_tips_title')}
                                </h3>
                                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('creator_tips_sub')}</p>
                            </div>

                            {donationSuccess ? (
                                <div className="bg-white/80 backdrop-blur-md rounded-[40px] p-12 text-center animate-in zoom-in-95 shadow-xl">
                                    <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 mb-2">{t('creator_donate_success')}</h4>
                                    <p className="text-lg text-slate-500 font-bold italic">¡Tu apoyo hace la diferencia!</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                        {[0.1, 0.5, 1, 5, 10].map(amount => (
                                            <button
                                                key={amount}
                                                onClick={() => handleDonation(amount.toString())}
                                                className="py-5 bg-white border-2 border-transparent hover:border-pi-gold rounded-3xl font-black text-slate-700 hover:text-pi-gold-dark shadow-sm hover:shadow-lg active:scale-95 transition-all text-lg"
                                            >
                                                {amount} Pi
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-4">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-px bg-pi-gold/10 flex-1" />
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('creator_tips_custom')}</span>
                                            <div className="h-px bg-pi-gold/10 flex-1" />
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    value={donationAmount}
                                                    onChange={(e) => setDonationAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-white border-2 border-slate-100 rounded-[30px] py-6 pl-14 pr-6 font-black text-2xl outline-none focus:border-pi-gold focus:ring-0 shadow-sm"
                                                />
                                                <Coins className="absolute left-5 top-1/2 -translate-y-1/2 text-pi-gold" size={28} fill="currentColor" />
                                            </div>
                                            <button
                                                onClick={() => handleDonation("")}
                                                disabled={isSubmittingDonation || !donationAmount}
                                                className="px-10 bg-pi-gold text-white rounded-[30px] font-black shadow-2xl shadow-pi-gold/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {isSubmittingDonation ? <Loader2 className="animate-spin" /> : <Send size={28} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Info Section moved inside/below Tips */}
                            <div className="mt-12 bg-slate-900 rounded-[40px] p-10 text-white text-center shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-pi-purple/20 rounded-full blur-3xl -mr-32 -mt-32" />
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                    <Info size={32} className="text-white/80" />
                                </div>
                                <h4 className="text-xl font-black mb-3">{t('creator_tips_info_title')}</h4>
                                <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-lg mx-auto">
                                    {t('creator_tips_info_desc')}
                                    <br />
                                    <span className="text-pi-gold font-black uppercase inline-block mt-2">{t('creator_tips_no_commission')}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
