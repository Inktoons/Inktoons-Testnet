"use client";

import { PiProvider } from "./PiNetworkProvider";
import { ContentProvider } from "@/context/ContentContext";
import { UserDataProvider } from "@/context/UserDataContext";
import { ThemeProvider } from "./ThemeHandler";
import { MissionProvider } from "@/context/MissionContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Toast from "./Toast";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <PiProvider>
                <UserDataProvider>
                    <ContentProvider>
                        <MissionProvider>
                            <ThemeProvider>
                                {children}
                                <Toast />
                            </ThemeProvider>
                        </MissionProvider>
                    </ContentProvider>
                </UserDataProvider>
            </PiProvider>
        </LanguageProvider>
    );
}
