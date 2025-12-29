"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Search, Upload, BookOpen, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePi } from "@/components/PiNetworkProvider";

export default function BottomNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useLanguage();
    const { user } = usePi();

    const handleProtectedNavigation = (path: string) => {
        if (!user) {
            // If we are on home page, it might trigger the login modal there
            // But for a generic component, we just redirect and let the page handle it
            router.push(path);
            return;
        }
        router.push(path);
    };

    const navItems = [
        { icon: Home, label: t('nav_home'), path: "/" },
        { icon: Search, label: t('nav_explore'), path: "/explore" },
        { icon: Upload, label: t('nav_upload'), path: "/upload" },
        { icon: BookOpen, label: t('nav_library'), path: "/library" },
        { icon: User, label: t('nav_profile'), path: "/profile" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between z-50 transition-colors duration-300 lg:hidden">
            {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                    <button
                        key={item.path}
                        onClick={() => handleProtectedNavigation(item.path)}
                        className={`${isActive ? "text-pi-purple" : "text-slate-400"
                            } transition-all flex flex-col items-center gap-1 active:scale-95`}
                    >
                        <item.icon size={22} />
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
