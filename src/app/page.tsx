"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePi } from "@/components/PiNetworkProvider";
import { mockNews } from "@/data/mockNews";
import { useContent } from "@/context/ContentContext";
import { Search, Upload, BookOpen, User, Home as HomeIcon, ChevronRight, Compass, TrendingUp, Ghost, Sword, Moon, Music } from "lucide-react";
import TopNavbar from "@/components/TopNavbar";
import BottomNavbar from "@/components/BottomNavbar";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const router = useRouter();
  const { user, authenticate, loading } = usePi();
  const { webtoons } = useContent();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("Nuevo");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const EXCLUDED_CATEGORIES = ['hentai', 'gore', '+18', 'adult', 'erotic', 'ecchi', 'nsfw'];

  const displayWebtoons = [
    ...webtoons,
    ...mockNews.filter(m => !webtoons.some(w => w.id === m.id))
  ].map(w => {
    const mock = mockNews.find(m => m.id === w.id);
    return mock ? { ...w, views: mock.views, votes: mock.votes, category: mock.category } : w;
  }).filter(w => {
    const cat = w.category?.toLowerCase() || '';
    return !EXCLUDED_CATEGORIES.some(excluded => cat.includes(excluded));
  });

  const recentWebtoons = [...displayWebtoons].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  }).slice(0, 6);

  const topRankedWebtoons = [...displayWebtoons].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);

  const handleProtectedNavigation = (path: string) => {
    if (user) {
      router.push(path);
    } else {
      setShowLoginModal(true);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-pi-gold selection:text-black transition-colors duration-300 pb-20">
      {/* Top Navbar */}
      <TopNavbar />

      <main className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Categories Header */}
        <div className="flex items-center justify-between mb-4 mt-4">
          <h3 className="text-xl font-black flex items-center gap-2">
            {t('home_categories')}
          </h3>
          <button
            onClick={() => router.push('/explore')}
            className="text-gray-400 hover:text-pi-purple font-bold text-sm transition-colors flex items-center gap-1 group"
          >
            {t('home_see_more')}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Categories Quick Links */}
        <section className="mb-10 overflow-x-auto no-scrollbar py-2">
          <div className="flex gap-6 min-w-max px-2">
            {[
              { id: 'genre_romance', image: '/img/categories/romance.png' },
              { id: 'genre_drama', image: '/img/categories/drama.png' },
              { id: 'genre_fantasy', image: '/img/categories/fantasy.png' },
              { id: 'genre_adventure', image: '/img/categories/adventure.png' },
              { id: 'genre_horror', image: '/img/categories/horror.jpg' },
              { id: 'genre_samurai', image: '/img/categories/samurai.jpg' },
              { id: 'genre_vampires', image: '/img/categories/vampires.jpg' },
              { id: 'genre_music', image: '/img/categories/music.jpg' }
            ].map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/explore?category=${cat.id}`)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-20 h-20 rounded-[2rem] bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden group-hover:border-pi-purple/30 group-hover:shadow-xl transition-all duration-300">
                  <img src={cat.image} alt={cat.id} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-[12px] font-black text-slate-700 group-hover:text-pi-purple uppercase tracking-tighter transition-colors">
                  {t(cat.id as any)}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Promo Banner */}
        <section className="mb-12 mt-4">
          <div className="bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-900 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden relative group cursor-pointer shadow-lg" onClick={() => router.push('/wallet')}>
            <div className="z-10 text-center md:text-left">
              <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold mb-4 inline-block text-white uppercase tracking-wider">{t('home_promo_economy')}</div>
              <h2 className="text-3xl font-black text-white mb-2 leading-tight">{t('home_promo_title')}</h2>
              <p className="text-white/80 font-bold">{t('home_promo_desc')}</p>
            </div>
            <div className="mt-6 md:mt-0 z-10">
              <button className="bg-white text-black px-8 py-3 rounded-full font-black hover:scale-105 transition-transform shadow-xl">
                {t('home_promo_btn')}
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-16 -mb-16" />
          </div>
        </section>

        {/* Section: Recién Llegados */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-black flex items-center gap-2 text-slate-900">
                🌱 {t('home_new_arrivals')}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('home_new_arrivals_desc')}</p>
            </div>
            <button onClick={() => router.push('/explore')} className="text-pi-purple hover:underline font-black text-xs transition-all uppercase tracking-tighter">{t('home_ver_todos')}</button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {recentWebtoons.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
                onClick={() => router.push(`/news/${item.id}`)}
              >
                <div className="relative aspect-[3/4.2] w-full overflow-hidden rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-xl transition-all duration-300">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 right-2">
                    <span className="badge-new text-[8px] px-2 py-0.5">NEW</span>
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-[12px] font-bold text-slate-800 line-clamp-1 group-hover:text-pi-purple transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[10px] font-medium text-gray-400 mt-0.5">{item.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section: Rankings Populares */}
        <section className="mb-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-black flex items-center gap-2 text-slate-900">
                🏆 {t('home_popular_rankings')}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('home_top_week')}</p>
            </div>
            <button onClick={() => router.push('/explore')} className="text-pi-purple hover:underline font-black text-xs transition-all uppercase tracking-tighter">{t('home_ver_todos')}</button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {topRankedWebtoons.map((item, i) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -5 }}
                className="group cursor-pointer w-full"
                onClick={() => router.push(`/news/${item.id}`)}
              >
                <div className="relative mb-4">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-md border border-gray-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  <div className="absolute -bottom-6 -left-2 z-10 select-none pointer-events-none">
                    <span
                      className="text-8xl font-black italic text-black"
                      style={{
                        textShadow: "-3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 3px 3px 0 #fff, 0 3px 0 #fff, 0 -3px 0 #fff, 3px 0 0 #fff, -3px 0 0 #fff",
                        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
                      }}
                    >
                      {i + 1}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-1">
                  <h4 className="text-base font-black text-slate-900 line-clamp-1 leading-tight group-hover:text-pi-purple transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{item.category}</span>
                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-500">
                      <TrendingUp size={12} className="text-pi-purple" />
                      {(item.views || 0).toLocaleString()} {t('home_visitas')}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main >

      <footer className="mt-0 py-16 bg-white border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col items-center text-center">
          <div className="mb-8">
            <div className="text-3xl font-black text-pi-purple mb-4 tracking-tighter">Inktoons</div>
            <p className="text-sm text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
              {t('footer_desc')}
            </p>
            <div className="flex justify-center gap-6 mb-12">
              <a href="https://t.me/+5dkizMdCURE3ZGY0" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-slate-50 border border-gray-100 flex items-center justify-center hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all group">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-pi-purple" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.36-.49.99-.75 3.86-1.68 6.44-2.78 7.73-3.31 3.68-1.51 4.44-1.77 4.95-1.78.11 0 .35.03.5.16.13.1.17.24.18.34.02.07.02.2.01.32z" />
                </svg>
              </a>
              <a href="https://x.com/inktoons_Dapp" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-slate-50 border border-gray-100 flex items-center justify-center hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all group">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-pi-purple" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.497h2.039L6.486 3.24H4.298l13.311 17.41z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="w-full flex flex-col items-center">
            <div className="flex flex-col items-center">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-gray-400">
                <button onClick={() => router.push('/help')} className="hover:text-pi-purple transition-colors">{t('footer_help')}</button>
                <span className="hidden sm:inline text-gray-200">|</span>
                <button onClick={() => router.push('/guidelines')} className="hover:text-pi-purple transition-colors">{t('footer_guidelines')}</button>
                <span className="hidden sm:inline text-gray-200">|</span>
                <button onClick={() => router.push('/privacy')} className="hover:text-pi-purple transition-colors">{t('footer_privacy')}</button>
                <span className="hidden sm:inline text-gray-200">|</span>
                <button onClick={() => router.push('/terms')} className="hover:text-pi-purple transition-colors">{t('footer_terms')}</button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 mt-16 pt-8 border-t border-gray-100 text-[10px] text-gray-400 text-center tracking-widest uppercase font-bold">
          © {new Date().getFullYear()} Inktoons. {t('footer_rights')}
        </div>
      </footer>

      <BottomNavbar />

      {
        showLoginModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100">
              <div className="w-16 h-16 bg-pi-purple/10 text-pi-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900">{t('login_modal_title')}</h3>
              <p className="text-gray-500 mb-6 text-sm">
                {t('login_modal_desc')}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    authenticate();
                    setShowLoginModal(false);
                  }}
                  disabled={loading}
                  className="w-full py-3 bg-pi-purple text-white font-bold rounded-xl hover:bg-pi-purple-dark transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? t('profile_loading') : t('login_modal_connect')}
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full py-3 text-gray-400 font-bold hover:text-black transition-colors"
                >
                  {t('login_modal_cancel')}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
