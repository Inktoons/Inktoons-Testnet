"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Check, Trash2, ExternalLink, Clock } from "lucide-react";
import { useUserData, Notification } from "@/context/UserDataContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
    const { userData, markNotificationRead, clearNotifications } = useUserData();
    const router = useRouter();
    const { t } = useLanguage();

    const notifications = userData.notifications || [];
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = (notif: Notification) => {
        markNotificationRead(notif.id);
        if (notif.link) {
            // Safe redirection with scroll support for hashes
            if (notif.link.includes("#") && typeof window !== 'undefined') {
                const [path, hash] = notif.link.split("#");
                if (window.location.pathname === path) {
                    const element = document.getElementById(hash);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        onClose();
                        return;
                    }
                }
            }
            router.push(notif.link);
            onClose();
        }
    };

    const formatTime = (date: number) => {
        const seconds = Math.floor((Date.now() - date) / 1000);
        if (seconds < 60) return "ahora";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100] md:hidden"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm md:absolute md:top-14 md:right-0 md:left-auto md:translate-x-0 md:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110]"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm text-gray-900">{t('notifications_title')}</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-[#FF4D4D] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearNotifications}
                                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                        title={t('notifications_clear')}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                                <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-black transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="flex flex-col">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`px-4 py-3 border-b border-gray-50 flex gap-3 transition-colors cursor-pointer hover:bg-gray-50 relative ${!notif.read ? 'bg-purple-50/30' : ''}`}
                                        >
                                            {!notif.read && (
                                                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-pi-purple rounded-r-full" />
                                            )}
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-lg shadow-inner">
                                                {notif.icon || (notif.type === 'CHAPTER' ? '📖' : '🎯')}
                                            </div>
                                            <div className="flex-1 space-y-0.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-xs font-bold leading-tight ${!notif.read ? 'text-pi-purple' : 'text-gray-900'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5 whitespace-nowrap">
                                                        <Clock size={10} />
                                                        {formatTime(notif.date)}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                                {notif.link && (
                                                    <div className="flex items-center gap-1 text-[9px] font-black text-pi-purple uppercase tracking-widest pt-1">
                                                        {t('notifications_view')} <ExternalLink size={8} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 px-8 text-center flex flex-col items-center">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                        <Bell size={24} />
                                    </div>
                                    <p className="text-gray-900 text-sm font-bold">{t('notifications_empty_title')}</p>
                                    <p className="text-gray-400 text-xs mt-1">{t('notifications_empty_desc')}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100 text-center">
                                <button className="text-[10px] font-black text-pi-purple uppercase tracking-widest hover:underline">
                                    {t('notifications_manage')}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
