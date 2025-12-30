import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import MobileDebugConsole from "@/components/MobileDebugConsole";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "Inktoons - Cómics y Noticias de Pi Network",
  description: "Tu portal premium de lectura en el ecosistema Pi. Cómics, noticias y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Carga síncrona del SDK como en la demo oficial */}
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              Pi.init({ version: "2.0", sandbox: true });
              console.log("[Pi SDK HTML] Init called successfully");
            } catch (e) {
              console.error("[Pi SDK HTML] Init failed:", e);
            }
          `
        }} />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <MobileDebugConsole />
        </Providers>
      </body>
    </html>
  );
}
