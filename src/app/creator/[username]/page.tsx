"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Heart, BookOpen, Star, MessageCircle,
    ChevronRight, Loader2, Coins, Edit3, Send, CheckCircle2,
    X, Info, ShieldCheck, Wallet, Save
} from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePi } from "@/components/PiNetworkProvider";
import { useUserData } from "@/context/UserDataContext";
import { SupabaseService } from "@/lib/supabaseService";
import TopNavbar from "@/components/TopNavbar";

export default function CreatorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const username = params.username as string;
    const { webtoons } = useContent();
    const { t } = useLanguage();
    const { createPayment, user: currentUser } = usePi();
    const { userData: myUserData, updateCreatorBio, updateWalletAddress } = useUserData();

    const [creatorData, setCreatorData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [donationAmount, setDonationAmount] = useState("");
    const [donationSuccess, setDonationSuccess] = useState(false);
    const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editedBio, setEditedBio] = useState("");
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

            if (isMyProfile) {
                setCreatorData({
                    username: username,
                    creatorDescription: myUserData.creatorDescription,
                    walletAddress: myUserData.walletAddress,
                    id: currentUser?.uid
                });
                setEditedBio(myUserData.creatorDescription || "");
                setEditedWalletAddress(myUserData.walletAddress || "");
            } else if (data) {
                setCreatorData(data);
            } else {
                setCreatorData({
                    username: username,
                    creatorDescription: "",
                    walletAddress: ""
                });
            }
            setLoading(false);
        };
        if (username) fetchCreator();
    }, [username, isMyProfile, myUserData.creatorDescription, myUserData.walletAddress, currentUser]);

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
                {/* Header Section with Integrated Banner Background */}
                <div className="relative mb-12 overflow-hidden shadow-2xl bg-slate-200">
                    {/* Background Banner - Full Height of this section */}
                    <div className="absolute inset-0 z-0">
                        {creatorBanner ? (
                            <div className="w-full h-full relative">
                                <img src={creatorBanner} className="w-full h-full object-cover" alt="Banner" />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-white/0" />
                            </div>
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-pi-purple to-pi-purple-dark">
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl animate-pulse" />
                                    <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-pi-gold blur-3xl animate-pulse" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/0" />
                            </div>
                        )}
                    </div>

                    {/* Content inside the Banner Area */}
                    <div className="relative z-10 pt-6 pb-12 px-6 flex flex-col items-center">
                        {/* Top Controls */}
                        <div className="w-full flex justify-start mb-8">
                            <button
                                onClick={() => router.back()}
                                className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-all"
                            >
                                <ArrowLeft size={24} />
                            </button>
                        </div>

                        {/* Avatar */}
                        <div className="relative group mb-6">
                            <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-2xl relative">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-pi-purple to-pi-purple-dark flex items-center justify-center text-white text-5xl font-black overflow-hidden shadow-inner border-4 border-white">
                                    {(isMyProfile && myUserData.profileImage) ? (
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

                        {/* User Info */}
                        <div className="text-center">
                            <h1 className="text-3xl font-black text-slate-900 mb-1 drop-shadow-sm">{username}</h1>
                            <div className="flex items-center justify-center gap-2 mb-8">
                                <span className="px-4 py-1.5 bg-pi-gold/10 text-pi-gold-dark text-[10px] font-black rounded-full uppercase tracking-widest border border-pi-gold/20 shadow-sm flex items-center gap-1.5 backdrop-blur-sm">
                                    <ShieldCheck size={12} fill="currentColor" />
                                    {t('profile_pioneer_desc')}
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-center gap-4">
                                <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/50 min-w-[110px]">
                                    <div className="text-xl font-black text-slate-900">{creatorWorks.length}</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{t('creator_profile_works')}</div>
                                </div>
                                <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/50 min-w-[110px]">
                                    <div className="text-xl font-black text-slate-900">
                                        {(creatorWorks.reduce((acc, w) => acc + (w.rating || 0), 0) / (creatorWorks.length || 1)).toFixed(1)}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{t('creator_profile_rating')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6">
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
                                                setEditedBio(myUserData.creatorDescription || "");
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
                                    {isMyProfile ? myUserData.creatorDescription || t('creator_profile_no_desc') : creatorData?.creatorDescription || t('creator_profile_no_desc')}
                                </p>
                            )}
                        </div>

                        {/* Works Section */}
                        <div className="space-y-6">
                            <h3 className="text-[12px] font-black text-pi-purple uppercase tracking-[0.2em] flex items-center gap-2 ml-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-pi-purple" />
                                {t('creator_profile_works')}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {creatorWorks.map((work) => (
                                    <motion.div
                                        key={work.id}
                                        whileHover={{ y: -5 }}
                                        onClick={() => router.push(`/news/${work.id}`)}
                                        className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4 cursor-pointer hover:shadow-md transition-all group"
                                    >
                                        <div className="w-20 h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-slate-50">
                                            <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center gap-1">
                                            <p className="text-[10px] font-black text-pi-purple uppercase tracking-widest">{work.category}</p>
                                            <h4 className="font-bold text-sm text-slate-900 line-clamp-2 leading-tight">{work.title}</h4>
                                            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold mt-1">
                                                <span className="flex items-center gap-1"><Star size={10} className="text-pi-gold" fill="currentColor" /> {work.rating?.toFixed(1) || "0.0"}</span>
                                                <span className="flex items-center gap-1"><BookOpen size={10} /> {work.chapters?.length || 0} {t('profile_caps')}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {creatorWorks.length === 0 && (
                                <p className="text-center text-slate-400 font-bold py-10 italic">
                                    {t('creator_profile_empty_works')}
                                </p>
                            )}
                        </div>

                        {/* Tip/Support Section */}
                        {(creatorData?.walletAddress || (isMyProfile && isEditing)) && (
                            <div className="space-y-6">
                                <h3 className="text-[12px] font-black text-pi-purple uppercase tracking-[0.2em] flex items-center gap-2 ml-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-pi-purple" />
                                    {t('creator_tips_title')}
                                </h3>

                                <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-pi-purple/5 rounded-bl-full -mr-16 -mt-16" />

                                    {/* Wallet Configuration (Edit Mode) */}
                                    {isMyProfile && isEditing && (
                                        <div className="mb-8 p-6 bg-pi-purple/5 rounded-3xl border border-pi-purple/10">
                                            <label className="text-[10px] font-black text-pi-purple uppercase tracking-[0.1em] block mb-3 ml-1">
                                                {t('profile_wallet')}
                                            </label>
                                            <input
                                                type="text"
                                                value={editedWalletAddress}
                                                onChange={(e) => setEditedWalletAddress(e.target.value)}
                                                placeholder={t('profile_wallet_placeholder')}
                                                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-pi-purple transition-all font-mono"
                                            />
                                            <p className="text-[10px] text-slate-400 font-bold mt-3 px-1">
                                                * {t('profile_wallet_autosave')}
                                            </p>
                                        </div>
                                    )}

                                    <div className="text-center mb-8">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{t('creator_tips_sub')}</p>
                                    </div>

                                    {donationSuccess ? (
                                        <div className="text-center py-6 animate-in zoom-in-95">
                                            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                <CheckCircle2 size={32} />
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900">{t('creator_donate_success')}</h4>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-4 gap-3">
                                                {["1", "5", "10", "20"].map((amount) => (
                                                    <button
                                                        key={amount}
                                                        onClick={() => handleDonation(amount)}
                                                        className="p-3 rounded-2xl border-2 border-slate-100 text-slate-600 font-black text-sm hover:border-pi-purple hover:text-pi-purple hover:bg-pi-purple/5 transition-all active:scale-95"
                                                    >
                                                        {amount} Pi
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <input
                                                        type="number"
                                                        value={donationAmount}
                                                        onChange={(e) => setDonationAmount(e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 text-xl font-black text-slate-900 outline-none focus:border-pi-purple transition-all"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-pi-purple">Pi</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDonation("")}
                                                    disabled={isSubmittingDonation || !donationAmount}
                                                    className="px-8 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-pi-purple transition-all active:scale-95 disabled:opacity-30"
                                                >
                                                    {isSubmittingDonation ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Info Section */}
                                    <div className="mt-12 bg-slate-900 rounded-[30px] p-8 text-white text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-pi-purple/20 rounded-full blur-2xl -mr-16 -mt-16" />
                                        <h4 className="text-lg font-black mb-2">{t('creator_tips_info_title')}</h4>
                                        <p className="text-slate-400 font-medium text-xs leading-relaxed">
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
            </div>
        </div>
    );
}
