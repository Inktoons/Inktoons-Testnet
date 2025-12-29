"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Scale, Gavel, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import TopNavbar from "@/components/TopNavbar";
import BottomNavbar from "@/components/BottomNavbar";

export default function TermsPage() {
    const router = useRouter();
    const { t, language } = useLanguage();

    const terms = [
        {
            icon: <Scale className="text-slate-700" size={24} />,
            title: language === 'es' ? 'Condiciones de Uso' : 'Terms of Use',
            content: language === 'es'
                ? 'Al acceder a Inktoons, aceptas cumplir con estas condiciones y todas las leyes locales aplicables. El servicio se proporciona "tal cual".'
                : 'By accessing Inktoons, you agree to comply with these terms and all applicable local laws. The service is provided "as is".'
        },
        {
            icon: <FileText className="text-slate-700" size={24} />,
            title: language === 'es' ? 'Contenido del Usuario' : 'User Content',
            content: language === 'es'
                ? 'Mantienes la propiedad de cualquier contenido que publiques. Sin embargo, nos otorgas una licencia mundial para mostrarlo dentro de la plataforma Inktoons.'
                : 'You maintain ownership of any content you publish. However, you grant us a worldwide license to display it within the Inktoons platform.'
        },
        {
            icon: <AlertTriangle className="text-slate-700" size={24} />,
            title: language === 'es' ? 'Limitación de Responsabilidad' : 'Limitation of Liability',
            content: language === 'es'
                ? 'Inktoons no será responsable de daños indirectos derivados del uso de la aplicación o de la imposibilidad de acceder a ella.'
                : 'Inktoons will not be liable for indirect damages arising from the use of the app or the inability to access it.'
        },
        {
            icon: <Gavel className="text-slate-700" size={24} />,
            title: language === 'es' ? 'Modificaciones' : 'Modifications',
            content: language === 'es'
                ? 'Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado de la app tras los cambios implica su aceptación.'
                : 'We reserve the right to modify these terms at any time. Continued use of the app after changes implies acceptance.'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <TopNavbar />

            <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-pi-purple transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{t('footer_terms')}</h1>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
                    {terms.map((term, idx) => (
                        <div key={idx} className="p-8 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4 mb-4">
                                {term.icon}
                                <h3 className="font-bold text-lg text-slate-900">{term.title}</h3>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                {term.content}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {language === 'es' ? 'Última actualización: 28 de diciembre de 2025' : 'Last updated: December 28, 2025'}
                </div>
            </main>

            <BottomNavbar />
        </div>
    );
}
